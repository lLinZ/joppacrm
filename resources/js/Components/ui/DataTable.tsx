import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
        <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            {columns.map((column, index) => (
                                <TableHead key={index} className="whitespace-nowrap font-medium text-muted-foreground">
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
                                <TableRow key={rowIndex} className="hover:bg-muted/50 transition-colors">
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
