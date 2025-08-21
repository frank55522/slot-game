import { Betspec } from './Betspec';
import { CommonGameSetting } from './CommonGameSetting';

export class BaseGameSetting extends CommonGameSetting {
    public betSpec: Betspec; //紀錄遊戲押注限制
    // public baseGameExtendSetting: BaseGameExtendSetting; // by Game 的額外資訊
}
