import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Copy, Type, ImageIcon, Move, Eye } from 'lucide-react';

interface DesignElement {
    id: string;
    type: 'text' | 'image';
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    label?: string;
}

export const DesignSpecsTable: React.FC<{ design: any }> = ({ design }) => {
    if (!design || !design.elements) return null;

    const allElements = [
        ...(design.elements.front || []).map((el: any) => ({ ...el, view: 'Frontal' })),
        ...(design.elements.back || []).map((el: any) => ({ ...el, view: 'Trasera' }))
    ];

    if (allElements.length === 0) return null;

    return (
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden mt-6">
            <CardHeader className="bg-blue-500/10 border-b border-blue-500/20">
                <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
                    Especificaciones Técnicas de Producción
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-black/20">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-4">Pieza</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Tipo</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Contenido / Asset</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Specs (Fuente/Color)</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest text-right px-4">Posición (X,Y,R)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allElements.map((el, i) => (
                            <TableRow key={el.id + i} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="px-4">
                                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px] font-bold">
                                        {el.view}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {el.type === 'text' ? <Type size={14} className="text-slate-500" /> : <ImageIcon size={14} className="text-slate-500" />}
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                    <div className="flex items-center gap-2 group">
                                        <span className="text-slate-200 text-sm font-medium truncate">
                                            {el.type === 'text' ? el.content : 'Imagen Subida'}
                                        </span>
                                        {el.type === 'image' && (
                                            <a href={el.content} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Eye size={12} />
                                            </a>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {el.type === 'text' ? (
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-500 font-mono leading-none">{el.fontFamily?.split(',')[0]}</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: el.color }}></span>
                                                <span className="text-[10px] text-slate-300 font-mono">{el.color}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-slate-500 italic">Asset Externo</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-mono text-[10px] text-slate-400 px-4">
                                    <div className="flex flex-col items-end">
                                        <span>X:{Math.round(el.x)}px Y:{Math.round(el.y)}px</span>
                                        <span className="text-blue-400/60">Rot: {Math.round(el.rotation)}°</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Summary Section for Production */}
                <div className="p-4 bg-zinc-900 border-t border-white/10 flex flex-wrap gap-8 justify-between">
                    <div className="flex gap-12">
                        <div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter mb-2">Fuentes requeridas</p>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Set(allElements.filter(el => el.type === 'text').map(el => el.fontFamily?.split(',')[0]))).map(font => (
                                    <Badge key={font} variant="secondary" className="bg-white/10 text-white text-[10px]">{font}</Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter mb-2">Pantone / Colores HEX</p>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Set(allElements.filter(el => el.type === 'text').map(el => el.color))).map(color => (
                                    <div key={color} className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/10">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                        <span className="text-[10px] text-zinc-300 font-mono uppercase">{color}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
