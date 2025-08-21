import { GameScene } from '../../sgv3/vo/data/GameScene';
import { GameStateId } from '../../sgv3/vo/data/GameStateId';
import { SpecialHitInfo } from '../../sgv3/vo/enum/SpecialHitInfo';
import { InitEvent } from '../../sgv3/vo/event/InitEvent';
import { BaseGameResult } from '../../sgv3/vo/result/BaseGameResult';
import { GameStateResult } from '../../sgv3/vo/result/GameStateResult';
import { SpecialFeatureResult } from '../../sgv3/vo/result/SpecialFeatureResult';
import { SpinResult } from '../../sgv3/vo/result/SpinResult';
import { GameStateSetting } from '../../sgv3/vo/setting/GameStateSetting';
import { TSMap } from './TSMap';

export class RefactoringGameData {
    private static freeGameRoundIdx: number = -1;
    private static bonusGameRoundIdx: number = -1;
    private static topUpGameRoundIdx: number = -1;
    private static gameStateId: number = -1;
    private static resultsData: TSMap<GameResultType, GameStateResult[]> = new TSMap<
        GameResultType,
        GameStateResult[]
    >();

    public static AddResultData_ByGameResultType(
        thisResultType: GameResultType,
        thisResultData: GameStateResult,
        resultsData: TSMap<GameResultType, GameStateResult[]>
    ) {
        if (resultsData.has(thisResultType)) {
            let gameStateResult = resultsData.get(thisResultType);
            gameStateResult.push(thisResultData);
        } else {
            let gameStateResult: GameStateResult[] = [];
            gameStateResult.push(thisResultData);
            resultsData.set(thisResultType, gameStateResult);
        }
    }

