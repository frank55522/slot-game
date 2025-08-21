import { MathUtil } from 'src/core/utils/MathUtil';
import { GameDataProxy } from '../../../sgv3/proxy/GameDataProxy';
import { ReelDataProxy, SymbolPosData } from '../../../sgv3/proxy/ReelDataProxy';
import { GameScene } from '../../../sgv3/vo/data/GameScene';
import { LockType } from '../../../sgv3/vo/enum/Reel';
import { FreeGameOneRoundResult } from '../../../sgv3/vo/result/FreeGameOneRoundResult';
import { TopUpGameOneRoundResult } from '../../../sgv3/vo/result/TopUpGameOneRoundResult';
import { BalanceUtil } from 'src/sgv3/util/BalanceUtil';

export class ReelEffect_SymbolFeatureCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'ReelEffect_SymbolFeatureCommand';

    public execute(notification: puremvc.INotification) {
        let ballScreenLabel = notification.getBody()
            ? (notification.getBody() as Array<Array<number>>)
            : this.ballScreenLabel;
        let myGameScene: GameScene = this.gameDataProxy.curStateResult
            ? this.gameDataProxy.curStateResult.gameSceneName
            : GameScene.Game_1;
        if (this.reelDataProxy.symbolFeature == null) {
            this.reelDataProxy.symbolFeature = [];
            for (let i = 0; i < ballScreenLabel.length; i++) {
                let tempArray = Array<SymbolPosData>();
                for (let j = 0; j < ballScreenLabel[i].length; j++) {
                    let posData = new SymbolPosData();
                    tempArray.push(posData);
                }
                this.reelDataProxy.symbolFeature.push(tempArray);
            }
        }
        //Game_1資料處理
        for (let i = 0; i < ballScreenLabel.length; i++) {
            for (let j = 0; j < ballScreenLabel[i].length; j++) {
                let posData = this.reelDataProxy.symbolFeature[i][j];
                let ballCreditInCash = this.gameDataProxy.convertCredit2Cash(ballScreenLabel[i][j]);
                if (this.gameDataProxy.isOmniChannel()) {
                    posData.creditCent = this.gameDataProxy.getCreditByDenomMultiplier(ballCreditInCash);
                    posData.creditDisplay = posData.creditCent.toString();
                } else {
                    posData.creditCent = ballCreditInCash;
                    posData.creditDisplay = BalanceUtil.formatBalanceWithExpressingUnits(posData.creditCent);
                }
                posData.isSpecial = posData.creditCent > 0 ? this.isSpecialBall(posData.creditCent) : false;
                posData.lockType = posData.creditCent > 0 ? LockType.BASE_LOCK : LockType.NONE;
                posData.language = this.gameDataProxy.language;
            }
        }
        //ByGame 依場景 做資料覆蓋處理
        switch (myGameScene) {
            case GameScene.Game_2:
                let game2TopUpData = this.gameDataProxy.curRoundResult as FreeGameOneRoundResult;
                let extendInfo = game2TopUpData.extendInfoForFreeGameResult;

                for (let i = 0; i < extendInfo.sideCreditBallScreenLabel.length; i++) {
                    for (let j = 0; j < extendInfo.sideCreditBallScreenLabel[i].length; j++) {
                        this.reelDataProxy.symbolFeature[i][j].creditCent = this.gameDataProxy.convertCredit2Cash(
                            extendInfo.sideCreditBallScreenLabel[i][j]
                        );
                        if (this.reelDataProxy.symbolFeature[i][j].creditCent > 0) {
                            this.reelDataProxy.symbolFeature[i][j].hasScatter = true;
                        } else {
                            this.reelDataProxy.symbolFeature[i][j].hasScatter = false;
                        }
                    }
                }

                break;
            case GameScene.Game_4:
                let topUpData = this.gameDataProxy.curRoundResult as TopUpGameOneRoundResult;
                for (let roundIndex = 0; roundIndex < topUpData.roundInfo.roundNumber; roundIndex++) {
                    let oneRoundData =
                        this.gameDataProxy.spinEventData.topUpGameResult.topUpGameOneRoundResult[roundIndex];

                    for (let i = 0; i < this.reelDataProxy.symbolFeature.length; i++) {
                        for (let j = 0; j < this.reelDataProxy.symbolFeature[i].length; j++) {
                            if (this.reelDataProxy.symbolFeature[i][j].lockType == LockType.NEW_LOCK) {
                                this.reelDataProxy.symbolFeature[i][j].lockType = LockType.OLD_LOCK;
                            }

                            if (oneRoundData.extendInfoForTopUpGameResult.goldCreditBallScreenLabel[i][j] > 0) {
                                let ballCash = this.gameDataProxy.convertCredit2Cash(
                                    oneRoundData.extendInfoForTopUpGameResult.goldCreditBallScreenLabel[i][j]
                                );
                                this.reelDataProxy.symbolFeature[i][j].creditCent = this.gameDataProxy.isOmniChannel()
                                    ? this.gameDataProxy.getCreditByDenomMultiplier(ballCash)
                                    : ballCash;
                                this.reelDataProxy.symbolFeature[i][j].lockType = LockType.NEW_LOCK;
                            }
                            this.reelDataProxy.symbolFeature[i][j].ReSpinNum =
                                oneRoundData.extendInfoForTopUpGameResult.addReSpinScreenLabel[i][j];
                            this.reelDataProxy.symbolFeature[i][j].multiple =
                                oneRoundData.extendInfoForTopUpGameResult.goldMultiplierScreenLabel[i][j];
                        }
                    }
                }
                break;
        }
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
            this._ballScreenLabel =
                this.gameDataProxy.spinEventData.baseGameResult.extendInfoForbaseGameResult.ballScreenLabel;
        }
        return this._ballScreenLabel;
    }
    // 依 Cash 比對
    protected isSpecialBall(value: number): boolean {
        let isSpecial = false;
        const creditBall =
            this.gameDataProxy.initEventData.executeSetting.baseGameSetting.baseGameExtendSetting.creditBall;
        let credit = this.gameDataProxy.isOmniChannel()
            ? MathUtil.mul(this.getLastBallCredit(creditBall), this.gameDataProxy.curBet)
            : MathUtil.div(
                  MathUtil.mul(creditBall[creditBall.length - 1], this.gameDataProxy.curTotalBet, 10),
                  this.gameDataProxy.curDenom
              );
        if (this.gameDataProxy.isOmniChannel()) {
            isSpecial = credit == value;
        } else {
            let cash = this.gameDataProxy.convertCredit2Cash(credit);
            isSpecial = cash == value;
        }
        return isSpecial;
    }

    private getLastBallCredit(creditBall: Array<number>): number {
        let ballCredit = 0;
        const creditWeight =
            this.gameDataProxy.initEventData.executeSetting.baseGameSetting.baseGameExtendSetting
                .groupingCreditBallWeight[this.gameDataProxy.curFeatureIdx];
        for (let i = creditWeight.length - 1; i >= 0; i--) {
            if (creditWeight[i] > 0) {
                ballCredit = creditBall[i];
                break;
            }
        }
        return ballCredit;
    }
}
