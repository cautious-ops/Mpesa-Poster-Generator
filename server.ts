import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

// Initialize Firebase for backend
const firebaseApp = initializeApp(firebaseConfig as any);
const db = getFirestore(firebaseApp, (firebaseConfig as any).firestoreDatabaseId);

// --- Safaricom Daraja M-PESA Dynamic QR API Integration ---
type PaymentType = "till" | "paybill" | "send_money" | "pochi" | "agent";

let cachedDarajaToken: { token: string; expiresAt: number } | null = null;

function getDarajaConfig() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY?.trim() || "";
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET?.trim() || "";
  const isConfigured =
    Boolean(consumerKey) &&
    Boolean(consumerSecret) &&
    consumerKey !== "MY_MPESA_CONSUMER_KEY" &&
    consumerSecret !== "MY_MPESA_CONSUMER_SECRET";

  const env = process.env.MPESA_ENV === "production" ? "production" : "sandbox";
  const baseUrl =
    env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

  return { consumerKey, consumerSecret, isConfigured, env, baseUrl };
}

function mapPaymentTypeToTrxCode(paymentType: PaymentType): "BG" | "PB" | "WA" | "SM" | "SB" {
  switch (paymentType) {
    case "till":
      return "BG";
    case "paybill":
      return "PB";
    case "agent":
      return "WA";
    case "send_money":
      return "SM";
    case "pochi":
      return "SB";
    default:
      return "BG";
  }
}

function normalizeDarajaCpi(rawCpi: string, trxCode: "BG" | "PB" | "WA" | "SM" | "SB"): string {
  const cleaned = rawCpi.replace(/[\s\-+]/g, "").trim();
  if ((trxCode === "SM" || trxCode === "SB") && /^0[17]\d{8}$/.test(cleaned)) {
    return `254${cleaned.slice(1)}`;
  }
  return cleaned;
}

async function getDarajaAccessToken(): Promise<string> {
  const { consumerKey, consumerSecret, isConfigured, baseUrl } = getDarajaConfig();
  if (!isConfigured) {
    throw new Error(
      "Safaricom Daraja credentials (MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET) are not configured."
    );
  }

  if (cachedDarajaToken && Date.now() < cachedDarajaToken.expiresAt) {
    return cachedDarajaToken.token;
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Daraja OAuth failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { access_token?: string; expires_in?: string };
  if (!data.access_token) {
    throw new Error("Daraja OAuth response did not include an access_token.");
  }

  const expiresInMs = Math.max(60, Number(data.expires_in) || 3599) * 1000;
  cachedDarajaToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresInMs - 60_000,
  };

  return data.access_token;
}

