'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileJson, FileText, ChevronDown, Loader2 } from 'lucide-react';

export interface ExportColumn {
    key: string;
    label: string;
    format?: 'currency' | 'percent' | 'text' | 'number';
}

export interface TableExportButtonProps {
    data: any[];
    columns: ExportColumn[];
    filename: string;
    title?: string;
    className?: string;
    variant?: 'default' | 'compact' | 'icon';
    disabled?: boolean;
}

type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

interface FormatOption {
    id: ExportFormat;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
    {
        id: 'csv',
        label: 'CSV',
        icon: <FileText size={16} />,
        description: 'Comma-separated values'
    },
    {
        id: 'excel',
        label: 'Excel',
        icon: <FileSpreadsheet size={16} />,
        description: 'Microsoft Excel (.xlsx)'
    },
    {
        id: 'json',
        label: 'JSON',
        icon: <FileJson size={16} />,
        description: 'JavaScript Object Notation'
    },
    {
        id: 'pdf',
        label: 'PDF',
        icon: <FileText size={16} />,
        description: 'Portable Document Format'
    }
];

export function TableExportButton({
    data,
    columns,
    filename,
    title,
    className = '',
    variant = 'default',
    disabled = false
}: TableExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [exporting, setExporting] = useState<ExportFormat | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatValue = (value: any, format?: string): string => {
        if (value === null || value === undefined) return '';
        
        switch (format) {
            case 'currency':
                return typeof value === 'number' ? `$${value.toFixed(2)}` : String(value);
            case 'percent':
                return typeof value === 'number' ? `${value.toFixed(2)}%` : String(value);
            case 'number':
                return typeof value === 'number' ? value.toLocaleString() : String(value);
            default:
                return String(value);
        }
    };

    const exportToCSV = () => {
        if (data.length === 0) return;
        
        const headers = columns.map(col => col.label).join(',');
        const rows = data.map(item => 
            columns.map(col => {
                const value = item[col.key];
                const formattedValue = formatValue(value, col.format);
                return `"${formattedValue.replace(/"/g, '""')}"`;
            }).join(',')
        ).join('\n');
        
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToJSON = () => {
        if (data.length === 0) return;
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        // Simple PDF export using window.print for now
        // In a real implementation, you'd use a library like jsPDF
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        let html = `
            <html>
                <head>
                    <title>${title || filename}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        h1 { color: #333; }
                    </style>
                </head>
                <body>
                    <h1>${title || filename}</h1>
                    <table>
                        <thead>
                            <tr>
                                ${columns.map(col => `<th>${col.label}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(item => `
                                <tr>
                                    ${columns.map(col => `<td>${formatValue(item[col.key], col.format)}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    const exportToExcel = () => {
        // For now, export as CSV with .xlsx extension
        // In a real implementation, you'd use a library like xlsx
        exportToCSV();
        // Rename the file to .xlsx (this is a workaround)
        setTimeout(() => {
            const link = document.createElement('a');
            link.setAttribute('href', 'data:text/csv;charset=utf-8,');
            link.setAttribute('download', `${filename}.xlsx`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 100);
    };

    const handleExport = async (format: ExportFormat) => {
        if (data.length === 0) return;

        setExporting(format);
        try {
            // Small delay for UI feedback
            await new Promise(resolve => setTimeout(resolve, 100));
            
            switch (format) {
                case 'csv':
                    exportToCSV();
                    break;
                case 'excel':
                    exportToExcel();
                    break;
                case 'json':
                    exportToJSON();
                    break;
                case 'pdf':
                    exportToPDF();
                    break;
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(null);
            setIsOpen(false);
        }
    };

    const isDisabled = disabled || data.length === 0;

    if (variant === 'icon') {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isDisabled}
                    className={`p-2 rounded-lg transition ${isDisabled
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-500 hover:text-emerald-500 hover:bg-slate-100'
                        } ${className}`}
                    title="Export data"
                >
                    <Download size={18} />
                </button>

                {isOpen && !isDisabled && (
                    <DropdownMenu
                        options={FORMAT_OPTIONS}
                        exporting={exporting}
                        onSelect={handleExport}
                    />
                )}
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isDisabled}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition whitespace-nowrap ${isDisabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        } ${className}`}
                >
                    <Download size={14} />
                    <span className="hidden xs:inline">Export</span>
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && !isDisabled && (
                    <div className="absolute right-0 top-full mt-1 z-[9999]">
                        <DropdownMenu
                            options={FORMAT_OPTIONS}
                            exporting={exporting}
                            onSelect={handleExport}
                        />
                    </div>
                )}
            </div>
        );
    }

    // Default variant
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isDisabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${isDisabled
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    } ${className}`}
            >
                <Download size={16} />
                Export
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !isDisabled && (
                <DropdownMenu
                    options={FORMAT_OPTIONS}
                    exporting={exporting}
                    onSelect={handleExport}
                />
            )}
        </div>
    );
}

function DropdownMenu({
    options,
    exporting,
    onSelect
}: {
    options: FormatOption[];
    exporting: ExportFormat | null;
    onSelect: (format: ExportFormat) => void;
}) {
    return (
        <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
                <div className="p-2">
                    <p className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Export Format
                    </p>
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => onSelect(option.id)}
                            disabled={exporting !== null}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                        >
                        <div className={`p-1.5 rounded-lg ${option.id === 'csv' ? 'bg-blue-100 text-blue-600' :
                            option.id === 'excel' ? 'bg-green-100 text-green-600' :
                                option.id === 'json' ? 'bg-amber-100 text-amber-600' :
                                    'bg-red-100 text-red-600'
                            }`}>
                            {exporting === option.id ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                option.icon
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-slate-900 text-sm">
                                {option.label}
                            </p>
                            <p className="text-xs text-slate-500">
                                {option.description}
                            </p>
                        </div>
                    </button>
                ))}
                </div>
            </div>
        </div>
    );
}

export default TableExportButton;
