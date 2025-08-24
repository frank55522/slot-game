import { _decorator } from 'cc';
import { ParseStateWinResultCommand } from '../../sgv3/command/spin/ParseStateWinResultCommand';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { SymbolId } from '../../sgv3/vo/enum/Reel';
import { SymbolInfo } from '../../sgv3/vo/info/SymbolInfo';
import { BaseGameResult } from '../../sgv3/vo/result/BaseGameResult';
import { WAY_GameResult } from '../../sgv3way/vo/result/WAY_GameResult';
import { WAY_WinInfo } from '../../sgv3way/vo/WAY_WinInfo';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
const { ccclass } = _decorator;

/**
 * ByGame 處理 遊戲狀態中包含兩個以上遊戲類型時，準備好遊戲類型都跑完後，回到初始畫面(預設:Game_1)時要表演的資料
 */

@ccclass('GAME_ParseStateWinResultCommand')
export class GAME_ParseStateWinResultCommand extends ParseStateWinResultCommand {
    protected gameDataProxy: GAME_GameDataProxy = null;

    public execute(notification: puremvc.INotification) {
        this.gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        this.mySceneData = this.gameDataProxy.getSceneDataByName(GameScene.Game_1);
        this.gameDataProxy.stateWinData.dispose();
        this.gameDataProxy.stateWinData.wayInfos = [];

        this.parseGame1Result();
        // 累計球數
        this.gameDataProxy.ballTotalCount = (
            this.gameDataProxy.spinEventData.baseGameResult as BaseGameResult
        ).extendInfoForbaseGameResult.ballCount;
        // 累計球分數
        this.gameDataProxy.ballTotalCredit = this.gameDataProxy.convertCredit2Cash(
            (this.gameDataProxy.spinEventData.baseGameResult as BaseGameResult).extendInfoForbaseGameResult
                .ballTotalCredit
        );
        if (this.gameDataProxy.isOmniChannel()) {
            this.gameDataProxy.ballTotalCredit = this.gameDataProxy.getCreditByDenomMultiplier(
                this.gameDataProxy.ballTotalCredit
            );
        }
        if (!!this.gameDataProxy.spinEventData.freeGameResult) {
            this.gameDataProxy.stateWinData.wayInfos.unshift(
                this.getScatterWinInfo(this.gameDataProxy.spinEventData.freeGameResult.freeGameTotalWin)
            );
        }
        if (!!this.gameDataProxy.spinEventData.topUpGameResult) {
            this.gameDataProxy.stateWinData.wayInfos.unshift(
                this.getScatterWinInfo(this.gameDataProxy.spinEventData.topUpGameResult.topUpGameTotalWin)
            );
        }
    }

    protected parseGame1Result() {
        //Game_1資料處理
        let idx: number = 0;
        let baseGameInfo = this.gameDataProxy.spinEventData.gameStateResult[0].roundResult[0]
            .waysGameResult as WAY_GameResult;
        let screenSymbols = this.gameDataProxy.spinEventData.gameStateResult[0].roundResult[0].screenSymbol;
        while (idx < baseGameInfo.waysResult.length) {
            let wayWinInfo = new WAY_WinInfo();
            wayWinInfo.hitCount = 0;
            wayWinInfo.symbolId = baseGameInfo.waysResult[idx].symbolID;
            wayWinInfo.symbolWin = this.gameDataProxy.convertCredit2Cash(baseGameInfo.waysResult[idx].symbolWin);
            wayWinInfo.hitOdds = baseGameInfo.waysResult[idx].hitOdds;
            wayWinInfo.hitNumber = baseGameInfo.waysResult[idx].hitNumber;
            wayWinInfo.hitDirection = baseGameInfo.waysResult[idx].hitDirection;

            wayWinInfo.screenHitData = baseGameInfo.waysResult[idx].screenHitData;

            wayWinInfo.symbols = [];

            for (let xIdx = 0; xIdx < screenSymbols.length; xIdx++) {
                for (let yIdx = 0; yIdx < screenSymbols[xIdx].length; yIdx++) {
                    if (wayWinInfo.screenHitData[xIdx][yIdx]) {
                        wayWinInfo.hitCount++;
                        wayWinInfo.symbols.push({
                            sid: screenSymbols[xIdx][yIdx],
                            x: xIdx,
                            y: yIdx
                        });

                        // 整理動畫 Symbol
                        if (this.mySceneData.animationIDs.indexOf(screenSymbols[xIdx][yIdx]) != -1) {
                            let symbolInfo: SymbolInfo = new SymbolInfo();
                            let key: string = '';
                            symbolInfo.sid = screenSymbols[xIdx][yIdx];
                            symbolInfo.x = xIdx;
                            symbolInfo.y = yIdx;
                            key = symbolInfo.sid + '_' + symbolInfo.x + '_' + symbolInfo.y;

                            this.gameDataProxy.stateWinData.animationInfos.set(key, symbolInfo);
                        }
                    } else {
                        wayWinInfo.symbols.push({
                            sid: -1,
                            x: xIdx,
                            y: yIdx
                        });
                    }
                }
            }

            this.gameDataProxy.stateWinData.wayInfos.push(wayWinInfo);
            idx++;
        }
    }

    protected getScatterWinInfo(totalWin: number) {
        let screenSymbols = this.gameDataProxy.spinEventData.gameStateResult[0].roundResult[0].screenSymbol;
        let baseGameInfo = this.gameDataProxy.spinEventData.baseGameResult as BaseGameResult;
        let wayWinInfo = new WAY_WinInfo();
        wayWinInfo.screenHitData = Array<Array<boolean>>();
        wayWinInfo.symbolId = SymbolId.C1;
        wayWinInfo.symbolWin = this.gameDataProxy.convertCredit2Cash(totalWin);
        wayWinInfo.hitOdds = -1;
        wayWinInfo.hitCount = 0;
        wayWinInfo.hitNumber = baseGameInfo.extendInfoForbaseGameResult.ballCount;
        for (let x = 0; x < screenSymbols.length; x++) {
            let screenX = Array<boolean>();
            for (let y = 0; y < screenSymbols[x].length; y++) {
                let isSymbolIdHit = screenSymbols[x][y] == wayWinInfo.symbolId;
                screenX.push(isSymbolIdHit);
            }
            wayWinInfo.screenHitData.push(screenX);
        }
        wayWinInfo.symbols = [];

        for (let xIdx = 0; xIdx < screenSymbols.length; xIdx++) {
            for (let yIdx = 0; yIdx < screenSymbols[xIdx].length; yIdx++) {
                if (wayWinInfo.screenHitData[xIdx][yIdx]) {
                    wayWinInfo.hitCount++;
                    wayWinInfo.symbols.push({
                        sid: screenSymbols[xIdx][yIdx],
                        x: xIdx,
                        y: yIdx
                    });

                    let symbolInfo: SymbolInfo = new SymbolInfo();
                    let key: string = '';
                    symbolInfo.x = xIdx;
                    symbolInfo.y = yIdx;
                    symbolInfo.sid = screenSymbols[xIdx][yIdx];

                    // add animation info
                    key = symbolInfo.sid + '_' + symbolInfo.x + '_' + symbolInfo.y;
                    this.gameDataProxy.stateWinData.animationInfos.set(key, symbolInfo);
                } else {
                    wayWinInfo.symbols.push({
                        sid: -1,
                        x: xIdx,
                        y: yIdx
                    });
                }
            }
        }

        return wayWinInfo;
    }

}
