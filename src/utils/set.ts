export function isSubset<T>(subset: Array<T>, arr: Array<T>): boolean {
    return new Set([...subset, ...arr]).size === arr.length;
}
