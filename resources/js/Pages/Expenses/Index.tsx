import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { DataTable } from '@/Components/ui/DataTable';
import { FormModal } from '@/Components/ui/FormModal';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import { SearchInput } from '@/Components/ui/SearchInput';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger 
} from '@/Components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Trash } from 'lucide-react';

interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string;
    order_details: string | null;
    notes: string | null;
    category?: { id: number; name: string };
    supplier?: { id: number; name: string };
    currency: string;
    exchange_rate_value: number | null;
}

export default function ExpensesIndex({ expenses, categories, suppliers, rates, filters }: any) {
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category_id: '',
        supplier_id: '',
        order_details: '',
        notes: '',
        currency: 'Bs',
        exchange_rate_value: 0,
    });

    const filteredData = expenses.filter(e => 
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.date && e.date.includes(searchTerm))
    );

    const totalsByCurrency = filteredData.reduce((acc: Record<string, number>, expense: Expense) => {
        const curr = expense.currency || 'Bs';
        acc[curr] = (acc[curr] || 0) + Number(expense.amount);
        return acc;
    }, {});

    const grandTotalBs = filteredData.reduce((total: number, expense: Expense) => {
        const amount = Number(expense.amount);
        const rate = expense.exchange_rate_value || 0;
        if (expense.currency && expense.currency !== 'Bs') {
            return total + (amount * rate);
        }
        return total + amount;
    }, 0);

    const usdRate = rates?.find((r: any) => r.currency === 'USD')?.rate;
    const grandTotalUSD = usdRate && usdRate > 0 ? grandTotalBs / usdRate : null;

    const openCreateDialog = () => {
        reset();
        setIsAddModalOpen(true);
    };

    const openEditDialog = (expense: Expense) => {
        setSelectedExpense(expense);
        setData({
            description: expense.description || '',
            amount: expense.amount || 0,
            date: expense.date ? expense.date.substring(0, 10) : new Date().toISOString().split('T')[0],
            category_id: expense.category?.id?.toString() || '',
            supplier_id: expense.supplier?.id?.toString() || '',
            order_details: expense.order_details || '',
            notes: expense.notes || '',
            currency: expense.currency || 'Bs',
            exchange_rate_value: expense.exchange_rate_value || 0,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (expense: Expense) => {
        setSelectedExpense(expense);
        setIsDeleteDialogOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('expenses.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExpense) return;
        
        put(route('expenses.update', selectedExpense.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDelete = () => {
        if (!selectedExpense) return;
        
        destroy(route('expenses.destroy', selectedExpense.id), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
            }
        });
    };

    const renderExpenseForm = (onSubmit: any, submitLabel: string) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="description">Descripción / Motivo</Label>
                <Input 
                    id="description" 
                    value={data.description} 
                    onChange={e => setData('description', e.target.value)} 
                    required 
                />
                {errors.description && <div className="text-sm text-destructive">{errors.description}</div>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Monto</Label>
                    <Input 
                        id="amount" 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={data.amount} 
                        onChange={e => setData('amount', Number(e.target.value))} 
                        required 
                    />
                    {errors.amount && <div className="text-sm text-destructive">{errors.amount}</div>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input 
                        id="date" 
                        type="date" 
                        value={data.date} 
                        onChange={e => setData('date', e.target.value)} 
                        required 
                    />
                    {errors.date && <div className="text-sm text-destructive">{errors.date}</div>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category_id">Categoría</Label>
                    <select
                        id="category_id"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={data.category_id}
                        onChange={e => setData('category_id', e.target.value)}
                    >
                        <option value="">-- Sin categoría --</option>
                        {categories?.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="supplier_id">Proveedor</Label>
                    <select
                        id="supplier_id"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={data.supplier_id}
                        onChange={e => setData('supplier_id', e.target.value)}
                    >
                        <option value="">-- Sin proveedor --</option>
                        {suppliers?.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <select
                        id="currency"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={data.currency}
                        onChange={e => {
                            const curr = e.target.value;
                            setData('currency', curr);
                            if (curr !== 'Bs') {
                                const matchedRate = rates?.find((r: any) => r.currency === curr);
                                if (matchedRate) setData('exchange_rate_value', matchedRate.rate);
                                else setData('exchange_rate_value', 0);
                            } else {
                                setData('exchange_rate_value', 0);
                            }
                        }}
                    >
                        <option value="Bs">Bs (Bolívares)</option>
                        {rates?.map((r: any) => (
                            <option key={r.id} value={r.currency}>{r.currency}</option>
                        ))}
                    </select>
                </div>
                
                {data.currency !== 'Bs' ? (
                    <div className="space-y-2">
                        <Label htmlFor="exchange_rate_value">Tasa Aplicada (Bs)</Label>
                        <Input 
                            id="exchange_rate_value" 
                            type="number" 
                            step="0.0001"
                            min="0"
                            value={data.exchange_rate_value!} 
                            onChange={e => setData('exchange_rate_value', Number(e.target.value))} 
                        />
                    </div>
                ) : (
                    <div className="space-y-2"></div>
                )}
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="order_details">Detalles del pedido</Label>
                    <Input 
                        id="order_details" 
                        value={data.order_details} 
                        onChange={e => setData('order_details', e.target.value)} 
                        placeholder="Ej. Se pidieron 4 diseños impresos..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="notes">Observaciones</Label>
                    <Input 
                        id="notes" 
                        value={data.notes} 
                        onChange={e => setData('notes', e.target.value)} 
                        placeholder="Ej. Pago realizado en Bs"
                    />
                </div>
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
        { 
            accessorKey: 'date', 
            header: 'Fecha', 
            cell: ({ row }: any) => {
                const rawDate = row.original.date;
                if (!rawDate) return '-';
                // Adjust for timezone differences to prevent shifting a day backwards
                const d = new Date(rawDate);
                const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
                return new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }).format(localDate);
            } 
        },
        { accessorKey: 'description', header: 'Descripción' },
        { 
            id: 'proveedor', 
            header: 'Proveedor', 
            cell: ({ row }: any) => row.original.supplier?.name || '-'
        },
        { accessorKey: 'order_details', header: 'Detalles' },
        { 
            accessorKey: 'amount', 
            header: 'Monto',
            cell: ({ row }: any) => {
                const amount = parseFloat(row.getValue("amount"));
                const curr = row.original.currency;
                const rate = row.original.exchange_rate_value;

                if (!curr || curr === 'Bs') {
                    return new Intl.NumberFormat("es-VE", {
                        style: "currency",
                        currency: "VES",
                    }).format(amount);
                }

                return (
                    <div>
                        <div className="font-medium">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount).replace('$', curr === 'Euro' ? '€' : '$')}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                            Tasa: {rate} Bs
                        </div>
                    </div>
                );
            }
        },
        {
            id: 'actions',
            cell: ({ row }: any) => {
                const expense = row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={() => openEditDialog(expense)}
                            title="Editar"
                        >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors"
                            onClick={() => openDeleteDialog(expense)}
                            title="Eliminar"
                        >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout>
            <Head title="Gastos" />
            
            <PageHeader 
                title="Gastos" 
                description="Registra y controla los egresos del negocio."
                action={
                    <Button onClick={openCreateDialog} variant="destructive">
                        <Plus className="mr-2 h-4 w-4" />
                        Registrar Gasto
                    </Button>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total General (Bs)</p>
                    <p className="text-2xl font-bold text-foreground">
                        {new Intl.NumberFormat("es-VE", { style: "currency", currency: "VES" }).format(grandTotalBs)}
                    </p>
                </div>
                {grandTotalUSD !== null && (
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-center">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total General (Ref USD)</p>
                        <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(grandTotalUSD)}
                        </p>
                    </div>
                )}
                {Object.entries(totalsByCurrency).map(([currency, amount]) => (
                    <div key={currency} className="bg-primary/5 border border-primary/20 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Subtotal {currency}</p>
                        <p className="text-xl font-bold text-primary">
                            {currency === 'Bs' 
                                ? new Intl.NumberFormat("es-VE", { style: "currency", currency: "VES" }).format(amount as number)
                                : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount as number).replace('$', currency === 'EUR' || currency === 'Euro' ? '€' : '$')
                            }
                        </p>
                    </div>
                ))}
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:max-w-xs">
                    <SearchInput 
                        value={searchTerm} 
                        onChange={setSearchTerm} 
                        placeholder="Buscar gasto..." 
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="flex-1 sm:w-36">
                        <Label className="text-xs text-muted-foreground mb-1 block">Desde</Label>
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="flex-1 sm:w-36">
                        <Label className="text-xs text-muted-foreground mb-1 block">Hasta</Label>
                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <div className="flex gap-1 items-end pb-0.5">
                        <Button 
                            variant="secondary" 
                            onClick={() => router.get(route('expenses.index'), { start_date: startDate, end_date: endDate }, { preserveState: true })}
                        >
                            Filtrar
                        </Button>
                        {(filters?.start_date || filters?.end_date) && (
                            <Button 
                                variant="ghost" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    router.get(route('expenses.index'));
                                }}
                            >
                                Limpiar
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={filteredData} 
            />

            <FormModal 
                title="Registrar Gasto" 
                open={isAddModalOpen} 
                onOpenChange={setIsAddModalOpen}
            >
                {renderExpenseForm(handleCreate, "Registrar")}
            </FormModal>

            <FormModal 
                title="Editar Gasto" 
                open={isEditModalOpen} 
                onOpenChange={setIsEditModalOpen}
            >
                {renderExpenseForm(handleEdit, "Guardar Cambios")}
            </FormModal>

            <ConfirmDialog 
                open={isDeleteDialogOpen} 
                onOpenChange={setIsDeleteDialogOpen}
                title="Eliminar Gasto"
                description={`¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.`}
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
