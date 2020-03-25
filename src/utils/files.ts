export function getFileType(fileName: string): string {
    // Return the file type with the '.' omitted, ie "cat.jpg" returns "jpg"
    const fileType = fileName.slice(fileName.lastIndexOf(".") + 1);
    // todo: potentially check against a set of allowed filetypes here instead
    if (fileType.length === 0) {
        throw new Error(`Invalid fileType for fileName ${fileName}`);
    }
    return fileType;
}
