/**
 * 測試案例清單
 */
export class DefCase {
    public cases: Array<DefObj>;
    public tasks: Array<DefObj>;
}

/**
 * 測試項目的路徑對照
 */
export class DefObj {
    public name: string;
    public path: string;
}
