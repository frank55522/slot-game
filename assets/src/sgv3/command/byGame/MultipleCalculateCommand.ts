import { _decorator } from 'cc';
import { BaseScoringDuration } from '../../../game/vo/enum/SoundMap';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { FreeGameEvent } from '../../util/Constant';
import { WinType } from '../../vo/enum/WinType';
import { GameScene } from 'src/sgv3/vo/data/GameScene';
import { MathUtil } from 'src/core/utils/MathUtil';
import { CommonGameResult } from 'src/sgv3/vo/result/CommonGameResult';
const { ccclass } = _decorator;

@ccclass('MultipleCalculateCommand')
export class MultipleCalculateCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = FreeGameEvent.ON_CALCULATE_MULTIPLE;
    public execute(notification: puremvc.INotification): void {
        this.multipleSet();
    }

    protected multipleSet() {
        this.gameDataProxy.spinEventData.gameStateResult.forEach((gameStateResult) => {
            const { gameSceneName, roundResult } = gameStateResult;
            const { baseGameResult, playerTotalWin } = this.gameDataProxy.spinEventData;
            const curTotalBet = this.gameDataProxy.curTotalBet;

            //BaseGame
            if (gameSceneName == GameScene.Game_1) {
                roundResult.forEach((commonGameResult) => {
                    let playerWin = this.gameDataProxy.convertCredit2Cash(baseGameResult.baseGameTotalWin);
                    this.processRoundResult(playerWin, curTotalBet, commonGameResult);
                });
                this.processTotalResult(playerTotalWin, curTotalBet);
            }
            //FreeGame
            if (gameSceneName == GameScene.Game_2) {
                roundResult.forEach((commonGameResult) => {
                    let playerWin = this.gameDataProxy.convertCredit2Cash(commonGameResult.waysGameResult.playerWin);
                    this.processRoundResult(playerWin, curTotalBet, commonGameResult);
                });
            }
        });
    }

    private processRoundResult(playerWin: number, curTotalBet: number, commonGameResult: CommonGameResult) {
        let multiple = MathUtil.div(playerWin, curTotalBet);
        commonGameResult.displayInfo.scoringTime = this.getScoringTime(multiple);
        commonGameResult.displayInfo.winType = this.getWinType(multiple);
    }

    private processTotalResult(playerTotalWin: number, curTotalBet: number) {
        let totalWinAmount = this.gameDataProxy.convertCredit2Cash(playerTotalWin);
        let totalMultiple = MathUtil.div(totalWinAmount, curTotalBet);
        this.gameDataProxy.totalWinAmount = totalWinAmount;
        this.gameDataProxy.totalScoringTime = this.getScoringTime(totalMultiple);
        this.gameDataProxy.totalWinType = this.getWinType(totalMultiple);
    }

    protected getWinType(winMultiple: number): WinType {
        const winTypeRanges = this.gameDataProxy.isOmniChannel() ? winTypeRangesOmniChannel : winTypeRangesNormal;
        if (winMultiple > 0) {
            for (const range of winTypeRanges) {
                if (winMultiple >= range.min && winMultiple < range.max) {
                    return range.type;
                }
            }
        } else {
            return WinType.none;
        }
    }

    protected getScoringTime(winMultiple: number): number {
        const winTypeRanges = this.gameDataProxy.isOmniChannel() ? winTypeRangesOmniChannel : winTypeRangesNormal;
        if (winMultiple > 0) {
            for (const range of winTypeRanges) {
                if (winMultiple >= range.min && winMultiple < range.max) {
                    return range.duration;
                }
            }
        } else {
            return 0;
        }
    }

    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}

