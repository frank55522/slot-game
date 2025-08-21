import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { StateCommand } from './StateCommand';
import { GameScene } from '../../vo/data/GameScene';
import { TopUpGameOneRoundResult } from '../../vo/result/TopUpGameOneRoundResult';
import { LockType } from '../../vo/enum/Reel';
import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { DragonUpEvent } from '../../util/Constant';
export class Game4RollCompleteCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME4_EV_ROLLCOMPLETE;

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        let topUpGameOneRoundResult: TopUpGameOneRoundResult = this.gameDataProxy
            .curRoundResult as TopUpGameOneRoundResult;

        let curResult = this.reelDataProxy.symbolFeature;
        let count = 0;
        for (let x = 0; x < curResult.length; x++) {
            for (let y = 0; y < curResult[x].length; y++) {
                if (curResult[x][y].lockType == LockType.NEW_LOCK) {
                    count++;
                }
            }
        }

        if (count > 0) {
            this.sendNotification(DragonUpEvent.ON_C2_COUNT_UPDATE, count);
        }

        // 進入Roll代表可以重置preScene為當前的Scene
        this.gameDataProxy.preScene = GameScene.Game_4;

        // 判斷是否有特殊獎項 Mystery Grand
        let isHitGrand = this.gameDataProxy.isHitGrand();

        // 判斷是否有特殊獎項
        if (
            (!!topUpGameOneRoundResult && topUpGameOneRoundResult.extendInfoForTopUpGameResult.isRetrigger) ||
            isHitGrand
        ) {
            this.changeState(StateMachineProxy.GAME4_HITSPECIAL, isHitGrand);
            return;
        } else {
            this.changeState(StateMachineProxy.GAME4_BEFORESHOW);
        }
    }

    // ======================== Get Set ========================
    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }
}
