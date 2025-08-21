import { ScreenEvent } from 'src/sgv3/util/Constant';
import { DemoProxy } from '../proxy/DemoProxy';
import { UIEvent } from 'common-ui/proxy/UIEvent';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
import { NetworkProxy } from 'src/core/proxy/NetworkProxy';

export class DemoStartCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'DemoStartCommand';

    public execute(notification: puremvc.INotification): void {
        let totalBet = notification.getBody().totalBet;
        let rng = notification.getBody().rng;
        if (rng) {
            this.setRNG(rng);
        } else {
            this.demoProxy.demo();
        }
        if (this.gameDataProxy.isOmniChannel()) {
            let denom = notification.getBody().denom;
            let multiplier = notification.getBody().multiplier;
            let featureBet = notification.getBody().featureBet;
            this.gameDataProxy.resetBetInfo(totalBet, denom, multiplier, featureBet);
        } else {
            let index = this.gameDataProxy.totalBetList.findIndex((betIndex) => betIndex == totalBet);
            this.gameDataProxy.totalBetIdx = index;
            this.gameDataProxy.resetBetInfo(this.gameDataProxy.totalBetList[index]);
        }
        this.sendNotification(UIEvent.UPDATE_TOTAL_BET, this.gameDataProxy.curTotalBet);
        this.sendNotification(ScreenEvent.ON_BET_CHANGE);
        this.sendNotification(ScreenEvent.ON_SPIN_DOWN);
    }

    private setRNG(rng: number[]): void {
        const self = this;

        const netProxy = self.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        if (netProxy && netProxy.isConnected()) {
            netProxy.sendRngRequest(rng);
        }
    }

    // ======================== Get Set ========================

    private _demoProxy: DemoProxy;
    private get demoProxy(): DemoProxy {
        if (!this._demoProxy) {
            this._demoProxy = this.facade.retrieveProxy(DemoProxy.NAME) as DemoProxy;
        }
        return this._demoProxy;
    }

    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