// 純線上廳的獎項與滾分門檻
const winTypeRangesNormal = [
    { min: 0, max: 1, type: WinType.section_1, duration: BaseScoringDuration.Scoring01 },
    { min: 1, max: 2, type: WinType.section_2, duration: BaseScoringDuration.Scoring02 },
    { min: 2, max: 3, type: WinType.section_3, duration: BaseScoringDuration.Scoring03 },
    { min: 3, max: 4, type: WinType.section_4, duration: BaseScoringDuration.Scoring04 },
    { min: 4, max: 5, type: WinType.section_5, duration: BaseScoringDuration.Scoring05 },
    { min: 5, max: 6, type: WinType.section_6, duration: BaseScoringDuration.Scoring06 },
    { min: 6, max: 7, type: WinType.section_7, duration: BaseScoringDuration.Scoring07 },
    { min: 7, max: 8, type: WinType.section_8, duration: BaseScoringDuration.Scoring08 },
    { min: 8, max: 9, type: WinType.section_9, duration: BaseScoringDuration.Scoring09 },
    { min: 9, max: 10, type: WinType.section_10, duration: BaseScoringDuration.Scoring10 },
    { min: 10, max: 11, type: WinType.section_11, duration: BaseScoringDuration.Scoring11 },
    { min: 11, max: 12, type: WinType.section_12, duration: BaseScoringDuration.Scoring12 },
    { min: 12, max: 13, type: WinType.section_13, duration: BaseScoringDuration.Scoring13 },
    { min: 13, max: 14, type: WinType.section_14, duration: BaseScoringDuration.Scoring14 },
    { min: 14, max: 15, type: WinType.section_15, duration: BaseScoringDuration.Scoring15 },
    { min: 15, max: 35, type: WinType.bigWin, duration: BaseScoringDuration.Scoring_Win01 },
    { min: 35, max: 60, type: WinType.megaWin, duration: BaseScoringDuration.Scoring_Win02 },
    { min: 60, max: 100, type: WinType.superWin, duration: BaseScoringDuration.Scoring_Win03 },
    { min: 100, max: Infinity, type: WinType.jumboWin, duration: BaseScoringDuration.Scoring_Win04 }
];

const winTypeRangesOmniChannel = [
    { min: 0, max: 1, type: WinType.section_1, duration: BaseScoringDuration.Scoring01 },
    { min: 1, max: 2, type: WinType.section_2, duration: BaseScoringDuration.Scoring02 },
    { min: 2, max: 3, type: WinType.section_3, duration: BaseScoringDuration.Scoring03 },
    { min: 3, max: 4, type: WinType.section_4, duration: BaseScoringDuration.Scoring04 },
    { min: 4, max: 5, type: WinType.section_5, duration: BaseScoringDuration.Scoring05 },
    { min: 5, max: 6, type: WinType.section_6, duration: BaseScoringDuration.Scoring06 },
    { min: 6, max: 7, type: WinType.section_7, duration: BaseScoringDuration.Scoring07 },
    { min: 7, max: 8, type: WinType.section_8, duration: BaseScoringDuration.Scoring08 },
    { min: 8, max: 9, type: WinType.section_9, duration: BaseScoringDuration.Scoring09 },
    { min: 9, max: 10, type: WinType.section_10, duration: BaseScoringDuration.Scoring10 },
    { min: 10, max: 11, type: WinType.section_11, duration: BaseScoringDuration.Scoring11 },
    { min: 11, max: 12, type: WinType.section_12, duration: BaseScoringDuration.Scoring12 },
    { min: 12, max: 13, type: WinType.section_13, duration: BaseScoringDuration.Scoring13 },
    { min: 13, max: 14, type: WinType.section_14, duration: BaseScoringDuration.Scoring14 },
    { min: 14, max: 17, type: WinType.section_15, duration: BaseScoringDuration.Scoring15 },
    { min: 17, max: 40, type: WinType.bigWin, duration: BaseScoringDuration.Scoring_Win01 },
    { min: 40, max: 60, type: WinType.megaWin, duration: BaseScoringDuration.Scoring_Win02 },
    { min: 60, max: 100, type: WinType.superWin, duration: BaseScoringDuration.Scoring_Win03 },
    { min: 100, max: Infinity, type: WinType.jumboWin, duration: BaseScoringDuration.Scoring_Win04 }
];
