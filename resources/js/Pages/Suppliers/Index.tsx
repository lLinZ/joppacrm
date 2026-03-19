import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AppLayout } from '@/components/ui/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash } from 'lucide-react';

interface Supplier {
    id: number;
    name: string;
    type: string | null;
    email: string | null;
    phone: string | null;
    instagram: string | null;
    platform: string | null;
    reliability: number | null;
    wholesale_price: string | null;
    address: string | null;
    last_purchase_notes: string | null;
    notes: string | null;
    category?: { id: number; name: string };
}

export default function SuppliersIndex({ suppliers }: { suppliers: Supplier[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        type: '',
        email: '',
        phone: '',
        instagram: '',
        platform: '',
        reliability: '',
        wholesale_price: '',
        address: '',
        last_purchase_notes: '',
        notes: '',
    });

    const filteredData = suppliers.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const openCreateDialog = () => {
        reset();
        setIsAddModalOpen(true);
    };

    const openEditDialog = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setData({
            name: supplier.name,
            type: supplier.type || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            instagram: supplier.instagram || '',
            platform: supplier.platform || '',
            reliability: supplier.reliability?.toString() || '',
            wholesale_price: supplier.wholesale_price || '',
            address: supplier.address || '',
            last_purchase_notes: supplier.last_purchase_notes || '',
            notes: supplier.notes || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsDeleteDialogOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('suppliers.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupplier) return;
        
        put(route('suppliers.update', selectedSupplier.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDelete = () => {
        if (!selectedSupplier) return;
        
        destroy(route('suppliers.destroy', selectedSupplier.id), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
            }
        });
    };

    const renderSupplierForm = (onSubmit: any, submitLabel: string) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Proveedor *</Label>
                    <Input 
                        id="name" 
                        value={data.name} 
                        onChange={e => setData('name', e.target.value)} 
                        required 
                    />
                    {errors.name && <div className="text-sm text-destructive">{errors.name}</div>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">Tipo de proveedor</Label>
                    <Input 
                        id="type" 
                        value={data.type} 
                        onChange={e => setData('type', e.target.value)} 
                        placeholder="Ej. Franelas Oversize"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Contacto</Label>
                    <Input 
                        id="phone" 
                        value={data.phone} 
                        onChange={e => setData('phone', e.target.value)} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="platform">Plataforma</Label>
                    <Input 
                        id="platform" 
                        value={data.platform} 
                        onChange={e => setData('platform', e.target.value)} 
                        placeholder="Facebook, Whatsapp..."
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input 
                        id="instagram" 
                        value={data.instagram} 
                        onChange={e => setData('instagram', e.target.value)} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reliability">Fiabilidad (1-5)</Label>
                    <Input 
                        id="reliability" 
                        type="number"
                        min="1"
                        max="5"
                        value={data.reliability} 
                        onChange={e => setData('reliability', e.target.value)} 
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="wholesale_price">Precio al mayor</Label>
                    <Input 
                        id="wholesale_price" 
                        value={data.wholesale_price} 
                        onChange={e => setData('wholesale_price', e.target.value)} 
                        placeholder="Ej. 12 x $90"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="last_purchase_notes">Última compra</Label>
                    <Input 
                        id="last_purchase_notes" 
                        value={data.last_purchase_notes} 
                        onChange={e => setData('last_purchase_notes', e.target.value)} 
                        placeholder="Ej. 10/03 pedido de 12 franelas"
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
        { accessorKey: 'name', header: 'Proveedor' },
        { accessorKey: 'type', header: 'Tipo' },
        { accessorKey: 'phone', header: 'Contacto' },
        { accessorKey: 'instagram', header: 'Instagram' },
        { 
            accessorKey: 'reliability', 
            header: 'Fiabilidad',
            cell: ({ row }: any) => row.original.reliability ? `${row.original.reliability} estrellas` : 'Sin clasificar'
        },
        { accessorKey: 'wholesale_price', header: 'Al mayor' },
        { accessorKey: 'platform', header: 'Plataforma' },
        {
            id: 'actions',
            cell: ({ row }: any) => {
                const supplier = row.original;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(supplier)} title="Editar">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(supplier)} className="text-destructive hover:bg-destructive/10 hover:text-destructive" title="Eliminar">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout>
            <Head title="Proveedores" />
            
            <PageHeader 
                title="Proveedores" 
                description="Gestiona los proveedores de tu negocio."
                action={
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Proveedor
                    </Button>
                }
            />

            <div className="mb-6 max-w-sm">
                <SearchInput 
                    value={searchTerm} 
                    onChange={setSearchTerm} 
                    placeholder="Buscar proveedor..." 
                />
            </div>

            <DataTable 
                columns={columns} 
                data={filteredData} 
            />

            <FormModal 
                title="Nuevo Proveedor" 
                open={isAddModalOpen} 
                onOpenChange={setIsAddModalOpen}
            >
                {renderSupplierForm(handleCreate, "Crear")}
            </FormModal>

            <FormModal 
                title="Editar Proveedor" 
                open={isEditModalOpen} 
                onOpenChange={setIsEditModalOpen}
            >
                {renderSupplierForm(handleEdit, "Guardar Cambios")}
            </FormModal>

            <ConfirmDialog 
                open={isDeleteDialogOpen} 
                onOpenChange={setIsDeleteDialogOpen}
                title="Eliminar Proveedor"
                description={`¿Estás seguro de que deseas eliminar a ${selectedSupplier?.name}? Esta acción no se puede deshacer.`}
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
