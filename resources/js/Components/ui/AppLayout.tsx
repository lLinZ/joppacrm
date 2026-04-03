import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { LayoutDashboard, Users, UserSquare2, PackageCheck, Receipt, Menu, X, LogOut, Settings, UserCog, ShoppingBag, Layers, Store, Palette, Globe, Bell, Check, Ghost, TrendingUp } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Toaster, toast } from 'sonner';

function NotificationBell({ unreadCount, notifications, direction = 'up', align = 'right' }: { unreadCount: number, notifications: any[], direction?: 'up'|'down', align?: 'left'|'right' }) {
    const [open, setOpen] = useState(false);
    
    const markAsRead = () => {
        if (unreadCount > 0) {
            router.post(route('notifications.mark-read'), {}, { preserveScroll: true, preserveState: true });
        }
    };

    return (
        <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="relative text-slate-300 hover:text-white">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-black">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>
            
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className={`absolute ${align === 'left' ? 'left-0' : '-right-2 sm:right-0'} w-[calc(100vw-2.5rem)] sm:w-80 rounded-xl border border-white/10 bg-[#121212] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px] ${direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <h3 className="font-semibold text-sm text-white">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAsRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Marcar leídas
                                </button>
                            )}
                        </div>
                        <div className="overflow-y-auto flex-1 p-2">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-400">No hay notificaciones recientes.</div>
                            ) : (
                                <div className="space-y-1">
                                    {notifications.map((n: any) => (
                                        <div key={n.id} className="p-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
                                            <p className="font-semibold text-white">{n.data.title}</p>
                                            <p className="text-slate-400 mt-0.5 text-xs line-clamp-2">{n.data.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Helper function to convert HEX to HSL for Tailwind CSS variable injection
function hexToHSL(hex: string) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { auth, flash } = usePage().props as any;
    const user = auth.user;

    const navigation = [
        { name: 'Dashboard', href: route('dashboard'), routeName: 'dashboard', icon: LayoutDashboard },
        { name: 'Finanzas', href: route('finance.index'), routeName: 'finance.*', icon: TrendingUp },
        { name: 'Tráfico Web', href: route('web.traffic'), routeName: 'web.traffic', icon: Globe },
        { name: 'Órdenes', href: route('orders.index'), routeName: 'orders.*', icon: ShoppingBag },
        { name: 'Sol. de Diseño', href: route('design-requests.index'), routeName: 'design-requests.*', icon: Palette },
        { name: 'D. Huérfanos', href: route('abandoned-designs.index'), routeName: 'abandoned-designs.*', icon: Ghost },
        { name: 'Proveedores', href: route('suppliers.index'), routeName: 'suppliers.*', icon: Users },
        { name: 'Clientes', href: route('clients.index'), routeName: 'clients.*', icon: UserSquare2 },
        { name: 'Inventario', href: route('products.index'), routeName: 'products.*', icon: PackageCheck },
        { name: 'Catálogo', href: route('catalog-products.index'), routeName: 'catalog-products.*', icon: Store },
        { name: 'Colecciones', href: route('collections.index'), routeName: 'collections.*', icon: Layers },
        { name: 'Gastos', href: route('expenses.index'), routeName: 'expenses.*', icon: Receipt },
        { name: 'Usuarios', href: route('users.index'), routeName: 'users.*', icon: UserCog },
        { name: 'Tasas de Cambio', href: route('exchange-rates.index'), routeName: 'exchange-rates.*', icon: Settings },
        { name: 'Config. Builder', href: route('settings.builder.index'), routeName: 'settings.builder.*', icon: Palette },
    ];

    useEffect(() => {
        const root = document.documentElement;
        // Clean up previous classes and styles
        root.classList.remove('theme-zinc', 'theme-blue', 'theme-emerald', 'theme-rose', 'theme-orange');
        root.style.removeProperty('--primary');
        root.style.removeProperty('--ring');

        if (!user.theme) return;
        
        if (user.theme.startsWith('#')) {
            // It's a custom hex color
            const hslString = hexToHSL(user.theme);
            root.style.setProperty('--primary', hslString);
            root.style.setProperty('--ring', hslString);
        } else if (user.theme !== 'zinc') {
            // It's a predefined theme
            root.classList.add(`theme-${user.theme}`);
        }
    }, [user.theme]);

    useEffect(() => {
        if (flash?.success) {
            toast.success('Completado', { description: flash.success });
        }
        if (flash?.error) {
            toast.error('Error', { description: flash.error });
        }
    }, [flash]);

    // Global listener for new orders and notifications
    useEffect(() => {
        if (!window.Echo) return;

        // Listener de base de datos de Laravel (Notificaciones genéricas)
        const userId = user.id;
        window.Echo.private(`App.Models.User.${userId}`)
            .notification((notification: any) => {
                // Reproducir sonido
                try {
                    const audio = new Audio('/sounds/notification.ogg');
                    audio.play().catch(e => console.log('Audio error:', e));
                } catch (err) {}

                toast.success(notification.title || 'Nueva Notificación', {
                    description: notification.message,
                    duration: 8000,
                    action: notification.order_id ? {
                        label: 'Ver Orden',
                        onClick: () => router.visit(route('orders.index'))
                    } : undefined
                });
                
                // Recargar props para actualizar el contador
                router.reload({ only: ['auth'] });
            });

        return () => {
            window.Echo.leave(`App.Models.User.${userId}`);
        };
    }, [user.id]);

    const themes = [
        { id: 'zinc', color: 'bg-zinc-500' },
        { id: 'blue', color: 'bg-blue-600' },
        { id: 'emerald', color: 'bg-emerald-600' },
        { id: 'rose', color: 'bg-rose-600' },
        { id: 'orange', color: 'bg-orange-500' },
    ];

    const changeTheme = (themeId: string) => {
        if (user.theme === themeId) return;
        router.patch(route('profile.theme.update'), { theme: themeId }, { preserveScroll: true });
    };

    return (
        <div className="min-h-screen text-white font-sans overflow-hidden flex relative" style={{ backgroundColor: '#0a0a0a' }}>
            {/* Background Glow Effects System-wide */}
            <div className="pointer-events-none fixed -top-40 left-1/4 h-[800px] w-[800px] -translate-x-1/2 rounded-full blur-[120px]" style={{ background: 'rgba(11,48,34,0.15)' }} />
            <div className="pointer-events-none fixed bottom-0 right-0 h-[600px] w-[600px] translate-y-1/2 rounded-full blur-[120px]" style={{ background: 'rgba(212,160,23,0.10)' }} />

            {/* Global Toaster Integration */}
            <Toaster position="top-right" richColors expand={false} />
            
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 border-r backdrop-blur-xl transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-64
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `} style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,10,10,0.65)' }}>
                <div className="flex flex-col h-full relative z-10">
                    <div className="h-16 flex items-center px-6 border-b justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #0B3022, #1a5c40)', boxShadow: '0 2px 10px rgba(11,48,34,0.35)' }}>
                                J
                            </div>
                            <NotificationBell unreadCount={auth.unread_count || 0} notifications={auth.notifications || []} direction="down" align="left" />
                        </div>
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const active = route().current(item.routeName);
                            return (
                                    <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium
                                        ${active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                    `}
                                    style={active ? { background: 'linear-gradient(90deg, rgba(11,48,34,0.8), rgba(11,48,34,0.2))', borderLeft: '3px solid #D4A017' } : { borderLeft: '3px solid transparent' }}
                                >
                                    <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-400'}`} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        {/* Theme Picker */}
                        <div className="flex items-center justify-between mb-4 px-3 hidden">
                            <span className="text-xs font-semibold text-slate-400">Color</span>
                            <div className="flex items-center gap-1.5">
                                {themes.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => changeTheme(t.id)}
                                        className={`w-5 h-5 rounded-full ${t.color} shrink-0 ${user.theme === t.id ? 'ring-2 ring-offset-2 ring-primary ring-offset-background' : 'hover:scale-110 transition-transform'}`}
                                        title={`Tema: ${t.id}`}
                                        aria-label={`Seleccionar tema ${t.id}`}
                                    />
                                ))}
                                
                                {/* Custom Color Picker */}
                                <div className="relative shrink-0 flex items-center justify-center w-5 h-5 rounded-full overflow-hidden hover:scale-110 transition-transform cursor-pointer shadow-inner">
                                    <div 
                                        className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500" 
                                        title="Color Personalizado"
                                    />
                                    {user.theme?.startsWith('#') && (
                                        <div 
                                            className="absolute inset-0 ring-2 ring-offset-2 ring-primary ring-offset-background"
                                            style={{ backgroundColor: user.theme }} 
                                        />
                                    )}
                                    <input 
                                        type="color" 
                                        value={user.theme?.startsWith('#') ? user.theme : '#8b5cf6'}
                                        onChange={(e) => changeTheme(e.target.value)}
                                        className="absolute -inset-2 w-[200%] h-[200%] opacity-0 cursor-pointer"
                                        title="Elegir Color Personalizado"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* User Info & Actions */}
                        <div className="flex items-center gap-2 px-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {user.email}
                                </p>
                            </div>

                            <Link href={route('logout')} method="post" as="button" className="shrink-0">
                                <Button variant="ghost" size="icon" title="Cerrar sesión">
                                    <LogOut className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 relative z-10">
                <header className="h-16 flex items-center justify-between px-6 border-b backdrop-blur-xl lg:hidden" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,10,10,0.65)' }}>
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="-ml-2 text-white" onClick={() => setSidebarOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <span className="ml-4 text-xl font-bold text-white">Joppa CRM</span>
                    </div>
                    
                    <NotificationBell unreadCount={auth.unread_count || 0} notifications={auth.notifications || []} direction="down" />
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
