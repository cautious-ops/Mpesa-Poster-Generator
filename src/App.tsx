import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  Download,
  FileText,
  LogOut,
  LogIn,
  History,
  Code,
  Shield,
  ScrollText,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Save,
  Plus,
  Menu,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  QrCode,
  Upload,
  Palette,
  Type,
  Lock,
  Layout,
} from 'lucide-react';
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { cn } from './lib/utils';
import {
  auth,
  db,
  loginWithGoogle,
  logout,
  handleFirestoreError,
  OperationType,
  isPlaceholder,
} from './firebase';
import { onAuthStateChanged, User as FirebaseUser, getRedirectResult } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Blog } from './components/Blog';
import { AdminBlog } from './components/AdminBlog';
import { MpesaLogo } from './components/MpesaLogo';
import {
  Poster,
  PosterData,
  PaymentType,
  SIZES,
  THEMES,
  TEMPLATES,
  ACCENT_COLORS,
  FONT_STYLES,
  BORDER_STYLES,
  NUMBER_BOX_STYLES,
  WATERMARK_STYLES,
} from './components/Poster';

const MWASH_LOGO_URL =
  'https://mwashcyber.co.ke/wp-content/uploads/2026/05/cropped-cropped-mwash-logo-1-150x150.png';

const DEFAULT_POSTER: PosterData = {
  businessName: '',
  number: '',
  storeNumber: '',
  paymentType: 'till',
  template: 'modern_green',
  accentColor: '#00A651',
  size: 'A4_Landscape',
  theme: 'default',
  customFooter: 'Thank you for your business!',
  headerSubtitle: '',
  contactInfo: '',
  fontStyle: 'modern',
  borderStyle: 'accent_top',
  numberBoxStyle: 'boxed',
  watermarkStyle: 'tiled',
  watermarkOpacity: 0.07,
  showQrCode: true,
  qrMode: 'standard',
  qrAmount: 1,
  qrRefNo: '',
  mpesaQrImage: '',
  qrCodeContent: '',
  showInstructions: true,
};

const MwashBrandLogo = ({ className = 'h-9 w-9' }: { className?: string }) => (
  <img
    src={MWASH_LOGO_URL}
    alt="Mwash Cyber Logo"
    referrerPolicy="no-referrer"
    onError={(e) => {
      if (!e.currentTarget.src.endsWith('/mwash-logo.png')) {
        e.currentTarget.src = '/mwash-logo.png';
      }
    }}
    className={cn('rounded-lg object-contain shrink-0', className)}
  />
);

