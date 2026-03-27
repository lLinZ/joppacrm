// <ai_context>
// Propósito: Interfaz administrativa para ver el detalle de una solicitud de diseño.
// Funcionalidad: Visualización exhaustiva de Items dinámicos, imágenes de referencia, notas administrativas e integración de órdenes.
// </ai_context>

import React, { useState, useRef } from 'react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { ArrowLeft, Check, Eye, Download, X, Save, ShoppingCart, RefreshCw, Shirt, FileText, Image as ImageIcon, Layers } from 'lucide-react';
import { DesignPreview } from '@/Components/Design/DesignPreview';
import { DesignSpecsTable } from '@/Components/Design/DesignSpecsTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import html2canvas from 'html2canvas';

interface DesignItem {
    id: number;
    gender: string;
    style: string;
    color: string;
    size: string;
    quantity: number;
    image_path: string | null;
    image_back_path?: string | null;
    placement?: string;
    design_data?: any;
}

interface DesignRequestComment {
    id: number;
    user: { id: number; name: string } | null;
    body: string;
    created_at: string;
}

interface DesignRequest {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    state: string | null;
    general_comments: string | null;
    admin_notes: string | null;
    status: string;
    created_at: string;
    items: DesignItem[];
    comments?: DesignRequestComment[];
}

interface CatalogProduct {
    id: number;
    name: string;
    price: number | string;
}

interface Props {
    request: DesignRequest;
    catalogProducts: CatalogProduct[];
}

