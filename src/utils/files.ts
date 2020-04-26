export function getFileType(fileName: string): string {
    // Return the file type with the '.' omitted, ie "cat.jpg" returns "jpg"
    const fileType = fileName.slice(fileName.lastIndexOf(".") + 1);
    // todo: potentially check against a set of allowed filetypes here instead
    if (fileType.length === 0) {
        throw new Error(`Invalid fileType for fileName ${fileName}`);
    }
    return fileType;
}

/*
 * Trim path after first occurrence of  given directory
 * Example: trimPath("/user/projects/MyApp/src/File1.txt", "src") returns "/user/projects/MyApp/src"
 */
export function trimPath(path: string, dir: string): string {
    const idx = path.indexOf(dir);
    if (idx === -1) {
        throw new Error(`File path ${path} does not include directory ${dir}`);
    }
    return path.substring(0, idx + dir.length);
}
export function removeExtension(file: string): string {
    const lastIndex = file.lastIndexOf(".");
    if (lastIndex < 0) {
        return file;
    }
    return file.slice(0, lastIndex);
}
