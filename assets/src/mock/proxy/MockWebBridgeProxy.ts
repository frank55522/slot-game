import { Component } from 'cc';
import { SlotViewMediator } from '../../mocktool/mediator/SlotViewMediator';
import { WebBridgeProxy } from '../../sgv3/proxy/WebBridgeProxy';

export class MockWebBridgeProxy extends WebBridgeProxy {
    private checkMediatorExist(): boolean {
        return !!SlotViewMediator;
    }

    private checkMediatorNameExist(): boolean {
        return this.checkMediatorExist() && !!SlotViewMediator.NAME;
    }

    private checkMockViewVisible(): boolean {
        if (this.checkMediatorNameExist()) {
            const viewComponent: Component = this.facade.retrieveMediator(SlotViewMediator.NAME).getViewComponent();
            if (!!viewComponent && viewComponent.node.active) {
                return true;
            }
        }
        return false;
    }

    public handleContainerMsg(e: MessageEvent) {}
    /**
     * 提供給外部複寫收到onWebSpinBtnClick要做的事件
     * @return 是否可以執行slot spin事件
     * */
    protected checkWebSpinBtnClick(): boolean {
        return !this.checkMockViewVisible();
    }
}
