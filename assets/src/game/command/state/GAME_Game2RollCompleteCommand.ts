import { _decorator, Vec3 } from 'cc';
import { ReelDataProxy } from '../../../sgv3/proxy/ReelDataProxy';
import { StateMachineProxy } from '../../../sgv3/proxy/StateMachineProxy';
import { FreeGameEvent } from '../../../sgv3/util/Constant';
import { GlobalTimer } from '../../../sgv3/util/GlobalTimer';
import { GameScene } from '../../../sgv3/vo/data/GameScene';
import { FreeGameOneRoundResult } from '../../../sgv3/vo/result/FreeGameOneRoundResult';
import { WAY_Game2RollCompleteCommand } from '../../../sgv3way/command/state/WAY_Game2RollCompleteCommand';
import { FreeGameSpecialInfo } from '../../vo/FreeGameSpecialInfo';
const { ccclass } = _decorator;

@ccclass('GAME_Game2RollCompleteCommand')
export class GAME_Game2RollCompleteCommand extends WAY_Game2RollCompleteCommand {
    private freeGameSpecialInfo: FreeGameSpecialInfo;

    readonly timeKey_sideBallShow = 'timeKey_sideBallShow';
    readonly sideBallShowTimeOut = 0.5;

    readonly timeKey_sideBallShowAfter = 'timeKey_sideBallShowAfter';
    readonly sideBallAfterTimeOut = 0.3;

    readonly timeKey_sideBallShowEnd = 'timeKey_sideBallShowEnd';
    readonly sideBallShowEndTimeOut = 1;

    public execute(notification: puremvc.INotification): void {
        //super.execute(notification);
        this.notifyWebControl();

        // 進入Roll代表可以重置preScene為當前的Scene
        this.gameDataProxy.preScene = GameScene.Game_2;

        let freeGameSpecialInfo: FreeGameSpecialInfo = this.getSpecialInfo();
        this.freeGameSpecialInfo = freeGameSpecialInfo;

        // 判斷是否有角落球需要先show
        if (freeGameSpecialInfo.hitBall.isShowHitBall) {
            GlobalTimer.getInstance()
                .registerTimer(this.timeKey_sideBallShow, this.sideBallShowTimeOut, this.showSideBall, this)
                .start();
        } else {
            this.sendNotification(FreeGameEvent.ON_SIDE_BALL_SHOW, this.freeGameSpecialInfo);
            this.nextState();
        }
    }

    // 因damping後銜接動畫破綻問題, 暫時用timer解
    private showSideBall() {
        GlobalTimer.getInstance().removeTimer(this.timeKey_sideBallShow);
        this.sendNotification(FreeGameEvent.ON_SIDE_BALL_SHOW, this.freeGameSpecialInfo);

        GlobalTimer.getInstance()
            .registerTimer(this.timeKey_sideBallShowAfter, this.sideBallAfterTimeOut, this.showHitSpecialAfter, this)
            .start();

        GlobalTimer.getInstance()
            .registerTimer(this.timeKey_sideBallShowEnd, this.sideBallShowEndTimeOut, this.nextState, this)
            .start();
    }

    // 隱藏滾輪上燃燒球
    private showHitSpecialAfter() {
        GlobalTimer.getInstance().removeTimer(this.timeKey_sideBallShowAfter);
        this.facade.sendNotification(FreeGameEvent.ON_SIDE_BALL_SHOW_AFTER);
    }

    private nextState() {
        GlobalTimer.getInstance().removeTimer(this.timeKey_sideBallShowEnd);
        if (this.freeGameSpecialInfo.retrigger.isRetrigger || this.freeGameSpecialInfo.isHitGrand) {
            this.changeState(StateMachineProxy.GAME2_HITSPECIAL, this.freeGameSpecialInfo);
        } else {
            this.changeState(StateMachineProxy.GAME2_BEFORESHOW);
        }
    }

    // 取得 特色 表演資訊
    private getSpecialInfo() {
        let freeGameOneRoundResult = this.gameDataProxy.curRoundResult as FreeGameOneRoundResult;

        let sideCreditBall: Array<Array<number>> =
            freeGameOneRoundResult.extendInfoForFreeGameResult.sideCreditBallScreenLabel;

        let sideCreditBallPos: Array<Array<Vec3>> = new Array();

        let freeGameSpecialInfo: FreeGameSpecialInfo = new FreeGameSpecialInfo();

        // 判斷是否有retrigger
        freeGameSpecialInfo.retrigger.isRetrigger = freeGameOneRoundResult.extendInfoForFreeGameResult.isRetrigger;
        freeGameSpecialInfo.retrigger.addRound = freeGameOneRoundResult.roundInfo.addRound;

        // 判斷是否有角落球
        for (let i = 0; i < sideCreditBall.length; i++) {
            sideCreditBallPos[i] = new Array();
            for (let j = 0; j < sideCreditBall[i].length; j++) {
                if (sideCreditBall[i][j] > 0) {
                    freeGameSpecialInfo.hitBall.isShowHitBall = true;
                    sideCreditBall[i][j] = this.gameDataProxy.convertCredit2Cash(sideCreditBall[i][j]);
                    if (this.gameDataProxy.isOmniChannel()) {
                        sideCreditBall[i][j] = this.gameDataProxy.getCreditByDenomMultiplier(sideCreditBall[i][j]);
                    }
                }
                sideCreditBallPos[i].push(this.reelDataProxy.getFovLocalPos(i, j));
            }
        }

        freeGameSpecialInfo.hitBall.sideCreditBall = sideCreditBall;
        freeGameSpecialInfo.hitBall.sideCreditBallPos = sideCreditBallPos;

        // 判斷是否有特殊獎項 Mystery Grand
        freeGameSpecialInfo.isHitGrand = this.gameDataProxy.isHitGrand();

        return freeGameSpecialInfo;
    }

    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }
}
