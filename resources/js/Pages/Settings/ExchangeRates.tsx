import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { DataTable } from '@/Components/ui/DataTable';
import { FormModal } from '@/Components/ui/FormModal';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Plus, Pencil, Trash } from 'lucide-react';

interface ExchangeRate {
    id: number;
    currency: string;
    rate: number;
    updated_at?: string;
}

export default function ExchangeRatesIndex({ rates, histories = [] }: { rates: ExchangeRate[], histories?: any[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    
    const [selectedRate, setSelectedRate] = useState<ExchangeRate | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        currency: '',
        rate: 0,
    });

    const openCreateDialog = () => {
        reset();
        setIsAddModalOpen(true);
    };

    const openEditDialog = (rate: ExchangeRate) => {
        setSelectedRate(rate);
        setData({
            currency: rate.currency,
            rate: rate.rate,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (rate: ExchangeRate) => {
        setSelectedRate(rate);
        setIsDeleteDialogOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('exchange-rates.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRate) return;
        
        put(route('exchange-rates.update', selectedRate.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDelete = () => {
        if (!selectedRate) return;
        
        destroy(route('exchange-rates.destroy', selectedRate.id), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
            }
        });
    };

    const renderRateForm = (onSubmit: any, submitLabel: string) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="currency">Moneda / Divisa</Label>
                <Input 
                    id="currency" 
                    value={data.currency} 
                    onChange={e => setData('currency', e.target.value)} 
                    placeholder="Ej. BCV, Euro, USDT Binance"
                    required 
                />
                {errors.currency && <div className="text-sm text-destructive">{errors.currency}</div>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="rate">Tasa (Valor en Bs o Equivalente)</Label>
                <Input 
                    id="rate" 
                    type="number" 
                    step="0.0001"
                    min="0"
                    value={data.rate} 
                    onChange={e => setData('rate', Number(e.target.value))} 
                    required 
                />
                {errors.rate && <div className="text-sm text-destructive">{errors.rate}</div>}
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={processing}>{submitLabel}</Button>
            </div>
        </form>
    );

    const columns = [
        { accessorKey: 'currency', header: 'Moneda' },
        { 
            accessorKey: 'rate', 
            header: 'Tasa Registrada',
            cell: ({ row }: any) => {
                const rate = parseFloat(row.getValue("rate"));
                return new Intl.NumberFormat("es-VE", {
                    style: "currency",
                    currency: "VES",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4
                }).format(rate);
            }
        },
        {
            accessorKey: 'updated_at',
            header: 'Última Actualización',
            cell: ({ row }: any) => {
                const date = row.original.updated_at;
                if (!date) return '-';
                return new Intl.DateTimeFormat('es-VE', { 
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                }).format(new Date(date));
            }
        },
        {
            id: 'actions',
            cell: ({ row }: any) => {
                const item = row.original;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)} title="Editar Valor">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item)} className="text-destructive hover:bg-destructive/10 hover:text-destructive" title="Eliminar">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout>
            <Head title="Tasas de Cambio" />
            
            <PageHeader 
                title="Tasas de Cambio" 
                description="Administra el valor diario del Dolar BCV, Euro, USDT, etc."
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsHistoryModalOpen(true)}>
                            Ver Historial
                        </Button>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Registrar Tasa
                        </Button>
                    </div>
                }
            />

            <div className="mt-6">
                <DataTable 
                    columns={columns} 
                    data={rates} 
                />
            </div>

            <FormModal 
                title="Nueva Tasa de Cambio" 
                open={isAddModalOpen} 
                onOpenChange={setIsAddModalOpen}
            >
                {renderRateForm(handleCreate, "Guardar")}
            </FormModal>

            <FormModal 
                title="Actualizar Tasa" 
                open={isEditModalOpen} 
                onOpenChange={setIsEditModalOpen}
            >
                {renderRateForm(handleEdit, "Actualizar")}
            </FormModal>

            <ConfirmDialog 
                open={isDeleteDialogOpen} 
                onOpenChange={setIsDeleteDialogOpen}
                title="Eliminar Tasa"
                description={`¿Estás seguro de que deseas eliminar la tasa de ${selectedRate?.currency}?`}
                onConfirm={handleDelete}
            />

            <FormModal 
                title="Historial de Tasas" 
                open={isHistoryModalOpen} 
                onOpenChange={setIsHistoryModalOpen}
            >
                <div className="max-h-[60vh] overflow-y-auto">
                    <DataTable 
                        columns={[
                            { accessorKey: 'created_at', header: 'Fecha', cell: ({ row }: any) => new Date(row.original.created_at).toLocaleString() },
                            { id: 'currency', header: 'Moneda', cell: ({ row }: any) => row.original.exchange_rate?.currency || '-' },
                            { 
                                accessorKey: 'rate', 
                                header: 'Valor Asignado',
                                cell: ({ row }: any) => new Intl.NumberFormat("es-VE", {
                                    style: "currency",
                                    currency: "VES",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 4
                                }).format(parseFloat(row.getValue("rate")))
                            }
                        ]} 
                        data={histories} 
                    />
                </div>
            </FormModal>
        </AppLayout>
    );
}
