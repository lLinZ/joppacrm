import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { User, Mail, Phone, MapPin, Calendar, FileText, ShoppingBag, Loader2, ArrowUpRight } from 'lucide-react';

interface Client {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
    created_at: string;
}

interface Order {
    id: number;
    status: string;
    total_amount: string;
    created_at: string;
    items: any[];
}

interface ClientDetailModalProps {
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    processing: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    completed: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    cancelled: 'bg-red-500/20 text-red-500 border-red-500/30',
};

const statusEs: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completado',
    cancelled: 'Cancelado',
};

export function ClientDetailModal({ client, open, onOpenChange }: ClientDetailModalProps) {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [fullClient, setFullClient] = useState<Client | null>(null);

    useEffect(() => {
        if (open && client?.id) {
            setLoading(true);
            fetch(route('clients.show', client.id))
                .then(res => res.json())
                .then(data => {
                    setFullClient(data.client);
                    setOrders(data.orders);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setOrders([]);
            setFullClient(null);
        }
    }, [open, client]);

    if (!client) return null;

    const displayClient = fullClient || client;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl w-[90vw] p-0 overflow-hidden bg-background/80 backdrop-blur-xl border-border/50 text-foreground flex flex-col h-[85vh]">
                <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/30">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl font-bold text-primary">
                                {displayClient.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                {displayClient.name}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1 text-base flex flex-wrap gap-x-6 gap-y-2">
                                {displayClient.email && (
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="w-4 h-4" /> {displayClient.email}
                                    </span>
                                )}
                                {displayClient.phone && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="w-4 h-4" /> {displayClient.phone}
                                    </span>
                                )}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                            <p>Cargando información del cliente...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            {/* LEFT COLUMN: Profile Info */}
                            <div className="col-span-1 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border/50 pb-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Información Personal
                                    </h3>
                                    
                                    <div className="space-y-3 text-sm">
                                        {displayClient.address && (
                                            <div>
                                                <p className="text-muted-foreground flex items-center gap-2 mb-1">
                                                    <MapPin className="w-4 h-4" /> Dirección
                                                </p>
                                                <p className="font-medium text-foreground pl-6">{displayClient.address}</p>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <p className="text-muted-foreground flex items-center gap-2 mb-1">
                                                <Calendar className="w-4 h-4" /> Cliente desde
                                            </p>
                                            <p className="font-medium text-foreground pl-6">
                                                {new Date(displayClient.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>

                                        {displayClient.notes && (
                                            <div>
                                                <p className="text-muted-foreground flex items-center gap-2 mb-1">
                                                    <FileText className="w-4 h-4" /> Notas
                                                </p>
                                                <div className="bg-muted/30 p-3 rounded-md pl-6 mt-1 border border-border/50">
                                                    <p className="font-medium text-sm text-foreground whitespace-pre-line">{displayClient.notes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Total de Órdenes</p>
                                    <p className="text-3xl font-bold text-foreground">{orders.length}</p>
                                </div>
                            </div>
                            
                            {/* RIGHT COLUMN: Order History */}
                            <div className="col-span-1 md:col-span-2 space-y-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border/50 pb-2">
                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                    Historial de Órdenes
                                </h3>

                                {orders.length === 0 ? (
                                    <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border/50">
                                        <p className="text-muted-foreground">Este cliente aún no ha realizado compras.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="bg-muted/20 rounded-xl p-4 border border-border/50 hover:bg-muted/40 transition-colors">
                                                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-foreground">Orden #{order.id}</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${statusColors[order.status] || 'bg-gray-500/20 text-gray-500'}`}>
                                                            {statusEs[order.status] || order.status}
                                                        </span>
                                                        <span className="font-bold text-foreground">
                                                            USD ${Number(order.total_amount).toLocaleString('es-AR')}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="pl-4 border-l-2 border-primary/20 space-y-2 mt-3">
                                                    {order.items?.map((item: any) => (
                                                        <div key={item.id} className="flex items-center gap-3 text-sm">
                                                            {item.catalog_product?.images?.[0] ? (
                                                                <img src={item.catalog_product.images[0]} className="w-8 h-8 rounded object-cover border border-border/50" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center border border-border/50">
                                                                    <ShoppingBag className="w-3 h-3 text-muted-foreground opacity-50" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                {item.catalog_product?.id ? (
                                                                    <a 
                                                                        href={`http://localhost:8001/catalog/${item.catalog_product.id}`}
                                                                        target="_blank"
                                                                        className="font-medium hover:text-primary transition-colors hover:underline inline-flex items-center gap-1"
                                                                    >
                                                                        {item.product_name} <ArrowUpRight className="w-3 h-3" />
                                                                    </a>
                                                                ) : (
                                                                    <span className="font-medium text-foreground">{item.product_name}</span>
                                                                )}
                                                                <p className="text-xs text-muted-foreground">Cant: {item.quantity} x ${Number(item.price).toLocaleString('es-AR')}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                        </div>
                    )}
                </div>
                
            </DialogContent>
        </Dialog>
    );
}
