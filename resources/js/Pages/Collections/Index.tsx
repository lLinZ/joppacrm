import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { Button } from '@/Components/ui/button';
import {
    Plus, Pencil, Trash2, LayoutList, ToggleRight, ToggleLeft,
    ChevronDown, ChevronRight, Package, Check
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    sku: string | null;
    price: string;
    is_published: boolean;
}

interface Collection {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
    catalog_products_count: number;
    catalog_products: { id: number }[];
}

// ─── Create / Edit Form ───────────────────────────────────────────────────────
function CollectionForm({ initial, onSubmit, onCancel }: {
    initial?: Partial<Collection>;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        name: initial?.name ?? '',
        description: initial?.description ?? '',
        is_active: initial?.is_active ?? true,
        sort_order: initial?.sort_order ?? 0,
    });

    return (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre *</label>
                    <input
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ej: Verano 2025"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Orden</label>
                    <input
                        type="number"
                        value={form.sort_order}
                        onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción</label>
                <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Descripción breve de la colección..."
                />
            </div>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                    className={`flex items-center gap-2 text-sm transition-colors ${form.is_active ? 'text-emerald-500' : 'text-muted-foreground'}`}
                >
                    {form.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    {form.is_active ? 'Activa (visible en tienda)' : 'Inactiva'}
                </button>
            </div>
            <div className="flex items-center gap-2 pt-2">
                <Button onClick={() => onSubmit(form)}>
                    {initial ? 'Guardar Cambios' : 'Crear Colección'}
                </Button>
                <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
            </div>
        </div>
    );
}

// ─── Product Picker Panel ─────────────────────────────────────────────────────
function ProductPicker({ collection, allProducts, onClose }: {
    collection: Collection;
    allProducts: Product[];
    onClose: () => void;
}) {
    const initial = new Set(collection.catalog_products?.map(p => p.id) ?? []);
    const [selected, setSelected] = useState<Set<number>>(initial);
    const [search, setSearch] = useState('');

    const toggle = (id: number) =>
        setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

    const visible = allProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const save = () => {
        router.post(route('collections.syncProducts', collection.id), { product_ids: [...selected] }, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <div className="bg-card border border-primary/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                    Productos en "{collection.name}"
                </h3>
                <span className="text-xs text-muted-foreground">{selected.size} seleccionados</span>
            </div>

            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto o SKU..."
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="max-h-72 overflow-y-auto space-y-1 rounded-lg">
                {visible.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">Sin productos</p>
                )}
                {visible.map(p => {
                    const checked = selected.has(p.id);
                    return (
                        <button
                            key={p.id}
                            onClick={() => toggle(p.id)}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                                ${checked ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent border border-transparent'}
                            `}
                        >
                            <div className={`
                                w-5 h-5 rounded flex items-center justify-center shrink-0 border
                                ${checked ? 'bg-primary border-primary' : 'border-border'}
                            `}>
                                {checked && <Check className="h-3 w-3 text-primary-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {p.sku ? `SKU: ${p.sku} · ` : ''}${Number(p.price).toLocaleString('es-AR')}
                                    {p.is_published && <span className="ml-2 text-emerald-500">● En catálogo web</span>}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-2 pt-1">
                <Button onClick={save}>Guardar Productos</Button>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CollectionsIndex({ collections, allProducts }: {
    collections: Collection[];
    allProducts: Product[];
}) {
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<number | null>(null);
    const [assigningTo, setAssigningTo] = useState<number | null>(null);

    const handleCreate = (data: any) =>
        router.post(route('collections.store'), data, { preserveScroll: true, onSuccess: () => setCreating(false) });

    const handleUpdate = (id: number, data: any) =>
        router.put(route('collections.update', id), data, { preserveScroll: true, onSuccess: () => setEditing(null) });

    const handleDelete = (id: number) => {
        if (!confirm('¿Eliminar esta colección?')) return;
        router.delete(route('collections.destroy', id), { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Colecciones" />

            <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                <PageHeader
                    title="Colecciones"
                    description="Agrupa productos del inventario en colecciones visibles en el catálogo del e-commerce."
                />
                {!creating && (
                    <Button onClick={() => { setCreating(true); setAssigningTo(null); setEditing(null); }}>
                        <Plus className="h-4 w-4 mr-2" /> Nueva Colección
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {creating && (
                    <CollectionForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
                )}

                {collections.length === 0 && !creating && (
                    <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
                        <LayoutList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Sin colecciones todavía</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Crea tu primera colección para agrupar productos del catálogo.
                        </p>
                        <Button onClick={() => setCreating(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Crear primera colección
                        </Button>
                    </div>
                )}

                {collections.map(col => (
                    <div key={col.id} className="space-y-2">
                        {editing === col.id ? (
                            <CollectionForm
                                initial={col}
                                onSubmit={(data) => handleUpdate(col.id, data)}
                                onCancel={() => setEditing(null)}
                            />
                        ) : (
                            <div className={`bg-card border rounded-xl px-5 py-4 transition-colors ${assigningTo === col.id ? 'border-primary/40' : 'border-border hover:border-primary/20'}`}>
                                <div className="flex items-center gap-4">
                                    {/* Expand/collapse product picker */}
                                    <button
                                        onClick={() => setAssigningTo(assigningTo === col.id ? null : col.id)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {assigningTo === col.id
                                            ? <ChevronDown className="h-4 w-4" />
                                            : <ChevronRight className="h-4 w-4" />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-foreground">{col.name}</h3>
                                            <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full">{col.slug}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.is_active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                                                {col.is_active ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>
                                        {col.description && (
                                            <p className="text-sm text-muted-foreground mt-0.5 truncate">{col.description}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Orden: {col.sort_order}
                                        </p>
                                    </div>

                                    {/* Product count badge */}
                                    <button
                                        onClick={() => setAssigningTo(assigningTo === col.id ? null : col.id)}
                                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 bg-accent px-3 py-1.5 rounded-lg"
                                    >
                                        <Package className="h-4 w-4" />
                                        {col.catalog_products_count} producto{col.catalog_products_count !== 1 ? 's' : ''}
                                    </button>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button size="sm" variant="ghost" onClick={() => { setEditing(col.id); setAssigningTo(null); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(col.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Inline Product Picker */}
                        {assigningTo === col.id && (
                            <ProductPicker
                                collection={col}
                                allProducts={allProducts}
                                onClose={() => setAssigningTo(null)}
                            />
                        )}
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
