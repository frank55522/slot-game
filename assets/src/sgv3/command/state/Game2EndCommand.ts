import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WinEvent, StateWinEvent, ViewMediatorEvent, ReelEvent, FreeGameEvent } from '../../util/Constant';
import { GlobalTimer } from '../../util/GlobalTimer';
import { GameScene } from '../../vo/data/GameScene';
import { GameStateId } from '../../vo/data/GameStateId';
import { FreeGameOneRoundResult } from '../../vo/result/FreeGameOneRoundResult';
import { CheckGameFlowCommand } from '../CheckGameFlowCommand';
import { StateCommand } from './StateCommand';

export class Game2EndCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME2_EV_END;

    protected timerKey = 'game2End';

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        this.sendNotification(WinEvent.FORCE_WIN_DISPOSE); //結束關閉所有贏分線
        if (!this.gameDataProxy.curStateResult) {
            throw new Error('this.gameDataProxy.curStateResult is null');
        } else {
            if (this.gameDataProxy.curStateResult.gameStateId == GameStateId.END) {
                this.sendNotification(ViewMediatorEvent.SHOW_FREE_SPIN_MSG, GameScene.Game_2); //針對FG最後一場，進去Mini Game，在回來FG進行處理。
                this.playGame2EndBoard();
                return;
            }
            if (this.gameDataProxy.preScene == GameScene.Game_3) {
                this.sendNotification(ViewMediatorEvent.SHOW_FREE_SPIN_MSG, GameScene.Game_2);
                this.changeState(StateMachineProxy.GAME2_IDLE);
                return;
            }
            if (this.gameDataProxy.curStateResult.roundResult.length == 0) {
                //目前狀態的最後一場
                let idx = 0;
                while (idx < this.gameDataProxy.spinEventData.gameStateResult.length) {
                    if (!!this.gameDataProxy.spinEventData.gameStateResult[idx].gameSceneName) {
                        // 非真正最後一場，中途觸發special進行轉場景
                        // this.sendNotification(ReelEvent.FORCE_SHOW_ALL_SCREEN_SYMBOL);
                        this.endShowWinProcess();
                        this.sendNotification(CheckGameFlowCommand.NAME);
                        return;
                    }
                    idx++;
                }

                // this.sendNotification(ReelEvent.FORCE_SHOW_ALL_SCREEN_SYMBOL);
                this.endShowWinProcess();

                this.playGame2EndBoard();
            } else {
                const nextRoundResult = this.gameDataProxy.curStateResult.roundResult[0] as FreeGameOneRoundResult;
                if (nextRoundResult && nextRoundResult.extendInfoForFreeGameResult.isRespinFeature) {
                    this.sendNotification(FreeGameEvent.ON_EXPAND_WILD, nextRoundResult);

                    GlobalTimer.getInstance()
                        .registerTimer(
                            FreeGameEvent.ON_EXPAND_WILD,
                            1.5,
                            () => {
                                GlobalTimer.getInstance().removeTimer(FreeGameEvent.ON_EXPAND_WILD);
                                this.changeState(StateMachineProxy.GAME2_IDLE);
                            },
                            this
                        )
                        .start();
                } else {
                    this.sendNotification(ReelEvent.ON_REELS_INIT); //Reel Init
                    this.changeState(StateMachineProxy.GAME2_IDLE);
                }
            }
        }
    }

    /** 最後轉場回去要顯示在贏分線上處理 */
    protected endShowWinProcess() {}

    /** game2結束面板處理 */
    protected playGame2EndBoard() {
        let freeGameOneRoundResults = this.gameDataProxy.spinEventData.freeGameResult.freeGameOneRoundResult;
        if (
            freeGameOneRoundResults[freeGameOneRoundResults.length - 1].displayLogicInfo
                .afterAccumulateWinWithBaseGameWin == 0
        ) {
            this.showCompleteBoard();
        } else {
            this.showCreditBoard();
        }
        this.gameDataProxy.afterFeatureGame = true;
    }

    /** 有贏分顯示CreditBoard */
    protected showCreditBoard() {
        let sceneData = this.gameDataProxy.getSceneDataByName(GameScene.Game_2);
        let runningTime = sceneData.wonCreditBoardRunningTime + sceneData.wonCreditBoardEndTime;
        let freeGameOneRoundResults = this.gameDataProxy.spinEventData.freeGameResult.freeGameOneRoundResult;
        let cashAmount = this.gameDataProxy.convertCredit2Cash(
            freeGameOneRoundResults[freeGameOneRoundResults.length - 1].displayLogicInfo
                .afterAccumulateWinWithBaseGameWin
        );
        this.sendNotification(StateWinEvent.SHOW_LAST_CREDIT_BOARD, cashAmount);
        GlobalTimer.getInstance().registerTimer(this.timerKey, runningTime, this.delayCloseBoard, this).start();
    }

    /** 沒贏分顯示CompleteBoard */
    protected showCompleteBoard() {
        let sceneData = this.gameDataProxy.getSceneDataByName(GameScene.Game_2);
        let runningTime = sceneData.completeBoardRunningTime;
        this.sendNotification(StateWinEvent.SHOW_LAST_WIN_COMPLETE);
        GlobalTimer.getInstance().registerTimer(this.timerKey, runningTime, this.delayCloseBoard, this).start();
    }

    /** 延遲關閉面板處理 */
    protected delayCloseBoard() {
        GlobalTimer.getInstance().removeTimer(this.timerKey);

        let sceneData = this.gameDataProxy.getSceneDataByName(GameScene.Game_2);
        this.sendNotification(StateWinEvent.ON_GAME2_EXITING);
        GlobalTimer.getInstance()
            .registerTimer(
                this.timerKey,
                sceneData.completeFadeOutSceneTime,
                () => {
                    GlobalTimer.getInstance().removeTimer(this.timerKey);
                    this.sendNotification(ViewMediatorEvent.HIDE_ALL_BOARD);
                    this.sendNotification(ViewMediatorEvent.CLOSE_FREE_SPIN_MSG);
                    this.sendNotification(CheckGameFlowCommand.NAME);
                },
                this
            )
            .start();
    }
}