export default function Show({ request, catalogProducts }: Props) {
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [previewItem, setPreviewItem] = useState<DesignItem | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportHideMockup, setExportHideMockup] = useState(true);

    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);

    const handleExport = async (ref: React.RefObject<HTMLDivElement>, viewName: string) => {
        if (!ref.current) return;
        
        setIsExporting(true);
        // Pequena pausa para asegurar que el DOM se actualice (quitar guías, etc)
        // y asegurar que las tipografías estén listas para evitar que html2canvas haga fallback y estire las letras
        await document.fonts?.ready;
        await new Promise(r => setTimeout(r, 150));

        try {
            const canvas = await html2canvas(ref.current, {
                scale: 4, // Alta resolución
                backgroundColor: null, // Transparente si el fondo es null
                useCORS: true,
                logging: false,
                onclone: (document) => {
                    // Forzar carga de fuentes localmente en el clon si es necesario
                    Array.from(document.styleSheets).forEach(sheet => {
                        try {
                            const cssRules = sheet.cssRules;
                        } catch (e) {
                            console.log("CORS issue with stylesheet rules");
                        }
                    });
                }
            });

            const link = document.createElement('a');
            link.download = `Joppa_Diseno_${request.id}_${viewName}_${exportHideMockup ? 'Solo_Elementos' : 'Mockup'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Error exportando diseño:", err);
        } finally {
            setIsExporting(false);
        }
    };

    const { data: commentData, setData: setCommentData, post: postComment, processing: addingComment, reset: resetComment } = useForm({
        body: '',
    });

    const { data: orderData, setData: setOrderData, post: submitOrder, processing: creatingOrder, errors: orderErrors, reset: resetOrder } = useForm({
        product_name: 'Diseño Custom',
        catalog_product_id: '',
        custom_price: '0',
        quantity: request.items.reduce((sum, item) => sum + item.quantity, 0),
    });

    const handleStatusUpdate = (newStatus: string) => {
        router.put(`/design-requests/${request.id}`, { status: newStatus }, {
            preserveScroll: true,
        });
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        postComment(`/design-requests/${request.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => resetComment('body')
        });
    };

    const handleCreateOrder = (e: React.FormEvent) => {
        e.preventDefault();
        submitOrder(`/design-requests/${request.id}/convert-to-order`, {
            preserveScroll: true,
            onSuccess: () => setShowOrderModal(false)
        });
    };

    const StatusBadge = () => {
        switch (request.status) {
            case 'pending': return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-3 py-1">Pendiente</Badge>;
            case 'reviewed': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1">Contactado/Revisado</Badge>;
            case 'in_progress': return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 px-3 py-1">En Proceso</Badge>;
            case 'accepted': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">Aceptada (Formal)</Badge>;
            case 'rejected': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1">Rechazado</Badge>;
            default: return null;
        }
    };

    return (
        <AppLayout>
            <Head title={`Solicitud #${request.id} - Admin`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-6 relative">

                    {/* ORDER CREATION MODAL OVERLAY */}
                    {showOrderModal && (
                        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                            <Card className="bg-zinc-900 border-zinc-700 w-full max-w-lg shadow-2xl overflow-hidden">
                                <CardHeader className="bg-emerald-950/30 border-b border-emerald-900/50">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-white text-xl">Crear Orden Formal</CardTitle>
                                        <button onClick={() => setShowOrderModal(false)} className="text-zinc-400 hover:text-white transition-colors">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <p className="text-zinc-400 text-sm mt-2">
                                        Esto creará una nueva orden y un cliente (si no existe) y marcará la solicitud como aceptada.
                                    </p>
                                </CardHeader>
                                <form onSubmit={handleCreateOrder}>
                                    <CardContent className="space-y-4 pt-6">

                                        <div>
                                            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Producto / Descripción</label>
                                            <input
                                                value={orderData.product_name}
                                                onChange={e => setOrderData('product_name', e.target.value)}
                                                required
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                            />
                                            {orderErrors.product_name && <p className="text-red-400 text-xs mt-1">{orderErrors.product_name}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Precio Unitario ($)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={orderData.custom_price}
                                                    onChange={e => setOrderData('custom_price', e.target.value)}
                                                    required
                                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                                />
                                                {orderErrors.custom_price && <p className="text-red-400 text-xs mt-1">{orderErrors.custom_price}</p>}
                                            </div>
                                            <div>
                                                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Cantidad Total</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={orderData.quantity}
                                                    onChange={e => setOrderData('quantity', parseInt(e.target.value) || 1)}
                                                    required
                                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                                />
                                                {orderErrors.quantity && <p className="text-red-400 text-xs mt-1">{orderErrors.quantity}</p>}
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Enlazar con Catálogo (Opcional)</label>
                                            <select
                                                value={orderData.catalog_product_id}
                                                onChange={e => {
                                                    setOrderData('catalog_product_id', e.target.value);
                                                    if (e.target.value) {
                                                        const p = catalogProducts.find(prod => prod.id.toString() === e.target.value);
                                                        if (p) {
                                                            setOrderData(d => ({ ...d, product_name: p.name, custom_price: p.price.toString() }));
                                                        }
                                                    }
                                                }}
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                            >
                                                <option value="">Selecciona un producto base...</option>
                                                {catalogProducts.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </CardContent>
                                    <div className="flex bg-zinc-800/50 p-4 border-t border-zinc-700 justify-end gap-3 rounded-b-xl">
                                        <Button type="button" variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-700" onClick={() => setShowOrderModal(false)}>Cancelar</Button>
                                        <Button type="submit" disabled={creatingOrder} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6">
                                            {creatingOrder ? 'Creando...' : 'Crear Orden Ahora'}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <Link href="/design-requests" className="flex items-center text-slate-400 hover:text-white transition-colors group">
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Regresar a Solicitudes
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-sm">Estado actual:</span>
                            <StatusBadge />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* COLUMNA IZQUIERDA: Info de Cliente y Acciones (1/3) */}
                        <div className="md:col-span-1 space-y-6">

                            {/* ACCIONES CARD */}
                            <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
                                <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 pb-4">
                                    <CardTitle className="text-emerald-400 text-lg flex items-center gap-2">
                                        Acciones de Estado
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-6">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-purple-400 border-purple-400/30 hover:bg-purple-400/10 hover:text-purple-300 transition-all font-semibold h-11"
                                        onClick={() => handleStatusUpdate('in_progress')}
                                    >
                                        <RefreshCw className="w-5 h-5 mr-3" />
                                        En Proceso
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-blue-400 border-blue-400/30 hover:bg-blue-400/10 hover:text-blue-300 transition-all font-semibold h-11"
                                        onClick={() => handleStatusUpdate('reviewed')}
                                    >
                                        <Eye className="w-5 h-5 mr-3" />
                                        Marcar como Contactado
                                    </Button>
                                    <div className="pt-3 pb-3 border-y border-white/10 my-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-green-400 border-green-400/30 hover:bg-green-400/10 hover:text-green-300 transition-all font-semibold h-11"
                                            onClick={() => setShowOrderModal(true)}
                                            disabled={request.status === 'accepted'}
                                        >
                                            <ShoppingCart className="w-5 h-5 mr-3" />
                                            {request.status === 'accepted' ? 'Orden Formal Emitida' : 'Convertir a Orden'}
                                        </Button>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-300 transition-all font-semibold h-11"
                                        onClick={() => handleStatusUpdate('rejected')}
                                    >
                                        <X className="w-5 h-5 mr-3" />
                                        Rechazar Solicitud
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg">Información de Contacto</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Nombre</p>
                                        <p className="text-white font-medium">{request.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Correo Electrónico</p>
                                        <a href={`mailto:${request.email}`} className="text-emerald-400 hover:underline">{request.email}</a>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Teléfono</p>
                                        <a href={`https://wa.me/${request.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">{request.phone || 'No especificado'}</a>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Estado / Ubicación</p>
                                        <p className="text-white font-medium">{request.state || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Fecha de Solicitud</p>
                                        <p className="text-slate-300">{new Date(request.created_at).toLocaleString()}</p>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* COLUMNA DERECHA: Petición y Diseños (2/3) */}
                        <div className="md:col-span-2 space-y-6">

                            {/* ADMIN NOTES TIMELINE */}
                            <Card className="bg-blue-900/10 border-blue-500/20 backdrop-blur-xl rounded-2xl">
                                <CardHeader className="flex flex-row items-center justify-between pb-4">
                                    <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
                                        Historial de Notas Internas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Lista de comentarios */}
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {request.comments && request.comments.length > 0 ? request.comments.map(c => (
                                            <div key={c.id} className="bg-black/30 rounded-lg p-4 border border-blue-500/10 hover:border-blue-500/30 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-blue-300 text-sm">
                                                        {c.user ? c.user.name : 'Sistema'}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {new Date(c.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{c.body}</p>
                                            </div>
                                        )) : (
                                            <div className="text-center py-6 bg-black/20 rounded-lg border border-dashed border-white/10">
                                                <p className="text-slate-500 text-sm">No hay notas registradas aún. El equipo puede dejar comentarios aquí.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Input form */}
                                    <form onSubmit={handleAddComment} className="pt-4 border-t border-blue-500/20">
                                        <textarea
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none h-[90px] text-sm"
                                            placeholder="Escribe una actualización o nota sobre acuerdos negociados con el cliente..."
                                            value={commentData.body}
                                            onChange={e => setCommentData('body', e.target.value)}
                                            required
                                        />
                                        <div className="flex justify-end mt-3">
                                            <Button
                                                type="submit"
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-500 text-white border-none px-6 shadow-lg shadow-blue-900/20"
                                                disabled={addingComment || !commentData.body.trim()}
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {addingComment ? 'Guardando...' : 'Añadir Nota'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {request.general_comments && (
                                <Card className="bg-emerald-500/5 border-emerald-500/20 backdrop-blur-xl rounded-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            Comentarios e Ideas del Cliente
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-300 leading-relaxed font-serif text-lg whitespace-pre-line">"{request.general_comments}"</p>
                                    </CardContent>
                                </Card>
                            )}

                            <h3 className="text-2xl font-semibold text-white mt-8 mb-4 flex items-center gap-3">
                                <span className="inline-block w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">{request.items.length}</span>
                                Piezas Solicitadas
                            </h3>

                             <div className="space-y-6">
                                {request.items.map((item, idx) => (
                                    <div key={item.id} className="space-y-4">
                                        <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                                            <div className="flex flex-col sm:flex-row h-full">
                                                {/* Design Visualization Area */}
                                                <div className="w-full sm:w-1/2 bg-black/40 border-b sm:border-b-0 sm:border-r border-white/10 p-4">
                                                     {(() => {
                                                         let designObj = item.design_data;
                                                         if (typeof designObj === 'string') {
                                                             try {
                                                                 designObj = JSON.parse(designObj);
                                                             } catch (e) {
                                                                 console.error("Parse error", e);
                                                             }
                                                         }
                                                         
                                                         const hasBack = designObj?.elements?.back && designObj.elements.back.length > 0;

                                                          // Extract unique images for download
                                                          const allDesignElements = [
                                                              ...(designObj?.elements?.front || []),
                                                              ...(designObj?.elements?.back || [])
                                                          ];
                                                          const designImages = Array.from(new Set(
                                                              allDesignElements
                                                                  .filter(el => el.type === 'image')
                                                                  .map(el => el.content)
                                                          ));

                                                         return designObj ? (
                                                             <div className="space-y-4">
                                                                 <div className="relative group cursor-zoom-in" onClick={() => setPreviewItem(item)}>
                                                                     <DesignPreview design={designObj} view="front" />
                                                                     <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                                                         <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 text-white font-bold text-sm shadow-xl">
                                                                             <Eye size={16} /> Ver en Grande
                                                                         </div>
                                                                     </div>
                                                                 </div>
                                                                 
                                                                 {hasBack && (
                                                                     <div className="relative group cursor-zoom-in mt-4" onClick={() => setPreviewItem(item)}>
                                                                         <DesignPreview design={designObj} view="back" />
                                                                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                                                             <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 text-white font-bold text-sm shadow-xl">
                                                                                 <Eye size={16} /> Ver en Grande
                                                                             </div>
                                                                         </div>
                                                                     </div>
                                                                 )}

                                                                  {/* Download Section for Design Assets */}
                                                                  {designImages.length > 0 && (
                                                                      <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                                                          <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                              <Download size={14} /> Recursos del Diseño
                                                                          </h4>
                                                                          <div className="grid grid-cols-1 gap-2">
                                                                              {designImages.map((imgUrl, i) => (
                                                                                  <a 
                                                                                      key={i}
                                                                                      href={imgUrl} 
                                                                                      download 
                                                                                      target="_blank"
                                                                                      className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg group transition-colors border border-white/5"
                                                                                  >
                                                                                      <div className="flex items-center gap-3 overflow-hidden">
                                                                                          <img src={imgUrl} className="w-8 h-8 rounded object-cover border border-white/10 bg-black" />
                                                                                          <span className="text-[10px] text-slate-300 truncate font-mono">Original_{i+1}.png</span>
                                                                                      </div>
                                                                                      <Download size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                                                                  </a>
                                                                              ))}
                                                                          </div>
                                                                      </div>
                                                                  )}
                                                             </div>
                                                         ) : item.image_path ? (
                                                             <div className="w-full h-full relative group min-h-[300px]">
                                                                 <img
                                                                     src={item.image_path}
                                                                     alt={`Diseño ${idx + 1}`}
                                                                     className="w-full h-full object-contain drop-shadow-2xl"
                                                                 />
                                                                 <a
                                                                     href={item.image_path}
                                                                     target="_blank"
                                                                     rel="noopener noreferrer"
                                                                     className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                                                 >
                                                                     <Download className="w-8 h-8 mb-2" />
                                                                     <span className="font-semibold text-sm">Ver Original</span>
                                                                 </a>
                                                             </div>
                                                         ) : (
                                                             <div className="text-slate-600 flex flex-col items-center justify-center min-h-[300px]">
                                                                 <Eye className="w-8 h-8 mb-2 opacity-50" />
                                                                 <p className="text-xs uppercase font-semibold text-center px-4">Este item no tiene un diseño interactivo ni imagen física adjunta.</p>
                                                             </div>
                                                         );
                                                     })()}
                                                     
                                                     <div className="mt-4 flex flex-wrap gap-2">
                                                        <Badge className="bg-emerald-500 text-white font-bold px-3 py-1 shadow-lg">Pieza #{idx + 1}</Badge>
                                                        {item.placement && (
                                                            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 font-bold px-3 py-1 uppercase tracking-wider">
                                                                {item.placement === 'doble' ? 'Doble Faz' : item.placement === 'trasero' ? 'Espalda' : item.placement === 'pocket' ? 'Bolsillo' : 'Frontal'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Detalles técnicos */}
                                                <div className="flex-1 p-6 flex flex-col justify-center">
                                                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                                                        <div>
                                                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Modelo de Prenda</p>
                                                            <p className="text-white font-bold text-lg leading-tight">{item.style}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Categoría/Género</p>
                                                            <p className="text-slate-200">{item.gender}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Color de Tela</p>
                                                            <p className="text-slate-200 flex items-center gap-2 font-medium">
                                                                <span className="w-3 h-3 rounded-full border border-white/20 inline-block" style={{ backgroundColor: item.color === 'Negro' ? '#1A1A1A' : item.color === 'Blanco' ? '#FFFFFF' : item.color }}></span>
                                                                {item.color}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-8">
                                                            <div>
                                                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Talla</p>
                                                                <span className="inline-flex items-center justify-center min-w-[36px] h-9 rounded-lg border border-white/20 bg-white/5 font-mono font-bold text-white shadow-inner">
                                                                    {item.size}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Cantidad</p>
                                                                <p className="text-white text-3xl font-light tracking-tighter">x{item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                        
                                        {/* TABLE OF SPECS FOR THIS SPECIFIC ITEM */}
                                        {item.design_data && (
                                            <DesignSpecsTable design={item.design_data} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* LARGE PREVIEW DIALOG */}
                            <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
                                <DialogContent className="w-[95vw] !max-w-[95vw] h-[90vh] bg-zinc-950 border-white/10 p-0 overflow-hidden flex flex-col">
                                     <DialogHeader className="p-4 border-b border-white/5 bg-zinc-900/50 flex-shrink-0">
                                         <DialogTitle className="text-white flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Shirt className="text-emerald-400" /> 
                                                <span>Inspección de Producción - {previewItem?.style}</span>
                                            </div>
                                            <div className="flex items-center gap-4 mr-8">
                                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Exportar:</span>
                                                    <Button 
                                                        size="xs" 
                                                        variant={exportHideMockup ? "default" : "outline"}
                                                        onClick={() => setExportHideMockup(true)}
                                                        className="h-7 text-[10px]"
                                                    >
                                                        Solo Diseño
                                                    </Button>
                                                    <Button 
                                                        size="xs" 
                                                        variant={!exportHideMockup ? "default" : "outline"}
                                                        onClick={() => setExportHideMockup(false)}
                                                        className="h-7 text-[10px]"
                                                    >
                                                        Con Prenda
                                                    </Button>
                                                </div>
                                            </div>
                                         </DialogTitle>
                                     </DialogHeader>

                                     <div className="flex-1 flex overflow-hidden">
                                         {/* Workspace Area */}
                                         <div className="flex-[3] min-w-0 overflow-y-auto p-8 flex flex-col gap-12 bg-black/20">
                                             {(() => {
                                                 let designObj = previewItem?.design_data;
                                                 if (typeof designObj === 'string') {
                                                     try {
                                                         designObj = JSON.parse(designObj);
                                                     } catch (e) {
                                                         console.error("Parse error", e);
                                                     }
                                                 }
                                                 
                                                 const hasBack = designObj?.elements?.back && designObj.elements.back.length > 0;

                                                 return (
                                                     <div className="w-full space-y-12">
                                                         <div className="space-y-4">
                                                             <div className="flex items-center justify-between">
                                                                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                                                                    <Layers size={12} /> Vista Frontal
                                                                </p>
                                                                <Button 
                                                                    onClick={() => handleExport(frontRef, 'Frontal')}
                                                                    disabled={isExporting}
                                                                    size="sm"
                                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                                                                >
                                                                    {isExporting ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
                                                                    Descargar PNG Alta Res
                                                                </Button>
                                                             </div>
                                                             <div className="flex justify-center">
                                                                <div className="w-full max-w-[800px]">
                                                                    <DesignPreview 
                                                                        ref={frontRef} 
                                                                        design={designObj} 
                                                                        view="front" 
                                                                        hideMockup={exportHideMockup}
                                                                        isExporting={isExporting}
                                                                    />
                                                                </div>
                                                             </div>
                                                         </div>

                                                         {hasBack && (
                                                            <div className="space-y-4 border-t border-white/5 pt-12">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                                                                        <Layers size={12} /> Vista Trasera
                                                                    </p>
                                                                    <Button 
                                                                        onClick={() => handleExport(backRef, 'Trasera')}
                                                                        disabled={isExporting}
                                                                        size="sm"
                                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                                                                    >
                                                                        {isExporting ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
                                                                        Descargar PNG Alta Res
                                                                    </Button>
                                                                </div>
                                                                <div className="flex justify-center">
                                                                    <div className="w-full max-w-[800px]">
                                                                        <DesignPreview 
                                                                            ref={backRef} 
                                                                            design={designObj} 
                                                                            view="back" 
                                                                            hideMockup={exportHideMockup}
                                                                            isExporting={isExporting}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                         )}
                                                     </div>
                                                 );
                                             })()}
                                         </div>

                                         {/* Technical Info Sidebar */}
                                         <div className="w-80 bg-zinc-900/50 border-l border-white/5 p-6 overflow-y-auto hidden lg:block">
                                             <div className="space-y-8">
                                                 <div>
                                                     <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                                         <FileText className="text-emerald-400" size={16} /> Ficha Técnica
                                                     </h4>
                                                     <div className="space-y-4">
                                                         <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                             <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Prenda Base</p>
                                                             <p className="text-white text-sm font-semibold">{previewItem?.style}</p>
                                                             <p className="text-zinc-400 text-xs">{previewItem?.gender}</p>
                                                         </div>
                                                         <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                             <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Color de Tela</p>
                                                             <div className="flex items-center gap-3">
                                                                 <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: previewItem?.color }} />
                                                                 <p className="text-white text-sm font-medium">{previewItem?.color}</p>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 </div>

                                                 <div>
                                                     <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                                         <ImageIcon className="text-emerald-400" size={16} /> Tipografías y Colores
                                                     </h4>
                                                     <div className="space-y-1">
                                                        <DesignSpecsTable design={previewItem?.design_data} />
                                                     </div>
                                                 </div>

                                                 <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                                     <p className="text-[10px] text-emerald-400 font-bold uppercase mb-2">Pro-Tip</p>
                                                     <p className="text-zinc-300 text-xs leading-relaxed">
                                                         Usa la opción <b>"Solo Diseño"</b> para exportar en alta resolución sin el fondo de la prenda. Esto facilita la vectorización y separación de colores.
                                                     </p>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
