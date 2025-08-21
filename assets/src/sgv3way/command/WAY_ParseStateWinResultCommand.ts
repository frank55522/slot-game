import { ParseStateWinResultCommand } from '../../sgv3/command/spin/ParseStateWinResultCommand';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { GameHitPattern } from '../../sgv3/vo/enum/GameHitPattern';
import { SymbolInfo } from '../../sgv3/vo/info/SymbolInfo';
import { SpecialFeatureResult } from '../../sgv3/vo/result/SpecialFeatureResult';
import { WAY_GameDataProxy } from '../proxy/WAY_GameDataProxy';
import { WAY_WinInfo } from '../vo/WAY_WinInfo';
import { WAY_GameResult } from '../vo/result/WAY_GameResult';
import { FreeGameOneRoundResult } from '../../sgv3/vo/result/FreeGameOneRoundResult';
import { CommonGameResult } from '../../sgv3/vo/result/CommonGameResult';
import { SpecialHitInfo } from '../../sgv3/vo/enum/SpecialHitInfo';

/**
 * 遊戲狀態中包含兩個以上遊戲類型時，準備好遊戲類型都跑完後，回到初始畫面(預設:Game_1)時要表演的資料
 */
export class WAY_ParseStateWinResultCommand extends ParseStateWinResultCommand {
    protected gameDataProxy: WAY_GameDataProxy = null;

    public execute(notification: puremvc.INotification) {
        this.gameDataProxy = this.facade.retrieveProxy(WAY_GameDataProxy.NAME) as WAY_GameDataProxy;
        this.myInitSetting = this.gameDataProxy.getStateSettingByName(GameScene.Game_1);
        this.mySceneData = this.gameDataProxy.getSceneDataByName(GameScene.Game_1);
        this.gameDataProxy.stateWinData.dispose();
        this.gameDataProxy.stateWinData.wayInfos = [];

        if (this.gameDataProxy.spinEventData.gameStateResult[0].roundResult[0].specialFeatureResult != null) {
            this.gameDataProxy.stateWinData.wayInfos = [];
            this.parseSpecialResult(this.gameDataProxy.spinEventData.gameStateResult[0].roundResult[0]);
            this.parseNormalResult(this.gameDataProxy.spinEventData.gameStateResult[0].roundResult[0]);

            if (!!this.gameDataProxy.curRoundResult) {
                let gameResult: FreeGameOneRoundResult = this.gameDataProxy.curRoundResult as FreeGameOneRoundResult;
                if (!!gameResult && !!gameResult.displayLogicInfo) {
                    let cashAmount = this.gameDataProxy.convertCredit2Cash(
                        gameResult.displayLogicInfo.afterAccumulateWinWithBaseGameWin
                    );
                    this.gameDataProxy.stateWinData.wayInfos[0].symbolWin = cashAmount;
                }
            }
        }
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
            let wayWinInfo = new WAY_WinInfo();
            wayWinInfo.symbolId = -1;
            wayWinInfo.symbolWin = this.gameDataProxy.convertCredit2Cash(_spResult[idx].specialScreenWin);
            wayWinInfo.hitOdds = -1;
            wayWinInfo.hitDirection = GameHitPattern[GameHitPattern.WaysGame];
            wayWinInfo.position = [];
            wayWinInfo.symbols = [];

            for (let x = 0; x < _spResult[idx].specialScreenHitData.length; x++) {
                wayWinInfo.symbols[x] = -1;
                for (let y = 0; y < _spResult[idx].specialScreenHitData[x].length; y++) {
                    if (_spResult[idx].specialScreenHitData[x][y]) {
                        let symbolInfo: SymbolInfo = new SymbolInfo();
                        let key: string = '';
                        symbolInfo.x = x;
                        symbolInfo.y = y;
                        symbolInfo.sid = _roundResult.screenSymbol[x][y];

                        // add animation info
                        key = symbolInfo.sid + '_' + symbolInfo.x + '_' + symbolInfo.y;
                        this.gameDataProxy.stateWinData.animationInfos.set(key, symbolInfo);

                        // add line info
                        wayWinInfo.position[x] = y;
                        wayWinInfo.symbols[x] = symbolInfo.sid;
                        wayWinInfo.hitSymbol = symbolInfo.sid;
                    }
                }
            }
            wayWinInfo.screenHitData = _spResult[idx].specialScreenHitData; // 加入特殊獎項中獎位置，提供給框使用
            this.gameDataProxy.stateWinData.wayInfos.push(wayWinInfo);

            idx++;
        }
    }

    /** 解析一般贏線 */
    protected parseNormalResult(_roundResult: CommonGameResult): void {
        let idx: number = 0;
        let gameResult = _roundResult.waysGameResult as WAY_GameResult;

        while (idx < gameResult.waysResult.length) {
            let wayWinInfo = new WAY_WinInfo();
            wayWinInfo.symbolId = gameResult.waysResult[idx].symbolID;
            wayWinInfo.symbolWin = this.gameDataProxy.convertCredit2Cash(gameResult.waysResult[idx].symbolWin);
            wayWinInfo.hitOdds = gameResult.waysResult[idx].hitOdds;
            wayWinInfo.hitCount = 0;
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
}
