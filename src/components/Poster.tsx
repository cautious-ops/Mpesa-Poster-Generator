import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  Store,
  CheckCircle2,
  CreditCard,
  Layout,
  Sparkles,
  Hash,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MpesaLogo } from './MpesaLogo';

// --- Types ---
export type PaymentType = 'till' | 'paybill' | 'send_money' | 'pochi' | 'agent';
export type PosterSize =
  | 'A4_Landscape'
  | 'A4_Portrait'
  | 'A5'
  | 'Square'
  | 'A3_Landscape'
  | 'A3_Portrait'
  | 'A6_Sticker'
  | 'HD_Display';
export type BusinessTheme =
  | 'default'
  | 'cafe'
  | 'church'
  | 'school'
  | 'retail'
  | 'salon'
  | 'cyber'
  | 'hotel'
  | 'pharmacy';
export type FontStyle = 'modern' | 'impact' | 'classic' | 'condensed' | 'mono';
export type BorderStyle = 'none' | 'clean' | 'double' | 'accent_top';
export type NumberBoxStyle = 'clean' | 'boxed' | 'filled';
export type WatermarkStyle = 'tiled' | 'centered' | 'corner';

export interface PosterData {
  id?: string;
  businessName: string;
  number: string;
  storeNumber?: string;
  paymentType: PaymentType;
  template: string;
  accentColor: string;
  logoUrl?: string;
  size: PosterSize;
  theme: BusinessTheme;
  customFooter?: string;
  headerSubtitle?: string;
  contactInfo?: string;
  fontStyle?: FontStyle;
  borderStyle?: BorderStyle;
  numberBoxStyle?: NumberBoxStyle;
  watermarkStyle?: WatermarkStyle;
  watermarkOpacity?: number;
  showQrCode?: boolean;
  qrMode?: 'standard' | 'daraja';
  qrAmount?: number;
  qrRefNo?: string;
  mpesaQrImage?: string;
  qrCodeContent?: string;
  showInstructions?: boolean;
  userId?: string;
  createdAt?: any;
}

// --- Constants ---
export const SIZES: {
  id: PosterSize;
  label: string;
  dimensions: string;
  resolutionNote: string;
  class: string;
  width: number;
  height: number;
}[] = [
  {
    id: 'A4_Landscape',
    label: 'A4 Landscape',
    dimensions: '297 × 210 mm',
    resolutionNote: '3508 × 2480 px @ 300 DPI',
    class: 'aspect-[1.414/1]',
    width: 297,
    height: 210,
  },
  {
    id: 'A4_Portrait',
    label: 'A4 Portrait',
    dimensions: '210 × 297 mm',
    resolutionNote: '2480 × 3508 px @ 300 DPI',
    class: 'aspect-[1/1.414]',
    width: 210,
    height: 297,
  },
  {
    id: 'A5',
    label: 'A5 Portrait',
    dimensions: '148 × 210 mm',
    resolutionNote: '1748 × 2480 px @ 300 DPI',
    class: 'aspect-[1/1.414]',
    width: 148,
    height: 210,
  },
  {
    id: 'Square',
    label: 'Square Stand',
    dimensions: '210 × 210 mm',
    resolutionNote: '2480 × 2480 px @ 300 DPI',
    class: 'aspect-square',
    width: 210,
    height: 210,
  },
  {
    id: 'A3_Landscape',
    label: 'A3 Landscape',
    dimensions: '420 × 297 mm',
    resolutionNote: '4961 × 3508 px @ 300 DPI',
    class: 'aspect-[1.414/1]',
    width: 420,
    height: 297,
  },
  {
    id: 'A3_Portrait',
    label: 'A3 Portrait',
    dimensions: '297 × 420 mm',
    resolutionNote: '3508 × 4961 px @ 300 DPI',
    class: 'aspect-[1/1.414]',
    width: 297,
    height: 420,
  },
  {
    id: 'A6_Sticker',
    label: 'A6 Sticker',
    dimensions: '105 × 148 mm',
    resolutionNote: '1240 × 1748 px @ 300 DPI',
    class: 'aspect-[1/1.414]',
    width: 105,
    height: 148,
  },
  {
    id: 'HD_Display',
    label: '16:9 Screen',
    dimensions: '338 × 190 mm',
    resolutionNote: '3600 × 2025 px (16:9 HD)',
    class: 'aspect-video',
    width: 338.67,
    height: 190.5,
  },
];

