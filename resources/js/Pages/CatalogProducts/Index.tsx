import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { Button } from '@/Components/ui/button';
import { Store, Plus, FileEdit, Trash2, Globe, Lock, Eye, BarChart2, Save, GripVertical } from 'lucide-react';
import { AnalyticsModal } from '@/Components/Catalog/AnalyticsModal';

interface Collection {
    id: number;
    name: string;
}

interface CatalogProduct {
    id: number;
    name: string;
    price: string;
    is_published: boolean;
    views_count: number;
    unique_views_count: number;
    collections: Collection[];
    catalog_order: number;
}

export default function CatalogProductsIndex({ products }: { products: CatalogProduct[] }) {
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ name: '', price: '' });
    const [processing, setProcessing] = useState(false);
    
    const [analyticsProduct, setAnalyticsProduct] = useState<CatalogProduct | null>(null);
    
    // Order management
    const [localOrders, setLocalOrders] = useState<Record<number, number>>(
        Object.fromEntries(products.map(p => [p.id, p.catalog_order || 0]))
    );
    const [isReordering, setIsReordering] = useState(false);

    const handleOrderChange = (id: number, value: string) => {
        const val = parseInt(value) || 0;
        setLocalOrders(prev => ({ ...prev, [id]: val }));
        setIsReordering(true);
    };

    const saveOrders = () => {
        setProcessing(true);
        const orders = Object.entries(localOrders).map(([id, catalog_order]) => ({
            id: parseInt(id),
            catalog_order
        }));

        router.post(route('catalog-products.reorder'), { orders }, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setIsReordering(false);
            }
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('catalog-products.store'), form, {
            preserveScroll: true,
            onFinish: () => setProcessing(false)
        });
    };

    const handleRemove = (id: number) => {
        if (!confirm('¿Seguro que deseas eliminar permanentemente este producto del catálogo?')) return;
        router.delete(route('catalog-products.destroy', id), { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Productos del Catálogo" />

            <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                <PageHeader
                    title="Catálogo de la Tienda"
                    description="Crea y gestiona productos diseñados puramente para marketing (sin afectar el inventario base)."
                />
                <div className="flex items-center gap-3">
                    {isReordering && (
                        <Button variant="outline" onClick={saveOrders} disabled={processing} className="border-primary text-primary hover:bg-primary/5">
                            <Save className="h-4 w-4 mr-2" /> Guardar Orden
                        </Button>
                    )}
                    {!adding && (
                        <Button onClick={() => setAdding(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Crear Producto Libre
                        </Button>
                    )}
                </div>
            </div>

            {adding && (
                <div className="bg-card border border-primary/40 rounded-xl p-5 mb-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Store className="h-4 w-4 text-primary" /> Nuevo Producto Aislado
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancelar</Button>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4 max-w-sm">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre del Producto</label>
                            <input
                                type="text"
                                placeholder="Ej. Franela Oversize Tokio"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Precio Base (USD)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Ej. 25.00"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                required
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <Button type="submit" disabled={processing} className="w-full">
                            Crear y continuar al diseño
                        </Button>
                    </form>
                </div>
            )}

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                {products.length === 0 ? (
                    <div className="text-center py-20 px-6">
                        <Store className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Catálogo Vacío</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                            Comienza a crear productos atractivos para tu tienda online totalmente separados del inventario.
                        </p>
                        <Button onClick={() => setAdding(true)}>Crear Primer Producto</Button>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-muted-foreground w-16">Pos.</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Producto / Estado</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Precio Base</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Colecciones</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Impresiones / Únicos</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <input
                                                type="number"
                                                value={localOrders[p.id] ?? 0}
                                                onChange={(e) => handleOrderChange(p.id, e.target.value)}
                                                className="w-12 px-1 py-1 bg-background border border-border rounded text-center text-xs focus:ring-1 focus:ring-primary outline-none font-bold"
                                            />
                                            {/* Logic for Landing Page: Top 4 published products */}
                                            {p.is_published && products.filter(x => x.is_published && (localOrders[x.id] < localOrders[p.id])).length < 4 && (localOrders[p.id] > 0) && (
                                                <span className="text-[9px] bg-primary text-white px-1 rounded font-bold uppercase" style={{ letterSpacing: '0.05em' }}>Landing</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-foreground">{p.name}</div>
                                        <div className="flex items-center mt-1">
                                            {p.is_published ? (
                                                <span className="flex items-center text-xs text-green-600 font-medium">
                                                    <Globe className="w-3 h-3 mr-1" /> Público Web
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-xs text-muted-foreground font-medium">
                                                    <Lock className="w-3 h-3 mr-1" /> Oculto (Borrador)
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-foreground font-medium">
                                        USD {Number(p.price).toLocaleString('es-AR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1 flex-wrap">
                                            {p.collections.length > 0 ? p.collections.map(c => (
                                                <span key={c.id} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium border border-primary/20">
                                                    {c.name}
                                                </span>
                                            )) : <span className="text-muted-foreground text-xs">Ninguna</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center justify-center text-sm font-medium">
                                            <div className="flex items-center gap-1.5 text-foreground">
                                                <Eye className="w-4 h-4 text-muted-foreground" />
                                                {p.views_count.toLocaleString('en-US')}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {p.unique_views_count.toLocaleString('en-US')} únicos
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="secondary" size="sm" onClick={() => setAnalyticsProduct(p)} className="h-8 shadow-none bg-primary/10 text-primary hover:bg-primary/20">
                                                <BarChart2 className="h-3.5 w-3.5 mr-1.5" /> Stats
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => router.get(route('catalog-products.edit', p.id))} className="h-8 shadow-none">
                                                <FileEdit className="h-3.5 w-3.5 mr-1.5" /> Editar Panel
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleRemove(p.id)} className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                                Borrar
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <AnalyticsModal 
                open={!!analyticsProduct} 
                onClose={() => setAnalyticsProduct(null)} 
                product={analyticsProduct} 
            />
        </AppLayout>
    );
}
