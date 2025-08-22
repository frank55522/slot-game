import { ViewMediatorEvent, DragonUpEvent } from 'src/sgv3/util/Constant';
import { Game1RollCompleteCommand } from '../../../sgv3/command/state/Game1RollCompleteCommand';
import { StateMachineProxy } from '../../../sgv3/proxy/StateMachineProxy';
import { GlobalTimer } from '../../../sgv3/util/GlobalTimer';
import { GameScene } from '../../../sgv3/vo/data/GameScene';
import { BaseGameResult } from '../../../sgv3/vo/result/BaseGameResult';
import { SymbolId } from 'src/sgv3/vo/enum/Reel';
import { GTMUtil } from 'src/core/utils/GTMUtil';

export class GAME_Game1RollCompleteCommand extends Game1RollCompleteCommand {
    protected timerKey = 'game1RollComplete';
    private isHitGrand: boolean = false;

    public execute(notification: puremvc.INotification): void {
        this.gameDataProxy.isSpinning = false;
        // 滾停，將 Web Spin 按鈕改變圖示
        this.webBridgeProxy.setElementStyle('spinBtn', 'stop', 'remove');
        // 進入Roll代表可以重置preScene為當前的Scene
        this.gameDataProxy.preScene = GameScene.Game_1;
        let curRoundResult = this.gameDataProxy.curRoundResult as BaseGameResult;
        let emblemLevel = (this.gameDataProxy.curEmblemLevel = this.getEmblemLevel());
        // 判斷是否有意象物升階表演
        this.sendNotification(ViewMediatorEvent.UPDATE_EMBLEM_LEVEL, emblemLevel);
        this.sentGTMEvent();

        // 題目一：發送 BaseGame 滾停後的中獎連線顯示
        this.triggerWinLineDisplay();
        
        // 題目三：發送 BaseGame 滾停後的贏分事件
        this.triggerBaseGameWinDisplay();

        // 判斷是否有特殊獎項
        this.isHitGrand = this.gameDataProxy.isHitGrand();

        // 延遲收集球的表演
        let delayTime: number = 0;
        let ballCount = curRoundResult.extendInfoForbaseGameResult.ballCount;
        if (ballCount >= 6 && this.isHitGrand == false) {
            delayTime = 2;
        } else if (ballCount > 0) {
            delayTime = 0.1;
        }
        GlobalTimer.getInstance().registerTimer(this.timerKey, delayTime, this.endGame1RollComplete, this).start();
    }

    private endGame1RollComplete() {
        GlobalTimer.getInstance().removeTimer(this.timerKey);
        if (this.isHitGrand) {
            this.changeState(StateMachineProxy.GAME1_HITSPECIAL);
        } else {
            this.changeState(StateMachineProxy.GAME1_BEFORESHOW);
        }
    }

    private getEmblemLevel(): number[] {
        let level: number[] = this.gameDataProxy.curEmblemLevel;
        let curRoundResult = this.gameDataProxy.curRoundResult as BaseGameResult;
        if (this.hasSymbolC1(curRoundResult)) {
            level = this.gameDataProxy.isHitMiniGame() ? [4] : this.gameDataProxy.getEmblemLevelInBaseGame();
        }
        return level;
    }

    private hasSymbolC1(curRoundResult: BaseGameResult) {
        let hasC1 = false;
        for (let i = 0; i < curRoundResult.screenSymbol.length; i++) {
            for (let j = 0; j < curRoundResult.screenSymbol[i].length; j++) {
                if (curRoundResult.screenSymbol[i][j] == SymbolId.C1) {
                    hasC1 = true;
                    break;
                }
            }
        }
        return hasC1;
    }
    
