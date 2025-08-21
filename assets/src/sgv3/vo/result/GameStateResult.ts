import { CommonGameResult } from './CommonGameResult';

export class GameStateResult {
    constructor() {
        this.stateWin = 0;
        this.roundResult = [];
    }

    /**
     * 回傳遊戲狀態Id。0:Initial，1~gameStateCount:各遊戲狀態，(gameStateCount+1):BoardEnd
     */
    gameStateId: number;

    /**
     * 回傳總場次數
     */
    roundCount: number;

    /**
     * 回傳各場次遊戲結果
     */
    roundResult: Array<CommonGameResult>;

    /**
     * 回傳狀態總贏分
     */
    stateWin: number;

    /**
     * Game Scene Data
     */
    gameSceneName: string;
}