export const THEMES: {
  id: BusinessTheme;
  label: string;
  badgeLabel: string;
  subtitle: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'default',
    label: 'Standard',
    badgeLabel: 'Business Name',
    subtitle: 'Fast, Secure & Reliable',
    icon: <Smartphone className="h-4 w-4" />,
  },
  {
    id: 'cafe',
    label: 'Cafe / Food',
    badgeLabel: 'Cafe & Dining',
    subtitle: 'Pay & Enjoy Your Meal',
    icon: <Store className="h-4 w-4" />,
  },
  {
    id: 'church',
    label: 'Church / Giving',
    badgeLabel: 'Giving & Tithes',
    subtitle: 'Tithes, Offerings & Seeds',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    id: 'school',
    label: 'School Fees',
    badgeLabel: 'School & Institution',
    subtitle: 'Official School Fees Portal',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    id: 'retail',
    label: 'Retail Shop',
    badgeLabel: 'Retail Counter',
    subtitle: 'Quick Counter Checkout',
    icon: <Layout className="h-4 w-4" />,
  },
  {
    id: 'salon',
    label: 'Salon / Barber',
    badgeLabel: 'Salon & Grooming',
    subtitle: 'Style & Beauty Checkout',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: 'cyber',
    label: 'Cyber / Tech',
    badgeLabel: 'Cyber & Print Services',
    subtitle: 'Digital Services & Instant Print',
    icon: <Smartphone className="h-4 w-4" />,
  },
  {
    id: 'hotel',
    label: 'Hotel / Stay',
    badgeLabel: 'Hotel & Hospitality',
    subtitle: 'Hospitality & Bookings',
    icon: <Store className="h-4 w-4" />,
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    badgeLabel: 'Pharmacy & Care',
    subtitle: 'Trusted Healthcare Pay',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
];

// All poster templates are authentically themed around M-Pesa Green (#00A651)
export const TEMPLATES: {
  id: string;
  name: string;
  color: string;
  bg: string;
  text: string;
  dark?: boolean;
  greenHeaderBand?: boolean;
  solidGreen?: boolean;
  redTrim?: boolean;
}[] = [
  { id: 'modern_green', name: 'Modern Green', color: '#00A651', bg: 'bg-white', text: 'text-slate-900' },
  {
    id: 'safaricom_pro',
    name: 'M-Pesa Classic',
    color: '#00A651',
    bg: 'bg-white',
    text: 'text-slate-900',
    greenHeaderBand: true,
  },
  {
    id: 'bold_impact',
    name: 'Bold Green',
    color: '#00A651',
    bg: 'bg-[#00A651]',
    text: 'text-white',
    dark: true,
    solidGreen: true,
  },
  {
    id: 'neon_night',
    name: 'Neon Green',
    color: '#00E676',
    bg: 'bg-slate-950',
    text: 'text-white',
    dark: true,
  },
  {
    id: 'forest_executive',
    name: 'Forest Dark',
    color: '#22C55E',
    bg: 'bg-emerald-950',
    text: 'text-white',
    dark: true,
  },
  {
    id: 'soft_pastel',
    name: 'Soft Mint',
    color: '#00A651',
    bg: 'bg-emerald-50',
    text: 'text-emerald-950',
  },
  {
    id: 'corporate',
    name: 'Corporate Green',
    color: '#059669',
    bg: 'bg-slate-50',
    text: 'text-slate-900',
  },
  {
    id: 'classic_gold',
    name: 'Emerald & Gold',
    color: '#00A651',
    bg: 'bg-neutral-950',
    text: 'text-white',
    dark: true,
  },
  {
    id: 'vibrant_purple',
    name: 'Fresh Lime',
    color: '#16A34A',
    bg: 'bg-lime-50',
    text: 'text-emerald-950',
  },
  {
    id: 'red_green_classic',
    name: 'M-Pesa Heritage',
    color: '#00A651',
    bg: 'bg-white',
    text: 'text-slate-900',
    redTrim: true,
  },
  {
    id: 'minimalist',
    name: 'Minimalist Green',
    color: '#00A651',
    bg: 'bg-white',
    text: 'text-slate-900',
  },
  {
    id: 'eco_friendly',
    name: 'Eco Green',
    color: '#16A34A',
    bg: 'bg-green-50',
    text: 'text-green-950',
  },
];

