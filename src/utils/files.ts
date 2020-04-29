import path from "path";

// Return the file type with the '.' omitted, ie "cat.jpg" returns "jpg"
export function getFileType(fileName: string): string {
    const fileType = fileName.slice(fileName.lastIndexOf(".") + 1);
    if (fileType.length === 0) {
        throw new Error(`Invalid fileType for fileName ${fileName}`);
    }
    return fileType;
}

/**
 * Appends slash to start and end of string if not present
 */
function appendSlashes(str: string): string {
    let res = str;
    if (!str.startsWith("/")) {
        res = "/" + res;
    }
    return res.endsWith("/") ? res : res + "/";
}

/*
 * Shrinks the file path to begin from the last instance of the given dirName
 * Example: shrinkPath("/User/Desktop/project/nodes/project/foo/bar.js", "project")
 * returns "foo/bar.js"
 */
export function shrinkPath(directory: string, filePath: string): string {
    if (directory.length === 0) {
        throw new Error("Directory cannot have a length of  0");
    }
    const fp = path.normalize(filePath);
    const dir = appendSlashes(path.normalize(directory));

    const lastIndex = fp.lastIndexOf(dir);
    if (lastIndex < 0) {
        throw new Error(`File path ${fp} does not include directory ${dir}`);
    }
    const startIndex = lastIndex + dir.length;
    return filePath.slice(startIndex);
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
