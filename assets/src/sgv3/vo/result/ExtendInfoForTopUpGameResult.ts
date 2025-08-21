export class ExtendInfoForTopUpGameResult {
    public maxTriggerCountFlag: boolean;
    public isRetrigger: boolean;
    public goldReSpin: number;
    public accumulateMultiplier: number;
    public accumulateCredit: number;
    public goldCreditBallScreenLabel: Array<Array<number>>;
    public goldMultiplierScreenLabel: Array<Array<number>>;
    public addReSpinScreenLabel: Array<Array<number>>;
    public extendPlayerWin: number;
    public specialFeatureIndex: number;
    public groupingIdx: number; // 紀錄每個Round中，group使用哪一個組合
}
