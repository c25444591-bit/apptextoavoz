import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { TrendingUp, Users, Zap, DollarSign, Activity, LogOut, BarChart3 } from 'lucide-react';

interface AdminDashboardProps {
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [stats, setStats] = useState(analyticsService.getStatsSummary());
    const [logs, setLogs] = useState(analyticsService.getLogs().slice(-10).reverse());

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(analyticsService.getStatsSummary());
            setLogs(analyticsService.getLogs().slice(-10).reverse());
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('admin_logged_in');
        localStorage.removeItem('admin_login_time');
        onLogout();
    };

    const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderColor: color }}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 font-medium">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
                    <Icon size={24} style={{ color }} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Administración</h1>
                            <p className="text-sm text-gray-500 mt-1">LibroVoz Analytics</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <LogOut size={18} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={Users}
                        title="Visitas Totales"
                        value={stats.totalVisits}
                        subtitle={`Hoy: ${stats.todayVisits}`}
                        color="#3B82F6"
                    />
                    <StatCard
                        icon={Zap}
                        title="Llamadas API"
                        value={stats.totalGeminiCalls + stats.totalHFCalls}
                        subtitle={`Hoy: ${stats.todayGeminiCalls + stats.todayHFCalls}`}
                        color="#10B981"
                    />
                    <StatCard
                        icon={Activity}
                        title="Caracteres Procesados"
                        value={stats.totalCharacters.toLocaleString()}
                        subtitle={`Hoy: ${stats.todayCharacters.toLocaleString()}`}
                        color="#F59E0B"
                    />
                    <StatCard
                        icon={DollarSign}
                        title="Costo Estimado"
                        value={`$${stats.estimatedCost.toFixed(2)}`}
                        subtitle={`Gemini: $${stats.geminiCost.toFixed(2)} | HF: $${stats.hfCost.toFixed(2)}`}
                        color="#EF4444"
                    />
                </div>

                {/* API Usage Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart3 size={20} className="text-orange-600" />
                            Uso de APIs
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Google Gemini</span>
                                    <span className="text-sm text-gray-500">{stats.totalGeminiCalls} llamadas</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{
                                            width: `${(stats.totalGeminiCalls / (stats.totalGeminiCalls + stats.totalHFCalls || 1)) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Hugging Face</span>
                                    <span className="text-sm text-gray-500">{stats.totalHFCalls} llamadas</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{
                                            width: `${(stats.totalHFCalls / (stats.totalGeminiCalls + stats.totalHFCalls || 1)) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-orange-600" />
                            Últimos 7 Días
                        </h2>
                        <div className="space-y-2">
                            {stats.last7Days.map((day, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                    <div className="flex gap-4">
                                        <span className="text-blue-600">{day.geminiCalls}G</span>
                                        <span className="text-green-600">{day.huggingfaceCalls}HF</span>
                                        <span className="text-gray-500">{day.visits}V</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Logs */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Últimas Actividades</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hora</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Acción</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Voz</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Caracteres</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">
                                            No hay actividad registrada aún
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {new Date(log.timestamp).toLocaleTimeString('es-ES')}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.type === 'gemini' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {log.type === 'gemini' ? 'Gemini' : 'HuggingFace'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{log.action}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{log.voice}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600 text-right">{log.charactersProcessed}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {log.success ? '✓' : '✗'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};
