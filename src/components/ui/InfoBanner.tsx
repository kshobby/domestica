import { Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

type BannerType = 'info' | 'warning' | 'success' | 'error';

interface InfoBannerProps {
  type?: BannerType;
  title: string;
  children: React.ReactNode;
}

const config: Record<BannerType, { bg: string; border: string; icon: typeof Info; iconColor: string }> = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, iconColor: 'text-blue-500' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500' },
  success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-500' },
  error: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, iconColor: 'text-red-500' },
};

export function InfoBanner({ type = 'info', title, children }: InfoBannerProps) {
  const { bg, border, icon: Icon, iconColor } = config[type];

  return (
    <div className={`${bg} ${border} border rounded-lg p-4 mb-4`}>
      <div className="flex gap-3">
        <Icon className={`${iconColor} shrink-0 mt-0.5`} size={20} />
        <div>
          <p className="font-semibold text-gray-900 mb-1">{title}</p>
          <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
