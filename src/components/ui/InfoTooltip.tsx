import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  title?: string;
}

export function InfoTooltip({ text, title }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-info hover:text-primary transition-colors p-0 bg-transparent border-none cursor-pointer"
        aria-label="Mais informações"
      >
        <HelpCircle size={16} />
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-700">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
          >
            <X size={14} />
          </button>
          {title && <p className="font-semibold text-gray-900 mb-1">{title}</p>}
          <p className="leading-relaxed">{text}</p>
        </div>
      )}
    </span>
  );
}
