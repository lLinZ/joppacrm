import { Head, router } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { Activity, Users, Clock, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

interface WebTrafficProps {
    metrics: {
        total_sessions: number;
        avg_duration_formatted: string;
        days: number;
    };
    chartData: {
        display: string;
        sessions: number;
        avg_duration: number;
    }[];
    recentSessions: {
        data: {
            id: number;
            visitor_id: string;
            ip_address: string | null;
            user_agent: string | null;
            source: string | null;
            entry_url: string;
            started_at: string;
            duration_formatted: string;
        }[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        total: number;
        from: number;
        to: number;
    };
}

export default function WebTraffic({ metrics, chartData, recentSessions }: WebTrafficProps) {
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.Echo) return;

        const channel = window.Echo.join('store');

        channel.here((users: any[]) => {
            console.log('Reverb: Usuarios actualmente en línea:', users);
            setOnlineUsers(users);
        })
        .joining((user: any) => {
            console.log('Reverb: Nuevo flujo de usuario conectado:', user);
            setOnlineUsers((prev) => [...prev.filter(u => u.id !== user.id), user]);
        })
        .leaving((user: any) => {
            console.log('Reverb: Usuario desconectado:', user);
            setOnlineUsers((prev) => prev.filter(u => u.id !== user.id));
        });

        channel.listenForWhisper('navigated', (e: any) => {
            setOnlineUsers((prev) => prev.map(u => 
                u.id === e.id ? { ...u, url: e.url } : u
            ));
        });

        return () => {
            window.Echo.leave('presence-store');
        };
    }, []);

    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('search') || '';
        }
        return '';
    });

    const currentSort = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('sort') || 'last_active_at' : 'last_active_at';
    const currentDir = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('dir') || 'desc' : 'desc';

    const handleFilter = (d: number) => {
        router.get(route('web.traffic'), { days: d, search: searchQuery }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('web.traffic'), { days: metrics.days, search: searchQuery, sort: currentSort, dir: currentDir }, { preserveState: true });
    };

    const handleSort = (field: string) => {
        const newDir = currentSort === field && currentDir === 'asc' ? 'desc' : 'asc';
        router.get(route('web.traffic'), { days: metrics.days, search: searchQuery, sort: field, dir: newDir }, { preserveState: true });
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (currentSort !== field) return <span className="opacity-30 ml-1">↕</span>;
        return <span className="ml-1 text-emerald-600">{currentDir === 'asc' ? '↑' : '↓'}</span>;
    };

    const formatPaginationLabel = (label: string) => {
        if (label.includes('Previous') || label.includes('previous')) return '&laquo; Anterior';
        if (label.includes('Next') || label.includes('next')) return 'Siguiente &raquo;';
        return label;
    };
    const parseDevice = (ua: string | null) => {
        if (!ua) return 'Desconocido';
        if (ua.includes('iPhone')) return '📱 iPhone';
        if (ua.includes('iPad')) return '📱 iPad';
        if (ua.includes('Android')) return '📱 Android';
        if (ua.includes('Mac OS')) return '💻 Mac';
        if (ua.includes('Windows')) return '💻 Windows';
        if (ua.includes('Linux')) return '💻 Linux';
        return '💻 Web';
    };

    return (
        <AppLayout>
            <Head title="Analíticas Web" />

            <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                <PageHeader
                    title="Monitor de Tráfico Web"
                    description="Rastrea visitantes globales, tiempo de permanencia y conexiones en tiempo real gracias al motor de WebSockets."
                />
                
                <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-full border border-emerald-500/20 shadow-sm">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="font-semibold tracking-wide text-sm">{onlineUsers.length} Usuarios Activos</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px] mb-1">Total Visitas ({metrics.days} Días)</p>
                        <p className="text-3xl font-bold text-foreground">{metrics.total_sessions.toLocaleString('es-AR')}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px] mb-1">Tiempo Promedio</p>
                        <p className="text-3xl font-bold text-foreground">{metrics.avg_duration_formatted}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px] mb-2">Filtro de Tiempo</p>
                    <div className="flex bg-muted p-1 rounded-lg">
                        {[7, 30, 90].map(d => (
                            <button
                                key={d}
                                onClick={() => handleFilter(d)}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${metrics.days === d ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Últimos {d}D
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Live Users Section */}
            {onlineUsers.length > 0 && (
                <div className="bg-card border border-emerald-500/20 rounded-xl shadow-sm overflow-hidden mb-8">
                    <div className="p-6 border-b border-border bg-emerald-500/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                En Directo: Viendo Ahora
                            </h3>
                            <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                                Visitantes activos en tiempo real a través de WebSockets.
                            </p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground w-1/5">Usuario / ID</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground w-1/5">IP</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground w-1/5">Dispositivo</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground w-1/5">Fuente / Campaña</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground w-1/5">URL Actual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {onlineUsers.map((user) => {

                                    return (
                                        <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4 text-foreground font-medium flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-xs font-bold uppercase ring-1 ring-emerald-500/20">
                                                    {user.name ? user.name.substring(0, 2) : 'V'}
                                                </div>
                                                <span>{user.name || 'Visitante'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-foreground font-mono text-xs">
                                                {user.ip || '127.0.0.1'}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-medium text-xs max-w-[150px] truncate" title={user.device || 'Desconocido'}>
                                                {parseDevice(user.device)}
                                            </td>
                                            <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-semibold text-xs whitespace-nowrap">
                                                <span className="bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm">
                                                    {user.source || 'Orgánico / Directo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="max-w-[300px] truncate font-medium text-muted-foreground" title={user.url}>
                                                        {user.url || 'N/A'}
                                                    </div>
                                                    {user.url && user.url !== '/' && (
                                                        <a href={user.url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-500 hover:underline text-xs flex items-center gap-1 font-semibold">
                                                            <Globe className="h-3 w-3" /> Abrir <span className="sr-only">URL</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                    <Activity className="h-5 w-5 text-primary" /> Curva de Sesiones Globales
                </h3>
                
                {chartData.length === 0 ? (
                    <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-border rounded-xl">
                        <span className="text-muted-foreground text-sm">Sin datos para graficar.</span>
                    </div>
                ) : (
                    <div className="h-[300px] w-full -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
                                <XAxis 
                                    dataKey="display" 
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.6 }}
                                    dy={10}
                                />
                                <YAxis 
                                    domain={[0, 'dataMax']}
                                    allowDecimals={false}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.6 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                                    labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px', fontSize: '13px' }}
                                    itemStyle={{ color: 'var(--foreground)', fontSize: '15px', fontWeight: 600 }}
                                    formatter={(value) => [value, 'Sesiones']}
                                    labelFormatter={(l) => `Día: ${l}`}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="sessions" 
                                    stroke="#D4A017" 
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#D4A017', strokeWidth: 0 }}
                                    activeDot={{ r: 7, fill: '#0B3022', stroke: '#D4A017', strokeWidth: 2 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Recent Sessions Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" /> Conexiones Históricas
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">Mostrando {recentSessions.from || 0} - {recentSessions.to || 0} de {recentSessions.total} sesiones.</p>
                    </div>
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Buscar IP, origen o ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 md:w-64 px-4 py-2 border border-border rounded-lg bg-background text-sm"
                        />
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
                            Buscar
                        </button>
                    </form>
                </div>
                
                {recentSessions.data.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                        No hay sesiones registradas aún. El tráfico aparecerá mágicamente aquí.
                    </div>
                ) : (
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('id')}># ID <SortIcon field="id" /></th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('visitor_id')}>ID Anónimo <SortIcon field="visitor_id" /></th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('ip_address')}>IP / Dispositivo <SortIcon field="ip_address" /></th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('source')}>Fuente <SortIcon field="source" /></th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('started_at')}>Inicio <SortIcon field="started_at" /></th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('duration_seconds')}>Duración <SortIcon field="duration_seconds" /></th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('entry_url')}>Última URL <SortIcon field="entry_url" /></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {recentSessions.data.map((s) => (
                                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-300 opacity-80">
                                            #{s.id}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                            {s.visitor_id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-foreground font-medium">{s.ip_address || 'Desc.'}</span>
                                                <span className="text-xs text-muted-foreground">{parseDevice(s.user_agent)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-emerald-600 font-semibold text-xs whitespace-nowrap">
                                            <span className="bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                                {s.source || 'Orgánico / Directo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-foreground font-medium">
                                            {s.started_at}
                                        </td>
                                        <td className="px-6 py-4 text-primary font-semibold text-sm">
                                            <span className="bg-primary/10 px-2 py-1 rounded-md">{s.duration_formatted}</span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]" title={s.entry_url}>
                                            {s.entry_url || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {recentSessions.links && recentSessions.links.length > 3 && (
                    <div className="p-4 border-t border-border bg-muted/20 flex justify-center">
                        <div className="flex flex-wrap gap-1">
                            {recentSessions.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url, { search: searchQuery, sort: currentSort, dir: currentDir }, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${link.active ? 'bg-primary text-primary-foreground font-medium' : 'bg-background border border-border text-foreground hover:bg-muted'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: formatPaginationLabel(link.label) }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
