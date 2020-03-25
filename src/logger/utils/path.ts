import path from "path";

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

export function removeExtension(file: string): string {
    const lastIndex = file.lastIndexOf(".");
    if (lastIndex < 0) {
        return file;
    }
    return file.slice(0, lastIndex);
}
