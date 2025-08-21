import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { ReelEvent } from '../../util/Constant';

export class PrizePredictionCompleteCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'PrizePredictionCompleteCommand';

    public execute(notification: puremvc.INotification) {
        this.sendNotification(ReelEvent.ON_REEL_EFFECT_COMPLETE);
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