async function generateDarajaQrCode(params: {
  businessName: string;
  number: string;
  storeNumber?: string;
  paymentType: PaymentType;
  trxCode?: "BG" | "PB" | "WA" | "SM" | "SB";
  amount?: number;
  refNo?: string;
  size?: string | number;
}) {
  const { baseUrl, env } = getDarajaConfig();
  const accessToken = await getDarajaAccessToken();

  const validTrxCodes = ["BG", "PB", "WA", "SM", "SB"] as const;
  const trxCode =
    params.trxCode && validTrxCodes.includes(params.trxCode)
      ? params.trxCode
      : mapPaymentTypeToTrxCode(params.paymentType);
  const cpi = normalizeDarajaCpi(params.number, trxCode);
  const merchantName = (params.businessName || "M-Pesa Merchant").trim().slice(0, 50);
  const refNo = (params.refNo || params.storeNumber || merchantName || "Payment")
    .trim()
    .slice(0, 30);
  const amount = Math.max(1, Math.round(Number(params.amount) || 1));
  const size = String(params.size || "300");

  const payload = {
    MerchantName: merchantName,
    RefNo: refNo,
    Amount: amount,
    TrxCode: trxCode,
    CPI: cpi,
    Size: size,
  };

  const response = await fetch(`${baseUrl}/mpesa/qrcode/v1/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  let result: {
    QRCode?: string;
    RequestID?: string;
    ResponseCode?: string;
    ResponseDescription?: string;
    errorMessage?: string;
  } = {};

  try {
    result = JSON.parse(rawText);
  } catch {
    throw new Error(`Unexpected Daraja response (${response.status}): ${rawText.slice(0, 200)}`);
  }

  if (!response.ok || !result.QRCode) {
    throw new Error(
      result.errorMessage ||
        result.ResponseDescription ||
        `Daraja QR generation failed (${response.status})`
    );
  }

  const cleanQr = result.QRCode.replace(/\s+/g, "");
  const qrImage = cleanQr.startsWith("data:image/")
    ? cleanQr
    : `data:image/png;base64,${cleanQr}`;

  return {
    qrImage,
    requestId: result.RequestID || null,
    responseCode: result.ResponseCode || null,
    responseDescription: result.ResponseDescription || "QR Code Successfully Generated.",
    trxCode,
    cpi,
    merchantName,
    refNo,
    amount,
    size,
    env,
  };
}

const VALID_TRX_CODES = ["BG", "PB", "WA", "SM", "SB"] as const;
type DarajaTrxCode = (typeof VALID_TRX_CODES)[number];

function parseDarajaRequest(body: Record<string, any> = {}) {
  const rawCpi = body.CPI ?? body.cpi ?? body.number;
  const rawPaymentType = body.paymentType as PaymentType | undefined;
  const rawTrxCode = (body.TrxCode ?? body.trxCode) as string | undefined;
  const normalizedTrxCode = rawTrxCode ? rawTrxCode.trim().toUpperCase() : undefined;

  if (normalizedTrxCode && !VALID_TRX_CODES.includes(normalizedTrxCode as DarajaTrxCode)) {
    return { error: "Invalid TrxCode. Allowed values are BG, PB, WA, SM, SB." };
  }

  if (!rawCpi || (!rawPaymentType && !normalizedTrxCode)) {
    return {
      error:
        "Missing required fields: provide number (or CPI) and paymentType (or TrxCode: BG, PB, WA, SM, SB).",
    };
  }

  const rawSize = String(body.Size ?? body.size ?? "300").trim();
  const numericSize = Number(rawSize);
  const size =
    Number.isFinite(numericSize) && numericSize >= 100 && numericSize <= 1000
      ? String(Math.round(numericSize))
      : "300";

  return {
    businessName: String(body.MerchantName ?? body.merchantName ?? body.businessName ?? "M-Pesa Merchant"),
    number: String(rawCpi),
    storeNumber: body.storeNumber ? String(body.storeNumber) : undefined,
    paymentType: rawPaymentType || "till",
    trxCode: normalizedTrxCode as DarajaTrxCode | undefined,
    amount: body.Amount !== undefined ? Number(body.Amount) : body.amount !== undefined ? Number(body.amount) : 1,
    refNo: body.RefNo ?? body.refNo ?? (body.storeNumber ? String(body.storeNumber) : undefined),
    size,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Check Daraja M-Pesa QR API configuration status (no secrets returned)
  app.get("/api/mpesa/qr/status", (req, res) => {
    const { isConfigured, env } = getDarajaConfig();
    res.json({ configured: isConfigured, env });
  });

  // Server-side proxy for Safaricom Daraja M-Pesa Dynamic QR API
  app.post("/api/mpesa/qr", async (req, res) => {
    const parsed = parseDarajaRequest(req.body || {});
    if ("error" in parsed) {
      return res.status(400).json({ error: parsed.error });
    }

    const { isConfigured, env } = getDarajaConfig();
    if (!isConfigured) {
      return res.status(503).json({
        configured: false,
        env,
        error:
          "Safaricom Daraja credentials (MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET) are not configured in server environment secrets.",
      });
    }

    try {
      const qrResult = await generateDarajaQrCode(parsed);

      res.json({
        configured: true,
        ...qrResult,
      });
    } catch (error: any) {
      console.error("Daraja QR Error:", error);
      res.status(502).json({
        configured: true,
        error: error?.message || "Failed to generate M-Pesa QR code via Daraja API.",
      });
    }
  });

  // Developer API: Generate Official M-Pesa Daraja QR via X-API-Key
  app.post("/api/v1/mpesa-qr", async (req, res) => {
    const apiKey = req.headers["x-api-key"] as string;
    if (!apiKey) {
      return res.status(401).json({ error: "Missing API key" });
    }

    try {
      const keyDoc = await getDoc(doc(db, "apiKeys", apiKey));
      if (!keyDoc.exists()) {
        return res.status(401).json({ error: "Invalid API key" });
      }

      const parsed = parseDarajaRequest(req.body || {});
      if ("error" in parsed) {
        return res.status(400).json({ error: parsed.error });
      }

      const { isConfigured } = getDarajaConfig();
      if (!isConfigured) {
        return res.status(503).json({
          error:
            "Daraja QR API credentials (MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET) are not configured on the server.",
        });
      }

      const qrResult = await generateDarajaQrCode(parsed);

      res.json(qrResult);
    } catch (error: any) {
      console.error("API QR Error:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // Developer API: Create a poster (optionally generating Daraja QR)
  app.post("/api/v1/posters", async (req, res) => {
    const apiKey = req.headers["x-api-key"] as string;
    if (!apiKey) {
      return res.status(401).json({ error: "Missing API key" });
    }

    try {
      // Validate API Key
      const keyDoc = await getDoc(doc(db, "apiKeys", apiKey));
      if (!keyDoc.exists()) {
        return res.status(401).json({ error: "Invalid API key" });
      }

      const { userId } = keyDoc.data();
      const { useDarajaQr, qrAmount, qrRefNo, qrTrxCode, qrSize, ...posterData } = req.body;

      // Basic validation
      if (!posterData.businessName || !posterData.number || !posterData.paymentType) {
        return res
          .status(400)
          .json({ error: "Missing required fields: businessName, number, paymentType" });
      }

      let qrFields: Record<string, any> = {};
      if (useDarajaQr && getDarajaConfig().isConfigured) {
        const normalizedTrx =
          typeof qrTrxCode === "string" && VALID_TRX_CODES.includes(qrTrxCode.toUpperCase() as DarajaTrxCode)
            ? (qrTrxCode.toUpperCase() as DarajaTrxCode)
            : undefined;
        const qrResult = await generateDarajaQrCode({
          businessName: posterData.businessName,
          number: String(posterData.number),
          storeNumber: posterData.storeNumber,
          paymentType: posterData.paymentType,
          trxCode: normalizedTrx,
          amount: qrAmount,
          refNo: qrRefNo,
          size: qrSize || "300",
        });
        qrFields = {
          showQrCode: true,
          qrMode: "daraja",
          qrAmount: qrResult.amount,
          qrRefNo: qrResult.refNo,
          mpesaQrImage: qrResult.qrImage,
        };
      }

      // Save poster
      const docRef = await addDoc(collection(db, "posters"), {
        size: "A4_Landscape",
        template: "modern_green",
        accentColor: "#00A651",
        theme: "default",
        ...posterData,
        ...qrFields,
        userId,
        createdAt: serverTimestamp(),
        source: "api",
      });

      res.status(201).json({
        id: docRef.id,
        url: `${process.env.APP_URL || "http://localhost:3000"}/view/${docRef.id}`,
        qrGenerated: Boolean(qrFields.mpesaQrImage),
        message: "Poster created successfully",
      });
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
