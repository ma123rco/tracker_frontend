import { format, isValid } from "date-fns";

export function safeParseToDate(input: string | Date | null | undefined): Date | null {
    if (typeof input === "string") return parseToDate(input);
    if (input instanceof Date && isValid(input)) return input;
    return null;
}

export const parseToDate = (value?: string | number | Date | null) => {
    if ( !value) return null;

    if (value instanceof Date) {
        return value;
    }

    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
};

export function formatDateToString(date: Date, formatStr: string = "yyyy-MM-dd"): string {
    return format(date, formatStr);
}

/**
 * Parsea una fecha ISO (o Date) ignorando el offset UTC.
 * Extrae sólo YYYY-MM-DD y lo interpreta como hora local,
 * evitando que "2026-04-13T00:00:00.000Z" se muestre como 12 de abril en UTC-4.
 */
export function parseDateLocal(input: string | Date | null | undefined): Date | null {
    if (!input) return null;

    const raw = input instanceof Date ? input.toISOString() : input;
    // Toma sólo la parte de fecha YYYY-MM-DD
    const datePart = raw.slice(0, 10);
    // Al parsear sin hora ni Z se trata como medianoche local
    const d = new Date(`${datePart}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
}

