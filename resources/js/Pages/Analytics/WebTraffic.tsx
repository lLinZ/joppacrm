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
        id: number;
        visitor_id: string;
        entry_url: string;
        started_at: string;
        duration_formatted: string;
    }[];
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

    const handleFilter = (d: number) => {
        router.get(route('web.traffic'), { days: d }, { preserveState: true });
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
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/20">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" /> Conexiones Recientes
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Últimas 50 sesiones detectadas por el sistema.</p>
                </div>
                
                {recentSessions.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                        No hay sesiones registradas aún. El tráfico aparecerá mágicamente aquí.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">ID Anónimo</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Fecha y Hora de Inicio</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Duración en Web</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Última URL Vista</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {recentSessions.map((s) => (
                                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                            {s.visitor_id}
                                        </td>
                                        <td className="px-6 py-4 text-foreground font-medium">
                                            {s.started_at}
                                        </td>
                                        <td className="px-6 py-4 text-primary font-semibold text-sm">
                                            <span className="bg-primary/10 px-2 py-1 rounded-md">{s.duration_formatted}</span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground truncate max-w-[250px]" title={s.entry_url}>
                                            {s.entry_url || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
