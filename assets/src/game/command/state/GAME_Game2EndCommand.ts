import { _decorator } from 'cc';
import { Game2EndCommand } from '../../../sgv3/command/state/Game2EndCommand';
import { FreeGameEvent, StateWinEvent } from '../../../sgv3/util/Constant';
import { GlobalTimer } from '../../../sgv3/util/GlobalTimer';
import { GameScene } from '../../../sgv3/vo/data/GameScene';
import { GAME_GameDataProxy } from '../../proxy/GAME_GameDataProxy';
import { MathUtil } from '../../../core/utils/MathUtil';
import { WinType } from '../../../sgv3/vo/enum/WinType';
const { ccclass } = _decorator;
@ccclass('GAME_Game2EndCommand')
export class GAME_Game2EndCommand extends Game2EndCommand {
    readonly beforeEndShowRrunningTime: number = 1.2;
    readonly endShowTimeKey: string = 'endShowTimeKey';
    /** game2結束面板處理 */
    protected playGame2EndBoard() {
        this.showTotalWinSum();
        this.gameDataProxy.afterFeatureGame = true;
    }

    /** 有贏分顯示CreditBoard */
    protected showTotalWinSum() {
        this.sendNotification(FreeGameEvent.ON_BEFORE_END_SCORE_SHOW, this.beforeEndShowRrunningTime);
        GlobalTimer.getInstance()
            .registerTimer(this.endShowTimeKey, this.beforeEndShowRrunningTime * 2, this.showCreditBoard, this)
            .start();
    }

    protected showCreditBoard() {
        GlobalTimer.getInstance().removeTimer(this.endShowTimeKey);

        let sceneData = this.gameDataProxy.getSceneDataByName(GameScene.Game_2);
        let runningTime = sceneData.wonCreditBoardRunningTime + sceneData.wonCreditBoardEndTime;
        let totalWin: number = this.gameDataProxy.convertCredit2Cash(this.gameDataProxy.spinEventData.playerTotalWin);

        // 檢查是否達到Big Win標準，未達到則跳過結算面板
        if (!this.isBigWinOrAbove(totalWin)) {
            // 贏分小於Big Win，直接跳過結算面板回到BaseGame
            this.delayCloseBoard();
            return;
        }

        // 達到Big Win以上，正常顯示結算面板
        this.sendNotification(StateWinEvent.SHOW_LAST_CREDIT_BOARD, totalWin);
        GlobalTimer.getInstance().registerTimer(this.timerKey, runningTime, this.delayCloseBoard, this).start();
    }

    /**
     * 判定贏分是否達到Big Win標準
     * 直接使用 MultipleCalculateCommand 已經計算好的 totalWinType
     * @param totalWin 總贏分金額 (unused - 使用已計算的 totalWinType)
     * @returns true: 達到Big Win以上, false: 未達到Big Win
     */
    private isBigWinOrAbove(totalWin: number): boolean {
        // 直接使用 MultipleCalculateCommand 已經計算並設定的 totalWinType
        // 這樣就能確保與 MultipleCalculateCommand 的邏輯完全同步
        const winType = this.gameDataProxy.totalWinType;
        
        // 判斷是否為 Big Win 以上等級
        return winType === WinType.bigWin || 
               winType === WinType.megaWin || 
               winType === WinType.superWin || 
               winType === WinType.jumboWin;
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GAME_GameDataProxy;
    protected get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
