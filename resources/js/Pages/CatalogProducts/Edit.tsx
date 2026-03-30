import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { Button } from '@/Components/ui/button';
import { 
    Save, 
    ArrowLeft, 
    Image as ImageIcon, 
    X, 
    Trash2, 
    Plus, 
    Check, 
    Globe, 
    Link as LinkIcon, 
    Video,
    Edit3,
    Plus as PlusIcon,
    Star,
    ShieldCheck,
    AlertCircle as AlertIcon,
} from 'lucide-react';
import { Modal, ScrollArea, ColorSwatch, Group as MantineGroup, Tooltip as MantineTooltip, UnstyledButton, ColorInput, ActionIcon as MantineActionIcon, Stack as MantineStack, Text as MantineText } from '@mantine/core';
import { DesignStudio, GARMENT_COLORS } from '@/Components/Design/DesignStudio';

interface Collection {
    id: number;
    name: string;
}

interface InventoryProduct {
    id: number;
    name: string;
    sku: string | null;
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    user_name: string;
    user_email: string | null;
    status: 'pending' | 'approved' | 'rejected';
    is_verified_purchase: boolean;
    created_at: string;
}

interface CatalogProduct {
    id: number;
    name: string;
    slug: string | null;
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
    available_colors: string[] | null;
    available_sizes: string[] | null;
    available_genders: string[] | null;
    reviews?: Review[];
}

