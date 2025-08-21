import { _decorator, Node, EventKeyboard, KeyCode } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { CoreGameDataProxy } from '../../core/proxy/CoreGameDataProxy';
import { KeyboardProxy } from '../../core/proxy/KeyboardProxy';
import { Logger } from '../../core/utils/Logger';
import { MockGameDataProxy } from '../proxy/MockGameDataProxy';
import { MockSFSProxy } from '../proxy/MockSFSProxy';
import { LoadingCaseListener, MTCaseManager } from '../proxy/MTCaseManager';
import { MTControllerView, MTControllerViewListener } from '../view/MTControllerView';
const { ccclass } = _decorator;

@ccclass('MTControllerViewMediator')
export class MTControllerViewMediator extends BaseMediator<MTControllerView> implements MTControllerViewListener, LoadingCaseListener {
    public static MOCK_SFS_PROXY: string = 'MOCK_SFS_PROXY';

    private objMockSFSProxy: MockSFSProxy;
    private objMockGameDataProxy: MockGameDataProxy;
    private objGameDataProxy: CoreGameDataProxy;

    private controllerView: MTControllerView;
    private mtCaseManager: MTCaseManager;

    constructor(name?: string, component?: any) {
        super(name, component);
        MTControllerViewMediator.NAME = this.mediatorName;
    }

    public onRegister(): void {
        Logger.i('MTControllerViewMediator initial done');
    }

    protected lazyEventListener(): void {
        this.controllerView = this.viewComponent;
        this.controllerView.initView(this);
        this.mtCaseManager = this.controllerView.mtCaseManager;
    }

    private get mockSFSProxy(): MockSFSProxy {
        if (!this.objMockSFSProxy) {
            this.objMockSFSProxy = this.facade.retrieveProxy(MockSFSProxy.NAME) as MockSFSProxy;
        }

        return this.objMockSFSProxy;
    }

    private get mockGameDataProxy(): MockGameDataProxy {
        if (!this.objMockGameDataProxy) {
            this.objMockGameDataProxy = this.facade.retrieveProxy(MockGameDataProxy.NAME) as MockGameDataProxy;
        }

        return this.objMockGameDataProxy;
    }

    private get gameDataProxy(): CoreGameDataProxy {
        if (!this.objGameDataProxy) {
            this.objGameDataProxy = this.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
        }

        return this.objGameDataProxy;
    }

    public listNotificationInterests(): Array<any> {
        return [KeyboardProxy.EV_KEY_DOWN, MTControllerViewMediator.MOCK_SFS_PROXY];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let event: string = notification.getName();

        switch (event) {
            case KeyboardProxy.EV_KEY_DOWN:
                this.onKeyDown(notification);
                break;
        }
    }

    private onKeyDown(notification: puremvc.INotification): void {
        const keyEvent = notification.getBody() as EventKeyboard;

        switch (keyEvent.keyCode) {
            case KeyCode.KEY_X:
                this.onClickX();
                break;
        }
    }

    private onClickX(): void {
        if (!this.mockSFSProxy.hasCaseManager()) {
            this.mockSFSProxy.loadCases(this, this.mtCaseManager);
            this.controllerView.node.active = true;
        } else {
            this.mockSFSProxy.connect();
            this.controllerView.node.active = !this.controllerView.node.active;
        }
    }

    public onClickCase(name: string): void {
        this.mockSFSProxy.mock();
        let description = this.mockSFSProxy.selectCase(name);
        this.mockGameDataProxy.mock();

        this.controllerView.setDescription(description);
        this.onClickX();
    }

    public onClickAdd(text: string): void {
        this.mockSFSProxy.addTempCase(text);
        this.onClickCase(MTCaseManager.TEMP_CASE);
    }

    public onClickCancel(): void {
        if (this.mockGameDataProxy instanceof MockGameDataProxy) {
            this.mockGameDataProxy.recover();
        }

        if (this.mockSFSProxy instanceof MockSFSProxy) {
            this.mockSFSProxy.recover();
        }

        this.controllerView.enabled = false;
    }

    /**
     * @param total case數量
     */
    public onStart(total: number) {
        this.controllerView.setDescription('Case amount: ' + total);
    }

    /**
     * @param name 已完成載入的case名稱
     */
    public onCompleteCase(name: string) {
        this.controllerView.appendDescription('Case ' + name + ' is ready');
        this.controllerView.addCase(name);
    }

    /**
     * @param url 載入失敗的案例檔名
     */
    public onError(url: string) {
        this.controllerView.setDescription('Failed loading: ' + url);
    }

    /**
     * @param name 已選擇的測試案例名稱
     */
    public onSelect(name: string): void {
        // TODO record the selection
    }

    /**
     * @param name 錯誤的測試案例名稱
     */
    public onErrorSelect(name: string): void {
        this.controllerView.setDescription('Failed selection: ' + name);
    }

    /**
     * @param name 已完成載入的task名稱
     */
    public onCompleteTask(name: string): void {
        this.controllerView.appendDescription('Task ' + name + ' is ready');
    }
}
