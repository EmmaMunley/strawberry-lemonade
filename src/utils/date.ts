// todo: undo this fuckery
export function timestampToSwiftApprovedFormat(timestamp: string): string {
    const isoString = new Date(timestamp).toISOString();
    const millisRegex = /\.[\d]*/;
    // swift UI doesn't like millisecond precision https://stackoverflow.com/questions/46537790/iso8601-date-json-decoding-using-swift4
    return isoString.replace(millisRegex, "");
}
