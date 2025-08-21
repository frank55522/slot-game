import { Component } from 'cc';
import { DEBUG } from 'cc/env';
import { MockViewMediator } from '../mediator/MockViewMediator';
import { MockWebBridgeProxy } from '../proxy/MockWebBridgeProxy';
import { MockKeyboardInputCommand } from './MockKeyboardInputCommand';

/**
 * 這只負責註冊跟slot有關的mock註冊
 */
export class RegisterSlotMockCommand extends puremvc.SimpleCommand {
    public execute(notification: puremvc.INotification): void {
        let rootView: Component = notification.getBody();

        super.execute(notification);
        const self = this;
        // if (DEBUG) {
        //     self.facade.registerCommand(MockKeyboardInputCommand.NAME, MockKeyboardInputCommand);
        // }
        //self.facade.registerProxy(new MockWebBridgeProxy());
        self.registerMediator(rootView);
    }

    protected registerMediator(rootView) {
        const self = this;
        self.facade.registerMediator(new MockViewMediator(rootView));
    }
}
