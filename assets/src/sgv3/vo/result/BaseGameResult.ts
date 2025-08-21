import { CommonGameResult } from './CommonGameResult';
import { ExtendInfoForBaseGameResult } from './ExtendInfoForBaseGameResult';

export class BaseGameResult extends CommonGameResult {
    baseGameTotalWin: number; //紀錄玩家此局獲得基數
    extendInfoForbaseGameResult: ExtendInfoForBaseGameResult; // 紀錄額外的baseGameResult
}
