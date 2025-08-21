import { GameProxy } from 'src/core/proxy/GameProxy';
import { NetworkProxy } from 'src/core/proxy/NetworkProxy';
import { IGameConfig } from 'src/core/vo/IGameConfig';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
import { WheelData } from 'src/sgv3/vo/data/WheelData';

export class DemoProxy extends GameProxy {
    public static Demo_NAME: string = 'DemoProxy';
    public static RAW_NAME: string = 'NetworkProxy';
    public static FEATURE_SELECT: string = 'Demo_Feature_Select';

    public static NAME: string = DemoProxy.Demo_NAME;

    private rawSFSProxy: NetworkProxy;

    public isDemoed: boolean;
    private _gameWheelData: Map<string, WheelData[][]> = new Map<string, WheelData[][]>();
    private _gameGroupingWheelData: Map<string, WheelData[][][]> = new Map<string, WheelData[][][]>();
    private _demoWheelData: Map<string, WheelData[][]> = new Map<string, WheelData[][]>();
    private _demoGroupingWheelData: Map<string, WheelData[][][]> = new Map<string, WheelData[][][]>();

    protected hasSentSpinRequest: boolean = false;

    public get gameWheelData() {
        return this._gameWheelData;
    }

    public get gameGroupingWheelData() {
        return this._gameGroupingWheelData;
    }

    public set demoWheelData(wheelData) {
        this._demoWheelData = wheelData;
    }

    public get demoWheelData() {
        return this._demoWheelData;
    }

    public set demoGroupingWheelData(groupingWheelData) {
        this._demoGroupingWheelData = groupingWheelData;
    }

    public get demoGroupingWheelData() {
        return this._demoGroupingWheelData;
    }

    public constructor() {
        super(DemoProxy.NAME);

        this.isDemoed = false;
        this.catchGameGroupingWheelData();
        this.catchGameWheelData();
    }

    public checkBeforeLoadGame(): boolean {
        console.log('checkBeforeLoadGame true');
        return true;
    }

    /**
     * 重新取出NetworkProxy，有可能會被Demo切換掉
     */
    public get netProxy(): NetworkProxy {
        return this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
    }
    /**

        /**
     * @param name 欲使用的測試案例名稱
     * @returns 該測試案例的description
     */

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

    public sendInitRequest(): void {
        let requestName = 'h5.init';
        // this.caseManager.handleTask(requestName, this);
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
        this.hasSentSpinRequest = true;
        if (operation != 'baseGame') {
            this.sendNotification(DemoProxy.FEATURE_SELECT, operation);
        }
        // this.caseManager.handleTask(requestName, this);
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
        this.hasSentSpinRequest = true;
        // this.caseManager.handleTask(requestName, this);
    }

    public resetSentSpinRequest(): void {
        this.hasSentSpinRequest = false;
    }

    public getRequestAndPlayConfirm(): boolean {
        return true;
    }

    public resetSettlePlayState(): void {}

    public getSettlePlayState(): boolean {
        return false;
    }

    public resetSendSpinState(): void {}

    public getCanSpinState(): boolean {
        return true;
    }

    // private onReqTableType(request: GameRequest): void {}

    public reconnect(): void {}

    public hasRetried(): boolean {
        return true;
    }

    public onResponse(event: string, data: any): void {
        this.sendNotification(event, data);
    }

    public demo(): void {
        this.rawSFSProxy = this.netProxy;
        this.changeProxy(DemoProxy.RAW_NAME);

        this.isDemoed = true;
        this.setGroupingWheelData(this.demoGroupingWheelData);
        this.setWheelData(this.demoWheelData);
    }

    public recover(): void {
        this.changeProxy(DemoProxy.Demo_NAME);
        this.facade.registerProxy(this.rawSFSProxy);

        this.isDemoed = false;
        this.setGroupingWheelData(this.gameGroupingWheelData);
        this.setWheelData(this.gameWheelData);
    }

    private changeProxy(name: string): void {
        this.proxyName = name;
        this.facade.registerProxy(this);
    }

    public catchGameWheelData() {
        for (let sceneName in GameSceneOption) {
            let GameStateSetting = this.gameDataProxy.getStateSettingByName(sceneName);
            if (GameStateSetting && GameStateSetting.wheelData) {
                this._gameWheelData.set(sceneName, GameStateSetting.wheelData.concat());
            }
        }
    }

    public catchGameGroupingWheelData() {
        for (let sceneName in GameSceneOption) {
            let GameStateSetting = this.gameDataProxy.getStateSettingByName(sceneName);
            if (GameStateSetting && GameStateSetting.groupingWheelData) {
                this._gameGroupingWheelData.set(sceneName, GameStateSetting.groupingWheelData.concat());
            }
        }
    }

    public setWheelData(wheelData) {
        for (let sceneName in GameSceneOption) {
            let GameStateSetting = this.gameDataProxy.getStateSettingByName(sceneName);
            if (GameStateSetting && wheelData.get(sceneName)) {
                GameStateSetting.wheelData = wheelData.get(sceneName);
            }
        }
    }

    public setGroupingWheelData(groupingWheelData) {
        for (let sceneName in GameSceneOption) {
            let GameStateSetting = this.gameDataProxy.getStateSettingByName(sceneName);
            if (GameStateSetting && groupingWheelData.get(sceneName)) {
                GameStateSetting.groupingWheelData = groupingWheelData.get(sceneName);
            }
        }
    }

    public setPlatformApi() {}
    public changeSoundStatus(val) {}
    public changeOptionStatus(val) {}
    public updateTotalBet(val) {}
    public sendNotEnoughMsg() {}
    public connect(): void {}
    public sendRecoveryData(data: string): void {}
    public sendSettlePlay(totalWin: number): void {}
    public sendRngRequest(rng: number[]): void {}
    public sendFeatureRequest(featureId: number) {}
    public getConfig(): IGameConfig {
        throw new Error('Method not implemented.');
    }
    public setConfig(val) {}

    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}

export enum GameSceneOption {
    Init = 'Init',
    Loading = 'Loading',
    Game_1 = 'Game_1',
    Game_2 = 'Game_2',
    Game_3 = 'Game_3',
    Game_4 = 'Game_4'
}
