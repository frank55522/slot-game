import { BigWinType } from '../enum/BigWinType';

/**
 * 顯示分級面板且滾分
 * @param _type 面板類型
 * @param _startAmount 開始金額
 * @param _totalAmount 完成金額
 * @param _runningTime 過程時間
 */
export class WinBoardData {
    _type: BigWinType;
    _startAmount: number;
    _totalAmount: number;
    _runningTime: number;
}
