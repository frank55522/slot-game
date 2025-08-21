import { ParseRoundWinResultCommand } from '../../sgv3/command/spin/ParseRoundWinResultCommand';
import { GameHitPattern } from '../../sgv3/vo/enum/GameHitPattern';
import { SpecialWinInfo } from '../../sgv3/vo/info/SpecialWinInfo';
import { SymbolInfo } from '../../sgv3/vo/info/SymbolInfo';
import { SpecialFeatureResult } from '../../sgv3/vo/result/SpecialFeatureResult';
import { WAY_GameDataProxy } from '../proxy/WAY_GameDataProxy';
import { WAY_WinInfo } from '../vo/WAY_WinInfo';
import { WAY_GameResult } from '../vo/result/WAY_GameResult';
import { CommonGameResult } from '../../sgv3/vo/result/CommonGameResult';
import { SpecialHitInfo } from '../../sgv3/vo/enum/SpecialHitInfo';
import { BaseGameResult } from '../../sgv3/vo/result/BaseGameResult';
import { FreeGameOneRoundResult } from '../../sgv3/vo/result/FreeGameOneRoundResult';

/**
 * 解析該 Round 贏線用於表演的資料
 */
export class WAY_ParseRoundWinResultCommand extends ParseRoundWinResultCommand {
    protected gameDataProxy: WAY_GameDataProxy = null;

    public execute(notification: puremvc.INotification) {
        this.gameDataProxy = this.facade.retrieveProxy(WAY_GameDataProxy.NAME) as WAY_GameDataProxy;
        this.myInitSetting = this.gameDataProxy.getStateSettingById(this.gameDataProxy.curStateResult.gameSceneName);
        this.mySceneData = this.gameDataProxy.getSceneDataByName(this.gameDataProxy.curStateResult.gameSceneName);
        this.gameDataProxy.curWinData.dispose();
        this.gameDataProxy.curWinData.wayInfos = [];
        this.parseSpecialResult(this.gameDataProxy.curRoundResult);
        this.parseNormalResult(this.gameDataProxy.curRoundResult);
    }

    /** 解析特殊獎項 */
    protected parseSpecialResult(_roundResult: CommonGameResult): void {
        if (_roundResult.specialFeatureResult == null) return;

        let _spResult: SpecialFeatureResult[] = _roundResult.specialFeatureResult;
        let idx: number = 0;

        while (idx < _spResult.length) {
            if (_spResult[idx].specialHitInfo == SpecialHitInfo[SpecialHitInfo.noSpecialHit]) {
                idx++;
                continue;
            }
            let specialWinInfo = new SpecialWinInfo();
            specialWinInfo.specialScreenHitData = _spResult[idx].specialScreenHitData;
            specialWinInfo.specialScreenWin = this.gameDataProxy.convertCredit2Cash(_spResult[idx].specialScreenWin);
            specialWinInfo.symbolsInfo = [];

            let wayWinInfo = new WAY_WinInfo();
            wayWinInfo.symbolId = -1;
            wayWinInfo.symbolWin = this.gameDataProxy.convertCredit2Cash(_spResult[idx].specialScreenWin);
            wayWinInfo.hitOdds = -1;
            wayWinInfo.hitDirection = GameHitPattern[GameHitPattern.WaysGame];
            wayWinInfo.position = [];
            wayWinInfo.symbols = [];

            for (let x = 0; x < _spResult[idx].specialScreenHitData?.length; x++) {
                wayWinInfo.symbols[x] = -1;
                for (let y = 0; y < _spResult[idx].specialScreenHitData[x].length; y++) {
                    if (_spResult[idx].specialScreenHitData[x][y]) {
                        let symbolInfo: SymbolInfo = new SymbolInfo();
                        let key: string = '';
                        symbolInfo.x = x;
                        symbolInfo.y = y;
                        symbolInfo.sid = this.gameDataProxy.curRoundResult.screenSymbol[x][y];
                        specialWinInfo.symbolsInfo.push(symbolInfo);

                        // add animation info
                        key = symbolInfo.sid + '_' + symbolInfo.x + '_' + symbolInfo.y;
                        this.gameDataProxy.curWinData.animationInfos.set(key, symbolInfo);

                        // add line info
                        wayWinInfo.position[x] = y;
                        wayWinInfo.symbols[x] = symbolInfo.sid;
                        wayWinInfo.hitSymbol = symbolInfo.sid;
                    }
                }
            }

            wayWinInfo.screenHitData = specialWinInfo.specialScreenHitData; // 將SpecialSceenHitData 設成screenHitData
            this.gameDataProxy.curWinData.specialInfos.push(specialWinInfo);
            this.gameDataProxy.curWinData.wayInfos.push(wayWinInfo);

            idx++;
        }
    }

    /** 解析一般贏線 */
    protected parseNormalResult(_roundResult: CommonGameResult): void {
        //Game4 沒WayGame資料 故跳過
        if (_roundResult.waysGameResult == undefined) {
            return;
        }

        let idx: number = 0;
        let gameResult: WAY_GameResult = _roundResult.waysGameResult as WAY_GameResult;
        while (idx < gameResult.waysResult.length) {
            let wayWinInfo = new WAY_WinInfo();
            wayWinInfo.hitCount = 0;
            wayWinInfo.symbolId = gameResult.waysResult[idx].symbolID;
            wayWinInfo.symbolWin = this.gameDataProxy.convertCredit2Cash(gameResult.waysResult[idx].symbolWin);
            wayWinInfo.hitOdds = gameResult.waysResult[idx].hitOdds;
            wayWinInfo.hitNumber = gameResult.waysResult[idx].hitNumber;
            wayWinInfo.hitDirection = gameResult.waysResult[idx].hitDirection;

            wayWinInfo.screenHitData = gameResult.waysResult[idx].screenHitData;
            let _screenSymbols = _roundResult.screenSymbol;
            wayWinInfo.symbols = [];

            for (let xIdx = 0; xIdx < _screenSymbols.length; xIdx++) {
                for (let yIdx = 0; yIdx < _screenSymbols[xIdx].length; yIdx++) {
                    if (wayWinInfo.screenHitData[xIdx][yIdx]) {
                        wayWinInfo.hitCount++;
                        wayWinInfo.symbols.push({
                            sid: _screenSymbols[xIdx][yIdx],
                            x: xIdx,
                            y: yIdx
                        });

                        // 整理動畫 Symbol
                        if (this.mySceneData.animationIDs.indexOf(_screenSymbols[xIdx][yIdx]) != -1) {
                            let symbolInfo: SymbolInfo = new SymbolInfo();
                            let key: string = '';
                            symbolInfo.sid = _screenSymbols[xIdx][yIdx];
                            symbolInfo.x = xIdx;
                            symbolInfo.y = yIdx;
                            key = symbolInfo.sid + '_' + symbolInfo.x + '_' + symbolInfo.y;

                            this.gameDataProxy.curWinData.animationInfos.set(key, symbolInfo);
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
            this.gameDataProxy.curWinData.wayInfos.push(wayWinInfo);
            idx++;
        }
    }
}
