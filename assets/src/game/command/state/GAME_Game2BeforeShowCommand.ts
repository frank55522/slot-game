import { _decorator } from 'cc';
import { Game2BeforeShowCommand } from '../../../sgv3/command/state/Game2BeforeShowCommand';
import { ReelDataProxy } from '../../../sgv3/proxy/ReelDataProxy';
import { StateMachineProxy } from '../../../sgv3/proxy/StateMachineProxy';
import { FreeGameEvent, ViewMediatorEvent } from '../../../sgv3/util/Constant';
import { GlobalTimer } from '../../../sgv3/util/GlobalTimer';
import { FreeGameOneRoundResult } from '../../../sgv3/vo/result/FreeGameOneRoundResult';
const { ccclass } = _decorator;

@ccclass('GAME_Game2BeforeShowCommand')
export class GAME_Game2BeforeShowCommand extends Game2BeforeShowCommand {
    protected timerKey = 'game2BeforeShow';

    public execute(notification: puremvc.INotification): void {
        let self = this;

        self.notifyWebControl();

        self.GAME_clearTimerKey(); //避免timer沒有清除的問題

        if (self.isBallScoreShow() || self.isWildShow()) {
            self.sendNotification(FreeGameEvent.ON_SIDE_BALL_SCORE_SHOW, self.beforeShow.bind(self));
        } else {
            self.beforeShow();
        }
    }

    private beforeShow() {
        this.notifyWebControl();

        this.GAME_clearTimerKey();

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

        if (this.gameDataProxy.curWinData.totalAmount() > 0) {
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
    private GAME_clearTimerKey() {
        GlobalTimer.getInstance().removeTimer(this.timerKey);
    }

    // 取得 角落球、retrigger、wild 表演資訊flag

    private isBallScoreShow() {
        let freeGameOneRoundResult = this.gameDataProxy.curRoundResult as FreeGameOneRoundResult;
        let sideCreditBall: Array<Array<number>> =
            freeGameOneRoundResult.extendInfoForFreeGameResult.sideCreditBallScreenLabel;
        for (let i = 0; i < sideCreditBall.length; i++) {
            for (let j = 0; j < sideCreditBall[i].length; j++) {
                if (sideCreditBall[i][j] > 0) {
                    return true;
                }
            }
        }
    }

    private isWildShow() {
        let freeGameOneRoundResult = this.gameDataProxy.curRoundResult as FreeGameOneRoundResult;

        // 判斷是否有wild加倍
        if (freeGameOneRoundResult.waysGameResult.waysResult.length > 0) {
            for (let i = 0; i < freeGameOneRoundResult.screenSymbol[2].length; i++) {
                if (freeGameOneRoundResult.screenSymbol[2][i] == 0) {
                    return true;
                }
            }
        }
    }

    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }
}
