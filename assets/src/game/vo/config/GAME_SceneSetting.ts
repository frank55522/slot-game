import { TSMap } from '../../../core/utils/TSMap';
import { GameSceneData } from '../../../sgv3/vo/config/GameSceneData';
import { SceneSetting } from '../../../sgv3/vo/config/SceneSetting';
import { GAME_GameScene } from '../data/GAME_GameScene';

export class GAME_SceneSetting extends SceneSetting {
    protected setSceneMap() {
        this.sceneMap.set(GAME_GameScene.Game_1, this.Game1());
        this.sceneMap.set(GAME_GameScene.Game_2, this.Game2());
        this.sceneMap.set(GAME_GameScene.Game_3, this.Game3());
        this.sceneMap.set(GAME_GameScene.Game_4, this.Game4());
    }

    public setSceneResultMap_ByResult(gameScenes: string[]) {
        this.sceneResultMap = null;
        this.sceneResultMap = new TSMap<string, GameSceneData>();

        let idx = 0;
        while (idx < gameScenes.length) {
            switch (gameScenes[idx]) {
                case GAME_GameScene.Game_1:
                    this.sceneResultMap.set(GAME_GameScene.Game_1, this.Game1());
                    break;
                case GAME_GameScene.Game_2:
                    this.sceneResultMap.set(GAME_GameScene.Game_2, this.Game2());
                    break;
                case GAME_GameScene.Game_3:
                    this.sceneResultMap.set(GAME_GameScene.Game_3, this.Game3());
                    break;
                default:
                    break;
            }
            idx++;
        }
    }

    /**
     * BaseGame: 3x5 Reels
     */
    private Game1(): GameSceneData {
        let result = new GameSceneData();
        result = {
            gameStateIds: [1],
            reelSymbolFrameByIDs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            animationIDs: [0, 1],
            reelSpinStopSequence: [[0], [1], [2], [3], [4]],
            symbolWidth: 224,
            symbolHeight: 196,
            freeScatterID: 1,
            bonusScatterID: -1,
            wildScatterID: 0,
            beforeWinRunningTime: 3,
            specialHitRunningTime: 3,
            miniGameHitRunningTime: 1,
            wonSpinBoardRunningTime: 0,
            retriggerBoardRunningTime: 0,
            wonCreditBoardRunningTime: 0,
            wonCreditBoardEndTime: 0,
            completeBoardRunningTime: 0,
            completeFadeOutSceneTime: 0,
            noWinStayTime: 0,
            bonusGamePlayBGMAfterEnterTime: 0,
            bonusGameWinSymbolShowTime: 0,
            bonusGameClickSymbolShowTime: 0,
            bonusCoinFallAfterCreditBoardTime: 0,
            bonusCloseViewAfterCoinFallTime: 0,
            bonusCanSkipRunCreditsTime: 0,
            featureSelectionShowTime: 1,
            reelPrefab: null
        };

        return result;
    }

    /**
     * FreeGame: 3x5 Reels
     */
    private Game2(): GameSceneData {
        let result = new GameSceneData();
        result = {
            gameStateIds: [2],
            reelSymbolFrameByIDs: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            animationIDs: [0],
            reelSpinStopSequence: [[0], [1], [2], [3], [4]],
            symbolWidth: 224,
            symbolHeight: 196,
            freeScatterID: 1,
            bonusScatterID: -1,
            wildScatterID: 0,
            beforeWinRunningTime: 3,
            specialHitRunningTime: 3,
            miniGameHitRunningTime: 1,
            wonSpinBoardRunningTime: 3,
            retriggerBoardRunningTime: 2,
            wonCreditBoardRunningTime: 0, //結算分數，不滾分表演
            wonCreditBoardEndTime: 3, //結算看板，顯示時間
            completeBoardRunningTime: 3,
            completeFadeOutSceneTime: 0.5,
            noWinStayTime: 0.5,
            bonusGamePlayBGMAfterEnterTime: 0,
            bonusGameWinSymbolShowTime: 0,
            bonusGameClickSymbolShowTime: 0,
            bonusCoinFallAfterCreditBoardTime: 0,
            bonusCloseViewAfterCoinFallTime: 0,
            bonusCanSkipRunCreditsTime: 0,
            featureSelectionShowTime: 0,
            reelPrefab: null
        };
        return result;
    }

    private Game3(): GameSceneData {
        let result = new GameSceneData();
        result = {
            gameStateIds: [3],
            reelSymbolFrameByIDs: [],
            animationIDs: [],
            reelSpinStopSequence: [],
            symbolWidth: 70,
            symbolHeight: 70,
            freeScatterID: 1,
            bonusScatterID: -1,
            wildScatterID: 0,
            beforeWinRunningTime: 0,
            specialHitRunningTime: 2,
            miniGameHitRunningTime: 1,
            wonSpinBoardRunningTime: 0,
            retriggerBoardRunningTime: 0,
            wonCreditBoardRunningTime: 5,
            wonCreditBoardEndTime: 0,
            completeBoardRunningTime: 3,
            completeFadeOutSceneTime: 0,
            noWinStayTime: 0.5,
            bonusGamePlayBGMAfterEnterTime: 0.9,
            bonusGameWinSymbolShowTime: 4,
            bonusGameClickSymbolShowTime: 1,
            bonusCoinFallAfterCreditBoardTime: 1,
            bonusCloseViewAfterCoinFallTime: 1.5,
            bonusCanSkipRunCreditsTime: 3,
            featureSelectionShowTime: 0,
            reelPrefab: null
        };
        return result;
    }

    private Game4(): GameSceneData {
        let result = new GameSceneData();
        result = {
            gameStateIds: [4],
            reelSymbolFrameByIDs: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
            animationIDs: [],
            reelSpinStopSequence: [
                [0, 5, 10],
                [1, 6, 11],
                [2, 7, 12],
                [3, 8, 13],
                [4, 9, 14]
            ],
            symbolWidth: 224,
            symbolHeight: 196,
            freeScatterID: 1,
            bonusScatterID: -1,
            wildScatterID: 0,
            beforeWinRunningTime: 3,
            specialHitRunningTime: 3,
            miniGameHitRunningTime: 1,
            wonSpinBoardRunningTime: 3,
            retriggerBoardRunningTime: 2,
            wonCreditBoardRunningTime: 0, //結算分數，不滾分表演
            wonCreditBoardEndTime: 3, //結算看板，顯示時間
            completeBoardRunningTime: 3,
            completeFadeOutSceneTime: 1.5,
            noWinStayTime: 0.3,
            bonusGamePlayBGMAfterEnterTime: 0,
            bonusGameWinSymbolShowTime: 0,
            bonusGameClickSymbolShowTime: 0,
            bonusCoinFallAfterCreditBoardTime: 0,
            bonusCloseViewAfterCoinFallTime: 0,
            bonusCanSkipRunCreditsTime: 0,
            featureSelectionShowTime: 0,
            reelPrefab: null
        };
        return result;
    }
}
