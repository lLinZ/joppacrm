import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    action?: React.ReactNode;
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-dashed border-gray-300">
            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}
