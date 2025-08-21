import { StateMachineCommand } from '../../../core/command/StateMachineCommand';
import { Logger } from '../../../core/utils/Logger';

/** 確認狀態轉換錯誤 */
export class CheckStateFailCommand extends puremvc.SimpleCommand {
    public static readonly NAME = StateMachineCommand.EV_FAILED_STATE;

    public execute(notification: puremvc.INotification): void {
        Logger.w('checkState Fail!');
    }
}
