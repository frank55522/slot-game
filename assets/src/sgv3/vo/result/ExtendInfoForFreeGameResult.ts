import { ReSpinResult } from './ReSpinResult';
import { ReSpinScreenResult } from './ReSpinScreenResult';

export class ExtendInfoForFreeGameResult {
    public sideCreditBallScreenLabel: Array<Array<number>>;
    public accumulateCredit: number;
    public sideCreditBallCount: number;
    public isRetrigger: boolean;
    public isRespinFeature: boolean;
    public reSpinResult: ReSpinResult;
    public reSpinScreenResult: ReSpinScreenResult;
    public displayAccumulateWinBeforeRespin: number;
    public displayAccumulateWinAfterRespin: number;
    public extendPlayerWin: number;
    public specialFeatureIndex: number;
    public groupingIdx: number; // 紀錄每個Round中，group使用哪一個組合

}
