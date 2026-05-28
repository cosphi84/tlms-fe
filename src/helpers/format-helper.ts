import { isValidElement, ReactNode } from "react";

// ─── Validation ───────────────────────────────────────────────────────────────

export function isPhoneValid(phone: string): boolean {
    return /^62[0-9]+$/.test(phone); // ✅ removed /gm flags — not needed for .test()
}

export function isValueExists(
    item?: string | number | null | ReactNode | unknown
): boolean {
    if (typeof item === "string") return item.trim() !== "" && item !== "null";
    if (typeof item === "number") return isFinite(item); // ✅ 0 and negatives are valid numbers
    if (Array.isArray(item))      return item.length > 0;
    if (item && typeof item === "object") return Object.keys(item).length > 0;
    return isValidElement(item);
}

// ─── String Helpers ───────────────────────────────────────────────────────────

export function trim(text: string): string {
    return text.trim();
}

export function getInitials(fullName: string): string {
    if (!isValueExists(fullName)) return fullName;

    const names = fullName.trim().split(/\s+/); // ✅ handles multiple spaces
    const first = names[0][0];
    const last = names[names.length - 1][0]; // same as first when single word — correct
    return `${first}${last}`.toUpperCase();   // ✅ removed redundant branch
}

// ✅ renamed: accurately describes snake_case → Title Case conversion
export function snakeToTitleCase(inputText: string): string {
    return inputText
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

/** @deprecated renamed to snakeToTitleCase */
export const pascalCaseKey = snakeToTitleCase;

export function parseNumber(input: string): string {
    return input.replace(/\D/g, "");
}

export function hidePhoneNumber(input: string): string {
    const cleaned = parseNumber(input);
    if (cleaned.length < 7) return cleaned;
    return `${cleaned.slice(0, 4)}...${cleaned.slice(-3)}`;
}

export function hideEmailAddress(email: string): string {
    const [localPart, domainPart] = email.split("@");
    if (!localPart || !domainPart) throw new Error("Invalid email address");

    const domainName = domainPart.split(".")[0];
    const domainExtension = domainPart.slice(domainName.length);

    return `${localPart.slice(0, 2)}...${localPart.slice(-1)}@${domainName.slice(0, 2)}...${domainExtension}`;
}

// ─── Number Helpers ───────────────────────────────────────────────────────────

export function numberFormat(n?: number, prefix?: string): string {
    const formatted = new Intl.NumberFormat().format(n ?? 0); // ✅ no redundant Number() cast
    return prefix ? `${prefix} ${formatted}` : formatted;
}