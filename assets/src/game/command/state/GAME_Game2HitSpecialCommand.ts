import { _decorator } from 'cc';
import { StateMachineObject } from '../../../core/proxy/CoreStateMachineProxy';
import { Game2HitSpecialCommand } from '../../../sgv3/command/state/Game2HitSpecialCommand';
import { StateMachineProxy } from '../../../sgv3/proxy/StateMachineProxy';
import { WinEvent } from '../../../sgv3/util/Constant';
import { SpecialHitInfo } from '../../../sgv3/vo/enum/SpecialHitInfo';
import { BonusGameOneRoundResult } from '../../../sgv3/vo/result/BonusGameOneRoundResult';
import { FreeGameSpecialInfo } from '../../vo/FreeGameSpecialInfo';
const { ccclass } = _decorator;

@ccclass('GAME_Game2HitSpecialCommand')
export class GAME_Game2HitSpecialCommand extends Game2HitSpecialCommand {
    protected timerKey_Retrigger = 'game2HitSpecialRetrigger';
    protected timerKey_HitGrand = 'game1HitGrand';

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        let freeGameSpecialInfo: FreeGameSpecialInfo = (notification.getBody() as StateMachineObject).body;

        if (freeGameSpecialInfo.isHitGrand) {
            const getGrand = (oneRoundResult: BonusGameOneRoundResult) =>
                oneRoundResult.specialHitInfo == SpecialHitInfo[SpecialHitInfo.bonusGame_02];
            // only Hit Grand in one game cycle
            let grandCash =
                this.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult.find(
                    getGrand
                ).oneRoundJPTotalWin;
            this.sendNotification(WinEvent.ON_HIT_GRAND, {
                grandCash: grandCash,
                callback: this.endGame2HitGrand.bind(this)
            });
        } else if (freeGameSpecialInfo.retrigger.isRetrigger) {
            this.showRetrigger();
            // 通知ui要做hitSpecial表演
            //this.sendNotification(WinEvent.ON_HIT_SPECIAL, freeGameSpecialInfo.retrigger.addRound);
        }
    }

    protected endGame2HitGrand() {
        // 移除已經表演過的bonus資料
        const removeResult = (result: BonusGameOneRoundResult) =>
            result.specialHitInfo != SpecialHitInfo[SpecialHitInfo.bonusGame_02];
        this.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult =
            this.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult.filter(removeResult);
        this.changeState(StateMachineProxy.GAME2_BEFORESHOW);
    }
}
