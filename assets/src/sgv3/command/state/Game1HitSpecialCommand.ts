import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WinEvent } from '../../util/Constant';
import { GlobalTimer } from '../../util/GlobalTimer';
import { GameScene } from '../../vo/data/GameScene';
import { SpecialHitInfo } from '../../vo/enum/SpecialHitInfo';
import { StateCommand } from './StateCommand';

export class Game1HitSpecialCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME1_EV_HITSPECIAL;

    protected timerKey_FreeGame = 'game1HitSpecialFreeGame';

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        let mySceneData = this.gameDataProxy.getSceneDataByName(GameScene.Game_1);

        let idx = 0;
        while (idx < this.gameDataProxy.curRoundResult.specialFeatureResult.length) {
            if (
                this.gameDataProxy.curRoundResult.specialFeatureResult[idx].specialHitInfo ===
                    SpecialHitInfo[SpecialHitInfo.freeGame_01] ||
                this.gameDataProxy.curRoundResult.specialFeatureResult[idx].specialHitInfo ===
                    SpecialHitInfo[SpecialHitInfo.freeGame_02] ||
                this.gameDataProxy.curRoundResult.specialFeatureResult[idx].specialHitInfo ===
                    SpecialHitInfo[SpecialHitInfo.freeGame_03]
            ) {
                GlobalTimer.getInstance()
                    .registerTimer(
                        this.timerKey_FreeGame,
                        mySceneData.specialHitRunningTime,
                        this.endGame1HitSpecialFreeGame,
                        this
                    )
                    .start();
                this.sendNotification(WinEvent.ON_HIT_SPECIAL);
            }
            idx++;
        }
    }

    protected endGame1HitSpecialFreeGame() {
        GlobalTimer.getInstance().removeTimer(this.timerKey_FreeGame);
        this.changeState(StateMachineProxy.GAME1_BEFORESHOW);
    }
}
