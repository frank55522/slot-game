import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { ScreenEvent } from '../../util/Constant';
import { IdelRemindCommand } from '../connect/IdelRemindCommand';
import { AutoPlayOnIdleProcessCommand } from '../autoplay/AutoPlayOnIdleProcessCommand';
import { StateCommand } from './StateCommand';
import { UIEvent } from 'common-ui/proxy/UIEvent';
import { ButtonName } from 'common-ui/proxy/UIEnums';
import { SpinButton } from 'common-ui/view/SpinButton';

export class Game1IdleCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME1_EV_IDLE;

    public execute(notification: puremvc.INotification): void {
        const self = this;
        self.gameDataProxy.canUpdateJackpotPool = true;
        self.notifyWebControl();
        /** 因為idle後會有jp所以採用狀態判斷 */
        if (self.stateMachineProxy.checkIdleRemind()) {
            self.sendNotification(IdelRemindCommand.NAME);
        }

        /** 判斷是否有 Recovery紀錄資料，需要進行處理 */
        if (this.gameDataProxy.spinEventData != undefined && this.gameDataProxy.reStateResult != null) {
            self.facade.sendNotification(ScreenEvent.ON_SPIN_DOWN); // 直接 Spin
            return;
        }

        // 重連線改寫
        if (self.gameDataProxy.isMaintaining) {
            if (self.gameDataProxy.onAutoPlay) {
                self.gameDataProxy.onAutoPlay = false;
                self.gameDataProxy.curAutoTimes = this.gameDataProxy.maxAutoTimes = 0;
                self.sendNotification(UIEvent.UPDATE_AUTO_PLAY_COUNT, 0);
                self.webBridgeProxy.updateWebAutoTimesSpan('pause');
            }
        } else if (this.gameDataProxy.onAutoPlay) {
            // AutoPlay 模式執行 IDLE 流程
            self.sendNotification(AutoPlayOnIdleProcessCommand.NAME);
        } else if (this.gameDataProxy.readySpin) {
            // 直接 Spin
            self.facade.sendNotification(ScreenEvent.ON_SPIN_DOWN);
        }
        self.sendNotification(UIEvent.CHANGE_BUTTON_STATE, { name: ButtonName.SPIN, state: SpinButton.STATUS_IDLE });
    }
}
