import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Users, UserSquare2, PackageCheck, Receipt, Menu, X, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = usePage().props.auth.user;

    const navigation = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard },
        { name: 'Proveedores', href: route('suppliers.index'), icon: Users },
        { name: 'Clientes', href: route('clients.index'), icon: UserSquare2 },
        { name: 'Inventario', href: route('products.index'), icon: PackageCheck },
        { name: 'Gastos', href: route('expenses.index'), icon: Receipt },
        { name: 'Tasas de Cambio', href: route('exchange-rates.index'), icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-64
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="h-16 flex items-center px-6 border-b border-border">
                        <span className="text-xl font-bold tracking-tight text-foreground">Joppa CRM</span>
                        <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const active = route().current(item.href.split('?')[0].split('/').pop() || '');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium
                                        ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
                                    `}
                                >
                                    <item.icon className={`h-5 w-5 ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                </p>
                            </div>
                            <ThemeToggle />
                            <Link href={route('logout')} method="post" as="button">
                                <Button variant="ghost" size="icon" title="Cerrar sesión">
                                    <LogOut className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 flex items-center px-6 bg-card border-b border-border lg:hidden">
                    <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="ml-4 text-xl font-bold text-foreground">Joppa CRM</span>
                </header>
                
                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
