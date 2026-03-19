import { ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface FormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
}

export function FormModal({
    open,
    onOpenChange,
    title,
    description,
    children,
}: FormModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <p className="text-sm text-gray-500">{description}</p>
                    )}
                </DialogHeader>
                <div className="mt-4">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}
