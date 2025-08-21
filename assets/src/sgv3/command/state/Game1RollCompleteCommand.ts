import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { SpecialHitInfo } from '../../vo/enum/SpecialHitInfo';
import { StateCommand } from './StateCommand';
import { GameScene } from '../../vo/data/GameScene';

export class Game1RollCompleteCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME1_EV_ROLLCOMPLETE;

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        this.gameDataProxy.isSpinning = false;
        // 滾停，將 Web Spin 按鈕改變圖示
        this.webBridgeProxy.setElementStyle('spinBtn', 'stop', 'remove');
        // 進入Roll代表可以重置preScene為當前的Scene
        this.gameDataProxy.preScene = GameScene.Game_1;

        // 判斷是否有特殊獎項
        if (
            this.gameDataProxy.curRoundResult.specialFeatureResult &&
            this.gameDataProxy.curRoundResult.specialFeatureResult.length > 0
        ) {
            for (let i = 0; i < this.gameDataProxy.curRoundResult.specialFeatureResult.length; i++) {
                if (
                    this.gameDataProxy.curRoundResult.specialFeatureResult[i].specialHitInfo ===
                        SpecialHitInfo[SpecialHitInfo.freeGame_01] ||
                    this.gameDataProxy.curRoundResult.specialFeatureResult[i].specialHitInfo ===
                        SpecialHitInfo[SpecialHitInfo.freeGame_02] ||
                    this.gameDataProxy.curRoundResult.specialFeatureResult[i].specialHitInfo ===
                        SpecialHitInfo[SpecialHitInfo.freeGame_03]
                ) {
                    this.changeState(StateMachineProxy.GAME1_HITSPECIAL);
                    return;
                }
            }
        }
        this.changeState(StateMachineProxy.GAME1_BEFORESHOW);
    }
}
