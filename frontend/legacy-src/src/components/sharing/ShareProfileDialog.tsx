import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Copy, Download, Check, ExternalLink, X, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useShareProfile } from '../../features/sharing';
import { useAuth } from '../../providers/AuthProvider';
import { Role } from '../../constants/roles';

export const ShareProfileDialog: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { data: shareInfo, isLoading } = useShareProfile();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const isPromoter = user?.role === Role.PROMOTER;
  const isBusiness = user?.role === Role.BUSINESS;

  const subtitle = isPromoter
    ? 'Share your promoter profile so businesses can discover and collaborate with you.'
    : isBusiness
    ? 'Share your business presence so promoters can find your campaigns.'
    : 'Share your profile link.';

  const handleCopy = async () => {
    if (shareInfo?.public_url) {
      await navigator.clipboard.writeText(shareInfo.public_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (shareInfo?.public_url && navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${shareInfo.username} on Byparsathy`,
          url: shareInfo.public_url,
        });
      } catch (err) {
        // user cancelled share
      }
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current || !shareInfo) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 80;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#1c1917';
        ctx.textAlign = 'center';
        ctx.fillText('Byparsathy', canvas.width / 2, canvas.height - 28);
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#78716c';
        ctx.fillText(`@${shareInfo.slug}`, canvas.width / 2, canvas.height - 10);
        const a = document.createElement('a');
        a.download = `${shareInfo.slug}-qr.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-graphite/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-cards-lg w-full max-w-md overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-profile-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-custom/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-button bg-signal-blue/10 flex items-center justify-center">
              <QrCode size={18} className="text-signal-blue" />
            </div>
            <div>
              <h2 id="share-profile-title" className="text-heading text-graphite">
                Share {isPromoter ? 'Promoter' : 'Business'} Profile
              </h2>
              <p className="text-xs text-ash">{shareInfo?.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ash hover:text-graphite hover:bg-sky-wash rounded-button transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-ash mb-6">{subtitle}</p>

          {isLoading ? (
            <div className="h-52 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-signal-blue border-t-transparent animate-spin" />
            </div>
          ) : shareInfo ? (
            <>
              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div ref={qrRef} className="bg-linen-canvas border border-slate-custom/10 rounded-images p-4">
                  <QRCodeSVG
                    value={shareInfo.public_url}
                    size={180}
                    level="H"
                    includeMargin={true}
                    fgColor="#1c1917"
                    bgColor="#fafaf9"
                  />
                </div>
              </div>

              {/* Link */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-ash uppercase tracking-wider mb-2">
                  Public Link
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-linen-canvas border border-slate-custom/10 rounded-inputs">
                  <span className="flex-1 text-sm text-graphite font-mono truncate">
                    {shareInfo.public_url}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md text-ash hover:text-signal-blue hover:bg-signal-blue/10 transition-colors flex-shrink-0"
                    title="Copy link"
                  >
                    {copied ? <Check size={16} className="text-emerald-status" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-inputs border border-slate-custom/10 bg-white text-sm font-medium text-graphite hover:bg-sky-wash transition-colors"
                >
                  <Download size={15} />
                  Download QR
                </button>

                {navigator.share ? (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-inputs bg-signal-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Share2 size={15} />
                    Share
                  </button>
                ) : (
                  <a
                    href={shareInfo.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-inputs bg-signal-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink size={15} />
                    Open Profile
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-coral-alert text-center py-8">Failed to load share information.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
