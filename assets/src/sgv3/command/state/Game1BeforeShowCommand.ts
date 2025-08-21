import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { ViewMediatorEvent } from '../../util/Constant';
import { GlobalTimer } from '../../util/GlobalTimer';
import { BaseGameResult } from '../../vo/result/BaseGameResult';
import { StateCommand } from './StateCommand';

export class Game1BeforeShowCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME1_EV_BEFORESHOW;

    protected timerKey = 'game1BeforeShow';

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();

        this.clearTimerKey(); //避免 timer沒有清除的問題

        let baseGameResult: BaseGameResult = this.gameDataProxy.curRoundResult as BaseGameResult;
        //判斷fortuneLevel參數是否需要變動;
        if (
            this.gameDataProxy.lastFortuneLevel == null ||
            this.gameDataProxy.lastFortuneLevel != baseGameResult.displayInfo.fortuneLevelType
        ) {
            this.gameDataProxy.lastFortuneLevel = baseGameResult.displayInfo.fortuneLevelType;
            this.sendNotification(ViewMediatorEvent.FORTUNE_LEVEL_CHANGE, baseGameResult.displayInfo.fortuneLevelType);
        }

        if (baseGameResult.baseGameTotalWin > 0 || this.gameDataProxy.isHitSpecial()) {
            this.changeState(StateMachineProxy.GAME1_SHOWWIN);
        } else {
            this.changeState(StateMachineProxy.GAME1_END);
        }
    }

    private clearTimerKey() {
        GlobalTimer.getInstance().removeTimer(this.timerKey);
    }
}
