import { _decorator } from 'cc';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { GameScene } from '../../vo/data/GameScene';
import { SpecialHitInfo } from '../../vo/enum/SpecialHitInfo';
import { DisplayInfo } from '../../vo/info/DisplayInfo';
import { DisplayLogicInfo } from '../../vo/info/DisplayLogicInfo';
import { RoundInfo } from '../../vo/info/RoundInfo';
import { ExtendInfoForFreeGameResult } from '../../vo/result/ExtendInfoForFreeGameResult';
import { FreeGameOneRoundResult } from '../../vo/result/FreeGameOneRoundResult';
const { ccclass } = _decorator;

@ccclass('RespinHandleCommand')
export class RespinHandleCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'RespinHandleCommand';
    public execute(notification: puremvc.INotification): void {
        const freeGameResult = this.gameDataProxy.spinEventData.gameStateResult.find(
            (result) => result.gameSceneName == GameScene.Game_2
        );
        if (freeGameResult) {
            this.handleData(freeGameResult.roundResult as FreeGameOneRoundResult[]);
        }
    }

    //反轉處理資料在轉回來
    handleData(results: FreeGameOneRoundResult[]) {
        results.reverse();
        for (const [index, result] of results.entries()) {
            if (result.extendInfoForFreeGameResult.isRespinFeature) {
                const respinResult = new FreeGameOneRoundResult();
                respinResult.usedTableIndex = result.extendInfoForFreeGameResult.reSpinScreenResult.tableIdx;
                respinResult.screenSymbol = result.extendInfoForFreeGameResult.reSpinScreenResult.screenLabel;
                respinResult.waysGameResult = result.extendInfoForFreeGameResult.reSpinResult;

                respinResult.specialFeatureResult = JSON.parse(JSON.stringify(result.specialFeatureResult));
                let checkHitGrand = (result) => result.specialHitInfo === SpecialHitInfo[SpecialHitInfo.bonusGame_02];
                let hitGrand = respinResult.specialFeatureResult.find(checkHitGrand);
                if(hitGrand) {
                    hitGrand.specialHitInfo = SpecialHitInfo[SpecialHitInfo.noSpecialHit];
                }

                respinResult.playerWin = result.extendInfoForFreeGameResult.reSpinResult.playerWin;

                respinResult.displayLogicInfo = new DisplayLogicInfo();
                Object.assign(respinResult.displayLogicInfo, result.displayLogicInfo);
                const baseGameWin =
                    respinResult.displayLogicInfo.beforeAccumulateWinWithBaseGameWin -
                    respinResult.displayLogicInfo.beforeAccumulateWinWithoutBaseGameWin;
                result.displayLogicInfo.afterAccumulateWinWithBaseGameWin =
                    respinResult.displayLogicInfo.beforeAccumulateWinWithBaseGameWin =
                        result.extendInfoForFreeGameResult.displayAccumulateWinBeforeRespin;
                result.displayLogicInfo.afterAccumulateWinWithoutBaseGameWin =
                    respinResult.displayLogicInfo.beforeAccumulateWinWithoutBaseGameWin =
                        result.extendInfoForFreeGameResult.displayAccumulateWinBeforeRespin;
                // respinResult.displayLogicInfo.afterAccumulateWinWithBaseGameWin = result.extendInfoForFreeGameResult.displayAccumulateWinAfterRespin + baseGameWin;
                // respinResult.displayLogicInfo.afterAccumulateWinWithoutBaseGameWin = result.extendInfoForFreeGameResult.displayAccumulateWinAfterRespin;

                respinResult.roundInfo = new RoundInfo();
                Object.assign(respinResult.roundInfo, result.roundInfo);
                respinResult.extendInfoForFreeGameResult = new ExtendInfoForFreeGameResult();
                Object.assign(respinResult.extendInfoForFreeGameResult, result.extendInfoForFreeGameResult);

                result.extendInfoForFreeGameResult.isRespinFeature = false;

                //clean retrigger event and add round to total round
                if (respinResult.extendInfoForFreeGameResult.isRetrigger) {
                    respinResult.extendInfoForFreeGameResult.isRetrigger = false;
                    respinResult.roundInfo.totalRound += respinResult.roundInfo.addRound;
                    respinResult.roundInfo.addRound = 0;
                }

                respinResult.extendInfoForFreeGameResult.sideCreditBallScreenLabel =
                    respinResult.extendInfoForFreeGameResult.sideCreditBallScreenLabel.map(
                        (x) => (x = x.map((x) => (x = 0)))
                    );

                respinResult.displayInfo = new DisplayInfo();

                respinResult.displayInfo.fortuneLevelType = '';
                respinResult.displayInfo.dampInfo = result.extendInfoForFreeGameResult.reSpinScreenResult.dampInfo;
                respinResult.displayInfo.rngInfo = result.extendInfoForFreeGameResult.reSpinScreenResult.rngInfo;

                respinResult.specialHitInfo = result.specialHitInfo;

                results.splice(index, 0, respinResult);
            }
        }

        results.reverse();
    }

    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
