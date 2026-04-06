import { Head, router } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { Button } from '@/Components/ui/button';
import { Star, ShieldCheck, Trash2, Check, X, MessageSquare, ExternalLink } from 'lucide-react';

interface Review {
    id: number;
    rating: number;
    comment: string;
    user_name: string;
    user_email: string | null;
    status: 'pending' | 'approved' | 'rejected';
    is_verified_purchase: boolean;
    created_at: string;
    product?: {
        id: number;
        name: string;
        images: string[] | null;
    };
}

interface PaginatedReviews {
    data: Review[];
    links: any[];
    current_page: number;
    last_page: number;
}

export default function ReviewsIndex({ reviews }: { reviews: PaginatedReviews }) {
    
    const handleStatusUpdate = (id: number, status: string, is_verified_purchase?: boolean) => {
        router.post(route('reviews.updateStatus', id), { 
            status, 
            is_verified_purchase: is_verified_purchase !== undefined ? is_verified_purchase : undefined 
        }, { preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (!confirm('¿Estás seguro de borrar esta reseña permanentemente?')) return;
        router.delete(route('reviews.destroy', id), { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Gestión de Reseñas" />

            <div className="mb-8">
                <PageHeader
                    title="Centro de Reseñas"
                    description="Modera y gestiona todas las opiniones de tus clientes en un solo lugar."
                />
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                {reviews.data.length === 0 ? (
                    <div className="text-center py-20 px-6">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Sin Reseñas</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                            No se han encontrado reseñas en el sistema todavía.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Estado</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Producto / Cliente</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Valoración / Comentario</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {reviews.data.map((r) => (
                                    <tr key={r.id} className={`hover:bg-muted/30 transition-colors ${r.status === 'pending' ? 'bg-amber-500/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                {r.status === 'pending' && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase">
                                                        Pendiente
                                                    </span>
                                                )}
                                                {r.status === 'approved' && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 uppercase">
                                                        Aprobada
                                                    </span>
                                                )}
                                                {r.status === 'rejected' && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/20 text-destructive border border-destructive/30 uppercase">
                                                        Rechazada
                                                    </span>
                                                )}
                                                <button 
                                                    onClick={() => handleStatusUpdate(r.id, r.status, !r.is_verified_purchase)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${r.is_verified_purchase ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted text-muted-foreground border-border'}`}
                                                >
                                                    <ShieldCheck className="h-3 w-3" />
                                                    {r.is_verified_purchase ? 'VERIFICADO' : 'NO VERIF.'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {r.product?.images?.[0] && (
                                                    <img src={r.product.images[0]} className="h-10 w-10 rounded-md object-cover border border-border" alt="" />
                                                )}
                                                <div className="min-w-0">
                                                    <div className="font-bold text-foreground truncate max-w-[200px]">
                                                        {r.product?.name || 'Producto Desconocido'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {r.user_name}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground/60 italic truncate max-w-[200px]">
                                                        {r.user_email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-0.5 mb-1.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < r.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/40"} />
                                                ))}
                                                <span className="text-xs text-muted-foreground ml-2">{new Date(r.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-foreground line-clamp-2 max-w-md leading-relaxed italic">
                                                "{r.comment}"
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {r.status !== 'approved' && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => handleStatusUpdate(r.id, 'approved')}
                                                        className="h-8 text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-500/50"
                                                    >
                                                        <Check className="h-3.5 w-3.5 mr-1" /> Aprobar
                                                    </Button>
                                                )}
                                                {r.status === 'approved' && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => handleStatusUpdate(r.id, 'rejected')}
                                                        className="h-8 text-amber-500 hover:bg-amber-500 hover:text-white border-amber-500/50"
                                                    >
                                                        <X className="h-3.5 w-3.5 mr-1" /> Rechazar
                                                    </Button>
                                                )}
                                                <Button 
                                                   variant="ghost" 
                                                   size="sm" 
                                                   onClick={() => handleDelete(r.id)}
                                                   className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                                {r.product && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => router.get(route('catalog-products.edit', r.product!.id))}
                                                        className="h-8 text-primary hover:bg-primary/10"
                                                        title="Ver Producto"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Simple Pagination */}
            {reviews.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    {reviews.links.map((link, i) => (
                        <Button
                            key={i}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`${!link.url ? 'opacity-50 cursor-not-allowed' : ''} h-8 min-w-[32px]`}
                        />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
