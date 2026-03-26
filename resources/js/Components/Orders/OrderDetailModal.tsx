import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { PhoneCall, Calendar, User, FileText, ShoppingCart, MessageSquare, Send, Activity } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { STATUS_CONFIG } from '@/Pages/Orders/Index';

interface OrderDetailModalProps {
    order: any;
    users: any[];
    isOpen: boolean;
    onClose: () => void;
}

export function OrderDetailModal({ order, users, isOpen, onClose }: OrderDetailModalProps) {
    const { auth } = usePage().props as any;
    const [comment, setComment] = useState('');
    const [activeTab, setActiveTab] = useState<'crm' | 'history'>('crm');
    const [fullOrder, setFullOrder] = useState<any>(order);
    const [loading, setLoading] = useState(false);

    // Fetch full order data when modal opens
    useEffect(() => {
        if (isOpen && order?.id) {
            setLoading(true);
            fetch(route('orders.show', order.id), {
                headers: { 'Accept': 'application/json' }
            })
            .then(res => res.json())
            .then(data => {
                setFullOrder(data.order);
                setLoading(false);
            });
        }
    }, [isOpen, order]);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.post(route('orders.updateStatus', order.id), { status: e.target.value }, {
            preserveScroll: true,
            onSuccess: () => reloadFullOrder(),
        });
    };

    const handleAssign = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.post(route('orders.assign', order.id), { assigned_user_id: e.target.value || null }, {
            preserveScroll: true,
            onSuccess: () => reloadFullOrder(),
        });
    };

    const handleCall = () => {
        router.post(route('orders.incrementCall', order.id), {}, {
            preserveScroll: true,
            onSuccess: () => reloadFullOrder(),
        });
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        router.post(route('orders.comments.store', order.id), { body: comment }, {
            preserveScroll: true,
            onSuccess: () => {
                setComment('');
                reloadFullOrder();
            },
        });
    };

    const reloadFullOrder = () => {
        fetch(route('orders.show', order.id), { headers: { 'Accept': 'application/json' } })
        .then(res => res.json())
        .then(data => setFullOrder(data.order));
    };

    // Real-time: subscribe to the per-order channel when modal is open
    useEffect(() => {
        if (!isOpen || !order?.id || !window.Echo) return;

        const channelName = `orders.${order.id}`;
        const channel = window.Echo.channel(channelName);

        // Append new comment instantly, no full reload needed
        channel.listen('.order.commented', (e: any) => {
            setFullOrder((prev: any) => ({
                ...prev,
                comments: [...(prev.comments || []), e.comment],
            }));
        });

        // Reload full order on status/assign/call changes
        channel.listen('.order.updated', (e: any) => {
            setFullOrder(e.order);
        });

        return () => {
            window.Echo.leave(channelName);
        };
    }, [isOpen, order?.id]);

    if (!fullOrder) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className="w-[95vw] md:w-[90vw] lg:w-full max-w-[1200px] md:min-w-[1000px] h-[90vh] max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0"
                style={{ maxWidth: '1200px' }}
            >
                <DialogHeader className="p-4 sm:p-6 border-b border-border bg-muted/30">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pr-6">
                        <div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2">
                                Orden #{fullOrder.id}
                                <span className={`text-xs px-2.5 py-1 rounded-full text-white font-medium ${STATUS_CONFIG[fullOrder.status]?.color || 'bg-gray-500'}`}>
                                    {STATUS_CONFIG[fullOrder.status]?.label || fullOrder.status}
                                </span>
                            </DialogTitle>
                            <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4" /> 
                                {new Date(fullOrder.created_at).toLocaleString('es-AR')}
                            </p>
                        </div>
                        <div className="flex flex-col xs:flex-row sm:items-center gap-3 w-full md:w-auto">
                            <div className="flex flex-col flex-1">
                                <span className="text-xs text-muted-foreground font-medium mb-1">Status</span>
                                <select 
                                    className="text-sm border-border bg-background rounded-md px-3 py-1.5 focus:ring-primary focus:border-primary w-full min-w-[140px]"
                                    value={fullOrder.status}
                                    onChange={handleStatusChange}
                                >
                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className="text-xs text-muted-foreground font-medium mb-1">Asignado a</span>
                                <select 
                                    className="text-sm border-border bg-background rounded-md px-3 py-1.5 focus:ring-primary focus:border-primary w-full min-w-[140px]"
                                    value={fullOrder.assigned_user_id || ''}
                                    onChange={handleAssign}
                                >
                                    <option value="">-- Sin asignar --</option>
                                    {users.map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
                    {/* Left Column: Client & Order Details */}
                    <div className="flex-1 space-y-6">
                        <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
                            <h3 className="font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3 mb-4">
                                <User className="h-5 w-5 text-primary" /> Información del Cliente
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block mb-1">Nombre</span>
                                    <p className="font-medium text-foreground">{fullOrder.name}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Email</span>
                                    <p className="font-medium text-foreground">{fullOrder.email}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Teléfono</span>
                                    <p className="font-medium text-foreground">{fullOrder.phone || '-'}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground block mb-1">Dirección / Estado</span>
                                    <p className="font-medium text-foreground">{fullOrder.address || '-'}</p>
                                </div>
                                {fullOrder.notes && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground block mb-1">Instrucciones de Entrega</span>
                                        <p className="font-medium text-foreground whitespace-pre-wrap bg-muted/30 rounded-lg px-3 py-2 text-sm">{fullOrder.notes}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
                            <h3 className="font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3 mb-4">
                                <ShoppingCart className="h-5 w-5 text-primary" /> Productos del Pedido
                            </h3>
                            <div className="space-y-3">
                                {fullOrder.items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3 flex-1">
                                            {item.catalog_product?.images?.[0] ? (
                                                <img src={item.catalog_product.images[0]} alt={item.product_name} className="w-12 h-12 object-cover rounded shadow-sm flex-shrink-0 bg-muted/50" />
                                            ) : (
                                                <div className="w-12 h-12 rounded shadow-sm bg-muted/50 flex items-center justify-center flex-shrink-0">
                                                    <ShoppingCart className="w-5 h-5 text-muted-foreground opacity-50" />
                                                </div>
                                            )}
                                            <div>
                                                {item.catalog_product?.id ? (
                                                    <a 
                                                        href={`http://localhost:8001/catalog/${item.catalog_product.id}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="font-medium text-foreground hover:text-primary transition-colors hover:underline inline-flex items-center gap-1"
                                                        title="Ver producto en la tienda"
                                                    >
                                                        {item.product_name}
                                                    </a>
                                                ) : (
                                                    <p className="font-medium text-foreground">{item.product_name}</p>
                                                )}
                                                
                                                {(item.size || item.color) && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                                                        {item.color} {item.color && item.size && '•'} {item.size && `Talla: ${item.size}`}
                                                    </p>
                                                )}
                                                
                                                {/* INVENTORY BADGE */}
                                                {item.catalog_product?.inventory_product && (
                                                    <p className="text-xs mt-1">
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
                                                            item.catalog_product.inventory_product.quantity > 5 
                                                                ? 'bg-green-100/10 text-green-500 border border-green-500/20' 
                                                                : item.catalog_product.inventory_product.quantity > 0 
                                                                    ? 'bg-yellow-100/10 text-yellow-500 border border-yellow-500/20'
                                                                    : 'bg-red-100/10 text-red-500 border border-red-500/20'
                                                        }`}>
                                                            Stock: {item.catalog_product.inventory_product.quantity}
                                                        </span>
                                                    </p>
                                                )}

                                                <p className="text-muted-foreground text-xs mt-0.5">Cant: {item.quantity} x ${Number(item.price).toLocaleString('es-AR')}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-foreground">
                                            ${(Number(item.price) * item.quantity).toLocaleString('es-AR')}
                                        </p>
                                    </div>
                                ))}
                                <div className="pt-4 flex items-center justify-between font-bold text-lg text-foreground border-t border-border">
                                    <span>Total:</span>
                                    <span>${Number(fullOrder.total_amount).toLocaleString('es-AR')}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: CRM Actions (Calls & Comments) & History */}
                    <div className="w-full lg:w-96 flex flex-col gap-4">
                        <div className="flex bg-muted p-1 rounded-lg">
                            <button
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'crm' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setActiveTab('crm')}
                            >
                                <MessageSquare className="w-4 h-4 inline-block mr-2" /> CRM
                            </button>
                            <button
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'history' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setActiveTab('history')}
                            >
                                <Activity className="w-4 h-4 inline-block mr-2" /> Historial
                            </button>
                        </div>

                        {activeTab === 'crm' ? (
                            <>
                                <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                            <PhoneCall className="h-5 w-5 text-primary" /> Llamadas
                                        </h3>
                                        <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                                            {fullOrder.call_count || 0}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-4">Registra cada vez que intentas contactar al cliente por teléfono o WhatsApp.</p>
                                    <Button onClick={handleCall} className="w-full" variant="outline">
                                        <PhoneCall className="h-4 w-4 mr-2" /> Registrar Llamada
                                    </Button>
                                </section>

                                <section className="bg-card border border-border rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-border bg-muted/20">
                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-primary" /> Notas
                                        </h3>
                                    </div>
                                    
                                    <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-60 bg-muted/10">
                                        {fullOrder.comments?.length === 0 ? (
                                            <p className="text-sm text-center text-muted-foreground italic mt-4">No hay comentarios aún.</p>
                                        ) : (
                                            fullOrder.comments?.map((comment: any) => (
                                                <div key={comment.id} className={`flex flex-col ${comment.user_id === auth.user.id ? 'items-end' : 'items-start'}`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-medium text-foreground">{comment.user?.name || 'Sistema'}</span>
                                                        <span className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleString('es-AR')}</span>
                                                    </div>
                                                    <div className={`text-sm px-4 py-2 rounded-2xl max-w-[90%] break-words whitespace-pre-wrap ${comment.user_id === auth.user.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border border-border rounded-bl-none shadow-sm'}`}>
                                                        {comment.body}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <form onSubmit={handleAddComment} className="p-4 border-t border-border bg-card flex gap-2">
                                        <input
                                            type="text"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Escribe una nota..."
                                            className="flex-1 text-sm border-border rounded-md px-3 py-2 bg-background focus:ring-primary focus:border-primary"
                                        />
                                        <Button type="submit" size="icon" disabled={!comment.trim()}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </section>
                            </>
                        ) : (
                            <section className="bg-card border border-border rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden max-h-[600px]">
                                <div className="p-4 border-b border-border bg-muted/20">
                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-foreground" /> Línea de Tiempo
                                    </h3>
                                </div>
                                <div className="flex-1 p-6 overflow-y-auto bg-muted/10">
                                    {fullOrder.activities?.length === 0 ? (
                                        <p className="text-sm text-center text-muted-foreground italic mt-4">No hay actividad registrada aún.</p>
                                    ) : (
                                        <div className="relative border-l-2 border-border ml-3 space-y-8 pb-4">
                                            {fullOrder.activities?.map((activity: any) => (
                                                <div key={activity.id} className="relative pl-6">
                                                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-card border-2 border-primary flex items-center justify-center"></span>
                                                    <div className="mb-1">
                                                        <span className="text-sm font-semibold text-foreground">{activity.user?.name || 'Sistema'}</span>
                                                        <span className="text-xs text-muted-foreground ml-2">{new Date(activity.created_at).toLocaleString('es-AR')}</span>
                                                    </div>
                                                    <p className="text-sm text-foreground mt-1">
                                                        {activity.description}
                                                    </p>
                                                    {(activity.old_value || activity.new_value) && (
                                                        <div className="mt-2 text-xs bg-card border border-border p-2.5 rounded-md flex flex-wrap items-center gap-2">
                                                            <span className="line-through text-muted-foreground">{activity.old_value}</span>
                                                            <span className="text-muted-foreground">→</span>
                                                            <span className="text-foreground font-medium">{activity.new_value}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
