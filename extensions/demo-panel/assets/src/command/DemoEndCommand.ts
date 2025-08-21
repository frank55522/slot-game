import { DemoProxy } from '../proxy/DemoProxy';

export class DemoEndCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'DemoEndCommand';

    public execute(notification: puremvc.INotification): void {
        this.demoProxy.recover();
    }

    // ======================== Get Set ========================

    protected _demoProxy: DemoProxy;
    protected get demoProxy(): DemoProxy {
        if (!this._demoProxy) {
            this._demoProxy = this.facade.retrieveProxy(DemoProxy.NAME) as DemoProxy;
        }
        return this._demoProxy;
    }
}
