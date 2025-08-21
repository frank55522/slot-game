import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { StateWinEvent, ViewMediatorEvent } from '../../util/Constant';
import { ClearRecoveryDataCommand } from '../recovery/ClearRecoveryDataCommand';
import { StateCommand } from './StateCommand';
// import { ClearRecoveryDataCommand } from '../recovery/ClearRecvoeryDataCommand';
export class Game3IdleCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME3_EV_IDLE;

    public execute(notification: puremvc.INotification): void {
        const self = this;
        self.notifyWebControl();

        // 由場景狀態判斷是否剛進入 Game_3
        if (self.gameDataProxy.preScene != self.gameDataProxy.curScene) {
            self.sendNotification(StateWinEvent.ON_GAME3_SHOW_INFO, true);
            //判斷是否需要重置牌面
            if (self.gameDataProxy.reStateResult) {
                self.sendNotification(ViewMediatorEvent.RECOVERY_LOAD_VIEW);
                self.sendNotification(ClearRecoveryDataCommand.NAME); //完成 Recovery動作，清除資料
            }
            return;
        }
    }
}
