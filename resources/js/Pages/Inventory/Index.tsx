import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { DataTable } from '@/Components/ui/DataTable';
import { FormModal } from '@/Components/ui/FormModal';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import { SearchInput } from '@/Components/ui/SearchInput';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Plus, Pencil, Trash, AlertTriangle } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    sku: string | null;
    style: string | null;
    fabric_type: string | null;
    size_s: number;
    size_m: number;
    size_l: number;
    quantity: number;
    min_stock: number;
    price: number;
    cost: number;
    supplier?: { id: number; name: string };
}

export default function InventoryIndex({ products }: { products: Product[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        sku: '',
        style: '',
        fabric_type: '',
        size_s: 0,
        size_m: 0,
        size_l: 0,
        quantity: 0,
        min_stock: 0,
        price: 0,
        cost: 0,
    });

    const filteredData = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const openCreateDialog = () => {
        reset();
        setIsAddModalOpen(true);
    };

    const openEditDialog = (product: Product) => {
        setSelectedProduct(product);
        setData({
            name: product.name,
            sku: product.sku || '',
            style: product.style || '',
            fabric_type: product.fabric_type || '',
            size_s: product.size_s || 0,
            size_m: product.size_m || 0,
            size_l: product.size_l || 0,
            quantity: product.quantity,
            min_stock: product.min_stock,
            price: product.price,
            cost: product.cost,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteDialogOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('products.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        
        put(route('products.update', selectedProduct.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDelete = () => {
        if (!selectedProduct) return;
        
        destroy(route('products.destroy', selectedProduct.id), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
            }
        });
    };

    const renderProductForm = (onSubmit: any, submitLabel: string) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">Nombre de Producto</Label>
                    <Input 
                        id="name" 
                        value={data.name} 
                        onChange={e => setData('name', e.target.value)} 
                        required 
                    />
                    {errors.name && <div className="text-sm text-destructive">{errors.name}</div>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sku">SKU / Código</Label>
                    <Input 
                        id="sku" 
                        value={data.sku} 
                        onChange={e => setData('sku', e.target.value)} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="style">Estilo</Label>
                    <select
                        id="style"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={data.style}
                        onChange={e => setData('style', e.target.value)}
                    >
                        <option value="">-- Seleccione estilo --</option>
                        <option value="Oversize">Oversize</option>
                        <option value="Normal / Clásico">Normal / Clásico</option>
                        <option value="Slim Fit">Slim Fit</option>
                        <option value="Cropped">Cropped</option>
                        <option value="Franela Sin Mangas">Franela Sin Mangas</option>
                        <option value="Deportivo">Deportivo</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fabric_type">Tipo de tela</Label>
                    <select
                        id="fabric_type"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={data.fabric_type}
                        onChange={e => setData('fabric_type', e.target.value)}
                    >
                        <option value="">-- Seleccione tela --</option>
                        <option value="Algodón">Algodón</option>
                        <option value="Microdurazno">Microdurazno</option>
                        <option value="Polialgodón">Polialgodón</option>
                        <option value="Poliéster">Poliéster</option>
                        <option value="Muselina">Muselina</option>
                        <option value="Lino">Lino</option>
                        <option value="Acetal">Acetal / Mono</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
                
                {/* Tallas */}
                <div className="col-span-2 grid grid-cols-3 gap-4 border-y border-border py-4 my-2">
                    <div className="space-y-2">
                        <Label htmlFor="size_s">S</Label>
                        <Input id="size_s" type="number" min="0" value={data.size_s} onChange={e => {
                            const val = Number(e.target.value);
                            setData(prev => ({ ...prev, size_s: val, quantity: val + prev.size_m + prev.size_l }));
                        }} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="size_m">M</Label>
                        <Input id="size_m" type="number" min="0" value={data.size_m} onChange={e => {
                            const val = Number(e.target.value);
                            setData(prev => ({ ...prev, size_m: val, quantity: prev.size_s + val + prev.size_l }));
                        }} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="size_l">L</Label>
                        <Input id="size_l" type="number" min="0" value={data.size_l} onChange={e => {
                            const val = Number(e.target.value);
                            setData(prev => ({ ...prev, size_l: val, quantity: prev.size_s + prev.size_m + val }));
                        }} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="quantity">Stock Total</Label>
                    <Input 
                        id="quantity" 
                        type="number" 
                        min="0"
                        value={data.quantity} 
                        onChange={e => setData('quantity', Number(e.target.value))} 
                        required 
                    />
                    <p className="text-xs text-muted-foreground">Suma automática de S+M+L</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="min_stock">Stock Mínimo Ideal</Label>
                    <Input 
                        id="min_stock" 
                        type="number" 
                        min="0"
                        value={data.min_stock} 
                        onChange={e => setData('min_stock', Number(e.target.value))} 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Precio de Venta</Label>
                    <Input 
                        id="price" 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={data.price} 
                        onChange={e => setData('price', Number(e.target.value))} 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cost">Costo de Compra</Label>
                    <Input 
                        id="cost" 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={data.cost} 
                        onChange={e => setData('cost', Number(e.target.value))} 
                        required 
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
        { accessorKey: 'name', header: 'Producto' },
        { accessorKey: 'style', header: 'Estilo' },
        { accessorKey: 'fabric_type', header: 'Tela' },
        { 
            id: 'tallas',
            header: 'S - M - L',
            cell: ({ row }: any) => {
                const p = row.original;
                if (!p.size_s && !p.size_m && !p.size_l) return <span className="text-muted-foreground">-</span>;
                return <span className="text-xs font-mono">{p.size_s} / {p.size_m} / {p.size_l}</span>;
            }
        },
        { 
            accessorKey: 'quantity', 
            header: 'Stock',
            cell: ({ row }: any) => {
                const product = row.original;
                const isLow = product.quantity <= product.min_stock;
                
                return (
                    <div className="flex items-center gap-2">
                        <span>{product.quantity}</span>
                        {isLow && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Bajo
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        { 
            accessorKey: 'price', 
            header: 'Precio',
            cell: ({ row }: any) => {
                const price = parseFloat(row.getValue("price"));
                const formatted = new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                }).format(price);
                return formatted;
            }
        },
        {
            id: 'actions',
            cell: ({ row }: any) => {
                const product = row.original;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)} title="Editar">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(product)} className="text-destructive hover:bg-destructive/10 hover:text-destructive" title="Eliminar">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout>
            <Head title="Inventario" />
            
            <PageHeader 
                title="Inventario" 
                description="Control de productos y stock del negocio."
                action={
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Producto
                    </Button>
                }
            />

            <div className="mb-6 max-w-sm">
                <SearchInput 
                    value={searchTerm} 
                    onChange={setSearchTerm} 
                    placeholder="Buscar producto por nombre o SKU..." 
                />
            </div>

            <DataTable 
                columns={columns} 
                data={filteredData} 
            />

            <FormModal 
                title="Nuevo Producto" 
                open={isAddModalOpen} 
                onOpenChange={setIsAddModalOpen}
            >
                {renderProductForm(handleCreate, "Crear")}
            </FormModal>

            <FormModal 
                title="Editar Producto" 
                open={isEditModalOpen} 
                onOpenChange={setIsEditModalOpen}
            >
                {renderProductForm(handleEdit, "Guardar Cambios")}
            </FormModal>

            <ConfirmDialog 
                open={isDeleteDialogOpen} 
                onOpenChange={setIsDeleteDialogOpen}
                title="Eliminar Producto"
                description={`¿Estás seguro de que deseas eliminar ${selectedProduct?.name}? Esta acción no se puede deshacer.`}
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
