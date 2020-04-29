// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseNumberOrDefault(input: any, fallback: number): number {
    const val = Number.parseInt(input);
    return Number.isNaN(val) ? fallback : val;
}
