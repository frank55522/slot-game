import { WinEvent } from '../../sgv3/util/Constant';

export class MockHitGrandCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockHitGrandCommand';

    public execute(notification: puremvc.INotification): void {
        let grandCash = +notification.getBody();
        if (isNaN(grandCash)) {
            alert('Error : 請輸入測試金額');
        } else{
        this.sendNotification(WinEvent.ON_HIT_GRAND, {
            grandCash: grandCash,
            callback: () => {}
        });}
    }
}
