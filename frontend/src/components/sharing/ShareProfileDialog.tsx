import React, { useState, useRef } from 'react';
import { Share2, Copy, Download, Check, ExternalLink, X, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useShareProfile } from '../../features/sharing';

export const ShareProfileDialog: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { data: shareInfo, isLoading } = useShareProfile();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

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
          title: `Check out ${shareInfo.username}'s profile on B2P Connect`,
          url: shareInfo.public_url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current || !shareInfo) return;
    
    // Convert SVG to Canvas then to PNG
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Add padding and background for the downloaded image
      canvas.width = img.width + 40;
      canvas.height = img.height + 80;
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        
        // Add branding text
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillStyle = '#111827';
        ctx.textAlign = 'center';
        ctx.fillText('B2P Connect', canvas.width / 2, canvas.height - 30);
        
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#6B7280';
        ctx.fillText(`@${shareInfo.slug}`, canvas.width / 2, canvas.height - 12);
        
        const a = document.createElement('a');
        a.download = `${shareInfo.slug}-qr-code.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="share-profile-title">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>
        
        <div className="px-6 pt-8 pb-6 flex flex-col items-center border-b border-gray-100">
          <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-4 shadow-sm border border-primary-100">
            <QrCode size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Share Public Profile</h2>
          <p className="text-sm text-gray-500 text-center max-w-[280px]">
            Scan this QR code or share the link below to invite others to view your professional portfolio.
          </p>
        </div>
        
        <div className="p-6 bg-gray-50 flex flex-col items-center">
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : shareInfo ? (
            <>
              {/* QR Code Container */}
              <div 
                ref={qrRef}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6"
              >
                <QRCodeSVG 
                  value={shareInfo.public_url}
                  size={200}
                  level="H"
                  includeMargin={true}
                  fgColor="#111827"
                />
              </div>

              {/* Link Box */}
              <div className="w-full mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Public Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 font-mono truncate shadow-sm">
                    {shareInfo.public_url}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    title="Copy Link"
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Download size={16} />
                  Download QR
                </button>
                
                {navigator.share ? (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Share2 size={16} />
                    Share Profile
                  </button>
                ) : (
                  <a
                    href={shareInfo.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <ExternalLink size={16} />
                    Open Profile
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-red-500">Failed to load share information.</p>
          )}
        </div>
      </div>
    </div>
  );
};
