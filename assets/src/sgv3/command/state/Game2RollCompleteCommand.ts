import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { FreeGameOneRoundResult } from '../../vo/result/FreeGameOneRoundResult';
import { StateCommand } from './StateCommand';
import { GameScene } from '../../vo/data/GameScene';
export class Game2RollCompleteCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME2_EV_ROLLCOMPLETE;

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        let freeGameOneRoundResult: FreeGameOneRoundResult = this.gameDataProxy
            .curRoundResult as FreeGameOneRoundResult;

        // 進入Roll代表可以重置preScene為當前的Scene
        this.gameDataProxy.preScene = GameScene.Game_2;

        // 判斷是否有特殊獎項
        if (
            !!freeGameOneRoundResult &&
            freeGameOneRoundResult.extendInfoForFreeGameResult.isRetrigger &&
            (!freeGameOneRoundResult.displayLogicInfo.maxTriggerCountFlag ||
                freeGameOneRoundResult.roundInfo.addRound > 0)
        ) {
            this.changeState(StateMachineProxy.GAME2_HITSPECIAL);
            return;
        }
        this.changeState(StateMachineProxy.GAME2_BEFORESHOW);
    }
}