    private static SetGameResultData(spinResult: SpinResult, gameStateResult: Array<GameStateResult>) {
        this.gameStateId = 0;
        this.resultsData = new TSMap<GameResultType, GameStateResult[]>();
        this.freeGameRoundIdx = -1;
        this.bonusGameRoundIdx = -1;
        this.topUpGameRoundIdx = -1;
        /** start game */
        let startGameResult: GameStateResult = new GameStateResult();
        startGameResult.gameStateId = this.gameStateId;
        this.gameStateId++;
        this.AddResultData_ByGameResultType(GameResultType.Start, startGameResult, this.resultsData);

        /** Base Game */
        let baseGameResult: GameStateResult = new GameStateResult();
        let baseGame: BaseGameResult = spinResult.baseGameResult as BaseGameResult;
        // 避免 Feature Selection Recovery 後，選擇 Feature Game 時，rngInfo 資料遺失的問題
        if (baseGame.displayInfo.rngInfo == null) {
            baseGame.displayInfo.rngInfo = baseGame.extendInfoForbaseGameResult.backUpRngInfo;
        }
        baseGameResult.stateWin = baseGame.baseGameTotalWin;
        baseGameResult.roundResult = [];
        baseGameResult.roundResult.push(spinResult.baseGameResult);
        baseGameResult.gameSceneName = GameScene.Game_1;
        this.AddResultData_ByGameResultType(GameResultType.BaseGame, baseGameResult, this.resultsData);

        /** Free Game */
        if (!!spinResult.freeGameResult) {
            let freeGame = spinResult.freeGameResult.freeGameOneRoundResult;
            let stateWin = 0;
            let freeGameResult: GameStateResult = new GameStateResult();
            freeGameResult.roundResult = [];
            freeGameResult.gameSceneName = GameScene.Game_2;
            for (let i = 0; i < freeGame.length; i++) {
                freeGameResult.roundResult.push(freeGame[i]);
                stateWin += freeGame[i].playerWin;
                freeGameResult.stateWin = stateWin;
                /** 此狀態結束，把資料存入resultData */
                if (i == freeGame.length - 1) {
                    this.AddResultData_ByGameResultType(GameResultType.FreeGame, freeGameResult, this.resultsData);
                } else if (RefactoringGameData.CheckTriggerBonus(freeGame[i].specialFeatureResult)) {
                    /** 觸發其他Feature需要做狀態切換，所以把目前為止同一狀態的Round存入resultData，做一狀態分割 */
                    this.AddResultData_ByGameResultType(GameResultType.FreeGame, freeGameResult, this.resultsData);
                    freeGameResult = null;
                    freeGameResult = new GameStateResult();
                    freeGameResult.roundResult = [];
                    freeGameResult.gameSceneName = GameScene.Game_2;
                }
            }
        }

        /** Top Up Game，目前只能用於昇龍賞 */
        if (!!spinResult.topUpGameResult) {
            let topUpGame = spinResult.topUpGameResult.topUpGameOneRoundResult;
            let stateWin = 0;
            let topUpGameResult: GameStateResult = new GameStateResult();
            topUpGameResult.roundResult = [];
            topUpGameResult.gameSceneName = GameScene.Game_4;
            for (let i = 0; i < topUpGame.length; i++) {
                topUpGameResult.roundResult.push(topUpGame[i]);
                stateWin += topUpGame[i].playerWin;
                topUpGameResult.stateWin = stateWin;
                /** 此狀態結束，把資料存入resultData */
                this.AddResultData_ByGameResultType(GameResultType.TopUpGame, topUpGameResult, this.resultsData);
            }
        }

        /** Bonus Game ， 目前只能用於本遊戲只有一種BonusGame(含MiniGame)，且BonusGame不會觸發其他Feature*/
        if (!!spinResult.bonusGameResult) {
            let bonusGame = spinResult.bonusGameResult.bonusGameOneRoundResult;
            for (let i = 0; i < bonusGame.length; i++) {
                // bonusGame_01 才需要算一個 game state，並轉場景
                if (bonusGame[i].specialHitInfo == SpecialHitInfo[SpecialHitInfo.bonusGame_01]) {
                    let bonusGameResult: GameStateResult = new GameStateResult();
                    bonusGameResult.stateWin = bonusGame[i].oneRoundJPTotalWin + bonusGame[i].oneRoundTotalWinWithoutJP;
                    bonusGameResult.roundResult = [];
                    bonusGameResult.gameSceneName = GameScene.Game_3;
                    this.AddResultData_ByGameResultType(GameResultType.BonusGame, bonusGameResult, this.resultsData);
                }
            }
        }

        let bSpecialEnd: boolean = this.SetResultDataStateId();

        /** end game */
        let endGameResult: GameStateResult = new GameStateResult();
        endGameResult.gameStateId = this.gameStateId;
        this.gameStateId++;
        this.AddResultData_ByGameResultType(GameResultType.End, endGameResult, this.resultsData);

        let stateID = 0;
        while (stateID < this.gameStateId) {
            gameStateResult.push(this.GetResultDat_ByStateId(stateID));
            if (stateID == this.gameStateId - 1) {
                /** Special End Game (FreeGame Last Round Trigger BonusGame) */
                if (bSpecialEnd) {
                    gameStateResult.push(this.GetResultDat_ByStateId(stateID));
                }
            }
            stateID++;
        }
    }

    private static GetResultDat_ByStateId(stateId: number): GameStateResult {
        let keys = this.resultsData.keys();
        for (let i = 0; i < keys.length; i++) {
            let states = this.resultsData.get(keys[i]);
            for (let j = 0; j < states.length; j++) {
                if (states[j].gameStateId == stateId) {
                    return states[j];
                }
            }
        }
        return null;
    }

    private static SetResultDataStateId(): boolean {
        let bSpecailEnd = false;
        let baseGames = this.resultsData.get(GameResultType.BaseGame);
        /** 除了三消 baseGame 都只有一round */
        let first = baseGames[0];
        first.gameStateId = this.gameStateId;
        this.gameStateId++;
        for (let i = 0; i < first.roundResult.length; i++) {
            bSpecailEnd = bSpecailEnd || this.SetBaseGameTriggerStateId(first.roundResult[i].specialFeatureResult);
        }
        return bSpecailEnd;
    }

