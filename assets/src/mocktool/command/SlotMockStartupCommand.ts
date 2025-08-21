import { DEBUG } from 'cc/env';
import { CoreGameDataProxy } from '../../core/proxy/CoreGameDataProxy';
import { RegisterSlotMockCommand } from '../../mock/command/RegisterSlotMockCommand';
import { MockGameDataProxy } from '../proxy/MockGameDataProxy';
import { MockSFSProxy } from '../proxy/MockSFSProxy';
import { RNGSheetProxy } from '../proxy/RNGSheetProxy';
import { BaseStartupCommand } from './BaseStartupCommand';
import { MockSetupSFSConfigCommand } from './MockSetupSFSConfigCommand';

export class SlotMockStartupCommand extends BaseStartupCommand {
    public initializeMacroCommand(): void {
        super.initializeMacroCommand();
        // full canvas 無需註冊 SlotMockCommand
        this.addSubCommand(RegisterSlotMockCommand);
    }

    public execute(notification: puremvc.INotification): void {
        super.execute(notification);

        const self = this;
        const rootView = notification.getBody();
        self.facade.registerProxy(new RNGSheetProxy());
        this.facade.registerProxy(new MockSFSProxy());
        self.facade.registerProxy(new MockGameDataProxy());
        self.registerCommand();
        // self.connectRNGSheet();
    }

    protected registerCommand() {
        if (DEBUG) {
            const self = this;
            self.facade.registerCommand(MockSetupSFSConfigCommand.NAME, MockSetupSFSConfigCommand);
        }
    }

    protected connectRNGSheet() {
        const self = this;
        const gameDataProxy = self.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
        const rngProxy = self.facade.retrieveProxy(RNGSheetProxy.NAME) as RNGSheetProxy;
        rngProxy.connect(gameDataProxy.machineType);
    }
}
