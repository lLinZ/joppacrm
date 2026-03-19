import { Search } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { useEffect, useState } from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    delay?: number;
}

export function SearchInput({ value, onChange, placeholder = "Buscar...", delay = 300 }: SearchInputProps) {
    const [localValue, setLocalValue] = useState(value);

    // Sync external value changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Debounce the onChange callback
    useEffect(() => {
        if (localValue === value) return; // Prevent loop

        const handler = setTimeout(() => {
            onChange(localValue);
        }, delay);

        return () => clearTimeout(handler);
    }, [localValue, delay, onChange, value]);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className="pl-9"
            />
        </div>
    );
}