    private static SetBaseGameTriggerStateId(specialFeatureResult: SpecialFeatureResult[]): boolean {
        let bTriggerSpecialEnd = false;
        if (this.CheckTriggerBonus(specialFeatureResult)) {
            this.bonusGameRoundIdx++;
            this.resultsData.get(GameResultType.BonusGame)[this.bonusGameRoundIdx].gameStateId = this.gameStateId;
            this.gameStateId++;
        }
        if (this.CheckTriggerWaitForClient(specialFeatureResult)) {
            GameStateId.WAIT_FOR_CLIENT = this.gameStateId;
            let featureSelectionResult: GameStateResult = new GameStateResult();
            featureSelectionResult.gameStateId = this.gameStateId;
            featureSelectionResult.gameSceneName = GameScene.Game_1;
            this.AddResultData_ByGameResultType(GameResultType.WaitForClient, featureSelectionResult, this.resultsData);
            this.gameStateId++;
            if (this.resultsData.has(GameResultType.FreeGame)) {
                this.freeGameRoundIdx++;
                this.resultsData.get(GameResultType.FreeGame)[this.freeGameRoundIdx].gameStateId = this.gameStateId;
                this.gameStateId++;

                let freeGameResultData = this.resultsData.get(GameResultType.FreeGame);
                bTriggerSpecialEnd = this.SetFreeTriggerStateId(freeGameResultData);
            } else if (this.resultsData.has(GameResultType.TopUpGame)) {
                this.topUpGameRoundIdx++;
                this.resultsData.get(GameResultType.TopUpGame)[this.topUpGameRoundIdx].gameStateId = this.gameStateId;
                this.gameStateId++;
            }
        } else {
            GameStateId.WAIT_FOR_CLIENT = -1;
        }
        if (this.CheckTriggerFreeGame(specialFeatureResult)) {
            this.freeGameRoundIdx++;
            this.resultsData.get(GameResultType.FreeGame)[this.freeGameRoundIdx].gameStateId = this.gameStateId;
            this.gameStateId++;

            let freeGameResultData = this.resultsData.get(GameResultType.FreeGame);
            bTriggerSpecialEnd = this.SetFreeTriggerStateId(freeGameResultData);
        }
        if (this.CheckTriggerTopUpGame(specialFeatureResult)) {
            this.topUpGameRoundIdx++;
            this.resultsData.get(GameResultType.TopUpGame)[this.topUpGameRoundIdx].gameStateId = this.gameStateId;
            this.gameStateId++;
            // Dragon up 不會觸發 Mini game?
            // let topUpGameResultData = this.resultsData.get(GameResultType.TopUpGame);
            // bTriggerSpecialEnd = this.SetFreeTriggerStateId(topUpGameResultData);
        }
        return bTriggerSpecialEnd;
    }

    private static SetFreeTriggerStateId(freeGameResultDatas: GameStateResult[]): boolean {
        let bTriggerSpecialEnd = false;
        let beTriggerBonus = false;
        for (let i = 0; i < freeGameResultDatas.length; i++) {
            // same state id
            let roundResult = freeGameResultDatas[i].roundResult;

            let bTriggerBonus = this.CheckTriggerBonus(roundResult[roundResult.length - 1].specialFeatureResult);
            if (bTriggerBonus) {
                this.bonusGameRoundIdx++;
                this.resultsData.get(GameResultType.BonusGame)[this.bonusGameRoundIdx].gameStateId = this.gameStateId;
                this.gameStateId++;
                beTriggerBonus = true;
            }

            if (i == freeGameResultDatas.length - 1 && bTriggerBonus) {
                bTriggerSpecialEnd = true;
            } else if (beTriggerBonus == true) {
                beTriggerBonus = false;
                this.freeGameRoundIdx++; // i + 1
                this.resultsData.get(GameResultType.FreeGame)[this.freeGameRoundIdx].gameStateId = this.gameStateId;
                this.gameStateId++;
            }
        }
        return bTriggerSpecialEnd;
    }

