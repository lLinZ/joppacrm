import { useState, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { SearchInput } from '@/Components/ui/SearchInput';
import { ChevronDown, ChevronRight, PhoneCall, ExternalLink, Calendar, Search, ChevronsUp, ChevronsDown } from 'lucide-react';
import { OrderDetailModal } from '@/Components/Orders/OrderDetailModal';
import { Button } from '@/Components/ui/button';

export const STATUS_CONFIG: Record<string, { label: string; color: string; border: string }> = {
    'pending': { label: 'Nueva', color: 'bg-blue-500', border: 'border-blue-500' },
    'attended': { label: 'Cliente Atendido', color: 'bg-purple-500', border: 'border-purple-500' },
    'processing': { label: 'En proceso', color: 'bg-amber-500', border: 'border-amber-500' },
    'purchasing': { label: 'Compra en proceso', color: 'bg-orange-500', border: 'border-orange-500' },
    'delivered': { label: 'Entregado', color: 'bg-emerald-500', border: 'border-emerald-500' },
    'cancelled': { label: 'Cancelado', color: 'bg-red-500', border: 'border-red-500' },
};

export default function OrdersIndex({ orders, users }: any) {
    const [search, setSearch] = useState('');
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // Real-time: listen for any order update on the global 'orders' channel
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel('orders');
        channel.listen('.order.updated', () => {
            // Silently refresh the page data from the server (Inertia preserves state)
            router.reload({ only: ['orders'] });
        });
        channel.listen('.order.created', () => {
            router.reload({ only: ['orders'] });
        });

        return () => {
            window.Echo.leave('orders');
        };
    }, []);

    const toggleGroup = (status: string) => {
        setCollapsedGroups(prev => ({ ...prev, [status]: !prev[status] }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('orders.index'), { search }, { preserveState: true, replace: true });
    };

    const groupedOrders = useMemo(() => {
        const groups: Record<string, any[]> = {};
        Object.keys(STATUS_CONFIG).forEach(key => groups[key] = []);
        orders.forEach((o: any) => {
            const st = STATUS_CONFIG[o.status] ? o.status : 'pending';
            groups[st].push(o);
        });
        return groups;
    }, [orders]);

    return (
        <AppLayout>
            <Head title="Órdenes (CRM)" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <PageHeader 
                    title="Tablero de Órdenes" 
                    description="Visualiza y procesa todas las órdenes entrantes estilo Kanban/Tabla."
                />
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto self-start sm:self-auto mb-2 sm:mb-0">
                        <Button 
                            variant="outline" 
                            className="bg-background"
                            onClick={() => setCollapsedGroups({})} 
                            title="Expandir todas las tablas"
                        >
                            <ChevronsDown className="h-4 w-4 mr-2" /> Expandir
                        </Button>
                        <Button 
                            variant="outline" 
                            className="bg-background"
                            onClick={() => {
                                const allCollapsed: Record<string, boolean> = {};
                                Object.keys(STATUS_CONFIG).forEach(key => allCollapsed[key] = true);
                                setCollapsedGroups(allCollapsed);
                            }} 
                            title="Colapsar todas las tablas"
                        >
                            <ChevronsUp className="h-4 w-4 mr-2" /> Colapsar
                        </Button>
                    </div>
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:max-w-[280px]">
                        <SearchInput 
                            value={search}
                            onChange={setSearch}
                            placeholder="Buscar por ID, nombre..."
                        />
                        <Button type="submit" variant="secondary" size="icon">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>

            <div className="space-y-6 pb-20">
                {Object.entries(groupedOrders).map(([statusKey, groupOrders]) => {
                    const config = STATUS_CONFIG[statusKey];
                    const isCollapsed = collapsedGroups[statusKey];

                    // Only show status groups that have orders, unless it's pending/attended which are important
                    if (groupOrders.length === 0 && !['pending', 'attended', 'processing'].includes(statusKey)) {
                        return null;
                    }

                    return (
                        <div key={statusKey} className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                            <div 
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors select-none"
                                onClick={() => toggleGroup(statusKey)}
                            >
                                <div className={`w-3 h-3 rounded-full ${config.color}`} />
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    {config.label}
                                    <span className="text-xs font-normal text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
                                        {groupOrders.length}
                                    </span>
                                </h3>
                                <div className="ml-auto text-muted-foreground">
                                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </div>
                            </div>
                            
                            {!isCollapsed && (
                                <div className={`border-t-[3px] ${config.border} grid overflow-x-auto`}>
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-3 font-medium w-16">ID</th>
                                                <th className="px-4 py-3 font-medium">Cliente</th>
                                                <th className="px-4 py-3 font-medium">Total</th>
                                                <th className="px-4 py-3 font-medium">Productos</th>
                                                <th className="px-4 py-3 font-medium">Agente</th>
                                                <th className="px-4 py-3 font-medium">Comentarios</th>
                                                <th className="px-4 py-3 font-medium w-24">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {groupOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground italic">
                                                        No hay órdenes en "{config.label}"
                                                    </td>
                                                </tr>
                                            ) : (
                                                groupOrders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-accent/30 transition-colors group">
                                                        <td className="px-4 py-3">#{order.id}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-foreground">{order.name}</div>
                                                            <div className="text-xs text-muted-foreground">{order.email}</div>
                                                        </td>
                                                        <td className="px-4 py-3 font-medium">
                                                            ${Number(order.total_amount).toLocaleString('es-AR')}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {order.items?.length || 0} items
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {order.assigned_user ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary" title={order.assigned_user.name}>
                                                                        {order.assigned_user.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="text-xs truncate max-w-[100px]">{order.assigned_user.name}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">Sin asignar</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {order.comments_count > 0 ? `${order.comments_count} notas` : '-'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                className="text-primary hover:text-primary hover:bg-primary/10 h-8"
                                                                onClick={() => setSelectedOrder(order)}
                                                            >
                                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                                Abrir
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedOrder && (
                <OrderDetailModal 
                    order={selectedOrder} 
                    users={users} 
                    isOpen={!!selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}
        </AppLayout>
    );
}
