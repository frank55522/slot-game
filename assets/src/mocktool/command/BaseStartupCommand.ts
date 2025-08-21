import { DEBUG } from 'cc/env';
// import { WormHoleMediator } from "../mediator/WormHoleMediator";
import { SetupDevGameConfigCommand } from './SetupDevGameConfigCommand';
import { SetupDevSFSConfigCommand } from './SetupDevSFSConfigCommand';
import { SetupLoggerErrorCommand } from './SetupLoggerErrorCommand';

export class BaseStartupCommand extends puremvc.MacroCommand {
    public static NAME: string = 'MockStartupCommand';

    public initializeMacroCommand(): void {
        const self = this;

        self.addSubCommand(SetupLoggerErrorCommand);

        if (DEBUG) {
            self.addSubCommand(SetupDevGameConfigCommand);
            self.addSubCommand(SetupDevSFSConfigCommand);
        }
    }

    public execute(notification: puremvc.INotification): void {
        super.execute(notification);
    }
}