export const ACCENT_COLORS = [
  '#00A651', // M-Pesa Green (Primary)
  '#059669', // Emerald
  '#16A34A', // Leaf Green
  '#008F45', // Deep M-Pesa Green
  '#22C55E', // Bright Green
  '#EE2E24', // Safaricom Red
  '#0F172A', // Deep Slate
  '#D4AF37', // Gold
];

export const FONT_STYLES: { id: FontStyle; label: string; family: string }[] = [
  { id: 'modern', label: 'Modern Sans', family: '"Plus Jakarta Sans", sans-serif' },
  { id: 'impact', label: 'Geometric', family: '"Outfit", sans-serif' },
  { id: 'condensed', label: 'Condensed', family: '"Barlow Condensed", sans-serif' },
  { id: 'classic', label: 'Editorial Serif', family: '"Playfair Display", serif' },
  { id: 'mono', label: 'Tech Mono', family: '"JetBrains Mono", monospace' },
];

export const BORDER_STYLES: { id: BorderStyle; label: string }[] = [
  { id: 'accent_top', label: 'Accent Bars' },
  { id: 'clean', label: 'Clean Frame' },
  { id: 'double', label: 'Double Border' },
  { id: 'none', label: 'Full Bleed' },
];

export const NUMBER_BOX_STYLES: { id: NumberBoxStyle; label: string }[] = [
  { id: 'boxed', label: 'Outlined Card' },
  { id: 'filled', label: 'Solid Accent' },
  { id: 'clean', label: 'Open Type' },
];

export const WATERMARK_STYLES: { id: WatermarkStyle; label: string }[] = [
  { id: 'tiled', label: 'Tiled Pattern' },
  { id: 'centered', label: 'Center Emblem' },
  { id: 'corner', label: 'Corner Crest' },
];

function isLightHex(hex: string): boolean {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  if (full.length !== 6) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62;
}

