import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Field {
  label: string;
  value: string;
}

interface ESocialFieldPreviewProps {
  title: string;
  fields: Field[];
}

export function ESocialFieldPreview({ title, fields }: ESocialFieldPreviewProps) {
  const [copied, setCopied] = useState(false);

  function copyAll() {
    const text = fields.map(f => `${f.label}: ${f.value}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copySingle(value: string) {
    navigator.clipboard.writeText(value);
  }

  return (
    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-emerald-900">
          📋 {title}
        </h4>
        <button
          type="button"
          onClick={copyAll}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-700 transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copiado!' : 'Copiar tudo'}
        </button>
      </div>
      <div className="space-y-2">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center gap-2 group">
            <div className="flex-1 bg-white border border-emerald-200 rounded px-3 py-2">
              <p className="text-xs text-emerald-600 font-medium">{field.label}</p>
              <p className="text-sm text-gray-900 font-semibold">{field.value}</p>
            </div>
            <button
              type="button"
              onClick={() => copySingle(field.value)}
              className="p-1.5 text-emerald-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copiar valor"
            >
              <Copy size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
