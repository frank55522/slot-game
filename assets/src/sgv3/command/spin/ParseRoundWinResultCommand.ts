import { GameSceneData } from '../../vo/config/GameSceneData';
import { GameStateSetting } from '../../vo/setting/GameStateSetting';

/**
 * 解析該 Round 贏線用於表演的資料
 */
export class ParseRoundWinResultCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'ParseRoundWinResultCommand';

    protected myInitSetting: GameStateSetting = null;
    protected mySceneData: GameSceneData = null;
}
