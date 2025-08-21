import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { ViewMediatorEvent } from '../../util/Constant';
import { GlobalTimer } from '../../util/GlobalTimer';
import { FreeGameOneRoundResult } from '../../vo/result/FreeGameOneRoundResult';
import { StateCommand } from './StateCommand';

export class Game2BeforeShowCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME2_EV_BEFORESHOW;

    protected timerKey = 'game2BeforeShow';

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();

        this.clearTimerKey(); //避免timer沒有清除的問題
        let freeGameOneRoundResult: FreeGameOneRoundResult = this.gameDataProxy
            .curRoundResult as FreeGameOneRoundResult;
        let sceneData = this.gameDataProxy.getSceneDataByName(this.gameDataProxy.curScene);

        //判斷fortuneLevel參數是否需要變動;
        if (
            this.gameDataProxy.lastFortuneLevel == null ||
            this.gameDataProxy.lastFortuneLevel != freeGameOneRoundResult.displayInfo.fortuneLevelType
        ) {
            this.gameDataProxy.lastFortuneLevel = freeGameOneRoundResult.displayInfo.fortuneLevelType;
            this.sendNotification(
                ViewMediatorEvent.FORTUNE_LEVEL_CHANGE,
                freeGameOneRoundResult.displayInfo.fortuneLevelType
            );
        }

        if (freeGameOneRoundResult.playerWin > 0) {
            this.changeState(StateMachineProxy.GAME2_SHOWWIN);
        } else {
            let stayTime = sceneData.noWinStayTime;
            GlobalTimer.getInstance()
                .registerTimer(
                    this.timerKey,
                    stayTime,
                    () => {
                        GlobalTimer.getInstance().removeTimer(this.timerKey);
                        this.changeState(StateMachineProxy.GAME2_END);
                    },
                    this
                )
                .start();
        }
    }

    private clearTimerKey() {
        GlobalTimer.getInstance().removeTimer(this.timerKey);
    }
}
