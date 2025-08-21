import { CoreStartupGameCommand } from '../../core/command/CoreStartupGameCommand';
import { GameDataProxy } from '../proxy/GameDataProxy';
import { RegisterJackpotCommand } from './jackpot/RegisterJackpotCommand';
import { RegisterSlotDisconnectCommand } from './register/RegisterSlotDisconnectCommand';
import { SetupSlotConfigCommand } from './SetupSlotConfigCommand';

export class StartupGameCommand extends CoreStartupGameCommand {
    protected initializeAfterMacroCommand() {
        super.initializeAfterMacroCommand();
        // 註冊Slot斷線command
        this.addSubCommand(RegisterSlotDisconnectCommand);
    }

    protected getMockCommand(): string {
        return 'SlotMockStartupCommand';
    }

    public initializeMacroCommand(): void {
        super.initializeMacroCommand();
        // 註冊JP
        this.addSubCommand(RegisterJackpotCommand);
        // 註冊 SlotConfig
        this.addSubCommand(SetupSlotConfigCommand);
    }

    public execute(notification: puremvc.INotification): void {
        super.execute(notification);
        const self = this;

        const gdProxy = self.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
    }
}
