/**
 * Pure validation + formatting helpers for the appointment form.
 *
 * SRP: this module knows about time/date shapes and nothing else \u2014 no React,
 * no styling, no i18n. All other modules depend on this small interface.
 */

export const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidTime(value: string): boolean {
    return TIME_RE.test(value.trim());
}

export function isValidDate(value: string): boolean {
    return DATE_RE.test(value.trim());
}

/**
 * Inserts ":" after the first two digits when the user types a bare 4-digit
 * sequence (e.g. "1315" \u2192 "13:15"). Idempotent for already-formatted input.
 */
export function autoFormatTime(input: string): string {
    const digits = input.replace(/\D/g, '');
    if (digits.length >= 3 && !input.includes(':')) {
        return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
    }
    return input;
}

/** 09:00\u201318:00 in 30-minute increments. */
export function defaultTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = 9; h <= 18; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        if (h !== 18) slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
}

/** Splits a list of "HH:mm" slots into morning (<12) and afternoon (\u226512). */
export function splitByDaypart(slots: string[]): {
    morning: string[];
    afternoon: string[];
} {
    const morning: string[] = [];
    const afternoon: string[] = [];
    for (const slot of slots) {
        const hour = parseInt(slot.split(':')[0], 10);
        (hour < 12 ? morning : afternoon).push(slot);
    }
    return {morning, afternoon};
}
