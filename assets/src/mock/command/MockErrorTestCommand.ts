import { _decorator } from 'cc';
const { ccclass } = _decorator;

@ccclass('MockErrorTestCommand')
export class MockErrorTestCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockErrorTestCommand';

    public execute(notification: puremvc.INotification): void {
        throw new Error('MockErrorTestCommand');
    }
}
