export class SpecialFeatureResult {
    public specialHitInfo: string; // 記錄此局中了哪種特殊Feature。
    public specialOperations: string[]; // 玩家可以選擇的選項資訊
    public specialScreenHitData: Array<Array<boolean>>;
    public specialScreenWin: number;
}
