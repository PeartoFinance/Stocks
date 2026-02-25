'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileJson, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { useSubscription } from '@/app/context/SubscriptionContext';
import { UpgradeModal } from '@/app/components/subscription/FeatureGating';
import { FEATURES, LIMITS } from '@/app/utils/featureKeys';

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
    const [showUpgrade, setShowUpgrade] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { trackUsage } = useSubscription();

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
        console.log('[CSV] Starting CSV export...');
        if (data.length === 0) {
            console.log('[CSV] No data');
            return;
        }
        
        try {
            const headers = columns.map(col => col.label).join(',');
            const rows = data.map(item => 
                columns.map(col => {
                    const value = item[col.key];
                    const formattedValue = formatValue(value, col.format);
                    return `"${formattedValue.replace(/"/g, '""')}"`;
                }).join(',')
            ).join('\n');
            
            const csv = `${headers}\n${rows}`;
            console.log('[CSV] Generated CSV, length:', csv.length);
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = `${filename}.csv`;
            document.body.appendChild(link);
            console.log('[CSV] Triggering download...');
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log('[CSV] Download triggered');
        } catch (error) {
            console.error('[CSV] Error:', error);
        }
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
        link.setAttribute('download', `${filename}.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = async (format: ExportFormat) => {
        console.log('[Export] Starting export:', format, 'Data length:', data.length);
        if (data.length === 0) {
            console.log('[Export] No data to export');
            return;
        }

        console.log('[Export] Tracking usage...');
        const result = await trackUsage(LIMITS.DOWNLOAD_REPORTS);
        console.log('[Export] Usage result:', result);
        if (!result.allowed) {
            console.log('[Export] Usage limit reached');
            setShowUpgrade(true);
            setIsOpen(false);
            return;
        }

        console.log('[Export] Proceeding with export...');
        setExporting(format);
        setIsOpen(false);
        
        try {
            switch (format) {
                case 'csv':
                    console.log('[Export] Exporting CSV...');
                    exportToCSV();
                    break;
                case 'excel':
                    console.log('[Export] Exporting Excel...');
                    exportToExcel();
                    break;
                case 'json':
                    console.log('[Export] Exporting JSON...');
                    exportToJSON();
                    break;
                case 'pdf':
                    console.log('[Export] Exporting PDF...');
                    exportToPDF();
                    break;
            }
            console.log('[Export] Export completed');
        } catch (error) {
            console.error('[Export] Export failed:', error);
        } finally {
            setTimeout(() => setExporting(null), 500);
        }
    };

    const isDisabled = disabled || data.length === 0;

    if (variant === 'icon') {
        return (
            <>
                <div className="relative ml-auto" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        disabled={isDisabled}
                        className={`p-2 rounded-lg transition ${isDisabled
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'bg-slate-900/95 dark:bg-slate-900/95 text-white hover:bg-slate-800'
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
                <UpgradeModal
                    isOpen={showUpgrade}
                    onClose={() => setShowUpgrade(false)}
                    featureKey={LIMITS.DOWNLOAD_REPORTS}
                />
            </>
        );
    }

    if (variant === 'compact') {
        return (
            <>
                <div className="relative ml-auto" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        disabled={isDisabled}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition whitespace-nowrap ${isDisabled
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-100 dark:bg-pearto-surface text-slate-600 dark:text-pearto-cloud hover:bg-slate-200 dark:hover:bg-pearto-surface/80'
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
                <UpgradeModal
                    isOpen={showUpgrade}
                    onClose={() => setShowUpgrade(false)}
                    featureKey={LIMITS.DOWNLOAD_REPORTS}
                />
            </>
        );
    }

    // Default variant
    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${isDisabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600 dark:bg-pearto-pink text-white'
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
            <UpgradeModal
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                featureKey={LIMITS.DOWNLOAD_REPORTS}
            />
        </>
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
        <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[9999] overflow-hidden backdrop-blur-sm">
            <div className="max-h-64 overflow-y-auto">
                <div className="p-2">
                    <p className="px-2 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Export Format
                    </p>
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => onSelect(option.id)}
                            disabled={exporting !== null}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition disabled:opacity-50"
                        >
                        <div className={`p-1.5 rounded-lg ${option.id === 'csv' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                            option.id === 'excel' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                                option.id === 'json' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                    'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                            }`}>
                            {exporting === option.id ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                option.icon
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                {option.label}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
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
