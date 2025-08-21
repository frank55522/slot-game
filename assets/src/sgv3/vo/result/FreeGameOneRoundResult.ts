import { DisplayInfo } from '../info/DisplayInfo';
import { DisplayLogicInfo } from '../info/DisplayLogicInfo';
import { RoundInfo } from '../info/RoundInfo';
import { CommonGameResult } from './CommonGameResult';
import { ExtendInfoForFreeGameResult } from './ExtendInfoForFreeGameResult';

export class FreeGameOneRoundResult extends CommonGameResult {
    playerWin: number; // 紀錄此Round中玩家獨得的基數
    displayLogicInfo: DisplayLogicInfo; //紀錄表演邏輯資訊
    roundInfo: RoundInfo; //紀錄freeGame的局號資訊。(包本局局號、總局數、本局增加局數)
    extendInfoForFreeGameResult: ExtendInfoForFreeGameResult; // 紀錄外的freeGameResult，即不同的遊戲訊息
    displayInfo: DisplayInfo;
    specialHitInfo: string; // free game 類型
}
