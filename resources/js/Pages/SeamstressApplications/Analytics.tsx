// <ai_context>
// Propósito: Panel de analíticas de las postulaciones de costureras.
// Incluye tarjetas resumen, comparación de presupuestos por prospecto, línea temporal
// y distribuciones por experiencia, máquinas, ubicación y origen del tráfico.
// Exporta la comparación de presupuestos a CSV.
// Localización: CRM (Admin)
// </ai_context>

import React from 'react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { StatCard } from '@/Components/ui/StatCard';
import { Head, Link } from '@inertiajs/react';
import { Users, DollarSign, TrendingUp, Gauge, CheckCircle2, Download, ArrowLeft } from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Dist { label: string; value: number }
interface Budget { id: number; name: string; price: number; capacity: number; status: string }

interface Props {
    stats: {
        total: number;
        with_price: number;
        avg_price: number | null;
        min_price: number | null;
        max_price: number | null;
        median_price: number | null;
        total_capacity: number;
        hired: number;
    };
    byStatus: { key: string; label: string; value: number }[];
    byExperience: Dist[];
    byMachine: Dist[];
    byLocation: Dist[];
    bySource: Dist[];
    timeline: { display: string; value: number }[];
    budgetComparison: Budget[];
}

const PALETTE = ['#34d399', '#D4AF37', '#60a5fa', '#c084fc', '#f87171', '#22d3ee', '#fb923c', '#a3e635'];

