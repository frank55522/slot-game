import { SpinRequestCommand } from '../../sgv3/command/spin/SpinRequestCommand';
import { WAY_GameDataProxy } from '../proxy/WAY_GameDataProxy';

export class WAY_SpinRequestCommand extends SpinRequestCommand {
    /**
     * 送出request
     */
    protected sendRequest(): void {
        this.gameDataProxy.spinEventData = null;
        this.gameDataProxy.playerTotalWin = -1;

        let extraBetType = this.gameDataProxy.curExtraBet;
        let playBet = this.gameDataProxy.convertCash2Credit(this.gameDataProxy.curTotalBet);
        let denom = this.gameDataProxy.curDenom;
        let operationRequest = this.gameDataProxy.curGameOperation;
        let wayColumn = this.gameDataProxy.curLine;
        let wayBet = this.gameDataProxy.curBet;
        let denomMultiplier = this.gameDataProxy.convertCash2Credit(this.gameDataProxy.curDenomMultiplier);
        let featureBet = this.gameDataProxy.curFeatureBet;

        this.netProxy.sendSpinRequest(
            playBet,
            extraBetType,
            denom,
            operationRequest,
            wayBet,
            wayColumn,
            denomMultiplier,
            featureBet
        );
    }

    protected _gameDataProxy: WAY_GameDataProxy;
    protected get gameDataProxy(): WAY_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(WAY_GameDataProxy.NAME) as WAY_GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
