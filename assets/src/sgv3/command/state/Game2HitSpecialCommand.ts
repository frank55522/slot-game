import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WinEvent, ViewMediatorEvent } from '../../util/Constant';
import { GlobalTimer } from '../../util/GlobalTimer';
import { FreeGameOneRoundResult } from '../../vo/result/FreeGameOneRoundResult';
import { StateCommand } from './StateCommand';

export class Game2HitSpecialCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME2_EV_HITSPECIAL;

    protected timerKey_Retrigger = 'game2HitSpecialRetrigger';

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        this.showRetrigger();
        // 通知ui要做hitSpecial表演
        this.sendNotification(WinEvent.ON_HIT_SPECIAL);
    }

    /** 觸發 Retriger事件處理 */
    protected showRetrigger(): void {
        //GlobalTimer.getInstance().removeTimer(this.timerKey_Retrigger);
        this.sendNotification(WinEvent.FORCE_WIN_DISPOSE);
        // this.sendNotification(ReelEvent.FORCE_SHOW_ALL_SCREEN_SYMBOL);
        this.notifyGame2RoundInfo();
        const sceneData = this.gameDataProxy.getSceneDataByName(this.gameDataProxy.curScene);
        GlobalTimer.getInstance()
            .registerTimer(this.timerKey_Retrigger, sceneData.retriggerBoardRunningTime, this.endShowRetriger, this)
            .start();
    }

    /** 通知game2 場次 */
    protected notifyGame2RoundInfo() {
        if (!this.gameDataProxy.curRoundResult) return;

        let freeGameOneRoundResult = this.gameDataProxy.curRoundResult as FreeGameOneRoundResult;
        if (freeGameOneRoundResult && freeGameOneRoundResult.roundInfo) {
            const readyAddTimes: number = freeGameOneRoundResult.roundInfo.addRound;
            const curTotalTimes: number = freeGameOneRoundResult.roundInfo.totalRound;
            const sceneData = this.gameDataProxy.getSceneDataByName(this.gameDataProxy.curScene);
            this.sendNotification(ViewMediatorEvent.SHOW_RETRIGGER_BOARD, [
                readyAddTimes,
                curTotalTimes,
                sceneData.retriggerBoardRunningTime
            ]);
        }
    }

    /** show Retriger後處理 */
    protected endShowRetriger() {
        GlobalTimer.getInstance().removeTimer(this.timerKey_Retrigger);
        // 達到最大場次，Web 顯示 ICON.
        let nextRoundResult: FreeGameOneRoundResult =
            this.gameDataProxy.curStateResult.roundResult.length > 0
                ? (this.gameDataProxy.curStateResult.roundResult[0] as FreeGameOneRoundResult)
                : null;
        if (nextRoundResult && nextRoundResult.displayLogicInfo.maxTriggerCountFlag) {
            this.webBridgeProxy.setElementDisplayById('maxSpinIcon', 'inline-block');
        }
        // 關閉面板
        this.sendNotification(ViewMediatorEvent.HIDE_ALL_BOARD);
        this.changeState(StateMachineProxy.GAME2_BEFORESHOW);
    }
}
