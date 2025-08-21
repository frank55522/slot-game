import { CommonGameResult } from './CommonGameResult';
import { HoldSpinGameResult } from './HoldSpinGameResult';
import { RoundInfo } from '../info/RoundInfo';
import { ExtendInfoForTopUpGameResult } from './ExtendInfoForTopUpGameResult';

export class TopUpGameOneRoundResult extends CommonGameResult {
    playerWin: number; // 紀錄此Round中玩家獨得的基數
    holdSpinGameResult: HoldSpinGameResult;
    roundInfo: RoundInfo; //紀錄freeGame的局號資訊。(包本局局號、總局數、本局增加局數)
    extendInfoForTopUpGameResult: ExtendInfoForTopUpGameResult;
}
