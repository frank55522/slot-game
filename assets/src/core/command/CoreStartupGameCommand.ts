import { Component } from 'cc';
import { CoreGameDataProxy } from '../proxy/CoreGameDataProxy';
import { CoreStateMachineProxy } from '../proxy/CoreStateMachineProxy';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';
import { KeyboardProxy } from '../proxy/KeyboardProxy';
import { CoreSGMaintenanceCommand } from './CoreSGMaintenanceCommand';
import { SetupGameConfigCommand } from './SetupGameConfigCommand';
import { SetupSFSConfigCommand } from './SetupSFSConfigCommand';
import { SFReconnectCommand } from './SFReconnectCommand';
import { SGErrorCommand } from './SGErrorCommand';
import { StateMachineCommand } from './StateMachineCommand';
import { AfterReconnectionCommand } from '../../sgv3/command/connect/AfterReconnectionCommand';

export class CoreStartupGameCommand extends puremvc.MacroCommand {
    public static NAME: string = 'StartupGameCommand';

    protected initializeAfterMacroCommand(): void {
        const cmd = this.getMockCommand();
        if (window[cmd]) {
            this.addSubCommand(window[cmd]);
        }
    }

    protected getMockCommand(): string {
        return 'MockStartupCommand';
    }

    public initializeMacroCommand(): void {
        this.addSubCommand(SetupGameConfigCommand);
        this.addSubCommand(SetupSFSConfigCommand);
        this.initializeAfterMacroCommand();
    }

    public execute(notification: puremvc.INotification): void {
        const self = this;
        self.facade.registerProxy(new CoreGameDataProxy());
        self.facade.registerProxy(new CoreWebBridgeProxy());
        self.facade.registerProxy(new KeyboardProxy()); // 全域鍵盤事件
        self.facade.registerProxy(new CoreStateMachineProxy());
        // self.facade.registerProxy(new AssetsProxy(rootView));
        self.facade.registerCommand(CoreSGMaintenanceCommand.NAME, CoreSGMaintenanceCommand);
        self.facade.registerCommand(SetupSFSConfigCommand.NAME, SetupSFSConfigCommand);
        self.facade.registerCommand(SFReconnectCommand.NAME, SFReconnectCommand);
        self.facade.registerCommand(AfterReconnectionCommand.NAME, AfterReconnectionCommand);
        self.facade.registerCommand(StateMachineCommand.NAME, StateMachineCommand);
        self.facade.registerCommand(SGErrorCommand.NAME, SGErrorCommand);
        // FIXME mediator 建構子依賴到proxy，必需更改依賴的時間點
        super.execute(notification);
        self.facade.removeCommand(CoreStartupGameCommand.NAME);
    }
}