const Navbar = ({ user, isAdmin }: { user: FirebaseUser | null; isAdmin: boolean }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinkClass = (path: string) =>
    cn(
      'text-sm font-semibold whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors',
      location.pathname === path
        ? 'text-slate-900 border-[#00A651]'
        : 'text-slate-600 border-transparent hover:text-slate-900'
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <MwashBrandLogo className="h-9 w-9" />
          <span className="text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Mwash Cyber Posters
          </span>
        </Link>

        {/* Zone 2: Primary Navigation Links */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link to="/" className={navLinkClass('/')}>
            Generator
          </Link>
          <Link to="/blog" className={navLinkClass('/blog')}>
            Blog
          </Link>
          {user && (
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
              My Posters
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/blog" className={navLinkClass('/admin/blog')}>
              Admin Blog
            </Link>
          )}
          <Link to="/developer" className={navLinkClass('/developer')}>
            API
          </Link>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <img
                  src={user.photoURL || ''}
                  alt={user.displayName || 'Account'}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                />
                <span className="hidden lg:inline text-xs font-semibold text-slate-700 max-w-[140px] truncate">
                  {user.displayName}
                </span>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </button>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 text-slate-600 hover:text-slate-900 md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-2.5">
            <Link to="/" className="text-sm font-semibold text-slate-700 hover:text-[#00A651]">
              Generator
            </Link>
            <Link to="/blog" className="text-sm font-semibold text-slate-700 hover:text-[#00A651]">
              Blog
            </Link>
            {user && (
              <Link to="/dashboard" className="text-sm font-semibold text-slate-700 hover:text-[#00A651]">
                My Posters
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin/blog" className="text-sm font-semibold text-slate-700 hover:text-[#00A651]">
                Admin Blog
              </Link>
            )}
            <Link to="/developer" className="text-sm font-semibold text-slate-700 hover:text-[#00A651]">
              API
            </Link>
          </div>
          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.photoURL || ''}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-full border border-slate-200"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{user.displayName}</div>
                    <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <LogIn className="h-4 w-4" />
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => (
  <footer className="border-t border-slate-200 bg-white py-12">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <a
            href="https://mwashcyber.co.ke/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 mb-3 group"
          >
            <MwashBrandLogo className="h-9 w-9" />
            <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-[#00A651] transition-colors">
              Mwash Cyber
            </span>
          </a>
          <p className="max-w-xs text-sm text-slate-500 leading-relaxed">
            Create print-ready M-Pesa payment posters with official M-PESA branding, protective watermarks, and QR codes.
          </p>
          <a
            href="https://mwashcyber.co.ke/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#00A651] hover:underline"
          >
            Visit mwashcyber.co.ke <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
            Mwash Cyber Tools
          </h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>
              <a
                href="https://mwashcyber.co.ke/mpesa-calculator/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00A651] transition-colors"
              >
                M-Pesa Charges Calculator
              </a>
            </li>
            <li>
              <a
                href="https://mwashcyber.co.ke/free-qr-code-generator/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00A651] transition-colors"
              >
                Free QR Code Generator
              </a>
            </li>
            <li>
              <a
                href="https://mwashcyber.co.ke/free-image-to-pdf-converter/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00A651] transition-colors"
              >
                Image to PDF Converter
              </a>
            </li>
            <li>
              <a
                href="https://mwashcyber.co.ke/merge-pdf/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00A651] transition-colors"
              >
                Merge PDF Tool
              </a>
            </li>
            <li>
              <a
                href="https://mwashcyber.co.ke/imgcompressor"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00A651] transition-colors"
              >
                Image Compressor
              </a>
            </li>
            <li>
              <a
                href="https://mwashcyber.co.ke/loan-calculator/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00A651] transition-colors"
              >
                Loan Calculator
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
            Bank & Cyber Resources
          </h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>
              <a
                href="https://mwashcyber.co.ke/create-equity-paybill-poster/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00A651] transition-colors"
              >
                Equity Bank Paybill Poster
              </a>
            </li>
            <li>
              <a
                href="https://mwashcyber.co.ke/kcb-paybill-poster/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00A651] transition-colors"
              >
                KCB Paybill Poster
              </a>
            </li>
            <li>
              <a
                href="https://mwashcyber.co.ke/cooperative-bank-paybill-poster/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00A651] transition-colors"
              >
                Co-op Bank Paybill Poster
              </a>
            </li>
            <li>
              <a
                href="https://mwashcyber.co.ke/absa-bank-paybill-poster/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00A651] transition-colors"
              >
                Absa Bank Paybill Poster
              </a>
            </li>
            <li>
              <a
                href="https://mwashcyber.co.ke/kra/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00A651] transition-colors"
              >
                KRA & Tax Guides
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
            Poster Studio
          </h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/" className="hover:text-[#00A651] transition-colors">
                Generator
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-[#00A651] transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/developer" className="hover:text-[#00A651] transition-colors">
                Developer API
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-[#00A651] transition-colors">
                My Posters
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-[#00A651] transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-[#00A651] transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <span>&copy; {new Date().getFullYear()} Mwash Cyber. All rights reserved.</span>
        <span>Built for Kenyan merchants, schools, churches & cyber cafes.</span>
      </div>
    </div>
  </footer>
);

const Home = ({ user }: { user: FirebaseUser | null }) => {
  const [data, setData] = useState<PosterData>(DEFAULT_POSTER);
  const posterRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [darajaTrxCode, setDarajaTrxCode] = useState<'AUTO' | 'BG' | 'PB' | 'WA' | 'SM' | 'SB'>('AUTO');
  const [darajaSize, setDarajaSize] = useState<'300' | '400' | '500'>('300');
  const [darajaMeta, setDarajaMeta] = useState<{
    trxCode: string;
    cpi: string;
    requestId?: string | null;
    responseCode?: string | null;
    responseDescription?: string | null;
  } | null>(null);
  const [qrStatusMsg, setQrStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [darajaStatus, setDarajaStatus] = useState<{ configured: boolean; env: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fitScale, setFitScale] = useState(0.5);
  const [zoomOffset, setZoomOffset] = useState(0);

  const selectedSize = SIZES.find((s) => s.id === data.size) || SIZES[0];

  const resolvedTrxCode =
    darajaTrxCode !== 'AUTO'
      ? darajaTrxCode
      : data.paymentType === 'paybill'
        ? 'PB'
        : data.paymentType === 'agent'
          ? 'WA'
          : data.paymentType === 'send_money'
            ? 'SM'
            : data.paymentType === 'pochi'
              ? 'SB'
              : 'BG';

  const resolvedCpiPreview = (() => {
    const cleaned = (data.number || '').replace(/[\s\-+]/g, '').trim();
    if (!cleaned) return '—';
    if ((resolvedTrxCode === 'SM' || resolvedTrxCode === 'SB') && /^0[17]\d{8}$/.test(cleaned)) {
      return `254${cleaned.slice(1)}`;
    }
    return cleaned;
  })();

  useEffect(() => {
    fetch('/api/mpesa/qr/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((status) => {
        if (status) setDarajaStatus(status);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const updatePreviewScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = Math.max(280, previewContainerRef.current.offsetWidth - 48);
        const baseWidth = 1200;
        const isWide = selectedSize.width > selectedSize.height;
        const maxScale = isWide ? 0.62 : 0.48;
        setFitScale(Math.min(containerWidth / baseWidth, maxScale));
      }
    };
    updatePreviewScale();
    window.addEventListener('resize', updatePreviewScale);
    return () => window.removeEventListener('resize', updatePreviewScale);
  }, [data.size, selectedSize.width, selectedSize.height]);

  const effectiveScale = Math.max(0.2, Math.min(0.85, fitScale + zoomOffset));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFillSample = () => {
    setData((prev) => ({
      ...prev,
      businessName: 'Mwash Cyber & Print Hub',
      paymentType: 'till',
      number: '5482910',
      storeNumber: '',
      theme: 'cyber',
      headerSubtitle: '',
      contactInfo: 'Tel: 0712 345 678 · Nairobi',
      customFooter: 'Thank you for choosing Mwash Cyber!',
    }));
  };

  const handleReset = () => {
    setData(DEFAULT_POSTER);
    setZoomOffset(0);
    setSaveNotice(null);
    setQrStatusMsg(null);
    setDarajaMeta(null);
    setDarajaTrxCode('AUTO');
    setDarajaSize('300');
  };

  const handleGenerateDarajaQr = async () => {
    if (!data.number.trim()) {
      setQrStatusMsg({
        type: 'error',
        text: 'Enter your Till, Paybill, Agent, or Phone number first.',
      });
      return;
    }

    setIsGeneratingQr(true);
    setQrStatusMsg(null);

    try {
      const response = await fetch('/api/mpesa/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MerchantName: data.businessName.trim() || 'M-Pesa Merchant',
          CPI: data.number.trim(),
          storeNumber: data.storeNumber?.trim() || undefined,
          paymentType: data.paymentType,
          TrxCode: darajaTrxCode === 'AUTO' ? undefined : darajaTrxCode,
          Amount: data.qrAmount || 1,
          RefNo: data.qrRefNo?.trim() || data.storeNumber?.trim() || undefined,
          Size: darajaSize,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setQrStatusMsg({
          type: response.status === 503 ? 'info' : 'error',
          text:
            result.error ||
            'Failed to generate M-Pesa QR code. Using standard QR fallback on poster.',
        });
        return;
      }

      setData((prev) => ({
        ...prev,
        showQrCode: true,
        qrMode: 'daraja',
        mpesaQrImage: result.qrImage,
      }));
      setDarajaMeta({
        trxCode: result.trxCode,
        cpi: result.cpi,
        requestId: result.requestId,
        responseCode: result.responseCode,
        responseDescription: result.responseDescription,
      });
      setQrStatusMsg({
        type: 'success',
        text: `${result.responseDescription || 'QR Code Successfully Generated.'} (${result.trxCode} · ${result.env})`,
      });
    } catch {
      setQrStatusMsg({
        type: 'error',
        text: 'Network error calling /api/mpesa/qr. Check server connection.',
      });
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleDownload = async (format: 'png' | 'pdf') => {
    if (!posterRef.current) return;
    setIsGenerating(true);

    const baseWidth = 1200;
    const aspectRatio = selectedSize.width / selectedSize.height;
    const baseHeight = baseWidth / aspectRatio;

    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 1,
        pixelRatio: 3,
        width: baseWidth,
        height: baseHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          borderRadius: '0',
        },
      });

      const safeName = (data.businessName || 'business').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `mpesa-poster-${safeName}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const pdf = new jsPDF({
          orientation: selectedSize.width > selectedSize.height ? 'l' : 'p',
          unit: 'mm',
          format: [selectedSize.width, selectedSize.height],
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, selectedSize.width, selectedSize.height, undefined, 'FAST');
        pdf.save(`mpesa-poster-${safeName}.pdf`);
      }
    } catch (err) {
      console.error('Download failed', err);
      setSaveNotice({ type: 'error', text: 'Could not export poster. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      loginWithGoogle();
      return;
    }
    if (!data.businessName.trim() || !data.number.trim()) {
      setSaveNotice({
        type: 'error',
        text: 'Please enter both a Business Name and Payment Number before saving.',
      });
      return;
    }

    setIsSaving(true);
    setSaveNotice(null);

    try {
      const payload: Record<string, any> = {
        userId: user.uid,
        businessName: data.businessName.trim().slice(0, 100),
        number: data.number.trim().slice(0, 20),
        paymentType: data.paymentType,
        template: data.template,
        accentColor: data.accentColor,
        size: data.size,
        theme: data.theme,
        fontStyle: data.fontStyle || 'modern',
        borderStyle: data.borderStyle || 'accent_top',
        numberBoxStyle: data.numberBoxStyle || 'boxed',
        watermarkStyle: data.watermarkStyle || 'tiled',
        watermarkOpacity: Math.max(0.04, Math.min(0.18, data.watermarkOpacity ?? 0.07)),
        showQrCode: data.showQrCode ?? true,
        qrMode: data.qrMode || 'standard',
        showInstructions: data.showInstructions ?? true,
        createdAt: serverTimestamp(),
      };

      if (data.storeNumber?.trim()) payload.storeNumber = data.storeNumber.trim().slice(0, 30);
      if (data.customFooter?.trim()) payload.customFooter = data.customFooter.trim().slice(0, 200);
      if (data.headerSubtitle?.trim()) payload.headerSubtitle = data.headerSubtitle.trim().slice(0, 80);
      if (data.contactInfo?.trim()) payload.contactInfo = data.contactInfo.trim().slice(0, 80);
      if (data.qrCodeContent?.trim()) payload.qrCodeContent = data.qrCodeContent.trim().slice(0, 300);
      if (data.qrRefNo?.trim()) payload.qrRefNo = data.qrRefNo.trim().slice(0, 40);
      if (typeof data.qrAmount === 'number' && data.qrAmount >= 0) payload.qrAmount = data.qrAmount;
      if (data.mpesaQrImage && data.mpesaQrImage.length <= 95000) {
        payload.mpesaQrImage = data.mpesaQrImage;
      }
      if (data.logoUrl && data.logoUrl.length <= 480000) {
        payload.logoUrl = data.logoUrl;
      }

      await addDoc(collection(db, 'posters'), payload);
      setSaveNotice({
        type: 'success',
        text: 'Poster saved to your dashboard.',
      });
    } catch (error) {
      setSaveNotice({
        type: 'error',
        text: 'Failed to save poster. Check your connection or try a smaller logo image.',
      });
      handleFirestoreError(error, OperationType.CREATE, 'posters');
    } finally {
      setIsSaving(false);
    }
  };

  const PAYMENT_OPTIONS: { id: PaymentType; label: string }[] = [
    { id: 'till', label: 'Buy Goods (Till)' },
    { id: 'paybill', label: 'Pay Bill' },
    { id: 'send_money', label: 'Send Money' },
    { id: 'pochi', label: 'Pochi la Biashara' },
    { id: 'agent', label: 'M-Pesa Agent' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Studio Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              M-Pesa Poster Studio
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Create official M-Pesa Green payment posters across every paper size and business theme, complete with M-PESA logo, watermark, and QR code.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleFillSample}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#00A651]" />
              Fill Sample
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Studio Controls — All Sections Open & Accessible */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Business Details */}
            <section className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Type className="h-4 w-4 text-[#00A651]" />
                <h2 className="text-sm font-bold text-slate-900">01. Business & Payment Details</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Payment Channel
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setData({ ...data, paymentType: opt.id })}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs font-semibold text-left transition-colors',
                        data.paymentType === opt.id
                          ? 'border-[#00A651] bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business / Account Name
                </label>
                <input
                  type="text"
                  value={data.businessName}
                  onChange={(e) => setData({ ...data, businessName: e.target.value })}
                  placeholder="e.g. Mwash Cyber & Print Hub"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/15"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {data.paymentType === 'paybill'
                      ? 'Business Number'
                      : data.paymentType === 'agent'
                        ? 'Agent Number'
                        : data.paymentType === 'send_money'
                          ? 'Phone Number'
                          : 'Till / Pochi Number'}
                  </label>
                  <input
                    type="text"
                    value={data.number}
                    onChange={(e) => setData({ ...data, number: e.target.value })}
                    placeholder={data.paymentType === 'send_money' ? 'e.g. 0712 345 678' : 'e.g. 5482910'}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono font-semibold tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/15"
                  />
                </div>

                {(data.paymentType === 'paybill' || data.paymentType === 'agent') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {data.paymentType === 'agent' ? 'Store Number' : 'Account Number'}
                    </label>
                    <input
                      type="text"
                      value={data.storeNumber || ''}
                      onChange={(e) => setData({ ...data, storeNumber: e.target.value })}
                      placeholder={data.paymentType === 'agent' ? 'e.g. 789012' : 'e.g. INVOICE / NAME'}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono font-semibold tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/15"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Header Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={data.headerSubtitle || ''}
                    onChange={(e) => setData({ ...data, headerSubtitle: e.target.value })}
                    placeholder="Auto from selected theme"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contact / Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={data.contactInfo || ''}
                    onChange={(e) => setData({ ...data, contactInfo: e.target.value })}
                    placeholder="e.g. Tel: 0712 345 678"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Custom Footer Message
                </label>
                <input
                  type="text"
                  value={data.customFooter || ''}
                  onChange={(e) => setData({ ...data, customFooter: e.target.value })}
                  placeholder="Thank you for your business!"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/15"
                />
              </div>
            </section>

            {/* 2. Branding, Watermark & QR */}
            <section className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Lock className="h-4 w-4 text-[#00A651]" />
                <h2 className="text-sm font-bold text-slate-900">02. M-Pesa Logo, Watermark & QR</h2>
              </div>

              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-3.5 flex items-center gap-3.5">
                <div className="rounded-lg bg-white px-2.5 py-1.5 border border-emerald-100 shrink-0">
                  <MpesaLogo className="h-5 w-auto" />
                </div>
                <p className="text-xs text-emerald-900 leading-snug">
                  Official <strong>M-PESA logo & watermark</strong> remain active on every poster design.
                </p>
              </div>

              {/* Business Logo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Business Logo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {data.logoUrl ? (
                      <img
                        src={data.logoUrl}
                        alt="Business Logo"
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <Upload className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {data.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    {data.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setData({ ...data, logoUrl: undefined })}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Watermark Controls */}
              <div className="grid grid-cols-1 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Watermark Layout
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {WATERMARK_STYLES.map((ws) => (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => setData({ ...data, watermarkStyle: ws.id })}
                        className={cn(
                          'rounded-lg border px-2.5 py-2 text-xs font-semibold text-center transition-colors',
                          (data.watermarkStyle || 'tiled') === ws.id
                            ? 'border-[#00A651] bg-emerald-50 text-emerald-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        {ws.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Watermark Opacity
                    </label>
                    <span className="text-xs font-mono font-semibold tabular-nums text-slate-600">
                      {Math.round((data.watermarkOpacity ?? 0.07) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.04}
                    max={0.16}
                    step={0.01}
                    value={data.watermarkOpacity ?? 0.07}
                    onChange={(e) =>
                      setData({ ...data, watermarkOpacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#00A651] cursor-pointer"
                  />
                </div>
              </div>

              {/* QR & Instructions Toggles */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-800">Include Scan-to-Pay QR Code</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={data.showQrCode ?? true}
                    onClick={() => setData({ ...data, showQrCode: !(data.showQrCode ?? true) })}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                      data.showQrCode ?? true ? 'bg-[#00A651]' : 'bg-slate-200'
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                        data.showQrCode ?? true ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {(data.showQrCode ?? true) && (
                  <div className="space-y-3 rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setData({ ...data, qrMode: 'standard' })}
                        className={cn(
                          'rounded-md py-1.5 text-xs font-semibold transition-colors',
                          (data.qrMode || 'standard') === 'standard'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        )}
                      >
                        Standard QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setData({ ...data, qrMode: 'daraja' })}
                        className={cn(
                          'rounded-md py-1.5 text-xs font-semibold transition-colors',
                          data.qrMode === 'daraja'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        )}
                      >
                        M-Pesa QR API
                      </button>
                    </div>

                    {(data.qrMode || 'standard') === 'standard' ? (
                      <input
                        type="text"
                        value={data.qrCodeContent || ''}
                        onChange={(e) => setData({ ...data, qrCodeContent: e.target.value })}
                        placeholder="Custom QR link or leave blank to encode payment number"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#00A651] focus:outline-none"
                      />
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Reference (RefNo)
                            </label>
                            <input
                              type="text"
                              value={data.qrRefNo || ''}
                              onChange={(e) => setData({ ...data, qrRefNo: e.target.value })}
                              placeholder={data.storeNumber || 'e.g. Invoice Test'}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#00A651] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Amount (KES)
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={data.qrAmount ?? 1}
                              onChange={(e) =>
                                setData({ ...data, qrAmount: Math.max(1, Number(e.target.value) || 1) })
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono tabular-nums text-slate-900 focus:border-[#00A651] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              TrxCode
                            </label>
                            <select
                              value={darajaTrxCode}
                              onChange={(e) => setDarajaTrxCode(e.target.value as any)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#00A651] focus:outline-none"
                            >
                              <option value="AUTO">Auto ({resolvedTrxCode})</option>
                              <option value="BG">BG — Buy Goods (Till)</option>
                              <option value="PB">PB — Paybill / Business</option>
                              <option value="WA">WA — Agent Withdraw</option>
                              <option value="SM">SM — Send Money</option>
                              <option value="SB">SB — Sent to Business</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              QR Size (px)
                            </label>
                            <select
                              value={darajaSize}
                              onChange={(e) => setDarajaSize(e.target.value as any)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-800 focus:border-[#00A651] focus:outline-none"
                            >
                              <option value="300">300 × 300</option>
                              <option value="400">400 × 400</option>
                              <option value="500">500 × 500</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-[11px] font-mono tabular-nums text-slate-600">
                          <span>
                            TrxCode: <strong className="text-slate-900">{resolvedTrxCode}</strong>
                          </span>
                          <span>
                            CPI: <strong className="text-slate-900">{resolvedCpiPreview}</strong>
                          </span>
                          <span>
                            Size: <strong className="text-slate-900">{darajaSize}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleGenerateDarajaQr}
                            disabled={isGeneratingQr}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#00A651] px-3 py-2 text-xs font-semibold text-white hover:bg-[#008f45] transition-colors disabled:opacity-50"
                          >
                            {isGeneratingQr ? (
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <QrCode className="h-3.5 w-3.5" />
                            )}
                            {data.mpesaQrImage ? 'Regenerate M-Pesa QR' : 'Generate M-Pesa QR'}
                          </button>
                          {data.mpesaQrImage && (
                            <button
                              type="button"
                              onClick={() => {
                                setData({ ...data, mpesaQrImage: undefined });
                                setDarajaMeta(null);
                              }}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {darajaStatus && !darajaStatus.configured && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 leading-snug">
                            Configure <code className="font-mono">MPESA_CONSUMER_KEY</code> and{' '}
                            <code className="font-mono">MPESA_CONSUMER_SECRET</code> in Secrets to enable live Safaricom Daraja QR generation. Standard QR remains active as fallback.
                          </p>
                        )}

                        {qrStatusMsg && (
                          <p
                            className={cn(
                              'text-[11px] rounded-lg px-2.5 py-2 border leading-snug',
                              qrStatusMsg.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : qrStatusMsg.type === 'info'
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : 'bg-red-50 border-red-200 text-red-800'
                            )}
                          >
                            {qrStatusMsg.text}
                          </p>
                        )}

                        {darajaMeta && data.mpesaQrImage && (
                          <div className="rounded-lg bg-white border border-slate-200 px-2.5 py-2 text-[11px] font-mono text-slate-600 space-y-0.5">
                            {darajaMeta.responseCode && (
                              <div className="truncate">
                                ResponseCode: <span className="text-slate-900">{darajaMeta.responseCode}</span>
                              </div>
                            )}
                            {darajaMeta.requestId && (
                              <div className="truncate">
                                RequestID: <span className="text-slate-900">{darajaMeta.requestId}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">Show "How to Pay" Steps</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={data.showInstructions ?? true}
                    onClick={() =>
                      setData({ ...data, showInstructions: !(data.showInstructions ?? true) })
                    }
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                      data.showInstructions ?? true ? 'bg-[#00A651]' : 'bg-slate-200'
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                        data.showInstructions ?? true ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* 3. M-Pesa Green Styles, Colors & Typography */}
            <section className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Palette className="h-4 w-4 text-[#00A651]" />
                <h2 className="text-sm font-bold text-slate-900">03. M-Pesa Styles, Colors & Framing</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select M-Pesa Style (12 Templates)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setData({ ...data, template: t.id, accentColor: t.color })}
                      className={cn(
                        'relative flex flex-col items-start gap-1.5 rounded-lg border p-2.5 text-left transition-colors',
                        data.template === t.id
                          ? 'border-[#00A651] bg-emerald-50/50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span
                          className={cn('h-5 w-8 rounded border border-black/10', t.bg)}
                          style={{ boxShadow: `inset 0 -3px 0 ${t.color}` }}
                        />
                        {data.template === t.id && (
                          <Check className="h-3.5 w-3.5 text-[#00A651]" />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 truncate w-full">
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Accent Color
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Select color ${color}`}
                      onClick={() => setData({ ...data, accentColor: color })}
                      className={cn(
                        'h-8 w-8 rounded-full border-2 transition-transform hover:scale-105',
                        data.accentColor === color
                          ? 'border-slate-900 ring-2 ring-slate-900/20'
                          : 'border-white shadow-sm'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <label className="relative h-8 w-8 rounded-full border border-slate-300 bg-white flex items-center justify-center cursor-pointer hover:border-slate-500">
                    <input
                      type="color"
                      value={data.accentColor}
                      onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                      className="sr-only"
                    />
                    <Palette className="h-4 w-4 text-slate-600" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Font Style
                  </label>
                  <select
                    value={data.fontStyle || 'modern'}
                    onChange={(e) => setData({ ...data, fontStyle: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 focus:border-[#00A651] focus:outline-none"
                  >
                    {FONT_STYLES.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Number Box
                  </label>
                  <select
                    value={data.numberBoxStyle || 'boxed'}
                    onChange={(e) => setData({ ...data, numberBoxStyle: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 focus:border-[#00A651] focus:outline-none"
                  >
                    {NUMBER_BOX_STYLES.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Border Frame
                  </label>
                  <select
                    value={data.borderStyle || 'accent_top'}
                    onChange={(e) => setData({ ...data, borderStyle: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 focus:border-[#00A651] focus:outline-none"
                  >
                    {BORDER_STYLES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 4. Paper Sizes / Resolutions & Business Themes */}
            <section className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Layout className="h-4 w-4 text-[#00A651]" />
                <h2 className="text-sm font-bold text-slate-900">04. Paper Sizes, Resolutions & Business Themes</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Paper Size & Resolution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setData({ ...data, size: s.id })}
                      className={cn(
                        'flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors',
                        data.size === s.id
                          ? 'border-[#00A651] bg-emerald-50 text-emerald-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <span className="text-xs font-bold">{s.label}</span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500">
                        {s.dimensions}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Business Theme (9 Themes)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setData({ ...data, theme: t.id })}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors',
                        data.theme === t.id
                          ? 'border-[#00A651] bg-emerald-50 text-emerald-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <span className="text-xs font-semibold truncate">{t.label}</span>
                      <span className={cn(data.theme === t.id ? 'text-[#00A651]' : 'text-slate-400')}>
                        {t.icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right Sticky Studio Canvas & Export Bar */}
          <div className="lg:col-span-7 space-y-4">
            <div className="sticky top-20 space-y-4">
              {/* Studio Canvas Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 px-4 py-2.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">{selectedSize.label}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{selectedSize.dimensions}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{selectedSize.resolutionNote}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Zoom out"
                    onClick={() => setZoomOffset((z) => Math.max(-0.25, z - 0.08))}
                    className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomOffset(0)}
                    className="rounded-md px-2 py-1 text-xs font-mono font-semibold tabular-nums text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {Math.round(effectiveScale * 100)}%
                  </button>
                  <button
                    type="button"
                    aria-label="Zoom in"
                    onClick={() => setZoomOffset((z) => Math.min(0.25, z + 0.08))}
                    className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Poster Stage */}
              <div
                ref={previewContainerRef}
                className="flex justify-center items-center rounded-2xl bg-slate-200/70 border border-slate-200 p-6 overflow-auto min-h-[420px]"
              >
                <div className="rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.18)] bg-white">
                  <Poster data={data} innerRef={posterRef} scale={effectiveScale} />
                </div>
              </div>

              {/* Export & Save Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleDownload('png')}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#00A651] py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#008f45] transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('pdf')}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Poster
                </button>
              </div>

              {saveNotice && (
                <div
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold',
                    saveNotice.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-800'
                  )}
                >
                  <span>{saveNotice.text}</span>
                  {saveNotice.type === 'success' && (
                    <Link to="/dashboard" className="underline hover:text-emerald-700">
                      Open My Posters
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Dashboard = ({ user }: { user: FirebaseUser | null }) => {
  const [posters, setPosters] = useState<PosterData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const q = query(collection(db, 'posters'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PosterData));
        setPosters(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'posters');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'posters', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posters/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00A651] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              My Saved Posters
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage, preview, and re-download your saved M-Pesa posters.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#00A651] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008f45] transition-colors self-start sm:self-auto whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Create New Poster
          </Link>
        </div>

        {posters.length === 0 ? (
          <div className="rounded-2xl bg-white p-16 text-center border border-dashed border-slate-300">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <History className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No saved posters yet</h3>
            <p className="mt-1 text-sm text-slate-500 mb-6">
              Create your first A4 Landscape M-Pesa poster and save it here for instant access.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Open Poster Studio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posters.map((poster) => (
              <div
                key={poster.id}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col"
              >
                <div className="aspect-[1.414/1] bg-slate-100 flex items-center justify-center p-4 overflow-hidden border-b border-slate-100">
                  <div className="shadow-md rounded overflow-hidden">
                    <Poster data={poster} scale={0.26} />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 truncate">{poster.businessName}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
                      <span>{poster.number}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans capitalize">{poster.paymentType.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans">{poster.size.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/view/${poster.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open & Download
                    </button>
                    <button
                      onClick={() => handleDelete(poster.id!)}
                      aria-label="Delete poster"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Developer = ({ user }: { user: FirebaseUser | null }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (d) => {
        if (d.exists()) {
          setApiKey(d.data().apiKey || null);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const generateKey = async () => {
    if (!user) return;
    setIsGenerating(true);
    const newKey = `mp_${nanoid(32)}`;
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          apiKey: newKey,
          role: 'developer',
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      await setDoc(doc(db, 'apiKeys', newKey), {
        apiKey: newKey,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Code className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Developer API</h1>
          <p className="mt-2 text-sm text-slate-600">
            Automate M-Pesa poster creation for merchants, POS systems, and onboarding workflows.
          </p>
        </div>

        {!user ? (
          <div className="rounded-2xl bg-white p-10 text-center border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Sign in to access the API</h3>
            <p className="mt-1 text-sm text-slate-500 mb-6">
              Create an account to generate API keys and integrate poster generation.
            </p>
            <button
              onClick={loginWithGoogle}
              className="mx-auto inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In with Google
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4">Your API Key</h3>
              {apiKey ? (
                <div className="space-y-4">
                  <div className="relative flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3.5 font-mono text-xs sm:text-sm text-white">
                    <span className="break-all pr-10">{apiKey}</span>
                    <button
                      onClick={copyToClipboard}
                      aria-label="Copy API key"
                      className="rounded-lg bg-white/10 p-2 hover:bg-white/20 transition-colors shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={generateKey}
                      disabled={isGenerating}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                    >
                      Regenerate Key
                    </button>
                    <span className="text-xs text-slate-500">
                      Regenerating immediately invalidates the previous key.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <p className="text-sm text-slate-500 mb-4">You haven't generated an API key yet.</p>
                  <button
                    onClick={generateKey}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#00A651] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#008f45] transition-colors"
                  >
                    {isGenerating ? 'Generating...' : 'Generate API Key'}
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200 space-y-6">
              <h3 className="text-base font-bold text-slate-900">REST Endpoint Reference</h3>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Create Poster Endpoint
                </h4>
                <div className="rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm border border-slate-200">
                  <span className="font-bold text-[#00A651]">POST</span> /api/v1/posters
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Generate Official M-Pesa QR Endpoint
                </h4>
                <div className="rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm border border-slate-200">
                  <span className="font-bold text-[#00A651]">POST</span> /api/v1/mpesa-qr
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Headers
                </h4>
                <div className="rounded-xl bg-slate-50 px-4 py-3 font-mono text-xs border border-slate-200 space-y-1">
                  <div>Content-Type: application/json</div>
                  <div>X-API-Key: YOUR_API_KEY</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Create Poster Request Body
                </h4>
                <pre className="rounded-xl bg-slate-900 p-5 font-mono text-xs text-emerald-300 overflow-x-auto">
{`{
  "businessName": "Mwash Cyber & Print Hub",
  "number": "5482910",
  "paymentType": "till",
  "template": "modern_green",
  "accentColor": "#00A651",
  "size": "A4_Landscape",
  "theme": "cyber",
  "watermarkStyle": "tiled",
  "watermarkOpacity": 0.07,
  "showQrCode": true,
  "useDarajaQr": true,
  "qrAmount": 500,
  "qrRefNo": "INV-101"
}`}
                </pre>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Safaricom Dynamic QR Parameters (POST /api/v1/mpesa-qr)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3.5 py-2.5">Parameter</th>
                        <th className="px-3.5 py-2.5">Type</th>
                        <th className="px-3.5 py-2.5">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr>
                        <td className="px-3.5 py-2 font-mono text-slate-900">MerchantName</td>
                        <td className="px-3.5 py-2">String</td>
                        <td className="px-3.5 py-2">Company / M-Pesa Merchant name (alias: <code className="font-mono">businessName</code>)</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-mono text-slate-900">RefNo</td>
                        <td className="px-3.5 py-2">String</td>
                        <td className="px-3.5 py-2">Transaction reference / invoice label (alias: <code className="font-mono">refNo</code>)</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-mono text-slate-900">Amount</td>
                        <td className="px-3.5 py-2">Numeric</td>
                        <td className="px-3.5 py-2">Total sale amount in KES (alias: <code className="font-mono">amount</code>)</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-mono text-slate-900">TrxCode</td>
                        <td className="px-3.5 py-2">String</td>
                        <td className="px-3.5 py-2">
                          <code className="font-mono">BG</code> (Buy Goods), <code className="font-mono">WA</code> (Agent Withdraw), <code className="font-mono">PB</code> (Paybill), <code className="font-mono">SM</code> (Send Money), <code className="font-mono">SB</code> (Sent to Business MSISDN)
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-mono text-slate-900">CPI</td>
                        <td className="px-3.5 py-2">String</td>
                        <td className="px-3.5 py-2">Credit Party Identifier: Till, Paybill, Agent, or MSISDN (alias: <code className="font-mono">number</code>)</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-mono text-slate-900">Size</td>
                        <td className="px-3.5 py-2">String</td>
                        <td className="px-3.5 py-2">Square QR image size in pixels, e.g. <code className="font-mono">"300"</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  M-Pesa Dynamic QR API Example cURL
                </h4>
                <pre className="rounded-xl bg-slate-900 p-5 font-mono text-xs text-slate-300 overflow-x-auto">
{`curl -X POST ${window.location.origin}/api/v1/mpesa-qr \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "MerchantName": "TEST SUPERMARKET",
    "RefNo": "Invoice Test",
    "Amount": 1,
    "TrxCode": "BG",
    "CPI": "373132",
    "Size": "300"
  }'`}
                </pre>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Dynamic QR Response Body
                </h4>
                <pre className="rounded-xl bg-slate-900 p-5 font-mono text-xs text-emerald-300 overflow-x-auto">
{`{
  "qrImage": "data:image/png;base64,iVBORw0KGgo...",
  "responseCode": "AG_20191219_000043fdf61864fe9ff5",
  "requestId": "16738-27456357-1",
  "responseDescription": "QR Code Successfully Generated.",
  "trxCode": "BG",
  "cpi": "373132",
  "size": "300",
  "env": "sandbox"
}`}
                </pre>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

const ViewPoster = () => {
  const { id } = useParams();
  const [poster, setPoster] = useState<PosterData | null>(null);
  const [loading, setLoading] = useState(true);
  const posterRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && poster) {
        const baseWidth = 1200;
        const containerWidth = Math.max(280, containerRef.current.offsetWidth - 48);
        setScale(Math.min(containerWidth / baseWidth, 0.8));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [poster]);

  useEffect(() => {
    if (id) {
      const unsubscribe = onSnapshot(doc(db, 'posters', id), (d) => {
        if (d.exists()) {
          setPoster({ id: d.id, ...d.data() } as PosterData);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [id]);

  const handleDownload = async (format: 'png' | 'pdf') => {
    if (!posterRef.current || !poster) return;
    const selectedSize = SIZES.find((s) => s.id === poster.size) || SIZES[0];
    const baseWidth = 1200;
    const aspectRatio = selectedSize.width / selectedSize.height;
    const baseHeight = baseWidth / aspectRatio;

    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 1,
        pixelRatio: 3,
        width: baseWidth,
        height: baseHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          borderRadius: '0',
        },
      });
      const safeName = (poster.businessName || 'poster').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `mpesa-poster-${safeName}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const pdf = new jsPDF({
          orientation: selectedSize.width > selectedSize.height ? 'l' : 'p',
          unit: 'mm',
          format: [selectedSize.width, selectedSize.height],
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, selectedSize.width, selectedSize.height, undefined, 'FAST');
        pdf.save(`mpesa-poster-${safeName}.pdf`);
      }
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00A651] border-t-transparent" />
      </div>
    );
  }
  if (!poster) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-lg font-bold text-slate-900">Poster not found</p>
        <Link to="/" className="text-sm font-semibold text-[#00A651] hover:underline">
          Create a new poster
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 flex flex-col items-center px-4" ref={containerRef}>
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => handleDownload('png')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00A651] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#008f45] transition-colors"
        >
          <Download className="h-4 w-4" />
          Download PNG
        </button>
        <button
          onClick={() => handleDownload('pdf')}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Download PDF
        </button>
        <Link
          to="/"
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Create Your Own
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl shadow-2xl bg-white">
        <Poster data={poster} innerRef={posterRef} scale={scale} />
      </div>
    </div>
  );
};

const Privacy = () => (
  <div className="min-h-screen bg-white py-16">
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        <Shield className="h-6 w-6" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Privacy Policy</h1>
      <div className="prose prose-slate max-w-none space-y-5 text-slate-600 text-sm leading-relaxed">
        <p className="font-semibold text-slate-900">Last updated: November 2026</p>
        <p>
          At Mwash Cyber Posters, we take your privacy seriously. This policy describes how we collect, use, and protect your information.
        </p>
        <h3 className="text-lg font-bold text-slate-900 pt-3">1. Information We Collect</h3>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Account information (name, email, profile picture) via Google Sign-In.</li>
          <li>Poster data (business name, payment numbers, uploaded logo, and customization settings).</li>
          <li>API usage credentials when generating developer keys.</li>
        </ul>
        <h3 className="text-lg font-bold text-slate-900 pt-3">2. How We Use Your Information</h3>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Generate, preview, and export your payment posters.</li>
          <li>Save your designs to your dashboard for future downloads.</li>
          <li>Authenticate your developer API requests.</li>
        </ul>
        <h3 className="text-lg font-bold text-slate-900 pt-3">3. Data Security</h3>
        <p>
          Your saved posters and account records are stored using Firebase on Google Cloud infrastructure with strict per-user access controls.
        </p>
      </div>
    </div>
  </div>
);

const Terms = () => (
  <div className="min-h-screen bg-white py-16">
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        <ScrollText className="h-6 w-6" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Terms of Service</h1>
      <div className="prose prose-slate max-w-none space-y-5 text-slate-600 text-sm leading-relaxed">
        <p className="font-semibold text-slate-900">Last updated: November 2026</p>
        <h3 className="text-lg font-bold text-slate-900 pt-3">1. Acceptance of Terms</h3>
        <p>
          By accessing or using Mwash Cyber Posters, you agree to be bound by these Terms of Service.
        </p>
        <h3 className="text-lg font-bold text-slate-900 pt-3">2. Accuracy of Payment Details</h3>
        <p>
          You are responsible for verifying the accuracy of your Till, Paybill, Agent, or Phone numbers before printing and displaying posters.
        </p>
        <h3 className="text-lg font-bold text-slate-900 pt-3">3. Developer API</h3>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Keep your API key confidential.</li>
          <li>Do not use the service for fraudulent or unauthorized payment collection.</li>
        </ul>
      </div>
    </div>
  </div>
);

const FirebaseWarning = () => (
  <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4 flex items-center justify-center gap-3 text-amber-900 text-xs sm:text-sm">
    <Shield className="h-4 w-4 text-amber-600 shrink-0" />
    <span>
      <strong>Firebase Configuration Required:</strong> Complete Firebase setup to enable saving posters and API keys.
    </span>
  </div>
);

const App = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { getDocFromServer, doc } = await import('firebase/firestore');
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration. The client is offline.');
        }
      }
    };
    testConnection();

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('Redirect sign-in successful:', result.user.email);
        }
      })
      .catch((err) => {
        if (err.code !== 'auth/no-current-user') {
          console.error('Redirect result error:', err.code, err.message);
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setIsAdmin(userDoc.data().role === 'admin');
          } else if (currentUser.email === 'martin.mbuco@gmail.com') {
            setIsAdmin(true);
          }
        } catch {
          setIsAdmin(currentUser.email === 'martin.mbuco@gmail.com');
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00A651] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-emerald-100 selection:text-[#00A651]">
      {isPlaceholder && <FirebaseWarning />}
      <Navbar user={user} isAdmin={isAdmin} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Blog />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/developer" element={<Developer user={user} />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/view/:id" element={<ViewPoster />} />
          {isAdmin && <Route path="/admin/blog" element={<AdminBlog />} />}
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
