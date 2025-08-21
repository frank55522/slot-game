import { Vec2 } from 'cc';
import { StateMachineObject } from '../../../core/proxy/CoreStateMachineProxy';
import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { DragonUpEvent, WinEvent } from '../../util/Constant';
import { GlobalTimer } from '../../util/GlobalTimer';
import { SpecialHitInfo } from '../../vo/enum/SpecialHitInfo';
import { BonusGameOneRoundResult } from '../../vo/result/BonusGameOneRoundResult';
import { TopUpGameOneRoundResult } from '../../vo/result/TopUpGameOneRoundResult';
import { StateCommand } from './StateCommand';

export class Game4HitSpecialCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME4_EV_HITSPECIAL;

    protected timerKey_Retrigger = 'game4RetriggerIndex:';

    protected timerKey_Retrigger_End = 'game4Retriggerend';

    protected retriggertime: number = 2;

    public execute(notification: puremvc.INotification): void {
        let isHitGrand: boolean = (notification.getBody() as StateMachineObject).body;
        this.notifyWebControl();

        if (isHitGrand) {
            // 滿盤 Hit Grand
            const getGrand = (oneRoundResult: BonusGameOneRoundResult) =>
                oneRoundResult.specialHitInfo == SpecialHitInfo[SpecialHitInfo.bonusGame_02];
            // only Hit Grand in one game cycle
            let grandCash =
                this.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult.find(
                    getGrand
                ).oneRoundJPTotalWin;
            this.sendNotification(WinEvent.ON_HIT_GRAND, {
                grandCash: grandCash,
                callback: this.endGame4HitGrand.bind(this)
            });
        } else {
            // ReSpin
            this.doReSpin();
        }
    }

    protected doReSpin() {
        let isMaxReSpinInfo = (this.gameDataProxy.curRoundResult as TopUpGameOneRoundResult)
            .extendInfoForTopUpGameResult.maxTriggerCountFlag;
        let posSymbolResult = this.reelDataProxy.symbolFeature;
        let lastXY: Vec2 = this.getLastReSpinXY;
        let num = 0;
        for (let x = 0; x < posSymbolResult.length; x++) {
            for (let y = 0; y < posSymbolResult[x].length; y++) {
                let reSpinNum = posSymbolResult[x][y].ReSpinNum;
                if (reSpinNum > 0) {
                    let index = y * this.reelDataProxy.symbolFeature.length + x;
                    let targertXY = new Vec2(x, y);
                    let isMaxReSpin = lastXY.x == targertXY.x && lastXY.y == targertXY.y && isMaxReSpinInfo;
                    GlobalTimer.getInstance()
                        .registerTimer(
                            String(this.timerKey_Retrigger + index),
                            this.retriggertime * num,
                            () => this.onRespinNext(targertXY, isMaxReSpin),
                            this
                        )
                        .start();
                    num++;
                }
            }
        }
        GlobalTimer.getInstance()
            .registerTimer(String(this.timerKey_Retrigger_End), this.retriggertime * num + 1, this.onReSpinEnd, this)
            .start();
    }

    protected onRespinNext(xy: Vec2, isMaxReSpin: boolean) {
        let index = xy.y * this.reelDataProxy.symbolFeature.length + xy.x;
        let infoArray: Array<any> = [];
        infoArray.push(xy);
        infoArray.push(isMaxReSpin);
        GlobalTimer.getInstance().removeTimer(String(this.timerKey_Retrigger + index));
        this.sendNotification(DragonUpEvent.ON_RESPIN_NEXT_START, infoArray);
    }

    protected onReSpinEnd() {
        GlobalTimer.getInstance().removeTimer(String(this.timerKey_Retrigger_End));
        this.changeState(StateMachineProxy.GAME4_BEFORESHOW);
    }

    protected endGame4HitGrand() {
        // 移除已經表演過的bonus資料
        const removeResult = (result: BonusGameOneRoundResult) =>
            result.specialHitInfo != SpecialHitInfo[SpecialHitInfo.bonusGame_02];
        this.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult =
            this.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult.filter(removeResult);

        this.doReSpin();
    }
    // ======================== Get Set ========================

    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }

    protected get getLastReSpinXY() {
        let posSymbolResult = this.reelDataProxy.symbolFeature;
        for (let x = posSymbolResult.length - 1; x >= 0; x--) {
            for (let y = posSymbolResult[x].length - 1; y >= 0; y--) {
                let reSpinNum = posSymbolResult[x][y].ReSpinNum;
                if (reSpinNum > 0) {
                    return new Vec2(x, y);
                }
            }
        }
        return new Vec2(-1, -1);
    }
}
