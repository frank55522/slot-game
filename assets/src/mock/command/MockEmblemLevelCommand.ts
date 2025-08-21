import { ViewMediatorEvent } from 'src/sgv3/util/Constant';

export class MockEmblemLevelCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockEmblemLevelCommand';

    public execute(notification: puremvc.INotification): void {
        let level = +notification.getBody();
        if (isNaN(level) || level < 0) {
            alert('Error : 請輸入大於等於1的數值，模擬意象物累積的階層');
        } else {
            this.sendNotification(ViewMediatorEvent.UPDATE_EMBLEM_LEVEL, [level]);
        }
    }
}
