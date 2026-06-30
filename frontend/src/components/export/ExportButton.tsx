import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileDown, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportButtonProps {
  module: string;
  className?: string;
  availableColumns?: string[];
  data?: any[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ module, className = '', availableColumns = [], data = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'pdf'>('pdf');
  const [columns, setColumns] = useState<string[]>(availableColumns);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    setIsExporting(true);
    
    setTimeout(() => {
      if (format === 'csv') {
        exportCSV();
      } else {
        exportPDF();
      }
      setIsExporting(false);
      setIsOpen(false);
    }, 500);
  };

  const exportCSV = () => {
    const headers = columns.join(',');
    const rows = data.map(item => {
      return columns.map(col => {
        let val = item[col];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return val;
      }).join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${module}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Add beautiful header
    doc.setFillColor(29, 158, 117); // Brand Teal
    doc.rect(0, 0, 220, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Byparsathy", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${module.toUpperCase()} EXPORT`, 150, 20);

    // Subtitle
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`My ${module.charAt(0).toUpperCase() + module.slice(1)} Report`, 14, 45);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 52);
    doc.text(`Total Records: ${data.length}`, 14, 57);

    // Prepare Table Data
    const tableHeaders = columns.map(c => c.charAt(0).toUpperCase() + c.slice(1));
    const tableRows = data.map(item => columns.map(col => item[col] || '-'));

    // AutoTable
    autoTable(doc, {
      startY: 65,
      head: [tableHeaders],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [127, 119, 221], // Brand Purple
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 4,
        lineColor: [230, 230, 230],
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // slate-50
      }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 25, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`${module}_report.pdf`);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-slate-custom/10 rounded-inputs hover:bg-sky-wash hover:text-signal-blue focus:outline-none transition-colors shadow-sm ${className}`}
      >
        <Download size={16} />
        Export Data
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-graphite">Export {module.charAt(0).toUpperCase() + module.slice(1)}</h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-xs font-bold text-fog uppercase tracking-wider mb-3">Format</label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 cursor-pointer transition-all ${format === 'pdf' ? 'border-signal-blue bg-signal-blue/5 text-signal-blue shadow-sm' : 'border-gray-100 hover:border-gray-200 text-ash hover:text-graphite'}`}
                onClick={() => setFormat('pdf')}
              >
                {format === 'pdf' && <CheckCircle2 size={16} className="absolute top-3 right-3 text-signal-blue" />}
                <FileDown size={28} className="mb-2" />
                <span className="font-bold text-sm">PDF Report</span>
              </div>
              <div 
                className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 cursor-pointer transition-all ${format === 'csv' ? 'border-signal-blue bg-signal-blue/5 text-signal-blue shadow-sm' : 'border-gray-100 hover:border-gray-200 text-ash hover:text-graphite'}`}
                onClick={() => setFormat('csv')}
              >
                {format === 'csv' && <CheckCircle2 size={16} className="absolute top-3 right-3 text-signal-blue" />}
                <FileText size={28} className="mb-2" />
                <span className="font-bold text-sm">CSV Data</span>
              </div>
            </div>
          </div>
          
          {/* Columns Selection */}
          {availableColumns.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-bold text-fog uppercase tracking-wider">Include Columns</label>
                <button onClick={() => setColumns(availableColumns)} className="text-xs font-bold text-signal-blue hover:underline">Select All</button>
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
                {availableColumns.map(col => (
                  <label key={col} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={columns.includes(col)}
                      onChange={(e) => {
                        if (e.target.checked) setColumns([...columns, col]);
                        else setColumns(columns.filter(c => c !== col));
                      }}
                      className="w-4 h-4 rounded text-signal-blue focus:ring-signal-blue border-gray-300 transition-colors"
                    />
                    <span className="text-sm font-medium text-graphite group-hover:text-signal-blue transition-colors">
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button 
            onClick={() => setIsOpen(false)}
            className="px-5 py-2.5 text-sm font-bold text-ash bg-white border border-gray-200 rounded-inputs hover:text-graphite transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-signal-blue rounded-inputs hover:bg-signal-blue/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isExporting ? <span className="animate-pulse">Exporting...</span> : <Download size={16} />}
            {isExporting ? 'Generating' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};
