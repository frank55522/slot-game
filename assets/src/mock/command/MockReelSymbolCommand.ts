import { CheckScreenSymbolCommand } from '../../sgv3/command/nomatch/CheckScreenSymbolCommand';
import { ScreenEvent } from '../../sgv3/util/Constant';
import { StripIndexer } from '../../sgv3/vo/match/ReelMatchInfo';

export class MockCheckScreenSymbolCommand extends CheckScreenSymbolCommand {
    public static ErrorIndex: string;

    public changeFakeSymbol(info: StripIndexer): void {
        if (MockCheckScreenSymbolCommand.ErrorIndex == info.reelIndex.toString()) {
            // info.reelFrames = this.shiftArrayValue(info.reelFrames, 2);
            // const self = this;
            // const matchInfo = self.gameDataProxy().symbolMatchInfo;
            // matchInfo.reelSymbolFrames[info.reelIndex] = self.truncateBothEnds(info.reelFrames);
        }
    }
}

export class MockReelSymbolCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockReelSymbolCommand';

    public execute(notification: puremvc.INotification): void {
        if (notification.getBody()) {
            MockCheckScreenSymbolCommand.ErrorIndex = notification.getBody();
        }

        const self = this;
        self.facade.removeCommand(CheckScreenSymbolCommand.NAME);
        self.facade.registerCommand(MockCheckScreenSymbolCommand.NAME, MockCheckScreenSymbolCommand);
        self.sendNotification(ScreenEvent.ON_SPIN_DOWN);
    }
}
