// <ai_context>
// Propósito: Panel de administración para configurar el Design Builder del E-commerce.
// Estructura: Por prenda > Por género > Colores + Tallas independientes
// </ai_context>

import React, { useState } from 'react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    Settings, Palette, Ruler, Shirt, Plus, Trash2, Save,
    Check, AlertCircle, ToggleLeft, ToggleRight, ChevronDown, ChevronRight, User, Users
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfigColor {
    label: string;
    value: string;
    enabled: boolean;
}

interface GenderVariant {
    enabled: boolean;
    assets: { front: string; back: string };
    colors: ConfigColor[];
    sizes: string[];
}

interface ConfigProduct {
    id: string;
    name: string;
    basePrice: number;
    enabled: boolean;
    variants: Record<string, GenderVariant>; // key = gender name
}

interface BuilderConfig {
    products: ConfigProduct[];
    fonts: { label: string; value: string }[];
    genders: string[];
}

interface Props {
    config: BuilderConfig;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GENDER_ICONS: Record<string, React.ReactNode> = {
    Caballero: <User className="w-4 h-4" />,
    Dama: <Users className="w-4 h-4" />,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BuilderSettings({ config }: Props) {
    const { props } = usePage<any>();
    const flash = props.flash ?? {};

    const [products, setProducts] = useState<ConfigProduct[]>(config.products ?? []);
    const [saving, setSaving] = useState(false);
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set([config.products?.[0]?.id].filter(Boolean)));
    const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());

    // ── Persist ────────────────────────────────────────────────────────────
    const handleSave = () => {
        setSaving(true);
        router.post('/settings/builder', {
            products: JSON.parse(JSON.stringify(products)),
            fonts: JSON.parse(JSON.stringify(config.fonts ?? [])),
            genders: config.genders ?? ['Caballero', 'Dama'],
        }, {
            onFinish: () => setSaving(false),
            preserveScroll: true,
        });
    };

    // ── Product helpers ────────────────────────────────────────────────────
    const toggleProduct = (idx: number) =>
        setProducts(p => p.map((x, i) => i === idx ? { ...x, enabled: !x.enabled } : x));

    const updateProductPrice = (idx: number, price: number) =>
        setProducts(p => p.map((x, i) => i === idx ? { ...x, basePrice: price } : x));

    // ── Variant helpers ────────────────────────────────────────────────────
    const updateVariant = (pIdx: number, gender: string, updater: (v: GenderVariant) => GenderVariant) =>
        setProducts(p => p.map((prod, i) => {
            if (i !== pIdx) return prod;
            return { ...prod, variants: { ...prod.variants, [gender]: updater(prod.variants[gender]) } };
        }));

    const toggleVariant = (pIdx: number, gender: string) =>
        updateVariant(pIdx, gender, v => ({ ...v, enabled: !v.enabled }));

    // ── Color helpers ──────────────────────────────────────────────────────
    const toggleColor = (pIdx: number, gender: string, cIdx: number) =>
        updateVariant(pIdx, gender, v => ({
            ...v,
            colors: v.colors.map((c, i) => i === cIdx ? { ...c, enabled: !c.enabled } : c)
        }));

    const updateColor = (pIdx: number, gender: string, cIdx: number, field: 'label' | 'value', val: string) =>
        updateVariant(pIdx, gender, v => ({
            ...v,
            colors: v.colors.map((c, i) => i === cIdx ? { ...c, [field]: val } : c)
        }));

    const removeColor = (pIdx: number, gender: string, cIdx: number) =>
        updateVariant(pIdx, gender, v => ({
            ...v,
            colors: v.colors.filter((_, i) => i !== cIdx)
        }));

    const addColor = (pIdx: number, gender: string, label: string, value: string) => {
        if (!label.trim()) return;
        updateVariant(pIdx, gender, v => ({
            ...v,
            colors: [...v.colors, { label: label.trim(), value, enabled: true }]
        }));
    };

    // ── Size helpers ───────────────────────────────────────────────────────
    const removeSize = (pIdx: number, gender: string, size: string) =>
        updateVariant(pIdx, gender, v => ({ ...v, sizes: v.sizes.filter(s => s !== size) }));

    const addSize = (pIdx: number, gender: string, size: string) => {
        const s = size.trim().toUpperCase();
        if (!s) return;
        updateVariant(pIdx, gender, v => {
            if (v.sizes.includes(s)) return v;
            return { ...v, sizes: [...v.sizes, s] };
        });
    };

