import { _decorator } from 'cc';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { GameScene } from '../../vo/data/GameScene';
import { SymbolId } from '../../vo/enum/Reel';
import { BaseGameResult } from '../../vo/result/BaseGameResult';
import { CommonGameResult } from '../../vo/result/CommonGameResult';
import { FreeGameOneRoundResult } from '../../vo/result/FreeGameOneRoundResult';
import { TopUpGameOneRoundResult } from '../../vo/result/TopUpGameOneRoundResult';
import { PreviewType } from 'src/sgv3/vo/enum/PreviewType';
const { ccclass } = _decorator;

@ccclass('PrizePredictionHandleCommand')
export class PrizePredictionHandleCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'PrizePredictionHandleCommand';
    public execute(notification: puremvc.INotification): void {
        this.handleData();
    }

    handleData() {
        this.gameDataProxy.spinEventData.gameStateResult.forEach((gameStateResult) => {
            switch (gameStateResult.gameSceneName) {
                case GameScene.Game_1:
                    gameStateResult.roundResult.forEach(this.checkBaseGame, this);
                    break;
                case GameScene.Game_2:
                    gameStateResult.roundResult.forEach(this.checkFreeGame, this);
                    break;
                case GameScene.Game_4:
                    gameStateResult.roundResult.forEach(this.checkDragonUp, this);
                    break;
            }
        });
    }
    /**
     * check Base Game Prediction
     * 大獎預告:
     * 1. M Symbol 5連線 贏分是押分的25倍(含)以上，80%機率觸發大獎預告
     * 2. 盤面出現8顆C1以上
     * 3. 盤面出現6顆C1以上並觸發MiniGame
     * 瞇牌:
     * 同上1. 必定瞇牌
     * @param result BaseGameResult
     */
    checkBaseGame(result: BaseGameResult): void {
        const totalBet = this.gameDataProxy.curTotalBet;
        const odds = this.gameDataProxy.convertCredit2Cash(result.baseGameTotalWin) / totalBet;
        const isMSymbolFiveOfKind = result.waysGameResult.waysResult.some(
            (result) => result.hitNumber == 5 && result.symbolID >= SymbolId.M1 && result.symbolID <= SymbolId.M6
        );
        const ballCount = result.extendInfoForbaseGameResult.ballCount;
        const hitMiniGame = this.gameDataProxy.spinEventData.gameStateResult.some(
            (gameStateResult) => gameStateResult.gameSceneName == GameScene.Game_3
        );
        const randomNumber = this.getRandomNumber(result, GameScene.Game_1);
        const threshold = this.gameDataProxy.isOmniChannel() ? thresholdOmniChannel : thresholdNormal;

        const prizePredictionCondition =
            (odds >= 25 && isMSymbolFiveOfKind && randomNumber < threshold) ||
            ballCount >= 8 ||
            (ballCount >= 6 && hitMiniGame);
        const displayMethodCondition = odds >= 25 && isMSymbolFiveOfKind;

        result.displayInfo.prizePredictionType = prizePredictionCondition ? 'TYPE_1' : 'NoPrizePredictionType';
        result.displayInfo.displayMethod = Array.from([false, false, false, false, displayMethodCondition], (x) => [x]);

        this.setPrizePreviewType(result);
    }

    /**
     * GTM大獎預告與瞇牌數據
     * 都沒有: -1
     * 大獎預告: 1
     * 瞇牌，盤面大分: 2
     * 瞇牌，FG: 3
     * 瞇牌，JP: 4
     * 複合式範例，大獎預告+瞇牌盤面大分: 12
     */
    private setPrizePreviewType(result: CommonGameResult) {
        let previewType: string = PreviewType.None;
        const hasPrizePrediction = result.displayInfo.prizePredictionType == 'TYPE_1';
        if (hasPrizePrediction) {
            previewType = PreviewType.PrizePrediction;
        }
        const hasSlowMotion = result.displayInfo.displayMethod.some((row) => row.includes(true));
        if (hasSlowMotion) {
            previewType += PreviewType.BigWinSlowMotion;
        }
        this.gameDataProxy.previewType = previewType;
    }

    /**
     * check Free Game Prediction
     * 大獎預告:
     * 1. M Symbol 5連線 贏分是押分的25倍(含)以上，80%機率觸發大獎預告
     * 瞇牌:
     * 同上1. 必定瞇牌
     * @param result FreeGameOneRoundResult
     */
    checkFreeGame(result: FreeGameOneRoundResult): void {
        const totalBet = this.gameDataProxy.curTotalBet;
        const odds = this.gameDataProxy.convertCredit2Cash(result.waysGameResult.playerWin) / totalBet;
        const isMSymbolFiveOfKind = result.waysGameResult.waysResult.some(
            (result) => result.hitNumber == 5 && result.symbolID >= SymbolId.M1 && result.symbolID <= SymbolId.M6
        );
        const randomNumber = this.getRandomNumber(result, GameScene.Game_1);
        const threshold = this.gameDataProxy.isOmniChannel() ? thresholdOmniChannel : thresholdNormal;

        if (result.extendInfoForFreeGameResult.isRespinFeature) {
            this.checkRespin(result);
        } else {
            const reel1StackWW = result.screenSymbol[0].filter((id) => id == 0).length == 3;
            const displayMethodCondition = (odds >= 25 && isMSymbolFiveOfKind) || reel1StackWW;

            result.displayInfo.displayMethod = Array.from([false, false, false, false, displayMethodCondition], (x) => [
                x
            ]);
        }

        const prizePredictionCondition = odds >= 25 && isMSymbolFiveOfKind && randomNumber < threshold;
        result.displayInfo.prizePredictionType = prizePredictionCondition ? 'TYPE_1' : 'NoPrizePredictionType';
    }

    checkRespin(result: FreeGameOneRoundResult): void {
        const displayCondition = result.waysGameResult.waysResult.some((result) => result.hitNumber >= 3);

        result.displayInfo.displayMethod = Array.from([false, false, false, displayCondition, false], (x) => [x]);
    }

    /**
     * check Dragon Up Prediction
     * 當前累積%數達300%以上，且此次Spin滾出C2 2顆以上
     * @param result TopUpGameOneRoundResult
     */
    checkDragonUp(result: TopUpGameOneRoundResult): void {
        //spec:
        const convert2dTo1dArray = (prev, curr) => prev.concat(curr);
        let multi = result.extendInfoForTopUpGameResult.accumulateMultiplier;
        multi = result.extendInfoForTopUpGameResult.goldMultiplierScreenLabel
            .reduce(convert2dTo1dArray, [])
            .reduce((prev, curr) => prev - curr, multi);
        let newC2Count = result.extendInfoForTopUpGameResult.goldCreditBallScreenLabel
            .reduce(convert2dTo1dArray, [])
            .filter((value) => value > 0).length;

        const isOmniChannel = this.gameDataProxy.isOmniChannel();
        const omniChannelCondition = (multi >= 300 && newC2Count >= 3) || (multi >= 500 && newC2Count >= 2);
        const normalCondition = multi >= 300 && newC2Count >= 2;

        if ((isOmniChannel && omniChannelCondition) || (!isOmniChannel && normalCondition)) {
            result.displayInfo.prizePredictionType = 'TYPE_1';
        }
    }

    /**
     * get random number by using first reel pos and first reel length
     * @param result GameResult
     * @param gameScene gameScene
     * @returns random number between 0 to 1(excluding 1)
     */
    getRandomNumber(result: CommonGameResult, gameScene: GameScene): number {
        const firstReelID = 0;
        const rngPos = result.displayInfo.rngInfo[0][firstReelID];
        const reelLength = this.gameDataProxy.initEventData.gameStateSettings.find(
            (setting) => setting.gameSceneId == gameScene
        ).wheelData[this.gameDataProxy.sceneSetting.defaultMathTableIndex][firstReelID].wheelLength;
        const randomNumber = rngPos / reelLength;
        return randomNumber;
    }

    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}

const thresholdNormal = 0.8;
const thresholdOmniChannel = 1;
