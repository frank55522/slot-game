import { Vec2, _decorator } from 'cc';
import { CheckGameFlowCommand } from '../../../sgv3/command/CheckGameFlowCommand';
import { ReelDataProxy } from '../../../sgv3/proxy/ReelDataProxy';
import { StateWinEvent, ViewMediatorEvent, WinEvent } from '../../../sgv3/util/Constant';
import { GlobalTimer } from '../../../sgv3/util/GlobalTimer';
import { GameScene } from '../../../sgv3/vo/data/GameScene';
import { GAME_GameDataProxy } from '../../proxy/GAME_GameDataProxy';

export class GAME_4_CreditCollectResultCommand extends puremvc.MacroCommand {
    public static readonly NAME = 'GAME_4_CreditCollectResultCommand';

    protected collecrtPerformSequence = new Array<Array<number>>();

    protected allCount = 0;

    protected curCount = 0;

    protected intervalTime = 0.55;
    protected skipIntervalTime = 0.15;
    protected arrayDatas = new Array<Array<any>>();

    public execute(notification: puremvc.INotification) {
        super.execute(notification);
        this.collecrtPerformSequence = [];
        this.arrayDatas = [];
        this.allCount = 0;
        this.curCount = 0;

        this.sendNotification(ViewMediatorEvent.COLLECT_CREDIT_BALL_SKIP_CALLBACK, () => this.onSkip());
        for (let i = 0; i < this.reelDataProxy.symbolFeature.length; i++) {
            for (let j = 0; j < this.reelDataProxy.symbolFeature[i].length; j++) {
                if (this.reelDataProxy.symbolFeature[i][j].creditCent > 0) {
                    let array = new Array<any>();
                    let pos = new Vec2(i, j);
                    let creditCent = this.reelDataProxy.symbolFeature[i][j].creditCent;
                    array.push(pos);
                    array.push(creditCent);
                    this.arrayDatas.push(array);
                    this.sendCreditCollectNotification(array);
                }
            }
        }
    }

    protected sendCreditCollectNotification(array: Array<number>) {
        this.allCount++;
        GlobalTimer.getInstance()
            .registerTimer(
                'CreditCollect_' + this.allCount,
                this.intervalTime * this.allCount,
                () => {
                    this.curCount++;
                    this.sendNotification(ViewMediatorEvent.COLLECT_CREDIT_BALL, array);
                    GlobalTimer.getInstance().removeTimer('CreditCollect_' + this.curCount);
                    this.checkShowResultBoard();
                },
                this
            )
            .start();
    }

    protected sendSkipCreditCollectNotification() {
        let count = 0;
        this.arrayDatas.forEach((value, key) => {
            let idx = key + 1;
            if (idx > this.curCount) {
                GlobalTimer.getInstance().removeTimer('CreditCollect_' + idx);
                GlobalTimer.getInstance()
                    .registerTimer(
                        'CreditCollect_' + idx,
                        this.skipIntervalTime * count,
                        () => {
                            this.curCount++;
                            this.sendNotification(ViewMediatorEvent.COLLECT_CREDIT_BALL, value);
                            GlobalTimer.getInstance().removeTimer('CreditCollect_' + this.curCount);
                            this.checkShowResultBoard();
                        },
                        this
                    )
                    .start();
                count++;
            }
        });
    }

    protected checkShowResultBoard() {
        if (this.curCount >= this.allCount) {
            GlobalTimer.getInstance()
                .registerTimer('checkGameEnd', this.intervalTime + 1, this.showCreditBoard, this)
                .start();
        }
    }

    /** 有贏分顯示CreditBoard */
    protected showCreditBoard() {
        GlobalTimer.getInstance().removeTimer('checkGameEnd');
        let sceneData = this.gameDataProxy.getSceneDataByName(GameScene.Game_4);
        let runningTime = sceneData.wonCreditBoardRunningTime + sceneData.wonCreditBoardEndTime;
        let totalWin: number = this.gameDataProxy.convertCredit2Cash(
            this.gameDataProxy.spinEventData.topUpGameResult.topUpGameTotalWin
        );
        this.sendNotification(StateWinEvent.SHOW_LAST_CREDIT_BOARD, totalWin);
        GlobalTimer.getInstance().registerTimer('showCreditBoard', runningTime, this.delayCloseBoard, this).start();
    }

    protected delayCloseBoard() {
        GlobalTimer.getInstance().removeTimer('showCreditBoard');
        this.sendNotification(WinEvent.FORCE_WIN_DISPOSE);
        this.sendNotification(CheckGameFlowCommand.NAME);
    }

    protected onSkip() {
        this.sendSkipCreditCollectNotification();
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GAME_GameDataProxy;
    protected get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }
}
