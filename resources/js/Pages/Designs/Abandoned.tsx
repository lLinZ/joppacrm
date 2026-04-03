import React from 'react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Ghost, Clock, Trash2, MapPin, Layers, X, Shirt } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface AbandonedDesign {
    id: number;
    session_id: string;
    ip_address: string;
    duration_seconds: number;
    design_data: any;
    status: string;
    last_active_at: string;
}

export default function Abandoned({ abandonedDesigns }: { abandonedDesigns: any }) {
    
    const handleDelete = (id: number) => {
        if (confirm('¿Seguro que deseas eliminar el registro de este diseño?')) {
            router.delete(route('abandoned-designs.destroy', id));
        }
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    // Calculate how many layers/objects they created
    const countObjects = (designData: any) => {
        if (!designData) return 0;
        try {
            const data = typeof designData === 'string' ? JSON.parse(designData) : designData;
            let count = 0;
            if (data.elementsMap) {
                if (Array.isArray(data.elementsMap.front)) count += data.elementsMap.front.length;
                if (Array.isArray(data.elementsMap.back)) count += data.elementsMap.back.length;
            } else if (data.elements) { // Some old structure fallback
                if (Array.isArray(data.elements.front)) count += data.elements.front.length;
                if (Array.isArray(data.elements.back)) count += data.elements.back.length;
            }
            return count;
        } catch (e) {
            return 0;
        }
    };

    const getPreviewDetails = (designData: any) => {
        if (!designData) return null;
        try {
            const data = typeof designData === 'string' ? JSON.parse(designData) : designData;
            return data;
        } catch (e) {
            return null;
        }
    };

    const getGarmentImage = (product: any, side: 'front'|'back') => {
        if (!product || !product.assets) return '';
        try {
            const firstVariant = Object.values(product.assets)[0] as any;
            if (firstVariant && firstVariant[side]) return firstVariant[side];
        } catch (e) {}
        return '';
    };

    const [selectedPreview, setSelectedPreview] = React.useState<any>(null);
    const [fonts, setFonts] = React.useState<any[]>([]);

    React.useEffect(() => {
        // Fetch dynamic fonts configuration from CRM API
        fetch('/api/builder-config')
            .then(res => res.json())
            .then(data => {
                if (data.fonts) setFonts(data.fonts);
            })
            .catch(() => {});
    }, []);

    return (
        <AppLayout>
            <Head title="Diseños Huérfanos" />
            
            {/* Dynamic Fonts Import */}
            {fonts.length > 0 && (
                <style dangerouslySetInnerHTML={{ __html: `
                    @import url('https://fonts.googleapis.com/css2?${fonts.map(f => f.url ? `family=${f.url}` : '').filter(Boolean).join('&')}&display=swap');
                `}} />
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Ghost className="w-6 h-6 text-purple-400" />
                    Radar de Diseños Huérfanos
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    Sesiones de usuarios que interactuaron con el creador pero nunca enviaron la solicitud.
                </p>
            </div>

            <Card className="bg-[#121212] border-white/10">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 bg-white/[0.02] border-b border-white/10 uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Token Sesión / IP</th>
                                    <th className="px-6 py-4 font-medium">Actividad</th>
                                    <th className="px-6 py-4 font-medium">Elementos en Lienzo</th>
                                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {abandonedDesigns.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            <Ghost className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                            El radar está limpio. No hay diseños huérfanos recientes.
                                        </td>
                                    </tr>
                                ) : (
                                    abandonedDesigns.data.map((design: AbandonedDesign) => (
                                        <tr key={design.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-xs text-slate-300 mb-1">{design.session_id.substring(0, 12)}...</div>
                                                <div className="flex items-center gap-1 text-slate-500 text-xs">
                                                    <MapPin className="w-3 h-3" /> {design.ip_address || 'IP Oculta'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-300">
                                                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                                    {formatDuration(design.duration_seconds)} de uso
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Última vez: {formatDate(design.last_active_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Layers className="w-4 h-4 text-purple-400" />
                                                    <span className="font-semibold">{countObjects(design.design_data)} capas</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline" size="sm" className="bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20" onClick={() => setSelectedPreview(getPreviewDetails(design.design_data))}>
                                                        Ver Elementos
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(design.id)} className="text-slate-500 hover:text-red-400 hover:bg-red-500/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* PREVIEW MODAL */}
            {selectedPreview && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                        
                        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Shirt className="w-5 h-5 text-purple-400" />
                                Inspección Rápida de Diseño
                            </h2>
                            <button onClick={() => setSelectedPreview(null)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* DETAILS */}
                            <div className="flex flex-wrap gap-4">
                                {selectedPreview.product && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex-1 min-w-[200px]">
                                        <p className="text-xs text-slate-400 mb-1 uppercase font-bold">Variante Elegida</p>
                                        <p className="font-semibold text-white">{selectedPreview.product.name}</p>
                                    </div>
                                )}
                                {selectedPreview.color && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex-1 min-w-[150px]">
                                        <p className="text-xs text-slate-400 mb-1 uppercase font-bold">Color del Fondo</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md shadow-inner border border-white/10" style={{ backgroundColor: selectedPreview.color }}></div>
                                            <span className="font-mono text-sm text-white">{selectedPreview.color}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* VISUAL & LIST GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['front', 'back'].map(side => {
                                    const sideData = selectedPreview.elementsMap ? selectedPreview.elementsMap[side] : (selectedPreview.elements ? selectedPreview.elements[side] : []);
                                    if (!sideData || sideData.length === 0) return null;
                                    
                                    const garmentImage = getGarmentImage(selectedPreview.product, side as 'front'|'back');
                                    
                                    return (
                                        <div key={side} className="space-y-4 border border-white/5 rounded-xl bg-black/40 p-4">
                                            <h3 className="text-sm font-bold text-slate-300 uppercase px-2 border-l-2 border-purple-500">
                                                Capa: {side === 'front' ? 'FRONTAL' : 'TRASERA'} ({sideData.length} elementos)
                                            </h3>

                                            {/* VISUAL MOCKUP CANVAS */}
                                            <div className="relative w-full aspect-[1000/1100] bg-white rounded-lg overflow-hidden border border-white/20" style={{ containerType: 'inline-size' }}>
                                                {/* Base Garment Image */}
                                                {garmentImage && (
                                                    <>
                                                        <img src={garmentImage} alt="Base" className="absolute inset-0 w-full h-full object-contain object-top" />
                                                        {selectedPreview.color && (
                                                            <div className="absolute inset-0 w-full h-full opacity-90 transition-colors duration-500 bg-blend-multiply" style={{
                                                                backgroundColor: selectedPreview.color,
                                                                maskImage: `url(${garmentImage})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'top center',
                                                                WebkitMaskImage: `url(${garmentImage})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'top center',
                                                                mixBlendMode: 'multiply'
                                                            }} />
                                                        )}
                                                        <img src={garmentImage} alt="Texture" className="absolute inset-0 w-full h-full object-contain object-top opacity-90 pointer-events-none mix-blend-multiply" style={{ filter: 'brightness(1.1) contrast(1.1)' }} />
                                                    </>
                                                )}

                                                {/* Render Elements mathematically */}
                                                <div className="absolute inset-0 z-10">
                                                    {sideData.map((el: any) => {
                                                        const leftPct = (el.x / 1000) * 100;
                                                        const topPct = (el.y / 1100) * 100;
                                                        const widthPct = (el.width / 1000) * 100;
                                                        const heightPct = (el.height / 1100) * 100;
                                                        
                                                        return (
                                                            <div key={el.id} className="absolute flex items-center justify-center transform origin-center" 
                                                                style={{
                                                                    left: `${leftPct}%`,
                                                                    top: `${topPct}%`,
                                                                    width: `${widthPct}%`,
                                                                    height: `${heightPct}%`,
                                                                    rotate: `${el.rotation || 0}deg`,
                                                                }}
                                                            >
                                                                {el.type === 'image' ? (
                                                                    <img src={el.content} className="w-full h-full object-contain pointer-events-none" />
                                                                ) : (
                                                                    <div style={{
                                                                        color: el.color,
                                                                        fontFamily: el.fontFamily?.split(',')[0] || 'Arial',
                                                                        fontSize: `${(el.fontSize / 1000) * 100}cqw`, 
                                                                        letterSpacing: `${((el.letterSpacing || 0) / 1000) * 100}cqw`,
                                                                        fontWeight: 'bold',
                                                                        textAlign: 'center',
                                                                        lineHeight: 1.1,
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        whiteSpace: 'pre-wrap',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                    }}>
                                                                        {el.content}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* LIST DETAILS */}
                                            <div className="space-y-3 mt-4">
                                                {sideData.map((el: any) => (
                                                    <div key={el.id} className="flex gap-4 items-center bg-white/[0.02] border border-white/5 rounded-lg p-3">
                                                        {el.type === 'text' ? (
                                                            <>
                                                                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-md font-bold shrink-0">Aa</div>
                                                                <div>
                                                                    <p className="text-sm font-semibold text-white">"{el.content}"</p>
                                                                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                                                                        {el.fontFamily?.split(',')[0]} · Size: {el.fontSize} · Color: {el.color}
                                                                    </p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 rounded-md shrink-0 p-1">
                                                                    <img src={el.content} className="w-full h-full object-contain" />
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="text-sm font-semibold text-white">Imagen subida</p>
                                                                    <a href={el.content} target="_blank" className="text-[10px] text-emerald-400 hover:underline truncate block mt-1">
                                                                        {el.content}
                                                                    </a>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
