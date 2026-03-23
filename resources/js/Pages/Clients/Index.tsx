import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { DataTable } from '@/Components/ui/DataTable';
import { FormModal } from '@/Components/ui/FormModal';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import { SearchInput } from '@/Components/ui/SearchInput';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Plus, Pencil, Trash, Eye } from 'lucide-react';
import { ClientDetailModal } from '@/Components/Clients/ClientDetailModal';

interface Client {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
    created_at: string;
}

export default function ClientsIndex({ clients }: { clients: Client[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });

    const filteredData = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const openCreateDialog = () => {
        reset();
        setIsAddModalOpen(true);
    };

    const openEditDialog = (client: Client) => {
        setSelectedClient(client);
        setData({
            name: client.name,
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            notes: client.notes || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (client: Client) => {
        setSelectedClient(client);
        setIsDeleteDialogOpen(true);
    };

    const openDetailDialog = (client: Client) => {
        setSelectedClient(client);
        setIsDetailModalOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('clients.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) return;
        
        put(route('clients.update', selectedClient.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDelete = () => {
        if (!selectedClient) return;
        
        destroy(route('clients.destroy', selectedClient.id), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
            }
        });
    };

    const renderClientForm = (onSubmit: any, submitLabel: string) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input 
                    id="name" 
                    value={data.name} 
                    onChange={e => setData('name', e.target.value)} 
                    required 
                />
                {errors.name && <div className="text-sm text-destructive">{errors.name}</div>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email" 
                    type="email" 
                    value={data.email} 
                    onChange={e => setData('email', e.target.value)} 
                />
                {errors.email && <div className="text-sm text-destructive">{errors.email}</div>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input 
                    id="phone" 
                    value={data.phone} 
                    onChange={e => setData('phone', e.target.value)} 
                />
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
        { accessorKey: 'name', header: 'Nombre' },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'phone', header: 'Teléfono' },
        {
            id: 'actions',
            cell: ({ row }: any) => {
                const client = row.original;
                return (
                    <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetailDialog(client)} title="Ver Detalles">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(client)} title="Editar">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => openDeleteDialog(client)} title="Eliminar">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout>
            <Head title="Clientes" />
            
            <PageHeader 
                title="Clientes" 
                description="Gestiona los clientes de tu emprendimiento."
                action={
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Cliente
                    </Button>
                }
            />

            <div className="mb-6 max-w-sm">
                <SearchInput 
                    value={searchTerm} 
                    onChange={setSearchTerm} 
                    placeholder="Buscar cliente..." 
                />
            </div>

            <DataTable 
                columns={columns} 
                data={filteredData} 
            />

            <FormModal 
                title="Nuevo Cliente" 
                open={isAddModalOpen} 
                onOpenChange={setIsAddModalOpen}
            >
                {renderClientForm(handleCreate, "Crear")}
            </FormModal>

            <FormModal 
                title="Editar Cliente" 
                open={isEditModalOpen} 
                onOpenChange={setIsEditModalOpen}
            >
                {renderClientForm(handleEdit, "Guardar Cambios")}
            </FormModal>

            <ConfirmDialog 
                open={isDeleteDialogOpen} 
                onOpenChange={setIsDeleteDialogOpen}
                title="Eliminar Cliente"
                description={`¿Estás seguro de que deseas eliminar a ${selectedClient?.name}? Esta acción no se puede deshacer.`}
                onConfirm={handleDelete}
            />

            <ClientDetailModal 
                client={selectedClient} 
                open={isDetailModalOpen} 
                onOpenChange={setIsDetailModalOpen} 
            />
        </AppLayout>
    );
}
