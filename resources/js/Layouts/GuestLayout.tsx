import { Link } from '@inertiajs/react';
import { ThemeToggle } from '@/Components/ui/ThemeToggle';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center font-sans text-white overflow-hidden sm:pt-0" style={{ backgroundColor: '#0a0a0a' }}>
            
            {/* Background Glow Effects (Similar to Landing) */}
            <div className="pointer-events-none absolute -top-40 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full blur-[120px]" style={{ background: 'rgba(11,48,34,0.25)' }} />
            <div className="pointer-events-none absolute bottom-0 -left-40 h-[600px] w-[600px] translate-y-1/2 rounded-full blur-[120px]" style={{ background: 'rgba(212,160,23,0.12)' }} />

            {/* Quick Actions overlay */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <div className="relative z-10 w-full max-w-md px-6 py-4">
                {/* Logo & Branding */}
                <div className="mb-10 flex flex-col items-center">
                    <Link href="/">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl font-bold text-white transition-transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #0B3022, #1a5c40)', boxShadow: '0 4px 14px rgba(11,48,34,0.35)' }}>
                            J
                        </div>
                    </Link>
                    <Link href="/">
                        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
                            Joppa CRM
                        </h1>
                    </Link>
                    <p className="mt-2 text-sm text-slate-400">
                        Acceso seguro al sistema empresarial
                    </p>
                </div>

                {/* Form Wrapper with Glassmorphism */}
                <div className="overflow-hidden rounded-3xl border p-8 shadow-2xl backdrop-blur-xl" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                    {children}
                </div>
                
                {/* Footer Copyright */}
                <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500">
                    &copy; {new Date().getFullYear()} Joppa. Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
}
