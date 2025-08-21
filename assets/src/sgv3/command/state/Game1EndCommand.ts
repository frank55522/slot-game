import { Logger } from '../../../core/utils/Logger';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { CheckGameFlowCommand } from '../CheckGameFlowCommand';
import { TakeWinCommand } from '../balance/TakeWinCommand';
import { StateCommand } from './StateCommand';
import { NetworkProxy } from '../../../core/proxy/NetworkProxy';
import { GameStateId } from '../../vo/data/GameStateId';

export class Game1EndCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME1_EV_END;

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        /** 判斷是否有 Recovery紀錄資料，需要進行處理 */
        if (
            this.gameDataProxy.spinEventData != undefined &&
            this.gameDataProxy.reStateResult?.gameStateId == GameStateId.WAIT_FOR_CLIENT
        ) {
            this.changeState(StateMachineProxy.GAME1_FEATURESELECTION);
            return;
        }

        if (this.gameDataProxy.spinEventData.gameStateResult.length > 0) {
            this.sendNotification(CheckGameFlowCommand.NAME);
        } else {
            // 此處非Game1場景轉場後才會進來
            Logger.i('已無遊戲狀態需表演 狀態切換為 Idle.(觸發此位置，原因應該為別的場景轉場回 Game_1 然後滾分滾滿)');
            //贏分加入表底
            //針對MiniGame結束回BaseGame的表演流程
            this.sendNotification(TakeWinCommand.NAME);
            this.changeState(StateMachineProxy.GAME1_IDLE);
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
