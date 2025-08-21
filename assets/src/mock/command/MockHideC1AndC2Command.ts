import { _decorator } from 'cc';
const { ccclass } = _decorator;
import { ReelEvent } from '../../sgv3/util/Constant';

@ccclass('MockHideC1AndC2Command')
export class MockHideC1AndC2Command extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockHideC1AndC2Command';

    public execute(notification: puremvc.INotification): void {
        this.sendNotification(ReelEvent.ON_HIDE_C1_AND_C2);
    }
}


