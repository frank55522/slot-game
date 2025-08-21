import { _decorator } from 'cc';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
import { ReelDataProxy } from 'src/sgv3/proxy/ReelDataProxy';
import { ReelEvent } from 'src/sgv3/util/Constant';
import { ReelEffect_SymbolFeatureCommand } from './reelEffect/ReelEffect_SymbolFeatureCommand';
import { SeatInfo } from 'src/sgv3/vo/result/ExtendInfoForBaseGameResult';
// 最後一把 by game 的 symbol 特色資料
export class LastSymbolFeatureCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'LastSymbolFeatureCommand';

    public execute(notification: puremvc.INotification) {
        let seatInfo = this.gameDataProxy.initEventData.initialData.seatStatusCache.seatInfo;
        if (this.ballScreenLabel != null) {
            if (this.gameDataProxy.isOmniChannel()) {
                this.handleOmniChannel(seatInfo);
            } else {
                this.sendNotification(ReelEffect_SymbolFeatureCommand.NAME, this.ballScreenLabel);
            }
        }
        if (seatInfo.screenRngInfo) {
            let mysterySymbol = this.gameDataProxy.initEventData.initialData.seatStatusCache.mysterySymbol;
            this.sendNotification(ReelEvent.SHOW_LAST_SYMBOL_OF_REELS, {
                seatInfo: seatInfo,
                mysterySymbol: mysterySymbol
            });
        }
    }

    private handleOmniChannel(seatInfo: SeatInfo) {
        const tempDenomMultiplier = this.gameDataProxy.curDenomMultiplier;
        const tempFeatureBet = this.gameDataProxy.curFeatureBet;
        this.gameDataProxy.curDenomMultiplier = this.gameDataProxy.convertCredit2Cash(seatInfo.denomMultiplier);
        this.gameDataProxy.curFeatureBet = this.gameDataProxy.initEventData.featureBetList[seatInfo.featureIdx];
        this.sendNotification(ReelEffect_SymbolFeatureCommand.NAME, this.ballScreenLabel);
        this.gameDataProxy.curDenomMultiplier = tempDenomMultiplier;
        this.gameDataProxy.curFeatureBet = tempFeatureBet;
    }
    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
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

    protected _ballScreenLabel: Array<Array<number>> | null = null;
    protected get ballScreenLabel() {
        if (this._ballScreenLabel == null) {
            this._ballScreenLabel = this.gameDataProxy.initEventData.initialData.seatStatusCache.ballScreenLabel;
        }
        return this._ballScreenLabel;
    }
}