    public static RefactoringGameResult(spinResult: SpinResult): Array<GameStateResult> {
        let Result = new Array<GameStateResult>();
        this.SetGameResultData(spinResult, Result);

        return Result;
    }

    private static CheckTriggerBonus(specialFeatureResults: SpecialFeatureResult[]): boolean {
        let idx = 0;
        while (idx < specialFeatureResults.length) {
            if (
                specialFeatureResults[idx].specialHitInfo == SpecialHitInfo[SpecialHitInfo.bonusGame_01] /*  ||
                specialFeatureResults[idx].specialHitInfo == SpecialHitInfo[SpecialHitInfo.bonusGame_02] */
            ) {
                return true;
            }
            idx++;
        }
        return false;
    }

    private static CheckTriggerFreeGame(specialFeatureResults: SpecialFeatureResult[]): boolean {
        let idx = 0;
        while (idx < specialFeatureResults.length) {
            if (
                specialFeatureResults[idx].specialHitInfo == SpecialHitInfo[SpecialHitInfo.freeGame_01] ||
                specialFeatureResults[idx].specialHitInfo == SpecialHitInfo[SpecialHitInfo.freeGame_02] ||
                specialFeatureResults[idx].specialHitInfo == SpecialHitInfo[SpecialHitInfo.freeGame_03]
            ) {
                return true;
            }
            idx++;
        }
        return false;
    }

    private static CheckTriggerTopUpGame(specialFeatureResults: SpecialFeatureResult[]): boolean {
        let idx = 0;
        while (idx < specialFeatureResults.length) {
            if (specialFeatureResults[idx].specialHitInfo == SpecialHitInfo[SpecialHitInfo.topUpGame_01]) {
                return true;
            }
            idx++;
        }
        return false;
    }

    private static CheckTriggerWaitForClient(specialFeatureResults: SpecialFeatureResult[]): boolean {
        let idx = 0;
        while (idx < specialFeatureResults.length) {
            if (specialFeatureResults[idx].specialHitInfo == SpecialHitInfo[SpecialHitInfo.waitingForClient]) {
                return true;
            }
            idx++;
        }
        return false;
    }

    public static RefactoringGameStateSetting(initEventData: InitEvent): GameStateSetting[] {
        let Result: GameStateSetting[] = [];

        let totalGameState = 1;
        //#region BaseGame State
        let baseGameSetting: GameStateSetting;
        baseGameSetting = new GameStateSetting(initEventData.executeSetting.baseGameSetting);
        baseGameSetting.gameSceneId = GameScene.Game_1;
        Result.push(baseGameSetting);
        totalGameState++;
        //#endregion

        //#region FreeGame State
        if (!!initEventData.executeSetting.freeGameSetting) {
            let freeGameSetting = new GameStateSetting(initEventData.executeSetting.freeGameSetting);
            freeGameSetting.gameSceneId = GameScene.Game_2;
            Result.push(freeGameSetting);
            totalGameState++;
        }
        //#endregion

        //#region BonusGame State
        if (!!initEventData.executeSetting.bonusGameSetting) {
            let bonusGameSetting = new GameStateSetting(initEventData.executeSetting.bonusGameSetting);
            bonusGameSetting.gameSceneId = GameScene.Game_3;
            Result.push(bonusGameSetting);
            totalGameState++;
        }
        //#endregion

        //#region TopUpGame State
        if (!!initEventData.executeSetting.topUpGameSetting) {
            let topUpGameSetting = new GameStateSetting(initEventData.executeSetting.topUpGameSetting);
            topUpGameSetting.gameSceneId = GameScene.Game_4;
            Result.push(topUpGameSetting);
            totalGameState++;
        }
        //#endregion

        return Result;
    }
}

enum GameResultType {
    None,
    Start,
    BaseGame,
    FreeGame,
    BonusGame,
    MiniGame,
    TopUpGame,
    End,
    WaitForClient
}
