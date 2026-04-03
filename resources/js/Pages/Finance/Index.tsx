import { Head, router } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Activity, DollarSign, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function FinanceIndex({ metrics, costsList, filters }: any) {
    const margin = metrics.revenue > 0 ? (metrics.net_profit / metrics.revenue) * 100 : 0;

    return (
        <AppLayout>
            <Head title="Finanzas y Rentabilidad" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <PageHeader 
                    title="Módulo de Rentabilidad" 
                    description="Analiza los costos, ventas y margen neto de tus operaciones."
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Brutos</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${Number(metrics.revenue).toLocaleString('es-AR')}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total facturado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Costos Totales</CardTitle>
                        <Activity className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-${Number(metrics.total_cost).toLocaleString('es-AR')}</div>
                        <p className="text-xs text-muted-foreground mt-1">Prendas, DTF, Transporte</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ganancia Neta (Profit)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">${Number(metrics.net_profit).toLocaleString('es-AR')}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-primary/80 font-medium">{margin.toFixed(1)}% Margen Promedio</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas Completadas</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.total_orders}</div>
                        <p className="text-xs text-muted-foreground mt-1">Órdenes despachadas</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4 border-border shadow-sm">
                    <CardHeader>
                        <CardTitle>Historial de Entregas</CardTitle>
                        <CardDescription>
                            Listado de órdenes entregadas con su desglose financiero.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Orden</th>
                                        <th className="px-6 py-3 font-medium">Venta</th>
                                        <th className="px-6 py-3 font-medium">Costos</th>
                                        <th className="px-6 py-3 font-medium">Ganancia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {costsList.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">
                                                No hay entregas registradas.
                                            </td>
                                        </tr>
                                    ) : (
                                        costsList.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-accent/30 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="font-medium text-foreground">Ord #{item.order_id}</div>
                                                    <div className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-3 text-foreground font-medium">
                                                    ${Number(item.revenue).toLocaleString('es-AR')}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="text-red-500 font-medium">-${Number(item.total_cost).toLocaleString('es-AR')}</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`font-bold ${item.net_profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        ${Number(item.net_profit).toLocaleString('es-AR')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 lg:col-span-3 border-border shadow-sm">
                    <CardHeader>
                        <CardTitle>Composición de Costos</CardTitle>
                        <CardDescription>
                            Distribución del gasto en las órdenes completadas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-muted-foreground">Prenda Base</span>
                                    <span className="font-bold text-foreground">${Number(metrics.base_cost).toLocaleString('es-AR')}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${metrics.total_cost > 0 ? (metrics.base_cost / metrics.total_cost) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-muted-foreground">DTF / Estampado</span>
                                    <span className="font-bold text-foreground">${Number(metrics.print_cost).toLocaleString('es-AR')}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${metrics.total_cost > 0 ? (metrics.print_cost / metrics.total_cost) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-muted-foreground">Logística / Transporte</span>
                                    <span className="font-bold text-foreground">${Number(metrics.logistics_cost).toLocaleString('es-AR')}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${metrics.total_cost > 0 ? (metrics.logistics_cost / metrics.total_cost) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-muted-foreground">Delivery Ext.</span>
                                    <span className="font-bold text-foreground">${Number(metrics.delivery_cost).toLocaleString('es-AR')}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${metrics.total_cost > 0 ? (metrics.delivery_cost / metrics.total_cost) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-muted-foreground">Otros</span>
                                    <span className="font-bold text-foreground">${Number(metrics.other_costs).toLocaleString('es-AR')}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="bg-slate-500 h-2 rounded-full" style={{ width: `${metrics.total_cost > 0 ? (metrics.other_costs / metrics.total_cost) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
