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
