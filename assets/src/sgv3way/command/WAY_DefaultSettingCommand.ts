import { MathUtil } from '../../core/utils/MathUtil';
import { CoreDefaultSettingCommand } from '../../sgv3/command/CoreDefaultSettingCommand';
import { WAY_GameDataProxy } from '../proxy/WAY_GameDataProxy';

/**
 * 初始設定 line、bet、denom 等等
 */
export class WAY_DefaultSettingCommand extends CoreDefaultSettingCommand {
    /** 設定totalbetList*/
    protected setTotalBetList() {
        // 基礎押注
        const baseBet = this.gameDataProxy.initEventData.executeSetting.baseGameSetting.betSpec.baseBet;
        // 幣別 denom
        const denom = this.gameDataProxy.initEventData.denoms[0];
        this.gameDataProxy.totalBetList = [];
        for (let i = 0; i < this.gameDataProxy.initEventData.betMultiplier.length; i++) {
            let totalBet = MathUtil.mul(
                baseBet,
                this.gameDataProxy.initEventData.betMultiplier[i],
                MathUtil.div(denom, 1000)
            );
            this.gameDataProxy.totalBetList.push(totalBet);
        }
    }

    protected setBetAndLine(_defaultIdx: number): number {
        this.gameDataProxy.curTotalBet = +this.gameDataProxy.userSetting.totalBet;
        this.gameDataProxy.curLine = +this.gameDataProxy.userSetting.line;
        this.gameDataProxy.curExtraBet = this.gameDataProxy.userSetting.extraBet;
        this.gameDataProxy.curBet = +this.gameDataProxy.userSetting.betMultiplier;
        this.gameDataProxy.curDenomMultiplier = +this.gameDataProxy.userSetting.denomMultiplier;
        this.gameDataProxy.curFeatureBet = +this.gameDataProxy.userSetting.featureBet;

        if (!this.gameDataProxy.isOmniChannel()) {
            _defaultIdx = this.gameDataProxy.totalBetList.findIndex((bet) => bet == this.gameDataProxy.curTotalBet);
        }

        return _defaultIdx;
    }

    protected checkBetInfo() {
        this.checkBetMultiplier();
        this.checkDenomMultiplier();
        this.checkFeatureBet();
        this.gameDataProxy.curTotalBet = MathUtil.mul(
            this.gameDataProxy.curBet,
            this.gameDataProxy.curDenomMultiplier,
            this.gameDataProxy.curFeatureBet
        );
    }

    private checkFeatureBet() {
        const validFeatureBet =
            this.gameDataProxy.initEventData.featureBetList.findIndex(
                (featureBet) => featureBet == this.gameDataProxy.curFeatureBet
            ) >= 0;
        const lastIndex = this.gameDataProxy.initEventData.featureBetList.length - 1;
        this.gameDataProxy.curFeatureBet = validFeatureBet
            ? this.gameDataProxy.curFeatureBet
            : this.gameDataProxy.initEventData.featureBetList[lastIndex];
    }

    private checkDenomMultiplier() {
        const validDenomMultiplier =
            this.gameDataProxy.initEventData.denomMultiplier.findIndex(
                (denom) => denom == this.gameDataProxy.curDenomMultiplier
            ) >= 0;
        this.gameDataProxy.curDenomMultiplier = validDenomMultiplier
            ? this.gameDataProxy.curDenomMultiplier
            : this.gameDataProxy.initEventData.denomMultiplier[0];
    }

    private checkBetMultiplier() {
        const validBetMultiplier =
            this.gameDataProxy.initEventData.betMultiplier.findIndex((bet) => bet == this.gameDataProxy.curBet) > 0;
        this.gameDataProxy.curBet = validBetMultiplier
            ? this.gameDataProxy.curBet
            : this.gameDataProxy.initEventData.betMultiplier[0];
    }
    // ======================== Get Set ========================
    protected _gameDataProxy: WAY_GameDataProxy;
    protected get gameDataProxy(): WAY_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(WAY_GameDataProxy.NAME) as WAY_GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
