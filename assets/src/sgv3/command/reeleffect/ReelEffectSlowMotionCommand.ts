import { GameDataProxy } from '../../proxy/GameDataProxy';
import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { GameScene } from '../../vo/data/GameScene';
import { FreeGameOneRoundResult } from '../../vo/result/FreeGameOneRoundResult';

/**
 * 解析數學資料是否包含瞇牌資訊
 */
export class ReelEffectSlowMotionCommand extends puremvc.SimpleCommand {
    public execute(notification: puremvc.INotification) {
        this.reelDataProxy.isSlowMotionAry = this.gameDataProxy.curRoundResult.displayInfo.displayMethod.reduce((prev, curr)=>prev.concat(curr), this.reelDataProxy.isSlowMotionAry);
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
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
