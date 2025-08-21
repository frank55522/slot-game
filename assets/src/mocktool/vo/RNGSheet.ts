/**
 * RNG sheet的物件結構
 */
export class RNGSheet {
    public sheets: Sheet[];
}

export class Sheet {
    public data: SheetData[];
}

export class SheetData {
    public rowData: RowData[];
}
export class RowData {
    public values: { formattedValue: string }[];
}
