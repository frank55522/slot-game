import { CommonGameSetting } from './CommonGameSetting';
import { FreeGameExtendSetting } from './FreeGameExtendSetting';

export class FreeGameSetting extends CommonGameSetting {
    public vlineTable: Array<Array<number>>; // 紀錄垂直線型 vlineTable[i][j] = k 表示第i條線第j列是k行。
    public freeGameExtendSetting: FreeGameExtendSetting; // by Game 的額外資訊
}
