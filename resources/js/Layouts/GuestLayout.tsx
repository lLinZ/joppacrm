import { Link } from '@inertiajs/react';
import { ThemeToggle } from '@/Components/ui/ThemeToggle';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 overflow-hidden sm:pt-0">
            
            {/* Background Glow Effects (Similar to Landing) */}
            <div className="pointer-events-none absolute -top-40 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-500/20 dark:bg-indigo-600/10 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-0 -left-40 h-[600px] w-[600px] translate-y-1/2 rounded-full bg-purple-500/20 dark:bg-purple-600/10 blur-[120px]" />

            {/* Quick Actions overlay */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <div className="relative z-10 w-full max-w-md px-6 py-4">
                {/* Logo & Branding */}
                <div className="mb-10 flex flex-col items-center">
                    <Link href="/">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-bold text-white shadow-xl shadow-indigo-500/30 transition-transform hover:scale-105">
                            J
                        </div>
                    </Link>
                    <Link href="/">
                        <h1 className="mt-4 text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                            Joppa CRM
                        </h1>
                    </Link>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Acceso seguro al sistema empresarial
                    </p>
                </div>

                {/* Form Wrapper with Glassmorphism */}
                <div className="overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 dark:ring-white/5">
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
