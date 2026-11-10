// Real, Standard-Compliant Scannable QR Code Component using 'qrcode'
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  label?: string;
}

export const QrCodeDisplay: React.FC<QrCodeProps> = ({
  value,
  size = 180,
  className = '',
  label
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to generate QR code:', err);
          setError('Failed to render QR');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  return (
    <div className={`inline-flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={label || value}
          width={size}
          height={size}
          className="rounded-sm"
        />
      ) : error ? (
        <div 
          style={{ width: size, height: size }}
          className="flex items-center justify-center text-xs text-rose-500 font-mono"
        >
          {error}
        </div>
      ) : (
        <div 
          style={{ width: size, height: size }} 
          className="bg-slate-100 animate-pulse rounded-sm" 
        />
      )}
      {label && (
        <span className="mt-2 text-[11px] font-mono font-medium text-slate-500 tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};