const TOOLTIP_STYLE = {
    contentStyle: { borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a' },
    labelStyle: { color: '#94a3b8', marginBottom: 4, fontSize: 13 },
    itemStyle: { color: '#fff', fontSize: 14, fontWeight: 600 },
};

function ChartCard({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-white/8 bg-white/[0.03] p-5 ${className}`}>
            <div className="mb-4">
                <h3 className="text-white font-semibold">{title}</h3>
                {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

function EmptyChart({ msg = 'Sin datos suficientes.' }: { msg?: string }) {
    return (
        <div className="h-[240px] flex items-center justify-center border-2 border-dashed border-white/8 rounded-xl">
            <span className="text-slate-600 text-sm">{msg}</span>
        </div>
    );
}

const money = (n: number | null) => (n === null ? '—' : `$${Number(n).toFixed(2)}`);

export default function Analytics({ stats, byStatus, byExperience, byMachine, byLocation, bySource, timeline, budgetComparison }: Props) {
    const hasData = stats.total > 0;
    const exportUrl = route('seamstress-applications.export');

    const experienceData = byExperience.filter((d) => d.value > 0);
    const machineData = byMachine.filter((d) => d.value > 0);
    const sourceData = bySource.filter((d) => d.value > 0);
    const budgetChartHeight = Math.max(220, budgetComparison.length * 40);
    const locationHeight = Math.max(220, byLocation.length * 40);

    return (
        <AppLayout>
            <Head title="Analíticas de Costureras - Admin" />

            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <Link href="/seamstress-applications" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Volver al listado
                            </Link>
                            <h1 className="text-2xl font-bold text-white tracking-tight mt-2">Analíticas de Costureras</h1>
                            <p className="text-slate-400 text-sm mt-0.5">
                                Visión general de las {stats.total} postulación{stats.total !== 1 ? 'es' : ''} recibidas
                            </p>
                        </div>
                        <a
                            href={exportUrl}
                            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm border border-emerald-400/20 hover:border-emerald-400/50 bg-emerald-400/10 px-4 py-2.5 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Exportar presupuestos (CSV)
                        </a>
                    </div>

                    {!hasData ? (
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-16 text-center">
                            <p className="text-slate-500">Todavía no hay postulaciones para analizar.</p>
                            <p className="text-slate-600 text-sm mt-2">
                                Comparte <span className="text-emerald-400 font-medium">joppa.shop/unete</span> para empezar a recibir candidatas.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Tarjetas resumen */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard title="Postulaciones" value={stats.total} icon={Users} description={`${stats.hired} contratada${stats.hired !== 1 ? 's' : ''}`} />
                                <StatCard title="Tarifa promedio" value={money(stats.avg_price)} icon={DollarSign} description={`Mediana ${money(stats.median_price)} · ${stats.with_price} con precio`} />
                                <StatCard title="Rango de tarifas" value={`${money(stats.min_price)} – ${money(stats.max_price)}`} icon={TrendingUp} description="Mínimo y máximo por pieza" />
                                <StatCard title="Capacidad total" value={`${stats.total_capacity}`} icon={Gauge} description="Piezas/semana entre todas" />
                            </div>

                            {/* Comparación de presupuestos por prospecto */}
                            <ChartCard
                                title="Comparación de presupuestos por prospecto"
                                subtitle="Precio por pieza en USD, ordenado de menor a mayor. Solo candidatas que indicaron tarifa."
                            >
                                {budgetComparison.length === 0 ? (
                                    <EmptyChart msg="Ninguna candidata indicó su tarifa todavía." />
                                ) : (
                                    <ResponsiveContainer width="100%" height={budgetChartHeight}>
                                        <BarChart data={budgetComparison} layout="vertical" margin={{ left: 20, right: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                                            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
                                            <YAxis type="category" dataKey="name" width={130} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                                            <Tooltip
                                                {...TOOLTIP_STYLE}
                                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                                formatter={(value: any, _n: any, item: any) => [`$${Number(value).toFixed(2)} · ${item.payload.capacity} pzs/sem · ${item.payload.status}`, 'Precio/pieza']}
                                            />
                                            <Bar dataKey="price" radius={[0, 6, 6, 0]} barSize={22}>
                                                {budgetComparison.map((_, i) => (
                                                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </ChartCard>

                            {/* Línea temporal */}
                            <ChartCard title="Postulaciones en el tiempo" subtitle="Últimos 30 días">
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={timeline} margin={{ left: -20, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="display" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} interval={4} dy={6} />
                                        <YAxis allowDecimals={false} domain={[0, 'dataMax']} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                        <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => [v, 'Postulaciones']} labelFormatter={(l) => `Día ${l}`} />
                                        <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} dot={{ r: 3, fill: '#D4AF37', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#0B3022', stroke: '#D4AF37', strokeWidth: 2 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Experiencia */}
                                <ChartCard title="Experiencia" subtitle="Años cosiendo">
                                    {experienceData.length === 0 ? <EmptyChart /> : (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <BarChart data={experienceData} margin={{ left: -20, right: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                                                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(v: any) => [v, 'Costureras']} />
                                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48}>
                                                    {experienceData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </ChartCard>

                                {/* Origen */}
                                <ChartCard title="Origen del tráfico" subtitle="De dónde llegaron (utm_source)">
                                    {sourceData.length === 0 ? <EmptyChart /> : (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <PieChart>
                                                <Pie data={sourceData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                                                    {sourceData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#0f172a" strokeWidth={2} />)}
                                                </Pie>
                                                <Tooltip {...TOOLTIP_STYLE} formatter={(v: any, n: any) => [`${v} postulaciones`, n]} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                    {sourceData.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3 justify-center">
                                            {sourceData.map((s, i) => (
                                                <span key={s.label} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                                                    {s.label} ({s.value})
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </ChartCard>

                                {/* Máquinas */}
                                <ChartCard title="Máquinas disponibles" subtitle="Cada candidata puede tener varias">
                                    {machineData.length === 0 ? <EmptyChart /> : (
                                        <ResponsiveContainer width="100%" height={Math.max(220, machineData.length * 40)}>
                                            <BarChart data={machineData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                                                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <YAxis type="category" dataKey="label" width={90} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                                                <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(v: any) => [v, 'Costureras']} />
                                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} fill="#34d399" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </ChartCard>

                                {/* Ubicación */}
                                <ChartCard title="Ubicación" subtitle="Top zonas de las candidatas">
                                    {byLocation.length === 0 ? <EmptyChart /> : (
                                        <ResponsiveContainer width="100%" height={locationHeight}>
                                            <BarChart data={byLocation} layout="vertical" margin={{ left: 20, right: 30 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                                                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <YAxis type="category" dataKey="label" width={110} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                                                <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(v: any) => [v, 'Costureras']} />
                                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} fill="#60a5fa" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </ChartCard>
                            </div>

                            {/* Estado (resumen de pipeline) */}
                            <ChartCard title="Embudo de selección" subtitle="Postulaciones por estado">
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    {byStatus.map((s, i) => (
                                        <div key={s.key} className="rounded-xl border border-white/8 bg-white/[0.02] p-4 text-center">
                                            <div className="text-2xl font-bold text-white">{s.value}</div>
                                            <div className="flex items-center justify-center gap-1.5 mt-1">
                                                <span className="w-2 h-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                                                <span className="text-xs text-slate-400">{s.label}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ChartCard>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
