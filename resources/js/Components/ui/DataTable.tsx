import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { ReactNode } from "react";

interface Column<T> {
    accessorKey?: keyof T | string;
    header?: string;
    id?: string;
    cell?: (props: { row: { original: T; getValue: (key: string) => any } }) => ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
}

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
    return (
        <div className="rounded-md shadow-sm overflow-hidden backdrop-blur-xl" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', borderWidth: '1px' }}>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-white/5 hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            {columns.map((column, index) => (
                                <TableHead key={index} className="whitespace-nowrap font-medium text-slate-300">
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell 
                                    colSpan={columns.length} 
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No hay resultados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, rowIndex) => (
                                <TableRow key={rowIndex} className="hover:bg-white/5 transition-colors text-white" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                    {columns.map((column, colIndex) => (
                                        <TableCell key={colIndex} className="py-3">
                                            {column.cell 
                                                ? column.cell({ 
                                                    row: { 
                                                        original: row,
                                                        getValue: (key) => (row as any)[key]
                                                    } 
                                                })
                                                : column.accessorKey && (row as any)[column.accessorKey]
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
