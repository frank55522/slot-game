import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WinEvent, ReelEvent, FreeGameEvent } from '../../util/Constant';
import { FreeGameOneRoundResult } from '../../vo/result/FreeGameOneRoundResult';
import { ScoringHandleCommand } from '../byGame/ScoringHandleCommand';
import { StateCommand } from './StateCommand';

export class Game2ShowWinCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME2_EV_SHOWWIN;
    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();

        this.showView();
    }

    /** 通知show線 */
    protected showView() {
        // 輪播贏分 Symbol
        let winType = this.gameDataProxy.curRoundResult.displayInfo.winType;
        if (winType > 0) {
            this.sendNotification(ReelEvent.SHOW_ALL_REELS_WIN, this.gameDataProxy.curWinData);
        }
    }
}
