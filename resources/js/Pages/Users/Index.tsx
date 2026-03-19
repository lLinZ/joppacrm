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

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

export default function UsersIndex({ users }: { users: User[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const openCreateDialog = () => {
        reset();
        setIsAddModalOpen(true);
    };

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (user: User) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        
        put(route('users.update', selectedUser.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDelete = () => {
        if (!selectedUser) return;
        
        destroy(route('users.destroy', selectedUser.id), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
            }
        });
    };

    const renderUserForm = (onSubmit: any, submitLabel: string, isEditing: boolean = false) => (
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
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input 
                    id="email" 
                    type="email"
                    value={data.email} 
                    onChange={e => setData('email', e.target.value)} 
                    required 
                />
                {errors.email && <div className="text-sm text-destructive">{errors.email}</div>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Contraseña {isEditing && '(Opcional)'}</Label>
                <Input 
                    id="password" 
                    type="password"
                    value={data.password} 
                    onChange={e => setData('password', e.target.value)} 
                    required={!isEditing}
                    minLength={8}
                />
                {errors.password && <div className="text-sm text-destructive">{errors.password}</div>}
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
        { accessorKey: 'email', header: 'Correo Electrónico' },
        { 
            accessorKey: 'created_at', 
            header: 'Fecha de Registro',
            cell: ({ row }: any) => new Date(row.original.created_at).toLocaleDateString()
        },
        {
            id: 'actions',
            cell: ({ row }: any) => {
                const user = row.original;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} title="Editar Acceso">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)} className="text-destructive hover:bg-destructive/10 hover:text-destructive" title="Eliminar Usuario">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout>
            <Head title="Usuarios" />
            
            <PageHeader 
                title="Usuarios y Accesos" 
                description="Gestión de empleados con acceso al sistema Joppa CRM."
                action={
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Nuevo Usuario
                    </Button>
                }
            />

            <div className="mt-6">
                <DataTable 
                    columns={columns} 
                    data={users} 
                />
            </div>

            <FormModal 
                title="Nuevo Usuario" 
                open={isAddModalOpen} 
                onOpenChange={setIsAddModalOpen}
            >
                {renderUserForm(handleCreate, "Crear Usuario", false)}
            </FormModal>

            <FormModal 
                title="Editar Usuario" 
                open={isEditModalOpen} 
                onOpenChange={setIsEditModalOpen}
            >
                {renderUserForm(handleEdit, "Guardar Cambios", true)}
            </FormModal>

            <ConfirmDialog 
                open={isDeleteDialogOpen} 
                onOpenChange={setIsDeleteDialogOpen}
                title="Eliminar Usuario"
                description={`¿Estás seguro de que deseas eliminar el acceso a ${selectedUser?.name}?`}
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
