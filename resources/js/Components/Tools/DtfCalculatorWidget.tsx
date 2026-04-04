import { useState, useEffect } from 'react';
import { Calculator, Copy, Check } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface DtfCalculatorWidgetProps {
    onSelectValue?: (value: number) => void;
    className?: string;
}

export function DtfCalculatorWidget({ onSelectValue, className = '' }: DtfCalculatorWidgetProps) {
    const [width, setWidth] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<number>(1);
    
    // Rollo standard configuration
    const [rollWidth, setRollWidth] = useState<number>(60); // 60cm
    const [pricePerMeter, setPricePerMeter] = useState<number>(15); // $15 per meter

    const [totalCost, setTotalCost] = useState<number>(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (width && height && rollWidth > 0 && pricePerMeter >= 0 && quantity > 0) {
            // Area in cm2 = 100cm * rollWidth
            const rollArea = 100 * rollWidth;
            const costPerCm2 = pricePerMeter / rollArea;
            const designArea = Number(width) * Number(height);
            const cost = designArea * costPerCm2 * quantity;
            setTotalCost(Number(cost.toFixed(2)));
        } else {
            setTotalCost(0);
        }
    }, [width, height, quantity, rollWidth, pricePerMeter]);

    const handleCopy = () => {
        navigator.clipboard.writeText(totalCost.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-5 ${className}`}>
            <div className="flex items-center gap-2 border-b border-border pb-3">
                <Calculator className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Calculadora DTF</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Ancho del Diseño (cm)</label>
                    <input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-primary focus:border-primary" 
                        value={width} 
                        onChange={e => setWidth(parseFloat(e.target.value) || '')} 
                        placeholder="Ej. 15"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Alto del Diseño (cm)</label>
                    <input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-primary focus:border-primary" 
                        value={height} 
                        onChange={e => setHeight(parseFloat(e.target.value) || '')} 
                        placeholder="Ej. 20"
                    />
                </div>
                <div className="space-y-1 col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">Cantidad de Copias</label>
                    <input 
                        type="number" 
                        step="1" 
                        min="1" 
                        className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-primary focus:border-primary" 
                        value={quantity} 
                        onChange={e => setQuantity(parseInt(e.target.value) || 1)} 
                    />
                </div>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-3">
                <p className="text-xs font-medium text-foreground mb-1">Configuración del Rollo DTF</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text[10px] text-muted-foreground">Ancho (cm)</label>
                        <input 
                            type="number" 
                            step="1" 
                            min="1" 
                            className="flex w-full rounded-md border border-border bg-background px-2 py-1 text-xs focus:ring-primary focus:border-primary" 
                            value={rollWidth} 
                            onChange={e => setRollWidth(parseFloat(e.target.value) || 0)} 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Precio por Metro ($)</label>
                        <input 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            className="flex w-full rounded-md border border-border bg-background px-2 py-1 text-xs focus:ring-primary focus:border-primary" 
                            value={pricePerMeter} 
                            onChange={e => setPricePerMeter(parseFloat(e.target.value) || 0)} 
                        />
                    </div>
                </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex flex-col items-center justify-center text-center mt-2">
                <span className="text-sm font-medium text-muted-foreground mb-1">Costo Total Estimado</span>
                <span className="text-3xl font-bold tracking-tight text-primary">${totalCost}</span>
            </div>

            <div className="flex gap-2 mt-2">
                <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={handleCopy}
                    disabled={totalCost <= 0}
                >
                    {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? '¡Copiado!' : 'Copiar Costo'}
                </Button>
                {onSelectValue && (
                    <Button 
                        className="flex-1"
                        onClick={() => onSelectValue(totalCost)}
                        disabled={totalCost <= 0}
                    >
                        <Check className="h-4 w-4 mr-2" />
                        Usar Valor
                    </Button>
                )}
            </div>
        </div>
    );
}
