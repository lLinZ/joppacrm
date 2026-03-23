import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { Button } from '@/Components/ui/button';
import { Save, ArrowLeft, Image as ImageIcon, X, Trash2, Plus, Check, Globe, Link as LinkIcon, Video } from 'lucide-react';

interface Collection {
    id: number;
    name: string;
}

interface InventoryProduct {
    id: number;
    name: string;
    sku: string | null;
}

interface CatalogProduct {
    id: number;
    name: string;
    price: string;
    description: string | null;
    images: string[] | null;
    video_url: string | null;
    detail_image_url: string | null;
    product_information: string | null;
    product_features: string | null;
    product_design: string | null;
    is_published: boolean;
    inventory_product_id: number | null;
    collections: Collection[];
}

export default function CatalogProductsEdit({ product, collections, inventoryProducts }: {
    product: CatalogProduct;
    collections: Collection[];
    inventoryProducts: InventoryProduct[];
}) {
    const [form, setForm] = useState({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        product_information: product.product_information || '',
        product_features: product.product_features || '',
        product_design: product.product_design || '',
        images: product.images || [],
        video_url: product.video_url || null,
        detail_image_url: product.detail_image_url || null,
        remove_video: false,
        remove_detail_image: false,
        collection_ids: product.collections.map(c => c.id),
        is_published: !!product.is_published,
        inventory_product_id: product.inventory_product_id || '',
    });

    const [newImages, setNewImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    
    const [newVideo, setNewVideo] = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

    const [newDetailImage, setNewDetailImage] = useState<File | null>(null);
    const [detailPreviewUrl, setDetailPreviewUrl] = useState<string | null>(null);

    const [processing, setProcessing] = useState(false);

    // -- File Handlers --

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);
        
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...urls]);
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setNewVideo(file);
        setVideoPreviewUrl(URL.createObjectURL(file));
        setForm(p => ({ ...p, remove_video: false }));
    };

    const handleDetailImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setNewDetailImage(file);
        setDetailPreviewUrl(URL.createObjectURL(file));
        setForm(p => ({ ...p, remove_detail_image: false }));
    };

    // -- Removers --

    const removeExistingImage = (index: number) => {
        const updated = [...form.images];
        updated.splice(index, 1);
        setForm(prev => ({ ...prev, images: updated }));
    };

    const removeNewImage = (index: number) => {
        const uFiles = [...newImages];
        uFiles.splice(index, 1);
        setNewImages(uFiles);

        const uUrls = [...previewUrls];
        URL.revokeObjectURL(uUrls[index]);
        uUrls.splice(index, 1);
        setPreviewUrls(uUrls);
    };

    const removeVideo = () => {
        setNewVideo(null);
        if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
        setVideoPreviewUrl(null);
        setForm(p => ({ ...p, remove_video: true }));
    };

    const removeDetailImage = () => {
        setNewDetailImage(null);
        if (detailPreviewUrl) URL.revokeObjectURL(detailPreviewUrl);
        setDetailPreviewUrl(null);
        setForm(p => ({ ...p, remove_detail_image: true }));
    };

    const toggleCollection = (id: number) => {
        setForm(prev => {
            const has = prev.collection_ids.includes(id);
            return {
                ...prev,
                collection_ids: has ? prev.collection_ids.filter(x => x !== id) : [...prev.collection_ids, id]
            };
        });
    };

    // -- Submit --

    const submit = () => {
        setProcessing(true);

        const data: any = {
            _method: 'PUT',
            name: form.name,
            price: form.price,
            description: form.description,
            product_information: form.product_information,
            product_features: form.product_features,
            product_design: form.product_design,
            images: form.images,
            collection_ids: form.collection_ids,
            is_published: form.is_published ? 1 : 0,
            inventory_product_id: form.inventory_product_id || null,
            new_images: newImages,
            remove_video: form.remove_video ? 1 : 0,
            remove_detail_image: form.remove_detail_image ? 1 : 0,
        };

        if (newVideo) data.new_video = newVideo;
        if (newDetailImage) data.new_detail_image = newDetailImage;

        router.post(route('catalog-products.update', product.id), data, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                setNewImages([]);
                setPreviewUrls([]);
                setNewVideo(null);
                setNewDetailImage(null);
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`Diseñando ${form.name}`} />

            <div className="flex items-center gap-4 mb-8">
                <Link href={route('catalog-products.index')}>
                    <Button variant="outline" size="icon" className="h-9 w-9 border-border">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                        Diseñando Catálogo
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Producto Aislado • Total libertad creativa
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={submit} disabled={processing} className="px-6">
                        {processing ? 'Guardando...' : <><Save className="h-4 w-4 mr-2" /> Guardar Cambios</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1 & 2: Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Basic Info Panel */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Información Principal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre del Producto</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Ej. Franela Oversize Tokio"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Precio (USD)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={form.price}
                                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images Panel */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-primary" /> Galería de Imágenes (Centro)
                        </h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {/* Existing Images */}
                            {form.images.map((img, idx) => (
                                <div key={`exists-${idx}`} className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button onClick={() => removeExistingImage(idx)} className="p-2 bg-destructive text-white rounded-full hover:scale-110 transition-transform shadow-lg">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {idx === 0 && <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow">PRINCIPAL</span>}
                                </div>
                            ))}
                            
                            {/* New Images */}
                            {previewUrls.map((url, idx) => (
                                <div key={`new-${idx}`} className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-primary/50 bg-muted">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button onClick={() => removeNewImage(idx)} className="p-2 bg-destructive text-white rounded-full hover:scale-110 transition-transform shadow-lg">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">NUEVA</span>
                                </div>
                            ))}

                            {/* Uploader Placeholder */}
                            <label className="aspect-[3/4] rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center cursor-pointer">
                                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-xs font-medium text-muted-foreground">Añadir Imagen</span>
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Formato JPG o PNG vertical (ratio 3:4 sugerido). La primera imagen se usará como portada en el catálogo.
                        </p>
                    </div>

                    {/* Multimedia Específica (Layout E-commerce) Panel */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Video className="h-5 w-5 text-primary" /> Contenido Específico del Layout
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Video Izquierdo */}
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Video Promocional (Izquierda)</label>
                                <div className="aspect-[3/4] relative rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden bg-muted/30">
                                    {(videoPreviewUrl || (form.video_url && !form.remove_video)) ? (
                                        <>
                                            <video src={videoPreviewUrl || form.video_url!} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <button onClick={removeVideo} className="p-2 bg-destructive text-white rounded-full shadow-lg">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                                            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                            <span className="text-xs font-medium text-muted-foreground">Añadir Video</span>
                                            <span className="text-[10px] text-muted-foreground/70 mt-1">MP4, MOV (Max 20MB)</span>
                                            <input type="file" accept="video/mp4,video/quicktime" className="hidden" onChange={handleVideoChange} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Detail Zoom Image Derecho */}
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Imagen Detalle / Zoom (Derecha)</label>
                                <div className="aspect-[3/4] relative rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden bg-muted/30">
                                    {(detailPreviewUrl || (form.detail_image_url && !form.remove_detail_image)) ? (
                                        <>
                                            <img src={detailPreviewUrl || form.detail_image_url!} className="w-full h-full object-cover" alt="Detalle" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <button onClick={removeDetailImage} className="p-2 bg-destructive text-white rounded-full shadow-lg">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                                            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                            <span className="text-xs font-medium text-muted-foreground">Añadir Imagen</span>
                                            <span className="text-[10px] text-muted-foreground/70 mt-1">JPG, PNG (Max 10MB)</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleDetailImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Textiles / Descriptions Panel */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Textos Exclusivos de Marketing</h3>
                        
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción Comercial Corta</label>
                            <textarea
                                rows={2}
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground"
                                placeholder="Aparecerá justo debajo del precio."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Información del Producto (Acordeón 1)</label>
                            <textarea
                                rows={4}
                                value={form.product_information}
                                onChange={e => setForm(p => ({ ...p, product_information: e.target.value }))}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground"
                                placeholder="Detalles de la tela, origen, composición (Ej: 100% Organic Cotton. Crafted in Tokyo...)"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Características del Producto (Acordeón 2)</label>
                            <textarea
                                rows={4}
                                value={form.product_features}
                                onChange={e => setForm(p => ({ ...p, product_features: e.target.value }))}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground"
                                placeholder="Bolsillos, cremalleras, corte oversize, gramaje, etc."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Diseño (Acordeón 3)</label>
                            <textarea
                                rows={4}
                                value={form.product_design}
                                onChange={e => setForm(p => ({ ...p, product_design: e.target.value }))}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground"
                                placeholder="Inspiración gráfica, significado de estampados, silueta de diseño."
                            />
                        </div>
                    </div>
                </div>

                {/* Column 3: Sidebar */}
                <div className="space-y-6">

                    {/* Visibilidad / Publishing */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" /> Tienda Online
                        </h3>
                        <label className="flex items-center justify-between cursor-pointer p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div>
                                <p className="text-sm font-medium text-foreground">Publicar Producto</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Visible en E-commerce</p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" style={{ backgroundColor: form.is_published ? '#0B3022' : '#e5e7eb' }}>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={form.is_published}
                                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                                />
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </label>
                    </div>

                    {/* Linking Inventory */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <LinkIcon className="h-5 w-5 text-primary" /> Stock Físico
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Opcionalmente, enlaza este producto de marketing con un producto real de tu inventario para descontar unidades al vender.
                        </p>
                        <select
                            value={form.inventory_product_id}
                            onChange={(e) => setForm({ ...form, inventory_product_id: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Sin enlazar (Pre-orden / Sólo Web)</option>
                            {inventoryProducts.map(inv => (
                                <option key={inv.id} value={inv.id}>
                                    {inv.name} (SKU: {inv.sku || 'N/A'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Collections */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Colecciones</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Selecciona las colecciones en las que aparecerá listado este producto.
                        </p>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {collections.length === 0 && <p className="text-xs text-muted-foreground">No has creado colecciones aún.</p>}
                            {collections.map(col => {
                                const active = form.collection_ids.includes(col.id);
                                return (
                                    <button
                                        key={col.id}
                                        onClick={() => toggleCollection(col.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg transition-colors text-left ${active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-muted/30'}`}
                                    >
                                        <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-foreground'}`}>
                                            {col.name}
                                        </span>
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${active ? 'bg-primary border-primary' : 'border-input bg-background'}`}>
                                            {active && <Check className="h-3 w-3 text-primary-foreground" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>

            </div>
        </AppLayout>
    );
}