    // ── Expand helpers ─────────────────────────────────────────────────────
    const toggleExpandProduct = (id: string) =>
        setExpandedProducts(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const toggleExpandVariant = (key: string) =>
        setExpandedVariants(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });

    // ─────────────────────────────────────────────────────────────────────
    return (
        <AppLayout>
            <Head title="Configuración del Builder" />

            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Configuración del Builder</h1>
                            <p className="text-slate-400 text-sm">Colores y tallas por prenda y género. Los cambios se reflejan en el E-commerce al instante.</p>
                        </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 gap-2">
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

                {/* ── PRODUCTS ──────────────────────────────────────────────── */}
                {products.map((product, pIdx) => {
                    const isExpanded = expandedProducts.has(product.id);
                    return (
                        <Card key={product.id} className={`bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden transition-all ${!product.enabled ? 'opacity-50' : ''}`}>

                            {/* Product Header */}
                            <div className="flex items-center gap-3 p-5 cursor-pointer select-none border-b border-white/[0.06]"
                                onClick={() => toggleExpandProduct(product.id)}>
                                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <Shirt className="w-5 h-5 text-slate-300" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold">{product.name}</p>
                                    <p className="text-slate-500 text-xs font-mono">{product.id}</p>
                                </div>
                                {/* Base price */}
                                <div className="flex items-center gap-2 mr-4" onClick={e => e.stopPropagation()}>
                                    <span className="text-slate-500 text-xs">Base:</span>
                                    <input type="number" min="0" step="0.5" value={product.basePrice}
                                        onChange={e => updateProductPrice(pIdx, parseFloat(e.target.value) || 0)}
                                        className="w-20 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-emerald-500"
                                    />
                                    <span className="text-slate-500 text-xs">USD</span>
                                </div>
                                {/* Enable toggle */}
                                <button onClick={e => { e.stopPropagation(); toggleProduct(pIdx); }}
                                    className="text-slate-400 hover:text-white transition-colors" title={product.enabled ? 'Desactivar' : 'Activar'}>
                                    {product.enabled
                                        ? <ToggleRight className="w-6 h-6 text-emerald-400" />
                                        : <ToggleLeft className="w-6 h-6" />}
                                </button>
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                            </div>

                            {/* Variants (genders) */}
                            {isExpanded && (
                                <div className="p-4 space-y-3">
                                    {Object.entries(product.variants).map(([gender, variant]) => {
                                        const variantKey = `${product.id}-${gender}`;
                                        const isVariantExpanded = expandedVariants.has(variantKey);
                                        return (
                                            <VariantPanel
                                                key={gender}
                                                gender={gender}
                                                variant={variant}
                                                variantKey={variantKey}
                                                isExpanded={isVariantExpanded}
                                                onToggleExpand={() => toggleExpandVariant(variantKey)}
                                                onToggleVariant={() => toggleVariant(pIdx, gender)}
                                                onToggleColor={(cIdx) => toggleColor(pIdx, gender, cIdx)}
                                                onUpdateColor={(cIdx, field, val) => updateColor(pIdx, gender, cIdx, field, val)}
                                                onRemoveColor={(cIdx) => removeColor(pIdx, gender, cIdx)}
                                                onAddColor={(label, value) => addColor(pIdx, gender, label, value)}
                                                onRemoveSize={(size) => removeSize(pIdx, gender, size)}
                                                onAddSize={(size) => addSize(pIdx, gender, size)}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    );
                })}

                {/* Footer Save */}
                <div className="flex justify-end pt-2 pb-8">
                    <Button onClick={handleSave} disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 gap-2 text-base">
                        <Save className="w-4 h-4" />
                        {saving ? 'Guardando...' : 'Guardar Toda la Configuración'}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}

// ─── Variant Panel ─────────────────────────────────────────────────────────────

interface VariantPanelProps {
    gender: string;
    variant: GenderVariant;
    variantKey: string;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onToggleVariant: () => void;
    onToggleColor: (cIdx: number) => void;
    onUpdateColor: (cIdx: number, field: 'label' | 'value', val: string) => void;
    onRemoveColor: (cIdx: number) => void;
    onAddColor: (label: string, value: string) => void;
    onRemoveSize: (size: string) => void;
    onAddSize: (size: string) => void;
}

function VariantPanel({
    gender, variant, variantKey, isExpanded,
    onToggleExpand, onToggleVariant,
    onToggleColor, onUpdateColor, onRemoveColor, onAddColor,
    onRemoveSize, onAddSize
}: VariantPanelProps) {
    const [newColorLabel, setNewColorLabel] = useState('');
    const [newColorValue, setNewColorValue] = useState('#000000');
    const [newSize, setNewSize] = useState('');

    const activeColors = variant.colors.filter(c => c.enabled).length;

    return (
        <div className={`rounded-xl border transition-all ${variant.enabled ? 'border-white/10 bg-white/[0.03]' : 'border-white/5 bg-black/20 opacity-50'}`}>

            {/* Variant header */}
            <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={onToggleExpand}>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-400">
                    {GENDER_ICONS[gender] ?? <User className="w-4 h-4" />}
                </div>
                <span className="text-white font-semibold text-sm flex-1">{gender}</span>

                <Badge className={`text-xs ${variant.enabled ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                    {activeColors} colores · {variant.sizes.length} tallas
                </Badge>

                {/* Enable toggle */}
                <button onClick={e => { e.stopPropagation(); onToggleVariant(); }}
                    className="text-slate-400 hover:text-white transition-colors" title={variant.enabled ? 'Desactivar género' : 'Activar género'}>
                    {variant.enabled
                        ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                        : <ToggleLeft className="w-5 h-5" />}
                </button>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-600" /> : <ChevronRight className="w-4 h-4 text-slate-600" />}
            </div>

            {/* Expanded content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-5 border-t border-white/[0.06] pt-4">

                    {/* COLORS */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Palette className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400 font-semibold text-sm">Colores de Tela</span>
                        </div>
                        <div className="space-y-2">
                            {variant.colors.map((color, cIdx) => (
                                <div key={cIdx}
                                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${color.enabled ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 opacity-50'}`}>
                                    {/* Swatch */}
                                    <div className="w-7 h-7 rounded-md border border-white/20 flex-shrink-0" style={{ backgroundColor: color.value }} />
                                    {/* Label */}
                                    <input value={color.label}
                                        onChange={e => onUpdateColor(cIdx, 'label', e.target.value)}
                                        className="flex-1 bg-transparent text-white text-sm focus:outline-none border-b border-transparent hover:border-white/20 focus:border-emerald-500 transition-colors"
                                    />
                                    {/* Hex picker */}
                                    <input type="color" value={color.value}
                                        onChange={e => onUpdateColor(cIdx, 'value', e.target.value)}
                                        className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                                    />
                                    <span className="text-slate-500 text-xs font-mono w-14">{color.value}</span>
                                    {/* Toggle */}
                                    <button onClick={() => onToggleColor(cIdx)} className="text-slate-400 hover:text-white transition-colors">
                                        {color.enabled
                                            ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                                            : <ToggleLeft className="w-5 h-5" />}
                                    </button>
                                    {/* Remove */}
                                    <button onClick={() => onRemoveColor(cIdx)} className="text-red-400/60 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* Add color */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.08]">
                            <input type="color" value={newColorValue} onChange={e => setNewColorValue(e.target.value)}
                                className="w-8 h-8 rounded-md cursor-pointer border border-white/20 bg-transparent flex-shrink-0"
                            />
                            <input value={newColorLabel} onChange={e => setNewColorLabel(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { onAddColor(newColorLabel, newColorValue); setNewColorLabel(''); setNewColorValue('#000000'); } }}
                                placeholder="Nombre del color…"
                                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                            />
                            <button onClick={() => { onAddColor(newColorLabel, newColorValue); setNewColorLabel(''); setNewColorValue('#000000'); }}
                                className="flex items-center gap-1 text-purple-400 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
                                <Plus className="w-3.5 h-3.5" /> Agregar
                            </button>
                        </div>
                    </div>

                    {/* SIZES */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Ruler className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 font-semibold text-sm">Tallas</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {variant.sizes.map(size => (
                                <div key={size}
                                    className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1 group">
                                    <span className="text-blue-300 font-bold text-sm font-mono">{size}</span>
                                    <button onClick={() => onRemoveSize(size)}
                                        className="text-blue-400/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* Add size */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.08]">
                            <input value={newSize} onChange={e => setNewSize(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { onAddSize(newSize); setNewSize(''); } }}
                                placeholder="Nueva talla (ej: 4XL)"
                                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                            />
                            <button onClick={() => { onAddSize(newSize); setNewSize(''); }}
                                className="flex items-center gap-1 text-blue-400 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
                                <Plus className="w-3.5 h-3.5" /> Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
