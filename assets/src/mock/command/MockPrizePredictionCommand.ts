import { ReelEvent } from '../../sgv3/util/Constant';

export class MockPrizePredictionCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockPrizePredictionCommand';

    public execute(notification: puremvc.INotification): void {
        this.sendNotification(ReelEvent.ON_REEL_PRIZE_PREDICTION);
    }
}
