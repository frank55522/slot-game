import { _decorator } from 'cc';
import { Game2EndCommand } from '../../../sgv3/command/state/Game2EndCommand';
import { FreeGameEvent, StateWinEvent } from '../../../sgv3/util/Constant';
import { GlobalTimer } from '../../../sgv3/util/GlobalTimer';
import { GameScene } from '../../../sgv3/vo/data/GameScene';
import { GAME_GameDataProxy } from '../../proxy/GAME_GameDataProxy';
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

        this.sendNotification(StateWinEvent.SHOW_LAST_CREDIT_BOARD, totalWin);
        GlobalTimer.getInstance().registerTimer(this.timerKey, runningTime, this.delayCloseBoard, this).start();
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
