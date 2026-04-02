// <ai_context>
// Propósito: Panel de administración para configurar el Design Builder del E-commerce.
// Permite gestionar colores, tallas y tipos de prenda desde el CRM.
// </ai_context>

import React, { useState } from 'react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    Settings, Palette, Ruler, Shirt, Plus, Trash2, GripVertical,
    Save, Check, AlertCircle, Eye, EyeOff, ToggleLeft, ToggleRight
} from 'lucide-react';

interface ConfigColor {
    label: string;
    value: string;
    enabled: boolean;
}

interface ConfigProduct {
    id: string;
    name: string;
    basePrice: number;
    enabled: boolean;
    assets: Record<string, { front: string; back: string }>;
}

interface BuilderConfig {
    colors: ConfigColor[];
    sizes: string[];
    products: ConfigProduct[];
    fonts: { label: string; value: string }[];
    genders: string[];
}

interface Props {
    config: BuilderConfig;
}

export default function BuilderSettings({ config }: Props) {
    const { props } = usePage<any>();
    const flash = props.flash ?? {};

    const [colors, setColors] = useState<ConfigColor[]>(config.colors ?? []);
    const [sizes, setSizes] = useState<string[]>(config.sizes ?? []);
    const [products, setProducts] = useState<ConfigProduct[]>(config.products ?? []);
    const [saving, setSaving] = useState(false);
    const [newColorLabel, setNewColorLabel] = useState('');
    const [newColorValue, setNewColorValue] = useState('#000000');
    const [newSize, setNewSize] = useState('');

    const handleSave = () => {
        setSaving(true);
        router.post('/settings/builder', {
            colors: JSON.parse(JSON.stringify(colors)),
            sizes: sizes,
            products: JSON.parse(JSON.stringify(products)),
            fonts: JSON.parse(JSON.stringify(config.fonts)),
            genders: config.genders,
        }, {
            onFinish: () => setSaving(false),
            preserveScroll: true,
        });
    };

    const addColor = () => {
        if (!newColorLabel.trim() || !newColorValue) return;
        setColors(prev => [...prev, { label: newColorLabel.trim(), value: newColorValue, enabled: true }]);
        setNewColorLabel('');
        setNewColorValue('#000000');
    };

    const removeColor = (index: number) => {
        setColors(prev => prev.filter((_, i) => i !== index));
    };

    const toggleColor = (index: number) => {
        setColors(prev => prev.map((c, i) => i === index ? { ...c, enabled: !c.enabled } : c));
    };

    const addSize = () => {
        const s = newSize.trim().toUpperCase();
        if (!s || sizes.includes(s)) return;
        setSizes(prev => [...prev, s]);
        setNewSize('');
    };

    const removeSize = (s: string) => {
        setSizes(prev => prev.filter(x => x !== s));
    };

    const toggleProduct = (index: number) => {
        setProducts(prev => prev.map((p, i) => i === index ? { ...p, enabled: !p.enabled } : p));
    };

    const updateProductPrice = (index: number, price: number) => {
        setProducts(prev => prev.map((p, i) => i === index ? { ...p, basePrice: price } : p));
    };

    return (
        <AppLayout>
            <Head title="Configuración del Builder - Admin" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* HEADER */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Settings className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Configuración del Builder</h1>
                                <p className="text-slate-400 text-sm">Controla lo que los clientes ven en el personalizador de prendas del E-commerce.</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>

                    {/* SUCCESS FLASH */}
                    {flash.success && (
                        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <p className="text-emerald-300 text-sm font-medium">{flash.success}</p>
                        </div>
                    )}

                    {/* ======================== COLORS ======================== */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-purple-500/10 border-b border-purple-500/20 pb-4">
                            <CardTitle className="text-purple-400 text-lg flex items-center gap-2">
                                <Palette className="w-5 h-5" />
                                Colores de Tela Disponibles
                                <Badge className="ml-auto bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    {colors.filter(c => c.enabled).length} activos de {colors.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {/* Color list */}
                            <div className="space-y-2">
                                {colors.map((color, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                            color.enabled
                                                ? 'bg-white/5 border-white/10'
                                                : 'bg-black/20 border-white/5 opacity-50'
                                        }`}
                                    >
                                        {/* Color swatch */}
                                        <div
                                            className="w-8 h-8 rounded-lg border border-white/20 flex-shrink-0 shadow-inner"
                                            style={{ backgroundColor: color.value }}
                                        />

                                        {/* Label editable */}
                                        <input
                                            value={color.label}
                                            onChange={e => setColors(prev => prev.map((c, i) => i === index ? { ...c, label: e.target.value } : c))}
                                            className="flex-1 bg-transparent text-white font-medium text-sm focus:outline-none border-b border-transparent hover:border-white/20 focus:border-emerald-500 transition-colors"
                                        />

                                        {/* Hex editable */}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={color.value}
                                                onChange={e => setColors(prev => prev.map((c, i) => i === index ? { ...c, value: e.target.value } : c))}
                                                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                                                title="Cambiar color"
                                            />
                                            <span className="text-slate-500 text-xs font-mono w-16">{color.value}</span>
                                        </div>

                                        {/* Toggle enable */}
                                        <button
                                            onClick={() => toggleColor(index)}
                                            className="text-slate-400 hover:text-white transition-colors"
                                            title={color.enabled ? 'Desactivar' : 'Activar'}
                                        >
                                            {color.enabled
                                                ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                                                : <ToggleLeft className="w-5 h-5" />
                                            }
                                        </button>

                                        {/* Remove */}
                                        <button
                                            onClick={() => removeColor(index)}
                                            className="text-red-400/70 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add new color */}
                            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                <input
                                    type="color"
                                    value={newColorValue}
                                    onChange={e => setNewColorValue(e.target.value)}
                                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/20 bg-transparent"
                                />
                                <input
                                    value={newColorLabel}
                                    onChange={e => setNewColorLabel(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addColor()}
                                    placeholder="Nombre del color (ej: Verde Militar)"
                                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                                />
                                <span className="text-slate-500 text-xs font-mono">{newColorValue}</span>
                                <Button
                                    onClick={addColor}
                                    size="sm"
                                    className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 gap-1"
                                    variant="outline"
                                >
                                    <Plus className="w-4 h-4" /> Agregar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ======================== SIZES ======================== */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-blue-500/10 border-b border-blue-500/20 pb-4">
                            <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
                                <Ruler className="w-5 h-5" />
                                Tallas Disponibles
                                <Badge className="ml-auto bg-blue-500/20 text-blue-300 border-blue-500/30">
                                    {sizes.length} tallas
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <p className="text-slate-400 text-sm">Estas tallas aparecen en el selector del builder y en las páginas de producto.</p>
                            {/* Sizes tags */}
                            <div className="flex flex-wrap gap-2">
                                {sizes.map(size => (
                                    <div
                                        key={size}
                                        className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5 group"
                                    >
                                        <span className="text-blue-300 font-bold text-sm font-mono">{size}</span>
                                        <button
                                            onClick={() => removeSize(size)}
                                            className="text-blue-400/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add new size */}
                            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                                <input
                                    value={newSize}
                                    onChange={e => setNewSize(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addSize()}
                                    placeholder="Nueva talla (ej: 3XL)"
                                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                                />
                                <Button
                                    onClick={addSize}
                                    size="sm"
                                    className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 gap-1"
                                    variant="outline"
                                >
                                    <Plus className="w-4 h-4" /> Agregar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ======================== PRODUCTS ======================== */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 pb-4">
                            <CardTitle className="text-emerald-400 text-lg flex items-center gap-2">
                                <Shirt className="w-5 h-5" />
                                Tipos de Prenda
                                <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                    {products.filter(p => p.enabled).length} activos de {products.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-3">
                            {products.map((product, index) => (
                                <div
                                    key={product.id}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                        product.enabled
                                            ? 'bg-white/5 border-white/10'
                                            : 'bg-black/20 border-white/5 opacity-50'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Shirt className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-sm">{product.name}</p>
                                        <p className="text-slate-500 text-xs font-mono">{product.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-xs">Precio base:</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={product.basePrice}
                                            onChange={e => updateProductPrice(index, parseFloat(e.target.value) || 0)}
                                            className="w-20 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-emerald-500 transition-colors"
                                        />
                                        <span className="text-slate-500 text-xs">USD</span>
                                    </div>
                                    <button
                                        onClick={() => toggleProduct(index)}
                                        className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                                        title={product.enabled ? 'Desactivar prenda' : 'Activar prenda'}
                                    >
                                        {product.enabled
                                            ? <ToggleRight className="w-6 h-6 text-emerald-400" />
                                            : <ToggleLeft className="w-6 h-6" />
                                        }
                                    </button>
                                </div>
                            ))}

                            <div className="pt-2 flex items-start gap-2 bg-amber-500/5 rounded-xl p-3 border border-amber-500/20">
                                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-amber-300/80 text-xs leading-relaxed">
                                    Para añadir nuevos tipos de prenda (ej: polo, tank top) contacta al equipo técnico, ya que requieren assets de imagen con fondo recortado.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SAVE BUTTON (bottom) */}
                    <div className="flex justify-end pt-2 pb-8">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 gap-2 text-base"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Guardando cambios...' : 'Guardar Toda la Configuración'}
                        </Button>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
