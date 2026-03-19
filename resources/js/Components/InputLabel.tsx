import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
