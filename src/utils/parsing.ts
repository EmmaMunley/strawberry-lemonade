export function parseNumberOrDefault(input: any, fallback: number): number {
    const val = Number.parseInt(input);
    return Number.isNaN(val) ? fallback : val;
}

export function formatUrl(domain: string, url: string): string {
    return url.includes(domain) ? url : `${domain}/${url}`;
}

export function formatPrice(price: string): number {
    return Number(price.replace(/[^0-9.]/g, ""));
}

export function formatQty(qty: string): number {
    return Number(qty.replace(/\D/g, ""));
}

export function parseBetweenStrings(stringToParse: string, prefixRegex: RegExp, suffixRegex: RegExp): string {
    let parsedString = stringToParse.replace(prefixRegex, "");
    parsedString = stringToParse.replace(suffixRegex, "");
    return parsedString;
}
