export class SheetList {
    public files: Array<FileItem>;
}

export class FileItem {
    public kind: string;
    public id: string;
    public name: string;
    public mimeType: string;
}
