import { Logger } from '../utils/Logger';
import { IGameConfig } from '../vo/IGameConfig';
import { NetworkType } from '../vo/NetworkType';
import { GameProxy } from './GameProxy';
// import { ODDSworksProxy } from './ODDSworksProxy';
import { SFSProxy } from './SFSProxy';

export class NetworkProxy extends puremvc.Proxy {
    public static readonly NAME: string = 'NetworkProxy';

    public static STATE_CONNECTING = 'STATE_CONNECTING';

    connectNetworkType = window['serviceProvider'];
    protocolProxy: GameProxy;

    protected needSendSpinState: boolean = true;
    protected needSettlePlayState: boolean = false;
    protected hasSentSpinRequest: boolean = false;

    public reconnectionRegister: number = -1;
    public getTicketRegister: number = -1;

    public constructor(proxyName: string = NetworkProxy.NAME) {
        super(NetworkProxy.NAME);
        // if (this.connectNetworkType === ServiceProvider.DEFAULT) {
        this.protocolProxy = new SFSProxy();
        /*}  else if (this.connectNetworkType === ServiceProvider.OTHERS) {
            this.protocolProxy = new ODDSworksProxy();
        } */
    }

    public connect() {
        this.protocolProxy.connect();
    }

    public disconnect() {
        this.protocolProxy.disconnect();
    }

    public reconnect() {
        this.protocolProxy.reconnect();
    }

    public reconnectFail() {
        const sfsProxy = this.protocolProxy as SFSProxy;
        sfsProxy.reconnectFail();
    }

    public sendInitRequest(): void {
        this.protocolProxy.sendInitRequest();
    }

    public sendSpinRequest(
        playerBet: number,
        extraBetType: string,
        denom: number,
        operation: string,
        waysBet: number,
        waysBetColumn: number,
        denomMultiplier: number,
        featureBet: number
    ): void {
        this.protocolProxy.sendSpinRequest(
            playerBet,
            extraBetType,
            denom,
            operation,
            waysBet,
            waysBetColumn,
            denomMultiplier,
            featureBet
        );
        this.needSendSpinState = false;
        this.hasSentSpinRequest = true;
        this.resetSettlePlayState();
    }

    public sendLineSpinRequest(
        playerBet: number,
        extraBetType: string,
        denom: number,
        operation: string,
        betLine: number,
        lineBet: number
    ): void {
        this.protocolProxy.sendLineSpinRequest(playerBet, extraBetType, denom, operation, betLine, lineBet);
        this.needSendSpinState = false;
        this.hasSentSpinRequest = true;
        this.resetSettlePlayState();
    }

    public sendRecoveryData(data: string): void {
        this.protocolProxy.sendRecoveryData(data);
    }

    public sendSettlePlay(totalWin: number): void {
        if (this.needSettlePlayState == false) {
            Logger.w('重覆送settlePlay');
            return;
        }
        this.needSettlePlayState = false;
        this.protocolProxy.sendSettlePlay(totalWin);
    }

    public resetSentSpinRequest(): void {
        this.hasSentSpinRequest = false;
    }

    public getSentSpinRequest(): boolean {
        return this.hasSentSpinRequest;
    }

    public resetSettlePlayState(): void {
        this.needSettlePlayState = true;
    }

    public getSettlePlayState(): boolean {
        return this.needSettlePlayState;
    }

    public resetSendSpinState(): void {
        this.needSendSpinState = true;
    }

    public getCanSpinState(): boolean {
        return this.needSendSpinState;
    }

    public requestToConfirmSpin(): boolean {
        if (this.protocolProxy.getRequestAndPlayConfirm()) return true;
        else return false;
    }

    public sendRngRequest(rng: Array<number>): void {
        this.protocolProxy.sendRngRequest(rng);
    }

    public sendFeatureRequest(featureId: number): void {
        this.protocolProxy.sendFeatureRequest(featureId);
    }

    public isConnected() {
        return this.protocolProxy.isConnected();
    }

    public hasRetried() {
        return this.protocolProxy.hasRetried();
    }

    public getConfig(): IGameConfig {
        return this.protocolProxy.getConfig();
    }
    public setConfig(config: IGameConfig, otherData?: any): void {
        this.protocolProxy.setConfig(config, otherData);
    }

    public getPlayerID(): string {
        return this.protocolProxy.getPlayerID();
    }

    public setPlayerID(playerID: string) {
        this.protocolProxy.setPlayerID(playerID);
    }

    public getSessionID(): string {
        return this.protocolProxy.getSessionID();
    }

    public setSessionID(sessionID: string) {
        this.protocolProxy.setSessionID(sessionID);
    }

    public getGameSeqNo(): number {
        return this.protocolProxy.getGameSeqNo();
    }

    public setGameSeqNo(gameSeqNo: number) {
        this.protocolProxy.setGameSeqNo(gameSeqNo);
    }

    public getNetworkType(): NetworkType {
        return this.connectNetworkType;
    }

    public changeSoundStatus(val) {
        this.protocolProxy.changeSoundStatus(val);
    }

    public setPlatformApi() {
        this.protocolProxy.setPlatformApi();
    }

    public changeOptionStatus(val) {
        this.protocolProxy.changeOptionStatus(val);
    }

    public updateTotalBet(val: number) {
        this.protocolProxy.updateTotalBet(val);
    }

    public sendNotEnoughMsg() {
        this.protocolProxy.sendNotEnoughMsg();
    }

    public sendNotEnoughMsgAndReload() {
        const sfsProxy = this.protocolProxy as SFSProxy;
        sfsProxy.sendNotEnoughMsgAndReload();
    }
}
