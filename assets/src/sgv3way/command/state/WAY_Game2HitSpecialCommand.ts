import { Game2HitSpecialCommand } from '../../../sgv3/command/state/Game2HitSpecialCommand';

export class WAY_Game2HitSpecialCommand extends Game2HitSpecialCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);
    }

    /** 再次觸發 Scatter事件處理 */
    protected showRetrigger(): void {
        super.showRetrigger();
    }
}
