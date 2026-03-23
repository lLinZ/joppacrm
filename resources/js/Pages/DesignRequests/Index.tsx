// <ai_context>
// Propósito: Interfaz administrativa para listar las solicitudes de diseño personalizado.
// Características: Utiliza shadcn/ui y tanstack/table de forma independiente sin interferencias de Tailiwind/Mantine.
// Localización: CRM (Admin)
// </ai_context>

import React from 'react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";

interface DesignRequest {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    items_count: number;
    created_at: string;
}

interface Props {
    requests: {
        data: DesignRequest[];
    };
}

export default function Index({ requests }: Props) {
    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'reviewed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'accepted': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <AppLayout>
            <Head title="Solicitudes de Diseño - Admin" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-white text-2xl font-semibold">Propuestas Recibidas</CardTitle>
                            <CardDescription className="text-slate-400 text-sm">
                                Gestiona las solicitudes de personalización recibidas desde el E-commerce.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="bg-white/5 uppercase font-medium text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4 rounded-tl-xl border-b border-white/10">ID</th>
                                            <th className="px-6 py-4 border-b border-white/10">Cliente</th>
                                            <th className="px-6 py-4 border-b border-white/10">Contacto</th>
                                            <th className="px-6 py-4 border-b border-white/10 text-center">Piezas Sugeridas</th>
                                            <th className="px-6 py-4 border-b border-white/10">Estado</th>
                                            <th className="px-6 py-4 rounded-tr-xl border-b border-white/10 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {requests.data.map((req) => (
                                            <tr key={req.id} className="hover:bg-white/[0.02] transition-colors rounded-xl overflow-hidden">
                                                <td className="px-6 py-4 font-semibold text-white">#{req.id}</td>
                                                <td className="px-6 py-4">{req.name}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span>{req.email}</span>
                                                        <span className="text-slate-500 text-xs">{req.phone}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-white shadow-inner">
                                                        {req.items_count} prendas
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={`${getStatusTheme(req.status)} px-3 py-1 font-semibold uppercase tracking-wider text-[10px]`}>
                                                        {req.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/design-requests/${req.id}`}
                                                        className="text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors border border-emerald-400/20 hover:border-emerald-400/50 bg-emerald-400/10 px-4 py-2 rounded-lg"
                                                    >
                                                        Revisar Propuesta
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {requests.data.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                    No hay solicitudes de diseño pendientes.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
