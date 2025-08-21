import { UIEvent } from 'common-ui/proxy/UIEvent';
import { NetworkProxy } from '../../../core/proxy/NetworkProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WinEvent, ViewMediatorEvent } from '../../util/Constant';
import { GameStateId } from '../../vo/data/GameStateId';
import { AutoPlayOnSpinProcessCommand } from '../autoplay/AutoPlayOnSpinProcessCommand';
import { CheckGameFlowCommand } from '../CheckGameFlowCommand';
import { ClearRecoveryDataCommand } from '../recovery/ClearRecoveryDataCommand';
import { SpinRequestCommand } from '../spin/SpinRequestCommand';
import { StateCommand } from './StateCommand';
import { ButtonName } from 'common-ui/proxy/UIEnums';
import { SpinButton } from 'common-ui/view/SpinButton';

export class Game1SpinCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME1_EV_SPIN;

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        this.gameDataProxy.spinEventData = null;
        this.gameDataProxy.runWinComplete = false;
        this.gameDataProxy.readySpin = false;

        // 重連線中不允許spin
        if (this.gameDataProxy.isMaintaining) return;

        this.sendNotification(UIEvent.CHANGE_BUTTON_STATE, { name: ButtonName.SPIN, state: SpinButton.STATUS_STOP });
        this.sendNotification(WinEvent.FORCE_WIN_DISPOSE); // 清除之前的贏分表演
        //是否 Recovery表演流程
        if (
            this.gameDataProxy.reStateResult == undefined ||
            this.gameDataProxy.reStateResult.gameStateId == GameStateId.END
        ) {
            this.gameDataProxy.resetGameParams(); // 這邊為做贏分表演相關參數重置
            if (this.networkProxy.getCanSpinState()) {
                this.sendNotification(SpinRequestCommand.NAME);
            }
        } else {
            this.sendNotification(CheckGameFlowCommand.NAME); //有數學資料，表示取得 Recovery資料
            this.sendNotification(ClearRecoveryDataCommand.NAME); //完成 Recovery動作，清除資料
        }

        this.gameDataProxy.isSpinning = true;
        this.sendNotification(UIEvent.UPDATE_PLAYER_WIN, 0); //清除Win欄位
        this.sendNotification(ViewMediatorEvent.JACKPOT_WON_CLOSE); //清除jackpot贏分顯示

        if (this.gameDataProxy.onAutoPlay) {
            this.sendNotification(AutoPlayOnSpinProcessCommand.NAME);
        }
    }

    protected _networkProxy: NetworkProxy;
    protected get networkProxy(): NetworkProxy {
        if (!this._networkProxy) {
            this._networkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._networkProxy;
    }
}
