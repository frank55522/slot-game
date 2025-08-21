import { SFLoginCommand } from '../../core/command/SFLoginCommand';
import { GameProxy, GameRequest } from '../../core/proxy/GameProxy';
import { JackpotPoolCommand } from '../../sgv3/command/jackpot/JackpotPoolCommand';
import { NetworkProxy } from '../../core/proxy/NetworkProxy';
import { IGameConfig } from '../../core/vo/IGameConfig';
import { MTTask } from '../vo/MTTask';
import { MTCaseManager, LoadingCaseListener } from './MTCaseManager';
import { TaskHandlerListener } from './TaskHandler';
import { Logger } from '../../core/utils/Logger';
import { SFConnectionCommand } from '../../core/command/SFConnectionCommand';

export class MockSFSProxy extends GameProxy implements TaskHandlerListener {
    public static MOCK_NAME: string = 'MockSFSProxy';
    public static RAW_NAME: string = 'NetworkProxy';

    public static NAME: string = MockSFSProxy.MOCK_NAME;

    private rawSFSProxy: NetworkProxy;

    private isMocked: boolean;

    protected hasSentSpinRequest: boolean = false;

    private caseManager: MTCaseManager;

    public constructor() {
        super(MockSFSProxy.NAME);

        this.isMocked = false;
    }

    public checkBeforeLoadGame(): boolean {
        console.log('checkBeforeLoadGame true');
        return true;
    }

    /**
     * 重新取出NetworkProxy，有可能會被Mock切換掉
     */
    public get netProxy(): NetworkProxy {
        return this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
    }

    public getTask(name: string): MTTask {
        return this.caseManager.getTask(name);
    }

    /**
     * @param text JSON格式描述的測試案例
     */
    public addTempCase(text: string): void {
        this.caseManager.addCase(text);
    }

    /**
     * @param name 欲使用的測試案例名稱
     * @returns 該測試案例的description
     */
    public selectCase(name: string): string {
        if (!this.caseManager) return;

        this.caseManager.selectCase(name);

        return this.caseManager.getCaseDescription();
    }

    /**
     * 讀取所有案例的描述檔，為json格式
     * @param path 專案目錄，如果有CDN的話要作此設定
     */
    public loadCases(l: LoadingCaseListener, mtCaseManager: MTCaseManager): void {
        if (this.caseManager) return;

        this.caseManager = mtCaseManager;
        this.caseManager.setLoadingCaseListener(l);
        this.caseManager.loadCases();
    }

    /**
     * 嘗試使用mock資料來連線
     */
    public connect(): void {
        if (this.rawSFSProxy instanceof NetworkProxy && !this.rawSFSProxy.isConnected()) {
            let task = this.caseManager.getTask('gameLoginReturn');
            if (task) {
                let data = task.data;
                let jpTask = this.caseManager.getTask('jackpotPoolNotify');
                let jpData = jpTask.data;
                this.facade.sendNotification(JackpotPoolCommand.NAME, jpData);
                this.facade.sendNotification(SFConnectionCommand.NAME, data);
            }
        }
    }

    /**
     * 永遠為連線狀態
     */
    public isConnected(): boolean {
        return true;
    }

    /**
     * 向server提出斷線要求
     */
    public disconnect(): void {
        const self = this;
        self.recover();
        this.rawSFSProxy.disconnect();
    }

    public setConfig(config: IGameConfig) {
        this.rawSFSProxy.setConfig(config);
    }

    public getConfig(): IGameConfig {
        return this.rawSFSProxy.getConfig();
    }

    public sendInitRequest(): void {
        let requestName = 'h5.init';
        this.caseManager.handleTask(requestName, this);
    }

    /**
     * 送需求至server
     */
    public sendSpinRequest(
        playerBet: number,
        extraBetType: string,
        denom: number,
        operation: string,
        waysBet: number,
        waysBetColumn: number
    ): void {
        let requestName = 'h5.spin';
        this.caseManager.handleTask(operation, this);
        this.hasSentSpinRequest= true;
    }

    public sendLineSpinRequest(
        playerBet: number,
        extraBetType: string,
        denom: number,
        operation: string,
        betLine: number,
        lineBet: number
    ): void {
        let requestName = 'h5.spin';
        this.caseManager.handleTask(requestName, this);
        this.hasSentSpinRequest= true;
    }

    public getRequestAndPlayConfirm(): boolean {
        return true;
    }

    public sendRecoveryData(data: string): void {
        let requestName = 'h5.saveData';
        this.caseManager.handleTask(requestName, this);
    }

    public sendSettlePlay(totalWin: number): void {
        Logger.i('Send SettlePlay');
        // let requestName = 'h5.settlePlay';
        // this.caseManager.handleTask(requestName, this);
    }

    public sendRngRequest(rng: Array<number>): void {
        let requestName = 'h5.rng';
        this.caseManager.handleTask(requestName, this);
    }

    public sendFeatureRequest(featureId: number): void {
        let requestName = 'h5.feature';
        this.caseManager.handleTask(requestName, this);
    }

    public resetSettlePlayState(): void {}

    public getSettlePlayState(): boolean {
        return false;
    }

    public resetSentSpinRequest(): void {
        this.hasSentSpinRequest = false;
    }

    public getSentSpinRequest(): boolean {
        return this.hasSentSpinRequest;
    }

    public resetSendSpinState(): void {}

    public getCanSpinState(): boolean {
        return true;
    }

    private onReqTableType(request: GameRequest): void {}

    public reconnect(): void {}

    public hasRetried(): boolean {
        return true;
    }

    public onResponse(task: MTTask): void {
        this.sendNotification(task.event, task.data);
    }

    public mock(): void {
        if (this.isMocked) return;

        this.isMocked = true;

        this.rawSFSProxy = this.netProxy;
        this.changeProxy(MockSFSProxy.RAW_NAME);
    }

    public recover(): void {
        if (!this.isMocked) return;

        this.isMocked = false;

        this.changeProxy(MockSFSProxy.MOCK_NAME);
        this.facade.registerProxy(this.rawSFSProxy);
    }

    public hasCaseManager(): boolean {
        return this.caseManager != null;
    }

    private changeProxy(name: string): void {
        MockSFSProxy.NAME = MockSFSProxy.RAW_NAME;
        this.proxyName = MockSFSProxy.NAME;
        this.facade.registerProxy(this);
    }

    public setPlatformApi() {}
    public changeSoundStatus(val) {}
    public changeOptionStatus(val) {}
    public updateTotalBet(val) {}
    public sendNotEnoughMsg() {}
}
