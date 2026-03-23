import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, Users, Package, DollarSign, ShieldCheck, Zap, Server, LayoutDashboard } from 'lucide-react';

export default function Welcome({ auth }: { auth: any }) {
    return (
        <>
            <Head title="Bienvenido | Joppa CRM" />
            
            <div className="min-h-screen text-white font-sans overflow-hidden relative" style={{ backgroundColor: '#0a0a0a' }}>
                
                {/* Background Glow Effects — JOPPA brand green */}
                <div className="pointer-events-none absolute -top-40 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full blur-[120px]" style={{ background: 'rgba(11,48,34,0.25)' }} />
                <div className="pointer-events-none absolute top-1/2 -right-60 h-[600px] w-[600px] -translate-y-1/2 rounded-full blur-[120px]" style={{ background: 'rgba(212,160,23,0.12)' }} />

                {/* Navbar */}
                <nav className="fixed top-0 z-50 w-full backdrop-blur-xl" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,10,0.85)' }}>
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #0B3022, #1a5c40)', boxShadow: '0 4px 14px rgba(11,48,34,0.35)' }}>
                                J
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                Joppa CRM
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link href={route('dashboard')}>
                                    <button className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 focus:outline-none dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                                        Ir al Dashboard
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')}>
                                        <button
                                            className="group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 focus:outline-none"
                                            style={{ background: 'linear-gradient(135deg, #0B3022, #1a5c40)', boxShadow: '0 4px 14px rgba(11,48,34,0.35)' }}
                                        >
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
                        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium mb-8 animate-fade-in-up" style={{ borderColor: 'rgba(212,160,23,0.4)', background: 'rgba(212,160,23,0.12)', color: '#D4A017' }}>
                            <span className="flex h-2 w-2 rounded-full mr-2 animate-pulse" style={{ background: '#D4A017' }}></span>
                            Sistema de Gestión Empresarial
                        </div>
                        
                        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-8 leading-tight">
                            Control total de tu negocio en <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #0B3022, #1a5c40)' }}>un solo lugar.</span>
                        </h1>
                        
                        <p className="mx-auto max-w-2xl text-lg text-slate-400 mb-10 leading-relaxed">
                            Joppa CRM centraliza tu inventario, gastos, proveedores y tasa de cambio en una interfaz ultrarrápida, hermosa y diseñada para maximizar tu productividad.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {auth.user ? (
                                <Link href={route('dashboard')}>
                                    <button className="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full px-8 font-semibold text-white transition-all hover:scale-105 hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #0B3022, #1a5c40)', boxShadow: '0 8px 24px rgba(11,48,34,0.3)' }}>
                                        <LayoutDashboard className="h-5 w-5" />
                                        Abrir Joppa CRM
                                    </button>
                                </Link>
                            ) : (
                                <Link href={route('login')}>
                                    <button className="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full px-8 font-semibold text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #0B3022, #1a5c40)', boxShadow: '0 8px 24px rgba(11,48,34,0.3)' }}>
                                        Ingresar al Sistema
                                        <ArrowRight className="h-5 w-5" />
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mx-auto max-w-7xl px-6 mt-20 lg:mt-32 relative z-10">
                        <div className="rounded-3xl border p-4 sm:p-8 backdrop-blur-2xl shadow-2xl" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                
                                {/* Feature 1 — Inventario */}
                                <div className="group rounded-2xl p-6 transition-all hover:shadow-xl" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl group-hover:scale-110 transition-transform" style={{ background: 'rgba(11,48,34,0.2)', color: '#4ade80' }}>
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-white">Inventario Inteligente</h3>
                                    <p className="text-slate-400">Controla stock por tallas, estilos, tipos de tela y calcula precios automáticos en divisa y moneda local.</p>
                                </div>
                                
                                {/* Feature 2 — Gastos */}
                                <div className="group rounded-2xl p-6 transition-all hover:shadow-xl" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl group-hover:scale-110 transition-transform" style={{ background: 'rgba(212,160,23,0.15)', color: '#D4A017' }}>
                                        <DollarSign className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-white">Gestión de Gastos</h3>
                                    <p className="text-slate-400">Registra erogaciones vinculadas a proveedores, filtra por fechas y mantén un historial exacto de tasas de cambio.</p>
                                </div>

                                {/* Feature 3 — Métricas */}
                                <div className="group rounded-2xl p-6 transition-all hover:shadow-xl" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl group-hover:scale-110 transition-transform" style={{ background: 'rgba(11,48,34,0.15)', color: '#4ade80' }}>
                                        <BarChart3 className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-white">Métricas en Tiempo Real</h3>
                                    <p className="text-slate-400">Dashboard interactivo con resúmenes mensuales, valoración de inventario y alertas predictivas de bajo stock.</p>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="mt-auto pb-8 pt-12" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,10,0.5)' }}>
                    <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #0B3022, #1a5c40)' }}>
                                J
                            </div>
                            <span className="text-sm font-semibold text-white">Joppa CRM</span>
                        </div>
                        <p className="text-sm text-slate-500">
                            &copy; {new Date().getFullYear()} Joppa. Todos los derechos reservados.
                        </p>
                        <div className="flex gap-4 text-slate-600">
                            <Server className="h-4 w-4" />
                            <ShieldCheck className="h-4 w-4" />
                            <Zap className="h-4 w-4" />
                        </div>
                    </div>
                </footer>
                
            </div>
            
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </>
    );
}
