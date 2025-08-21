import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WinEvent, StateWinEvent } from '../../util/Constant';
import { StateCommand } from './StateCommand';

export class Game3EndCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME3_EV_END;

    protected timerKey = 'Game3End';

    public execute(notification: puremvc.INotification): void {
        const self = this;
        self.notifyWebControl();
        self.sendNotification(WinEvent.FORCE_WIN_DISPOSE); //結束關閉所有贏分線
        if (!self.gameDataProxy.curStateResult) {
            throw new Error('this.gameDataProxy.curStateResult is null');
        } else {
            self.playGame3EndBoard();
        }
    }

    /** Game3結束面板處理 */
    protected playGame3EndBoard() {
        const self = this;
        self.showCreditBoard();
    }

    /** 顯示CreditBoard */
    protected showCreditBoard() {
        const self = this;
        self.sendNotification(
            StateWinEvent.SHOW_LAST_CREDIT_BOARD,
            self.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult.shift()
        );
    }
}