export default function CatalogProductsEdit({ product, collections, inventoryProducts }: {
    product: CatalogProduct;
    collections: Collection[];
    inventoryProducts: InventoryProduct[];
}) {
    // Helper function for safe JSON parsing
    const safeJsonParse = (str: any) => {
        if (!str || typeof str !== 'string') return str;
        try {
            return JSON.parse(str);
        } catch (e) {
            console.error("Invalid JSON in product_design, using null:", str);
            return null;
        }
    };

    const [form, setForm] = useState({
        name: product.name || '',
        slug: product.slug || '',
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
        available_colors: product.available_colors || [],
        available_sizes: product.available_sizes || ['S', 'M', 'L', 'XL'],
        available_genders: product.available_genders || ['CABALLERO', 'DAMA'],
    });

    const [newImages, setNewImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    
    const [newVideo, setNewVideo] = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

    const [newDetailImage, setNewDetailImage] = useState<File | null>(null);
    const [detailPreviewUrl, setDetailPreviewUrl] = useState<string | null>(null);

    const [newDesignFront, setNewDesignFront] = useState<File | null>(null);
    const [designFrontPreview, setDesignFrontPreview] = useState<string | null>(null);

    const [newDesignBack, setNewDesignBack] = useState<File | null>(null);
    const [designBackPreview, setDesignBackPreview] = useState<string | null>(null);

    const [isStudioOpen, setIsStudioOpen] = useState(false);
    const [customColor, setCustomColor] = useState('#FFFFFF');

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

    const addColor = (hex: string) => {
        if (!form.available_colors.includes(hex.toUpperCase())) {
            setForm(prev => ({
                ...prev,
                available_colors: [...prev.available_colors, hex.toUpperCase()]
            }));
        }
    };

    const removeColor = (hex: string) => {
        setForm(prev => ({
            ...prev,
            available_colors: prev.available_colors.filter(c => c !== hex)
        }));
    };

    const toggleSize = (size: string) => {
        setForm(prev => {
            const has = prev.available_sizes.includes(size);
            return {
                ...prev,
                available_sizes: has ? prev.available_sizes.filter(x => x !== size) : [...prev.available_sizes, size]
            };
        });
    };

    const toggleGender = (gender: string) => {
        setForm(prev => {
            const has = prev.available_genders.includes(gender);
            return {
                ...prev,
                available_genders: has ? prev.available_genders.filter(x => x !== gender) : [...prev.available_genders, gender]
            };
        });
    };

    // -- Submit --

    const submit = () => {
        setProcessing(true);

        const data: any = {
            _method: 'PUT',
            name: form.name,
            slug: form.slug,
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
            remove_detail_image: form.remove_detail_image ? 1 : 0,
            available_colors: form.available_colors,
            available_sizes: form.available_sizes,
            available_genders: form.available_genders,
        };

        if (newVideo) data.new_video = newVideo;
        if (newDetailImage) data.new_detail_image = newDetailImage;
        if (newDesignFront) data.new_design_front = newDesignFront;
        if (newDesignBack) data.new_design_back = newDesignBack;

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Ej. franela-okio (Auto-generado si vacío)"
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
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Diseño (JSON Avanzado)</label>
                            <div className="flex gap-2">
                                <textarea
                                    rows={2}
                                    value={form.product_design}
                                    onChange={e => setForm(p => ({ ...p, product_design: e.target.value }))}
                                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground"
                                    placeholder='{"product": {"id": "tshirt"}, "elements": {...}}'
                                />
                                <button
                                    onClick={() => setIsStudioOpen(true)}
                                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors"
                                    title="Abrir Editor Visual"
                                >
                                    <Edit3 className="h-5 w-5" />
                                    <span className="text-[10px] font-bold uppercase">Studio</span>
                                </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 italic">Este campo se auto-actualiza al usar el Studio o subir diseños abajo.</p>
                        </div>
                    </div>

                    {/* Design Studio Modal */}
                    <Modal 
                        opened={isStudioOpen} 
                        onClose={() => setIsStudioOpen(false)} 
                        size="95%" 
                        radius="md" 
                        padding={0}
                        withCloseButton={false}
                        scrollAreaComponent={ScrollArea.Autosize}
                    >
                        <div className="relative">
                            <button 
                                onClick={() => setIsStudioOpen(false)}
                                className="absolute top-4 right-4 z-[1000] p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/20"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            <DesignStudio 
                                gender="Caballero" 
                                initialData={safeJsonParse(form.product_design)}
                                onSave={(data) => {
                                    setForm(prev => ({ ...prev, product_design: JSON.stringify(data) }));
                                }} 
                            />
                        </div>
                    </Modal>

                    {/* Quick Design Upload Panel */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" /> Carga Rápida de Diseño (Mockup)
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Sube tus diseños en PNG (transparente) para que el mockup dinámico los muestre sobre la prenda.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Front Design */}
                            <div>
                                <label className="text-sm font-medium text-zinc-400 mb-2 block uppercase tracking-wider">FRENTE</label>
                                <div className="aspect-square relative rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden bg-zinc-900/50">
                                    {designFrontPreview ? (
                                        <div className="relative w-full h-full p-4">
                                            <img src={designFrontPreview} className="w-full h-full object-contain" alt="Front Preview" />
                                            <button onClick={() => { setNewDesignFront(null); setDesignFrontPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/50 transition-colors gap-2">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            <span className="text-xs font-medium text-muted-foreground">Subir PNG Frontal</span>
                                            <input type="file" accept="image/png" className="hidden" onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) { setNewDesignFront(f); setDesignFrontPreview(URL.createObjectURL(f)); }
                                            }} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Back Design */}
                            <div>
                                <label className="text-sm font-medium text-zinc-400 mb-2 block uppercase tracking-wider">ESPALDA</label>
                                <div className="aspect-square relative rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden bg-zinc-900/50">
                                    {designBackPreview ? (
                                        <div className="relative w-full h-full p-4">
                                            <img src={designBackPreview} className="w-full h-full object-contain" alt="Back Preview" />
                                            <button onClick={() => { setNewDesignBack(null); setDesignBackPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/50 transition-colors gap-2">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            <span className="text-xs font-medium text-muted-foreground">Subir PNG Posterior</span>
                                            <input type="file" accept="image/png" className="hidden" onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) { setNewDesignBack(f); setDesignBackPreview(URL.createObjectURL(f)); }
                                            }} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Moderation Panel */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" /> Moderación de Reseñas
                        </h3>
                        
                        {!product.reviews || product.reviews.length === 0 ? (
                            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed text-zinc-500">
                                <p className="text-sm">No hay reseñas para este producto todavía.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {product.reviews.map((review: any) => (
                                    <div key={review.id} className={`p-4 rounded-lg border ${review.status === 'pending' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-background border-border shadow-sm'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-zinc-100">
                                                        {review.user_name} 
                                                        {review.user_email && <span className="text-xs text-muted-foreground/60 font-normal italic ml-2">({review.user_email})</span>}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">• {new Date(review.created_at).toLocaleDateString()}</span>
                                                    {review.status === 'pending' && (
                                                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-[10px] font-bold rounded-full border border-amber-500/30 uppercase">Pendiente</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} className={i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className={`h-8 px-2 text-[10px] font-bold uppercase ${review.is_verified_purchase ? 'text-emerald-500 border-emerald-500/50 bg-emerald-500/10' : 'text-zinc-400 border-zinc-700'}`}
                                                    onClick={() => {
                                                        router.post(route('reviews.updateStatus', review.id), {
                                                            status: review.status,
                                                            is_verified_purchase: !review.is_verified_purchase
                                                        }, { preserveScroll: true });
                                                    }}
                                                >
                                                    <ShieldCheck className={`h-3 w-3 mr-1 ${review.is_verified_purchase ? 'fill-emerald-500' : ''}`} />
                                                    {review.is_verified_purchase ? 'Verificado' : 'No Verificado'}
                                                </Button>
                                                
                                                <div className="h-4 w-px bg-border mx-1" />
                                                
                                                <button 
                                                    onClick={() => router.delete(route('reviews.destroy', review.id), { preserveScroll: true, onBefore: () => confirm('¿Estás seguro de borrar esta reseña?') })}
                                                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                                    title="Eliminar Reseña"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm text-zinc-300 my-3 leading-relaxed">
                                            {review.comment}
                                        </p>
                                        
                                        <div className="flex gap-2 mt-4 pt-3 border-t border-border/50">
                                            {review.status !== 'approved' && (
                                                <Button 
                                                    size="sm" 
                                                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold uppercase"
                                                    onClick={() => router.post(route('reviews.updateStatus', review.id), { status: 'approved' }, { preserveScroll: true })}
                                                >
                                                    Aprobar
                                                </Button>
                                            )}
                                            {review.status !== 'rejected' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-8 text-[10px] font-bold uppercase text-zinc-400 border-zinc-700"
                                                    onClick={() => router.post(route('reviews.updateStatus', review.id), { status: 'rejected' }, { preserveScroll: true })}
                                                >
                                                    Rechazar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-4 italic">
                            Las reseñas marcadas como "Aprobadas" aparecerán en la tienda. "Verificado" añade un sello de confianza.
                        </p>
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

                    {/* Available Colors Selection */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Colores de Prenda</h3>
                        
                        <div className="space-y-6">
                            {/* Preset Selection Grid */}
                            <div>
                                <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Presets del Studio</p>
                                <div className="flex flex-wrap gap-2">
                                    {GARMENT_COLORS.map(c => {
                                        const isSelected = form.available_colors.includes(c.value);
                                        return (
                                            <MantineTooltip key={c.value} label={c.label}>
                                                <UnstyledButton 
                                                    onClick={() => isSelected ? removeColor(c.value) : addColor(c.value)}
                                                    className={`p-1 rounded-full border-2 transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100 hover:border-border'}`}
                                                >
                                                    <ColorSwatch color={c.value} size={28} />
                                                </UnstyledButton>
                                            </MantineTooltip>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom Color Selector */}
                            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                                <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Añadir Color Personalizado</p>
                                <div className="flex gap-2">
                                    <ColorInput 
                                        value={customColor} 
                                        onChange={setCustomColor}
                                        placeholder="#000000"
                                        className="flex-1"
                                        radius="md"
                                        size="xs"
                                        styles={{ input: { color: '#000' } }}
                                    />
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="outline"
                                        className="h-auto"
                                        onClick={() => addColor(customColor)}
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Active List */}
                            {form.available_colors.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Lista Activa ({form.available_colors.length})</p>
                                    <div className="flex flex-wrap gap-1.5 p-3 bg-background rounded-lg border border-border min-h-[50px]">
                                        {form.available_colors.map((hex, i) => (
                                            <div key={i} className="group relative">
                                                <ColorSwatch color={hex} size={30} />
                                                <button 
                                                    onClick={() => removeColor(hex)}
                                                    className="absolute -top-1 -right-1 p-0.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-white shadow-sm"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2 italic">Haz clic en la 'x' para remover un color de la tienda.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Available Sizes Selection */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Tallas Disponibles</h3>
                        <div className="flex flex-wrap gap-2">
                            {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map(size => {
                                const active = form.available_sizes.includes(size);
                                return (
                                    <button
                                        key={size}
                                        onClick={() => toggleSize(size)}
                                        className={`px-3 py-1.5 rounded-md border text-xs font-bold transition-all ${active ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-3 italic">Selecciona las tallas que el cliente podrá elegir.</p>
                    </div>

                    {/* Available Genders Selection */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Géneros / Versiones</h3>
                        <div className="space-y-2">
                            {['CABALLERO', 'DAMA', 'UNISEX', 'NIÑO', 'NIÑA'].map(gender => {
                                const active = form.available_genders.includes(gender);
                                return (
                                    <button
                                        key={gender}
                                        onClick={() => toggleGender(gender)}
                                        className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg transition-colors text-left ${active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-muted/30'}`}
                                    >
                                        <span className={`text-xs font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>
                                            {gender}
                                        </span>
                                        {active && <Check className="h-3 w-3 text-primary" />}
                                    </button>
                                );
                            })}
                        </div>
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
