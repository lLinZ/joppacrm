import ApplicationLogo from '@/components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-background text-foreground pt-6 sm:justify-center sm:pt-0 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-foreground" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-card border border-border px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