export const Poster: React.FC<{
  data: PosterData;
  innerRef?: React.RefObject<HTMLDivElement | null>;
  scale?: number;
}> = ({ data, innerRef, scale = 1 }) => {
  const selectedSize = SIZES.find((s) => s.id === data.size) || SIZES[0];
  const selectedTemplate = TEMPLATES.find((t) => t.id === data.template) || TEMPLATES[0];
  const selectedFont = FONT_STYLES.find((f) => f.id === (data.fontStyle || 'modern')) || FONT_STYLES[0];
  const selectedTheme = THEMES.find((t) => t.id === data.theme) || THEMES[0];

  const baseWidth = 1200;
  const aspectRatio = selectedSize.width / selectedSize.height;
  const baseHeight = baseWidth / aspectRatio;
  const isLandscape = selectedSize.width > selectedSize.height;
  const isSquare = data.size === 'Square';
  const isDark = Boolean(selectedTemplate.dark);
  const isSolidGreen = Boolean(selectedTemplate.solidGreen);
  const hasTwoNumbers = data.paymentType === 'paybill' || data.paymentType === 'agent';

  const watermarkStyle: WatermarkStyle = data.watermarkStyle || 'tiled';
  const watermarkOpacity = Math.max(0.04, Math.min(0.18, data.watermarkOpacity ?? 0.07));
  const borderStyle: BorderStyle = data.borderStyle || 'accent_top';
  const numberBoxStyle: NumberBoxStyle = data.numberBoxStyle || 'boxed';
  const showQrCode = data.showQrCode ?? true;
  const showInstructions = data.showInstructions ?? true;
  const showSideColumn = showQrCode || showInstructions;

  const displaySubtitle =
    data.headerSubtitle?.trim() || selectedTheme.subtitle || 'Fast, Secure & Reliable';
  const displayNumber = data.number?.trim() || '000000';
  const displayBusiness = data.businessName?.trim() || 'Business Name';
  const qrPayload =
    data.qrCodeContent?.trim() ||
    `MPESA|${data.paymentType.toUpperCase()}|${displayNumber}${
      hasTwoNumbers && data.storeNumber ? `|${data.storeNumber}` : ''
    }|${displayBusiness}`;

  // Ensure crisp contrast on solidGreen template
  const effectiveAccent = data.accentColor || '#00A651';
  const numberTextContrast = isLightHex(effectiveAccent) ? '#0F172A' : '#FFFFFF';

  const watermarkTiles = isLandscape ? Array.from({ length: 12 }) : Array.from({ length: 15 });

  return (
    <div
      style={{
        width: `${baseWidth * scale}px`,
        height: `${baseHeight * scale}px`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <div
          ref={innerRef}
          style={{
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            fontFamily: selectedFont.family,
          }}
          className={cn(
            'relative overflow-hidden shadow-2xl flex flex-col',
            selectedTemplate.bg,
            selectedTemplate.text
          )}
        >
          {/* M-Pesa Green Template Background Accents */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Subtle M-Pesa green glow on every template */}
            <div
              className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full opacity-[0.07]"
              style={{ backgroundColor: isSolidGreen ? '#FFFFFF' : '#00A651' }}
            />
            <div
              className="absolute -left-24 -bottom-24 h-[380px] w-[380px] rounded-full opacity-[0.06]"
              style={{ backgroundColor: isSolidGreen ? '#022C22' : '#00A651' }}
            />

            {selectedTemplate.greenHeaderBand && (
              <div
                className="absolute top-0 left-0 right-0 h-36"
                style={{ backgroundColor: effectiveAccent }}
              />
            )}

            {selectedTemplate.redTrim && (
              <div className="absolute top-3.5 left-0 right-0 h-2 bg-[#EE2E24]" />
            )}

            {data.template === 'neon_night' && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,230,118,0.16),transparent_65%)]" />
            )}

            {data.template === 'classic_gold' && (
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, #00A651 1.5px, transparent 0)',
                  backgroundSize: '36px 36px',
                }}
              />
            )}
          </div>

          {/* Permanent M-PESA Logo Watermark Layer (Always remains on posters) */}
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-0 pointer-events-none select-none overflow-hidden z-0',
              isSolidGreen && 'brightness-200 contrast-125'
            )}
            style={{ opacity: watermarkOpacity }}
          >
            {watermarkStyle === 'tiled' && (
              <div
                className={cn(
                  'grid items-center justify-items-center w-[130%] h-[130%] -ml-[15%] -mt-[15%] -rotate-12',
                  isLandscape ? 'grid-cols-4 gap-16' : 'grid-cols-3 gap-20'
                )}
              >
                {watermarkTiles.map((_, idx) => (
                  <MpesaLogo key={idx} className="w-52 h-auto" />
                ))}
              </div>
            )}
            {watermarkStyle === 'centered' && (
              <div className="flex h-full w-full items-center justify-center">
                <MpesaLogo className="w-[62%] h-auto -rotate-12" />
              </div>
            )}
            {watermarkStyle === 'corner' && (
              <div className="relative h-full w-full">
                <MpesaLogo className="absolute -bottom-10 -right-12 w-[58%] h-auto -rotate-12" />
                <MpesaLogo className="absolute top-10 left-10 w-[24%] h-auto -rotate-12 opacity-60" />
              </div>
            )}
          </div>

          {/* Border Frame Layer */}
          {borderStyle === 'clean' && (
            <div
              className="absolute inset-5 rounded-[32px] pointer-events-none z-20"
              style={{
                border: `4px solid ${isSolidGreen ? '#FFFFFF' : effectiveAccent}`,
                opacity: isSolidGreen ? 0.45 : 0.35,
              }}
            />
          )}
          {borderStyle === 'double' && (
            <>
              <div
                className="absolute inset-4 rounded-[36px] pointer-events-none z-20"
                style={{
                  border: `3px solid ${isSolidGreen ? '#FFFFFF' : effectiveAccent}`,
                  opacity: isSolidGreen ? 0.55 : 0.45,
                }}
              />
              <div
                className="absolute inset-7 rounded-[26px] pointer-events-none z-20"
                style={{
                  border: `1.5px solid ${isSolidGreen ? '#FFFFFF' : effectiveAccent}`,
                  opacity: isSolidGreen ? 0.35 : 0.25,
                }}
              />
            </>
          )}
          {borderStyle === 'accent_top' && (
            <>
              <div
                className="absolute top-0 left-0 right-0 h-3.5 pointer-events-none z-20"
                style={{ backgroundColor: isSolidGreen ? '#022C22' : effectiveAccent }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-3.5 pointer-events-none z-20"
                style={{ backgroundColor: isSolidGreen ? '#022C22' : effectiveAccent }}
              />
            </>
          )}

          {/* Main Poster Content */}
          <div
            className={cn(
              'relative z-10 flex h-full',
              isLandscape
                ? cn('flex-row gap-10 p-12 text-left', hasTwoNumbers && 'p-10 gap-8')
                : cn('flex-col justify-between gap-4 p-12 text-center', hasTwoNumbers && 'p-8 gap-2')
            )}
          >
            {/* Primary Left / Top Column */}
            <div
              className={cn(
                'flex flex-col min-h-0 justify-between',
                isLandscape
                  ? showSideColumn
                    ? 'flex-[1.35]'
                    : 'w-full items-center text-center'
                  : 'flex-1'
              )}
            >
              {/* Header with Permanent Official M-Pesa Logo */}
              <div
                className={cn(
                  'flex items-center justify-between w-full gap-6',
                  isLandscape && !showSideColumn && 'max-w-4xl mx-auto',
                  hasTwoNumbers && !isLandscape ? 'mb-1' : 'mb-2',
                  selectedTemplate.greenHeaderBand && 'text-white pb-4'
                )}
              >
                <div className="flex items-center gap-6 min-w-0">
                  {data.logoUrl ? (
                    <div
                      className={cn(
                        'flex items-center justify-center rounded-[28px] shadow-xl overflow-hidden bg-white shrink-0 border border-black/5',
                        isLandscape
                          ? hasTwoNumbers
                            ? 'h-20 w-20'
                            : 'h-24 w-24'
                          : hasTwoNumbers
                            ? 'h-16 w-16 rounded-[20px]'
                            : 'h-20 w-20'
                      )}
                    >
                      <img
                        src={data.logoUrl}
                        alt="Business Logo"
                        className="h-full w-full object-contain p-2.5"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'flex items-center justify-center rounded-[24px] shadow-xl overflow-hidden bg-white shrink-0 border border-black/5',
                        isLandscape
                          ? hasTwoNumbers
                            ? 'h-20 px-4 py-2.5'
                            : 'h-24 px-5 py-3'
                          : hasTwoNumbers
                            ? 'h-16 px-3.5 py-2 rounded-[18px]'
                            : 'h-20 px-4 py-2.5'
                      )}
                    >
                      <MpesaLogo className="h-full w-auto" />
                    </div>
                  )}

                  <div className="text-left min-w-0">
                    <h3
                      className={cn(
                        'font-extrabold uppercase tracking-tight leading-none',
                        isLandscape
                          ? hasTwoNumbers
                            ? 'text-3xl'
                            : 'text-4xl'
                          : hasTwoNumbers
                            ? 'text-2xl'
                            : 'text-3xl'
                      )}
                    >
                      {data.paymentType === 'pochi'
                        ? 'Pochi la Biashara'
                        : data.paymentType === 'agent'
                          ? 'M-Pesa Agent'
                          : 'Lipa na M-Pesa'}
                    </h3>
                    <p
                      className={cn(
                        'mt-1.5 font-bold uppercase tracking-[0.25em] truncate',
                        selectedTemplate.greenHeaderBand ? 'opacity-90' : 'opacity-65',
                        isLandscape ? 'text-sm' : 'text-xs'
                      )}
                    >
                      {displaySubtitle}
                    </p>
                  </div>
                </div>

                {/* Secondary Official M-PESA Badge when user uploads custom business logo */}
                {data.logoUrl && (
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-[20px] shadow-lg overflow-hidden bg-white shrink-0 border border-black/5',
                      isLandscape ? 'h-16 px-4 py-2' : hasTwoNumbers ? 'h-14 px-3 py-1.5' : 'h-16 px-4 py-2'
                    )}
                  >
                    <MpesaLogo className="h-full w-auto" />
                  </div>
                )}
              </div>

              {/* Business Name */}
              <div
                className={cn(
                  'w-full flex-shrink-0',
                  !isLandscape && 'my-1',
                  isLandscape && !showSideColumn && 'max-w-4xl mx-auto'
                )}
              >
                <div
                  className={cn(
                    'inline-block rounded-full font-extrabold uppercase tracking-[0.2em] mb-2',
                    isDark ? 'bg-white/15 text-white' : 'bg-[#00A651]/10 text-[#007a3d]',
                    isLandscape ? 'px-5 py-1.5 text-sm' : 'px-4 py-1 text-xs'
                  )}
                >
                  {selectedTheme.badgeLabel}
                </div>
                <h2
                  className={cn(
                    'font-black tracking-tight leading-[0.98] break-words',
                    isLandscape ? 'text-6xl' : isSquare ? 'text-6xl' : 'text-7xl px-2',
                    displayBusiness.length > 16 && (isLandscape ? 'text-5xl' : 'text-5xl'),
                    displayBusiness.length > 26 && (isLandscape ? 'text-4xl' : 'text-4xl'),
                    displayBusiness.length > 40 && 'text-3xl',
                    hasTwoNumbers && !isLandscape && displayBusiness.length > 18 && 'text-4xl'
                  )}
                >
                  {displayBusiness}
                </h2>
                <div
                  className={cn(
                    'rounded-full mt-3',
                    isLandscape && showSideColumn ? 'h-2 w-24' : 'h-1.5 w-24 mx-auto'
                  )}
                  style={{ backgroundColor: isSolidGreen ? '#FFFFFF' : effectiveAccent }}
                />
              </div>

              {/* Payment Number Block */}
              <div
                className={cn(
                  'w-full flex flex-col',
                  isLandscape && showSideColumn ? 'items-start gap-4' : 'items-center gap-3',
                  isLandscape && !showSideColumn && 'max-w-4xl mx-auto'
                )}
              >
                <div className="w-full">
                  <div
                    className={cn(
                      'flex items-center gap-2.5 mb-2',
                      (!isLandscape || !showSideColumn) && 'justify-center'
                    )}
                  >
                    <Hash className="h-5 w-5 opacity-60" />
                    <span className="font-extrabold uppercase tracking-[0.28em] opacity-80 text-lg">
                      {data.paymentType === 'till' && 'Buy Goods Till Number'}
                      {data.paymentType === 'paybill' && 'Paybill Business Number'}
                      {data.paymentType === 'send_money' && 'M-Pesa Phone Number'}
                      {data.paymentType === 'pochi' && 'Pochi la Biashara Number'}
                      {data.paymentType === 'agent' && 'Agent Number'}
                    </span>
                  </div>

                  <div
                    className={cn(
                      'inline-flex items-center justify-center transition-all',
                      numberBoxStyle === 'boxed' &&
                        cn(
                          'rounded-[28px] px-8 py-4 shadow-sm',
                          isSolidGreen
                            ? 'bg-white text-slate-900'
                            : isDark
                              ? 'bg-white/5'
                              : 'bg-white/90'
                        ),
                      numberBoxStyle === 'filled' && 'rounded-[28px] px-8 py-4 shadow-xl',
                      (!isLandscape || !showSideColumn) && 'mx-auto',
                      hasTwoNumbers && isLandscape && 'px-6 py-3'
                    )}
                    style={
                      numberBoxStyle === 'boxed'
                        ? { border: `4px solid ${isSolidGreen ? '#FFFFFF' : effectiveAccent}` }
                        : numberBoxStyle === 'filled'
                          ? {
                              backgroundColor: isSolidGreen ? '#FFFFFF' : effectiveAccent,
                              color: isSolidGreen ? '#00A651' : numberTextContrast,
                            }
                          : undefined
                    }
                  >
                    <div
                      className={cn(
                        'font-black tracking-tight leading-none break-all tabular-nums',
                        isLandscape
                          ? hasTwoNumbers
                            ? 'text-[5.5rem]'
                            : 'text-[7.5rem]'
                          : isSquare
                            ? hasTwoNumbers
                              ? 'text-[5.5rem]'
                              : 'text-[7.5rem]'
                            : hasTwoNumbers
                              ? 'text-[6.5rem]'
                              : 'text-[8.5rem]',
                        displayNumber.length > 7 && (isLandscape ? 'text-[5rem]' : 'text-[6.2rem]'),
                        displayNumber.length > 10 && 'text-[4.2rem]',
                        displayNumber.length > 14 && 'text-[3.4rem]',
                        data.template === 'neon_night' &&
                          numberBoxStyle !== 'filled' &&
                          'text-[#00E676] drop-shadow-[0_0_28px_rgba(0,230,118,0.6)]'
                      )}
                    >
                      {displayNumber}
                    </div>
                  </div>
                </div>

                {/* Store / Account Number */}
                {hasTwoNumbers && data.storeNumber && (
                  <div
                    className={cn(
                      'w-full max-w-xl rounded-[24px] px-7 py-4 border',
                      isSolidGreen
                        ? 'bg-white/95 text-slate-900 border-white'
                        : isDark
                          ? 'bg-white/5 border-white/15'
                          : 'bg-[#00A651]/5 border-[#00A651]/20',
                      isLandscape && showSideColumn ? 'text-left' : 'text-center mx-auto'
                    )}
                  >
                    <p className="font-extrabold uppercase tracking-[0.3em] opacity-65 text-sm mb-1">
                      {data.paymentType === 'agent' ? 'Store Number' : 'Account Number'}
                    </p>
                    <p
                      className={cn(
                        'font-black tracking-tight leading-none break-all tabular-nums',
                        isLandscape ? 'text-5xl' : 'text-6xl',
                        data.storeNumber.length > 10 && 'text-4xl',
                        data.storeNumber.length > 16 && 'text-3xl'
                      )}
                    >
                      {data.storeNumber}
                    </p>
                  </div>
                )}
              </div>

              {/* Optional Contact / Branch Line */}
              {isLandscape && (data.contactInfo || !showSideColumn) && (
                <div
                  className={cn(
                    'flex items-center justify-between pt-2 text-sm font-bold opacity-80',
                    !showSideColumn && 'justify-center gap-6'
                  )}
                >
                  {data.contactInfo && <span>{data.contactInfo}</span>}
                  {!showSideColumn && (
                    <span className="italic">"{data.customFooter || 'Thank you for your business!'}"</span>
                  )}
                </div>
              )}
            </div>

            {/* Right / Bottom Instructions + QR Code Column */}
            {showSideColumn && (
              <div
                className={cn(
                  'flex flex-col min-h-0',
                  isLandscape
                    ? cn(
                        'flex-1 justify-between pl-8 border-l',
                        isDark ? 'border-white/20' : 'border-black/10',
                        selectedTemplate.greenHeaderBand && 'pt-28'
                      )
                    : 'w-full gap-4 mt-2'
                )}
              >
                <div
                  className={cn(
                    'flex gap-4 flex-1 min-h-0',
                    isLandscape
                      ? 'flex-col justify-center'
                      : showInstructions && showQrCode
                        ? 'grid grid-cols-12 items-stretch'
                        : 'flex-col items-center justify-center'
                  )}
                >
                  {/* How to Pay Card */}
                  {showInstructions && (
                    <div
                      className={cn(
                        'rounded-[28px] border backdrop-blur-sm text-left flex flex-col justify-center',
                        isSolidGreen
                          ? 'bg-white text-slate-900 border-white shadow-lg'
                          : isDark
                            ? 'bg-white/5 border-white/15'
                            : 'bg-white/85 border-[#00A651]/20',
                        isLandscape
                          ? 'p-6 space-y-3.5'
                          : showQrCode
                            ? 'col-span-7 p-5 space-y-2.5'
                            : 'w-full max-w-2xl p-6 space-y-3'
                      )}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-sm"
                          style={{ backgroundColor: effectiveAccent, color: numberTextContrast }}
                        >
                          1
                        </div>
                        <p className="font-extrabold uppercase tracking-[0.2em] text-base">
                          How to Pay
                        </p>
                      </div>

                      <div className="space-y-2 text-base font-bold leading-snug opacity-85">
                        <div className="flex items-start gap-2.5">
                          <span
                            className="mt-2 h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: effectiveAccent }}
                          />
                          <span>
                            {data.paymentType === 'send_money' || data.paymentType === 'agent'
                              ? 'Go to M-PESA menu on your phone'
                              : 'Go to Lipa na M-PESA menu'}
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span
                            className="mt-2 h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: effectiveAccent }}
                          />
                          <span>
                            Select{' '}
                            {data.paymentType === 'till'
                              ? 'Buy Goods & Services'
                              : data.paymentType === 'paybill'
                                ? 'Pay Bill'
                                : data.paymentType === 'pochi'
                                  ? 'Pochi la Biashara'
                                  : data.paymentType === 'agent'
                                    ? 'Withdraw Cash → From Agent'
                                    : 'Send Money'}
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span
                            className="mt-2 h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: effectiveAccent }}
                          />
                          <span>
                            Enter{' '}
                            {data.paymentType === 'paybill'
                              ? 'Business No.'
                              : data.paymentType === 'agent'
                                ? 'Agent No.'
                                : 'Number'}
                            : <strong className="font-black tabular-nums">{displayNumber}</strong>
                          </span>
                        </div>
                        {data.paymentType === 'paybill' && data.storeNumber && (
                          <div className="flex items-start gap-2.5">
                            <span
                              className="mt-2 h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: effectiveAccent }}
                            />
                            <span>
                              Enter Account:{' '}
                              <strong className="font-black tabular-nums">{data.storeNumber}</strong>
                            </span>
                          </div>
                        )}
                        {data.paymentType === 'agent' && data.storeNumber && (
                          <div className="flex items-start gap-2.5">
                            <span
                              className="mt-2 h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: effectiveAccent }}
                            />
                            <span>
                              Enter Store No:{' '}
                              <strong className="font-black tabular-nums">{data.storeNumber}</strong>
                            </span>
                          </div>
                        )}
                        <div className="flex items-start gap-2.5">
                          <span
                            className="mt-2 h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: effectiveAccent }}
                          />
                          <span>Enter Amount, M-PESA PIN & confirm</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QR Code Card */}
                  {showQrCode && (
                    <div
                      className={cn(
                        'rounded-[28px] border bg-white text-slate-900 shadow-sm flex items-center gap-4',
                        isDark ? 'border-white/20' : 'border-[#00A651]/20',
                        isLandscape
                          ? showInstructions
                            ? 'p-5 flex-row justify-start'
                            : 'p-8 flex-col justify-center text-center'
                          : showInstructions
                            ? 'col-span-5 p-5 flex-col justify-center text-center'
                            : 'p-6 flex-row justify-center'
                      )}
                    >
                      <div className="rounded-2xl bg-white p-2 border border-slate-100 shrink-0">
                        {data.qrMode === 'daraja' && data.mpesaQrImage ? (
                          <img
                            src={data.mpesaQrImage}
                            alt="Official M-Pesa QR Code"
                            style={{
                              width: isLandscape ? (showInstructions ? 116 : 210) : 140,
                              height: isLandscape ? (showInstructions ? 116 : 210) : 140,
                            }}
                            className="object-contain rounded-lg"
                          />
                        ) : (
                          <QRCodeSVG
                            value={qrPayload}
                            size={isLandscape ? (showInstructions ? 116 : 210) : 140}
                            level="M"
                            fgColor="#0F172A"
                            bgColor="#FFFFFF"
                          />
                        )}
                      </div>
                      <div className={cn(!isLandscape || !showInstructions ? 'text-center' : 'text-left')}>
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#00A651]">
                          {data.qrMode === 'daraja' && data.mpesaQrImage ? 'Official M-Pesa QR' : 'Quick Scan'}
                        </p>
                        <p className="text-base font-black text-slate-900 mt-0.5 leading-tight">
                          {data.qrMode === 'daraja' && data.mpesaQrImage
                            ? 'Scan with M-PESA App'
                            : 'Scan Payment Details'}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 mt-1 tabular-nums">
                          {data.paymentType === 'till'
                            ? `Till ${displayNumber}`
                            : data.paymentType === 'paybill'
                              ? `Paybill ${displayNumber}`
                              : displayNumber}
                          {data.qrMode === 'daraja' &&
                          data.mpesaQrImage &&
                          data.qrAmount &&
                          data.qrAmount > 1
                            ? ` · KES ${data.qrAmount.toLocaleString()}`
                            : ''}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Message & Contact Info */}
                <div
                  className={cn(
                    'w-full pt-3 border-t flex items-center justify-between gap-4',
                    isDark ? 'border-white/20' : 'border-black/10',
                    !isLandscape && 'flex-col text-center gap-1'
                  )}
                >
                  <p className="font-bold uppercase tracking-[0.14em] opacity-85 italic text-sm break-words">
                    "{data.customFooter || 'Thank you for your business!'}"
                  </p>
                  {!isLandscape && data.contactInfo && (
                    <p className="text-xs font-bold opacity-75">{data.contactInfo}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
