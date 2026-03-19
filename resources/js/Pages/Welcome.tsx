import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, Users, Package, DollarSign, ShieldCheck, Zap, Server, LayoutDashboard } from 'lucide-react';

export default function Welcome({ auth }: { auth: any }) {
    return (
        <>
            <Head title="Bienvenido | Joppa CRM" />
            
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden relative">
                
                {/* Background Glow Effects */}
                <div className="pointer-events-none absolute -top-40 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-500/20 dark:bg-indigo-600/10 blur-[120px]" />
                <div className="pointer-events-none absolute top-1/2 -right-60 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-purple-500/20 dark:bg-purple-600/10 blur-[120px]" />

                {/* Navbar */}
                <nav className="fixed top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
                                J
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                Joppa CRM
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link href={route('dashboard')}>
                                    <button className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:focus:ring-white dark:focus:ring-offset-slate-950">
                                        Ir al Dashboard
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="hidden sm:block text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                                        Iniciar Sesión
                                    </Link>
                                    <Link href={route('register')}>
                                        <button className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950">
                                            Acceder
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="relative pt-32 pb-16 lg:pt-48 lg:pb-32">
                    <div className="mx-auto max-w-7xl px-6 text-center">
                        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-8 animate-fade-in-up">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mr-2 animate-pulse"></span>
                            Sistema de Gestión Empresarial
                        </div>
                        
                        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl mb-8 leading-tight">
                            Control total de tu negocio en <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">un solo lugar.</span>
                        </h1>
                        
                        <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                            Joppa CRM centraliza tu inventario, gastos, proveedores y tasa de cambio en una interfaz ultrarrápida, hermosa y diseñada para maximizar tu productividad.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {auth.user ? (
                                <Link href={route('dashboard')}>
                                    <button className="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-slate-900 px-8 font-semibold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-xl shadow-slate-900/20 dark:shadow-white/10 hover:shadow-2xl hover:-translate-y-1">
                                        <LayoutDashboard className="h-5 w-5" />
                                        Abrir Joppa CRM
                                    </button>
                                </Link>
                            ) : (
                                <Link href={route('login')}>
                                    <button className="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 font-semibold text-white transition-all hover:scale-105 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50">
                                        Ingresar al Sistema
                                        <ArrowRight className="h-5 w-5" />
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Features Grid Mockup */}
                    <div className="mx-auto max-w-7xl px-6 mt-20 lg:mt-32 relative z-10">
                        <div className="rounded-3xl border border-slate-200/50 bg-white/50 p-4 sm:p-8 backdrop-blur-2xl shadow-2xl dark:border-slate-800/50 dark:bg-slate-900/50 ring-1 ring-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                
                                {/* Feature 1 */}
                                <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 transition-all hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Inventario Inteligente</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Controla stock por tallas, estilos, tipos de tela y calcula precios automáticos en divisa y moneda local.</p>
                                </div>
                                
                                {/* Feature 2 */}
                                <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 transition-all hover:shadow-xl hover:purple-500/30 dark:hover:border-purple-500/30">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                        <DollarSign className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Gestión de Gastos</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Registra erogaciones vinculadas a proveedores, filtra por fechas y mantén un historial exacto de tasas de cambio.</p>
                                </div>

                                {/* Feature 3 */}
                                <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 transition-all hover:shadow-xl hover:border-emerald-500/30 dark:hover:border-emerald-500/30">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                        <BarChart3 className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Métricas en Tiempo Real</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Dashboard interactivo con resúmenes mensuales, valoración de inventario y alertas predictivas de bajo stock.</p>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-950/30 backdrop-blur-lg mt-auto pb-8 pt-12">
                    <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                             <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                J
                            </div>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">Joppa CRM</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            &copy; {new Date().getFullYear()} Joppa. Todos los derechos reservados.
                        </p>
                        <div className="flex gap-4 text-slate-400">
                            <Server className="h-4 w-4" />
                            <ShieldCheck className="h-4 w-4" />
                            <Zap className="h-4 w-4" />
                        </div>
                    </div>
                </footer>
                
            </div>
            
            <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </>
    );
}