    protected sentGTMEvent() {
        if (!this.gameDataProxy.isFirstSpin) {
            GTMUtil.setGTMEvent('FirstSpin', {
                Member_ID: this.gameDataProxy.userId,
                Game_ID: this.gameDataProxy.machineType,
                DateTime: Date.now(),
                Session_ID: this.gameDataProxy.sessionId,
            });
            this.gameDataProxy.isFirstSpin = true;
        }
        const spinResult = this.gameDataProxy.spinEventData;
        let jp_Type = [];
        if (spinResult.bonusGameResult) {
            for (let i = 0; i < spinResult.bonusGameResult.bonusGameOneRoundResult.length; i++) {
                jp_Type.push(...spinResult.bonusGameResult.bonusGameOneRoundResult[i].hitPool);
            }
        }

        let freeGameType = '0';
        let freeGameWin = 0;
        let freeGameSpin = 0;
        if (spinResult.freeGameResult) {
            const specialHitInfo = spinResult.freeGameResult.freeGameOneRoundResult[0]?.specialHitInfo;
            switch (specialHitInfo) {
                case 'freeGame_01':
                    freeGameType = '1';
                    break;
                case 'freeGame_02':
                    freeGameType = '2';
                    break;
                case 'freeGame_03':
                    freeGameType = '3';
                    break;
            }

            freeGameWin = spinResult.freeGameResult.freeGameTotalWin;
            freeGameSpin = spinResult.freeGameResult.totalRound;
        }
        
        if (spinResult.topUpGameResult) {
            freeGameType = '4';

            freeGameWin = spinResult.topUpGameResult.topUpGameTotalWin;
            freeGameSpin = spinResult.topUpGameResult.totalRound;
        }

        GTMUtil.setGTMEvent('SpinResponse', {
            GameSeqNo: this.gameDataProxy.spinSequenceNumber,
            Bet_Type: '0',
            Bet_Multiplier: this._gameDataProxy.isOmniChannel() ? this.gameDataProxy.curBet : this.gameDataProxy.curTotalBet,
            Feature_Bet: this._gameDataProxy.isOmniChannel() ? this.gameDataProxy.curFeatureBet : '1',
            OmniDenom: this._gameDataProxy.isOmniChannel() ? this.gameDataProxy.curDenomMultiplier : '1',
            BaseGame_Win: this._gameDataProxy.convertCredit2Cash(spinResult.baseGameResult.baseGameTotalWin),
            FreeGame_Win: this._gameDataProxy.convertCredit2Cash(freeGameWin),
            FreeGame_Type: freeGameType,
            FreeGame_Spin: freeGameSpin,
            FeatureGame_Win: '0',
            FeatureGame_Type: '0',
            JP_Type: jp_Type.length > 0 ? jp_Type : undefined,
            SpinSpeedMode: this.gameDataProxy.curSpeedMode,
            Session_ID: this.gameDataProxy.sessionId,
            PreviewType: this.gameDataProxy.previewType
        });
    }

    /**
     * 觸發中獎連線顯示（題目一）
     */
    private triggerWinLineDisplay(): void {
        // 只在 BaseGame 和 FreeGame 場景觸發，避免在 feature selection 等場景顯示
        if (this.gameDataProxy.curScene !== GameScene.Game_1 && this.gameDataProxy.curScene !== GameScene.Game_2) {
            return;
        }

        if (this.gameDataProxy.stateWinData.wayInfos.length > 0) {
            // 過濾掉沒有中獎的項目 (symbolWin > 0)
            const validWinInfos = this.gameDataProxy.stateWinData.wayInfos.filter(info => info.symbolWin > 0);
            
            if (validWinInfos.length > 0) {
                // === 輸出中獎信息到 Console ===
                const sceneType = this.gameDataProxy.curScene === GameScene.Game_1 ? 'BaseGame' : 'FreeGame';
                console.log(`=== ${sceneType} 滾停後中獎連線結果 ===`);
                validWinInfos.forEach((winInfo) => {
                    const symbolName = this.getSymbolNameById(winInfo.symbolId);
                    console.log(`${symbolName} × ${winInfo.hitCount} = ${winInfo.symbolWin.toFixed(2)}`);
                });
                console.log(`總共 ${validWinInfos.length} 條中獎連線`);
                console.log('================================');
                
                this.sendNotification('SHOW_WIN_LINES', validWinInfos);
                console.log(`GAME_Game1RollCompleteCommand: 觸發顯示 ${validWinInfos.length} 條中獎連線 (${sceneType})`);
            } else {
                const sceneType = this.gameDataProxy.curScene === GameScene.Game_1 ? 'BaseGame' : 'FreeGame';
                console.log(`${sceneType} 本局無中獎連線`);
            }
        } else {
            const sceneType = this.gameDataProxy.curScene === GameScene.Game_1 ? 'BaseGame' : 'FreeGame';
            console.log(`${sceneType} 本局無任何中獎數據`);
        }
    }

    /**
     * 根據 symbolId 獲取符號名稱
     */
    private getSymbolNameById(symbolId: number): string {
        const symbolMap: { [key: number]: string } = {
            0: 'WILD',
            1: 'C1', // Scatter
            2: 'M1',
            3: 'M2', 
            4: 'M3',
            5: 'J',
            6: 'Q',
            7: 'K',
            8: 'A',
            9: '10',
            10: '9'
        };
        return symbolMap[symbolId] || `Symbol_${symbolId}`;
    }

    private triggerBaseGameWinDisplay(): void {
        const spinResult = this.gameDataProxy.spinEventData;
        const baseGameWin = spinResult.baseGameResult.baseGameTotalWin;
        
        // 只有在有贏分時才發送事件
        if (baseGameWin > 0) {
            // 發送龍珠顯示贏分事件，帶上贏分參數
            this.sendNotification(DragonUpEvent.ON_BASEGAME_WIN_DISPLAY, {
                winAmount: baseGameWin,
                formattedWin: this._gameDataProxy.convertCredit2Cash(baseGameWin)
            });
        }
    }
}
