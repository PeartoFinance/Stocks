'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { stockAPI } from '@/app/utils/api';
import {
    getAlerts,
    createAlert,
    deleteAlert,
    toggleAlert,
    type UserAlert,
} from '@/app/utils/alertsAPI';
import {
    ArrowLeft,
    Plus,
    Bell,
    BellOff,
    TrendingUp,
    TrendingDown,
    Trash2,
    X,
    Search,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    ChevronDown,
    Mail,
    Smartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AlertsPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [alerts, setAlerts] = useState<UserAlert[]>([]);
    const [availableStocks, setAvailableStocks] = useState<any[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stocksLoading, setStocksLoading] = useState(false);
    const [showCreateAlert, setShowCreateAlert] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);
    const [searching, setSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [selectedSymbol, setSelectedSymbol] = useState<{ symbol: string; name: string } | null>(null);
    const [alertType, setAlertType] = useState<'price' | 'change' | 'volume'>('price');
    const [condition, setCondition] = useState<'above' | 'below'>('above');
    const [targetValue, setTargetValue] = useState('');
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifyPush, setNotifyPush] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/login');
    }, [authLoading, isAuthenticated, router]);

    const loadAlerts = useCallback(async () => {
        try {
            const data = await getAlerts();
            setAlerts(data);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load alerts');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadAvailableStocks = useCallback(async () => {
        try {
            setStocksLoading(true);
            const response = await stockAPI.getAllStocks();
            if (response.success && response.data) {
                setAvailableStocks(response.data);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load available stocks');
        } finally {
            setStocksLoading(false);
        }
    }, []);

    // Filter stocks based on search input
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredStocks([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = availableStocks.filter(stock => 
            stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stock.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 8); // Limit to 8 suggestions

        setFilteredStocks(filtered);
        setShowSuggestions(filtered.length > 0);
    }, [searchQuery, availableStocks]);

    useEffect(() => {
        if (!isAuthenticated) return;
        loadAlerts();
        loadAvailableStocks();
    }, [isAuthenticated, loadAlerts, loadAvailableStocks]);

    const handleSuggestionClick = (stock: any) => {
        setSelectedSymbol({ symbol: stock.symbol, name: stock.name });
        setSearchQuery(stock.symbol);
        setShowSuggestions(false);
        setFilteredStocks([]);
    };

    const handleCreateAlert = async () => {
        if (!selectedSymbol) {
            toast.error('Please select a stock');
            return;
        }
        if (!targetValue || parseFloat(targetValue) <= 0) {
            toast.error('Please enter a valid target value');
            return;
        }

        setSubmitting(true);
        try {
            await createAlert({
                symbol: selectedSymbol.symbol,
                alertType,
                condition,
                targetValue: parseFloat(targetValue),
                notifyEmail,
                notifyPush,
            });
            toast.success('Alert created successfully!');
            setShowCreateAlert(false);
            resetForm();
            loadAlerts();
        } catch (err) {
            console.error(err);
            toast.error('Failed to create alert');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleAlert = async (id: string) => {
        try {
            await toggleAlert(id);
            setAlerts(alerts.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
            toast.success('Alert status updated');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update alert');
        }
    };

    const handleDeleteAlert = async (id: string) => {
        if (!confirm('Are you sure you want to delete this alert?')) return;
        
        try {
            await deleteAlert(id);
            setAlerts(alerts.filter(a => a.id !== id));
            toast.success('Alert deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete alert');
        }
    };

    const resetForm = () => {
        setSelectedSymbol(null);
        setSearchQuery('');
        setSearchResults([]);
        setAlertType('price');
        setCondition('above');
        setTargetValue('');
        setNotifyEmail(true);
        setNotifyPush(true);
    };

    const getAlertIcon = (alert: UserAlert) => {
        if (alert.isTriggered) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
        if (!alert.isActive) return <BellOff className="h-5 w-5 text-gray-400" />;
        if (alert.condition === 'above') return <TrendingUp className="h-5 w-5 text-emerald-600" />;
        return <TrendingDown className="h-5 w-5 text-red-600" />;
    };

    const activeAlerts = alerts.filter(a => a.isActive && !a.isTriggered);
    const triggeredAlerts = alerts.filter(a => a.isTriggered);
    const inactiveAlerts = alerts.filter(a => !a.isActive && !a.isTriggered);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/profile"
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Bell className="h-6 w-6 text-emerald-600" />
                                    Price Alerts
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {activeAlerts.length} active • {triggeredAlerts.length} triggered
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateAlert(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition font-medium"
                        >
                            <Plus className="h-5 w-5" />
                            Create Alert
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Active Alerts</p>
                                <p className="text-3xl font-bold text-gray-900">{activeAlerts.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Bell className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Triggered</p>
                                <p className="text-3xl font-bold text-gray-900">{triggeredAlerts.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Alerts</p>
                                <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts List */}
                {alerts.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                        <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts yet</h3>
                        <p className="text-gray-500 mb-6">
                            Create your first price alert to get notified when stocks hit your target price
                        </p>
                        <button
                            onClick={() => setShowCreateAlert(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition font-medium"
                        >
                            <Plus className="h-5 w-5" />
                            Create Your First Alert
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Active Alerts */}
                        {activeAlerts.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h2>
                                <div className="space-y-3">
                                    {activeAlerts.map((alert) => (
                                        <AlertCard
                                            key={alert.id}
                                            alert={alert}
                                            onToggle={handleToggleAlert}
                                            onDelete={handleDeleteAlert}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Triggered Alerts */}
                        {triggeredAlerts.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Triggered Alerts</h2>
                                <div className="space-y-3">
                                    {triggeredAlerts.map((alert) => (
                                        <AlertCard
                                            key={alert.id}
                                            alert={alert}
                                            onToggle={handleToggleAlert}
                                            onDelete={handleDeleteAlert}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Inactive Alerts */}
                        {inactiveAlerts.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Inactive Alerts</h2>
                                <div className="space-y-3">
                                    {inactiveAlerts.map((alert) => (
                                        <AlertCard
                                            key={alert.id}
                                            alert={alert}
                                            onToggle={handleToggleAlert}
                                            onDelete={handleDeleteAlert}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Alert Modal */}
            {showCreateAlert && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">Create Price Alert</h2>
                            <button
                                onClick={() => {
                                    setShowCreateAlert(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Search Stock */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Stock
                                </label>
                                {selectedSymbol ? (
                                    <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <div>
                                            <p className="font-semibold text-gray-900">{selectedSymbol.symbol}</p>
                                            <p className="text-sm text-gray-600">{selectedSymbol.name}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedSymbol(null);
                                                setSearchResults([]);
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <div className="flex-1 relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onFocus={() => setShowSuggestions(true)}
                                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                    placeholder="Search stocks by symbol or name..."
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                />
                                            </div>
                                            
                                            {/* Stock Suggestions Dropdown */}
                                            {showSuggestions && filteredStocks.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                                                    {filteredStocks.map((stock, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleSuggestionClick(stock)}
                                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">
                                                                        {stock.symbol}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 truncate">
                                                                        {stock.name}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-semibold text-gray-900">
                                                                        ${stock.price?.toFixed(2) || '0.00'}
                                                                    </div>
                                                                    <div className={`text-sm font-medium ${
                                                                        stock.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                                                                    }`}>
                                                                        {stock.change >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2) || '0.00'}%
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Alert Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alert Type
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['price', 'change', 'volume'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setAlertType(type)}
                                            className={`py-3 px-4 rounded-xl border-2 font-medium transition capitalize ${
                                                alertType === type
                                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Condition & Target Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Condition
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={condition}
                                            onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none bg-white"
                                        >
                                            <option value="above">Above</option>
                                            <option value="below">Below</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Value
                                    </label>
                                    <input
                                        type="number"
                                        value={targetValue}
                                        onChange={(e) => setTargetValue(e.target.value)}
                                        placeholder="0.00"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Notification Settings */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Notification Channels
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                        <input
                                            type="checkbox"
                                            checked={notifyEmail}
                                            onChange={(e) => setNotifyEmail(e.target.checked)}
                                            className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                                        />
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-700 font-medium">Email Notification</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                        <input
                                            type="checkbox"
                                            checked={notifyPush}
                                            onChange={(e) => setNotifyPush(e.target.checked)}
                                            className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                                        />
                                        <Smartphone className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-700 font-medium">Push Notification</span>
                                    </label>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowCreateAlert(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateAlert}
                                    disabled={submitting || !selectedSymbol}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition font-medium flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-5 w-5" />
                                            Create Alert
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Alert Card Component
function AlertCard({
    alert,
    onToggle,
    onDelete,
}: {
    alert: UserAlert;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const getStatusBadge = () => {
        if (alert.isTriggered) {
            return (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Triggered
                </span>
            );
        }
        if (alert.isActive) {
            return (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    Active
                </span>
            );
        }
        return (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                Inactive
            </span>
        );
    };

    const getIcon = () => {
        if (alert.isTriggered) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
        if (!alert.isActive) return <BellOff className="h-5 w-5 text-gray-400" />;
        if (alert.condition === 'above') return <TrendingUp className="h-5 w-5 text-emerald-600" />;
        return <TrendingDown className="h-5 w-5 text-red-600" />;
    };

    return (
        <div className={`bg-white rounded-xl p-5 border-2 transition-all ${
            alert.isTriggered
                ? 'border-green-200 bg-green-50/30'
                : alert.isActive
                ? 'border-emerald-200 hover:border-emerald-300 hover:shadow-md'
                : 'border-gray-200'
        }`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${
                        alert.isTriggered
                            ? 'bg-green-100'
                            : alert.isActive
                            ? 'bg-emerald-100'
                            : 'bg-gray-100'
                    }`}>
                        {getIcon()}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">{alert.symbol}</h3>
                            {getStatusBadge()}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                            Alert when {alert.alertType} goes{' '}
                            <span className="font-semibold">{alert.condition}</span>{' '}
                            {alert.targetValue ? (
                                <span className="font-bold text-gray-900">${alert.targetValue.toFixed(2)}</span>
                            ) : (
                                'target'
                            )}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            {alert.notifyEmail && (
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    Email
                                </span>
                            )}
                            {alert.notifyPush && (
                                <span className="flex items-center gap-1">
                                    <Smartphone className="h-3.5 w-3.5" />
                                    Push
                                </span>
                            )}
                            {alert.triggeredAt && (
                                <span className="text-green-600 font-medium">
                                    Triggered {new Date(alert.triggeredAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onToggle(alert.id)}
                        className={`p-2 rounded-lg transition ${
                            alert.isActive
                                ? 'hover:bg-gray-100 text-gray-600'
                                : 'hover:bg-emerald-100 text-emerald-600'
                        }`}
                        title={alert.isActive ? 'Disable alert' : 'Enable alert'}
                    >
                        {alert.isActive ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                    </button>
                    <button
                        onClick={() => onDelete(alert.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                        title="Delete alert"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
