import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { ViewMediatorEvent } from '../../util/Constant';
import { GameStateId } from '../../vo/data/GameStateId';
import { StateCommand } from './StateCommand';

export class Game4EndCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME4_EV_END;

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        if (!this.gameDataProxy.curStateResult) {
            throw new Error('this.gameDataProxy.curStateResult is null');
        } else {
            if (this.gameDataProxy.curStateResult.gameStateId == GameStateId.END) {
                return;
            }
            if (this.gameDataProxy.curStateResult.roundResult.length == 0) {
                this.onBonusGameEnd();//進行結算流程            
            } else {
                this.onBonusGameIdle();
            }
        }
    }

    protected onBonusGameEnd(){
        this.sendNotification(ViewMediatorEvent.CLOSE_FREE_SPIN_MSG);
        this.gameDataProxy.afterFeatureGame = true;
    }

    protected onBonusGameIdle(){
        this.changeState(StateMachineProxy.GAME4_IDLE);
    }
}
