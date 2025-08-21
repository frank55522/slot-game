import { PrizePredictionViewMediator } from 'src/game/mediator/PrizePredictionViewMediator';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { ReelEvent } from '../../util/Constant';

export class ReelEffectPrizePredictionCommand extends puremvc.SimpleCommand {
    public execute(notification: puremvc.INotification) {
        //送出大獎預告表演通知
        let hasMediator = this.facade.hasMediator(PrizePredictionViewMediator.NAME);
        if (this.gameDataProxy.curRoundResult.displayInfo.prizePredictionType == 'TYPE_1' && hasMediator) {
            this.sendNotification(ReelEvent.ON_REEL_PRIZE_PREDICTION);
        } else {
            this.sendNotification(ReelEvent.ON_REEL_EFFECT_COMPLETE);
        }
    }

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
