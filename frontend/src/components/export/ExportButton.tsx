import React, { useState } from 'react';
import { Download, Loader2, FileSpreadsheet, FileText } from 'lucide-react';
import { useExport } from '../../features/export';

interface ExportButtonProps {
  module: string;
  className?: string;
  availableColumns?: string[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ module, className = '', availableColumns = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');
  const [columns, setColumns] = useState<string[]>(availableColumns);
  const exportMutation = useExport();

  const handleExport = () => {
    exportMutation.mutate(
      { module, format, columns: columns.length > 0 ? columns : undefined },
      { onSuccess: () => setIsOpen(false) }
    );
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm ${className}`}
      >
        <Download size={16} />
        Export
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Export Data: {module.charAt(0).toUpperCase() + module.slice(1)}</h3>
        </div>
        
        <div className="p-6 space-y-5">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${format === 'csv' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                onClick={() => setFormat('csv')}
              >
                <FileText size={24} className="mb-2" />
                <span className="font-semibold text-sm">CSV</span>
              </div>
              <div 
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors opacity-50 ${format === 'xlsx' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-400'}`}
                title="Excel export coming soon"
              >
                <FileSpreadsheet size={24} className="mb-2" />
                <span className="font-semibold text-sm">Excel (XLSX)</span>
              </div>
            </div>
          </div>
          
          {/* Columns Selection */}
          {availableColumns.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                <span>Columns</span>
                <button onClick={() => setColumns(availableColumns)} className="text-xs text-primary-600 hover:text-primary-700">Select All</button>
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2 bg-gray-50">
                {availableColumns.map(col => (
                  <label key={col} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={columns.includes(col)}
                      onChange={(e) => {
                        if (e.target.checked) setColumns([...columns, col]);
                        else setColumns(columns.filter(c => c !== col));
                      }}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{col}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button 
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {exportMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Generate Export
          </button>
        </div>
      </div>
    </div>
  );
};
