import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { DtfCalculatorWidget } from '@/Components/Tools/DtfCalculatorWidget';

export default function DtfCalculator() {
    return (
        <AppLayout>
            <Head title="Calculadora DTF" />
            
            <PageHeader 
                title="Calculadora de Costos DTF" 
                description="Calcula cuánto cuesta exactamente imprimir un diseño basado en sus dimensiones y el costo del rollo por metro."
            />

            <div className="max-w-xl">
                <DtfCalculatorWidget />
            </div>
        </AppLayout>
    );
}
