import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { StatCard } from '@/Components/ui/StatCard';
import { DataTable } from '@/Components/ui/DataTable';
import { Users, ShoppingCart, Package, CreditCard, Globe } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    min_stock: number;
}

interface DashboardProps {
    stats: {
        total_clients: number;
        total_suppliers: number;
        inventory_value: number;
        monthly_expenses: number;
        total_web_views: number;
    };
    low_stock_products: Product[];
}

export default function Dashboard({ stats, low_stock_products }: DashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const columns = [
        {
            accessorKey: 'name',
            header: 'Producto',
        },
        {
            accessorKey: 'sku',
            header: 'SKU',
        },
        {
            accessorKey: 'quantity',
            header: 'Cantidad Actual',
        },
        {
            accessorKey: 'min_stock',
            header: 'Mínimo Requerido',
        },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />
            
            <PageHeader 
                title="Dashboard" 
                description="Resumen de la información de tu emprendimiento."
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard 
                    title="Total Clientes" 
                    value={stats.total_clients} 
                    icon={Users} 
                />
                <StatCard 
                    title="Total Proveedores" 
                    value={stats.total_suppliers} 
                    icon={ShoppingCart} 
                />
                <StatCard 
                    title="Valor Inventario" 
                    value={formatCurrency(stats.inventory_value)} 
                    icon={Package} 
                />
                <StatCard 
                    title="Gastos del Mes" 
                    value={formatCurrency(stats.monthly_expenses)} 
                    icon={CreditCard} 
                />
                <StatCard 
                    title="Visualizaciones Web" 
                    value={stats.total_web_views} 
                    icon={Globe} 
                />
            </div>

            <h3 className="text-xl font-bold tracking-tight mb-4 text-white">
                Productos con Stock Bajo
            </h3>
            
            <DataTable 
                columns={columns} 
                data={low_stock_products} 
            />
        </AppLayout>
    );
}
