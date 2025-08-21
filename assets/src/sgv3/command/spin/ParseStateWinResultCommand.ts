import { GameSceneData } from '../../vo/config/GameSceneData';
import { GameStateSetting } from '../../vo/setting/GameStateSetting';

/**
 * 遊戲狀態中包含兩個以上遊戲類型時，準備好遊戲類型都跑完後，回到初始畫面(預設:Game_1)時要表演的資料
 */
export class ParseStateWinResultCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'ParseStateWinResultCommand';

    protected myInitSetting: GameStateSetting = null;
    protected mySceneData: GameSceneData = null;
}
