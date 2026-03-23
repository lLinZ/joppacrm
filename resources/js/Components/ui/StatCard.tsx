import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
    return (
        <div className="rounded-xl p-6 shadow-sm backdrop-blur-xl relative overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
            <div className="relative z-10 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                <Icon className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <div className="relative z-10 mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight text-white">
                    {value}
                </span>
            </div>
            {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
}
