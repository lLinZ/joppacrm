import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, Eye, CalendarDays } from 'lucide-react';
import axios from 'axios';

interface AnalyticsModalProps {
    open: boolean;
    onClose: () => void;
    product: any;
}

export function AnalyticsModal({ open, onClose, product }: AnalyticsModalProps) {
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (!open || !product) return;
        setLoading(true);
        axios.get(`/catalog-products/${product.id}/analytics`, { params: { days } })
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [open, product, days]);

    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[700px] w-[95vw] overflow-y-auto max-h-[90vh]">
                <DialogHeader className="border-b border-border pb-4 mb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Activity className="h-5 w-5 text-primary" /> 
                        Rendimiento: {product.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                            <Users className="h-6 w-6 text-primary mb-2 opacity-80" />
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Total Visitantes</p>
                            <p className="text-2xl font-bold text-foreground">
                                {data?.total_unique?.toLocaleString('es-AR') || '0'}
                            </p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                            <Eye className="h-6 w-6 text-muted-foreground mb-2 opacity-80" />
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Impresiones Totales</p>
                            <p className="text-2xl font-bold text-foreground">
                                {data?.total_raw?.toLocaleString('es-AR') || '0'}
                            </p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-center gap-2 col-span-2 md:col-span-1">
                            <span className="text-xs font-semibold text-muted-foreground mb-1 block">Rango de Tiempo</span>
                            <div className="flex bg-muted p-1 rounded-lg">
                                {[7, 30, 90].map(d => (
                                    <button
                                        key={d}
                                        disabled={loading}
                                        className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${days === d ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => setDays(d)}
                                    >
                                        {d}D
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                            <CalendarDays className="h-4 w-4 text-primary" /> Curva de Nuevos Visitantes ({days} días)
                        </h3>
                        {loading ? (
                            <div className="h-[250px] w-full flex items-center justify-center">
                                <span className="text-muted-foreground text-sm animate-pulse">Cargando gráfica...</span>
                            </div>
                        ) : !data?.chart_data?.length ? (
                            <div className="h-[250px] w-full flex items-center justify-center">
                                <span className="text-muted-foreground text-sm">Sin datos para este periodo</span>
                            </div>
                        ) : (
                            <div className="h-[250px] w-full -ml-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.chart_data}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
                                        <XAxis 
                                            dataKey="display" 
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
                                            dy={10}
                                        />
                                        <YAxis 
                                            domain={[0, 'dataMax']}
                                            allowDecimals={false}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
                                        />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                                            labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px', fontSize: '12px' }}
                                            itemStyle={{ color: 'var(--foreground)', fontSize: '14px', fontWeight: 600 }}
                                            formatter={(value) => [value, 'Nuevos Visitantes']}
                                            labelFormatter={(l) => `Día: ${l}`}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="views" 
                                            stroke="#0B3022" 
                                            strokeWidth={3}
                                            dot={{ r: 3, fill: '#0B3022', strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: '#D4A017', stroke: '#fff', strokeWidth: 2 }}
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
