import React from 'react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Ghost, Clock, Trash2, MapPin, Layers } from 'lucide-react';
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
            return data.objects?.length || 0;
        } catch (e) {
            return 0;
        }
    };

    return (
        <AppLayout>
            <Head title="Diseños Huérfanos" />

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
                                                    <Button variant="outline" size="sm" className="bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20" onClick={() => alert('Pronto podrás lanzar este JSON directo a previsualización')}>
                                                        Ver Lienzo
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
        </AppLayout>
    );
}
