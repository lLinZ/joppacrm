import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen text-white font-sans overflow-hidden relative" style={{ backgroundColor: '#0a0a0a' }}>
            {/* Background Glow Effects */}
            <div className="pointer-events-none absolute -top-40 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full blur-[120px]" style={{ background: 'rgba(11,48,34,0.15)' }} />
            <div className="pointer-events-none absolute top-1/2 -right-60 h-[600px] w-[600px] -translate-y-1/2 rounded-full blur-[120px]" style={{ background: 'rgba(212,160,23,0.08)' }} />

            <nav className="relative z-50 border-b backdrop-blur-xl" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,10,10,0.6)' }}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #0B3022, #1a5c40)', boxShadow: '0 2px 10px rgba(11,48,34,0.35)' }}>
                                        J
                                    </div>
                                    <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
                                        Joppa CRM
                                    </span>
                                </Link>
                            </div>

                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className={route().current('dashboard') ? "text-white focus:text-white" : "text-slate-400 hover:text-white focus:text-white"}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('design-requests.index')}
                                    active={route().current('design-requests.*')}
                                    className={route().current('design-requests.*') ? "text-white focus:text-white" : "text-slate-400 hover:text-white focus:text-white"}
                                >
                                    Peticiones de Diseño
                                </NavLink>
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium leading-4 text-slate-300 transition duration-150 ease-in-out hover:text-white focus:outline-none bg-transparent"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-slate-300 focus:bg-slate-800 focus:text-slate-300 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        </div>
                    </div>
                </div>

            </nav>

            {header && (
                <header className="relative z-20 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,10,10,0.4)' }}>
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-white">
                        {header}
                    </div>
                </header>
            )}

            <main className="relative z-10">{children}</main>
        </div>
    );
}
