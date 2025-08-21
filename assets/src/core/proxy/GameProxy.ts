import { Logger } from '../utils/Logger';
import { IGameConfig } from '../vo/IGameConfig';

/**
 * 封裝解析後的參數
 *
 */
export class GameEvent {
    /**
     * 事件名稱
     */
    private name: string;
    /**
     * Raw data
     */
    private data: any;
    /**
     * @param 事件名稱
     */
    public constructor(name: string, data: any) {
        this.name = name;
        this.data = data;
    }
    /**
     * @return 事件名稱
     */
    public getName(): string {
        return this.name;
    }
    /**
     * 取得raw data
     *
     * @returns object
     */
    public getData(): any {
        return this.data;
    }
}
/**
 * 封裝送給server的參數
 */
export interface GameRequest {
    getName(): string;
    getResponseName(): string;
    getRequest(): any;
}
/**
 * * 提供與server溝通的介面
 * * 儲存解析器再利用
 */
export abstract class GameProxy extends puremvc.Proxy {
    public static NAME: string = 'GameProxy';
    /**
     * 連結server的設定
     */
    protected config: any;

    protected gameSeqNo: number;

    protected sessionID: string = '';

    protected playerID: string;

    /**
     * @param host
     */
    public constructor(proxyName: string) {
        super(proxyName);
    }

    abstract checkBeforeLoadGame(): boolean;

    /**
     * 向server提出連線要求
     */
    abstract connect(): void;
    /**
     * 向server提出斷線要求
     */
    abstract disconnect(): void;

    //#region Send Request

    /**
     * 送init需求至server
     */
    abstract sendInitRequest(): void;

    /**
     * 送spin需求至server
     */
    abstract sendSpinRequest(
        playerBet: number,
        extraBetType: string,
        denom: number,
        operation: string,
        waysBet: number,
        waysBetColumn: number,
        denomMultiplier: number,
        featureBet: number
    ): void;

    /**
     * 送line spin需求至server
     */
    abstract sendLineSpinRequest(
        playerBet: number,
        extraBetType: string,
        denom: number,
        operation: string,
        betLine: number,
        lineBet: number
    ): void;

    abstract sendRecoveryData(data: string): void;

    abstract sendSettlePlay(totalWin: number): void;

    abstract sendRngRequest(rng: Array<number>): void;

    abstract getRequestAndPlayConfirm(): boolean;

    /**
     * 送feature需求至server
     */
    abstract sendFeatureRequest(featureId: number);

    //#endregion

    /**
     * 重連server
     */
    abstract reconnect(): void;

    abstract getConfig(): IGameConfig;
    abstract setConfig(config: IGameConfig, otherData?: any);

    public getPlayerID(): string {
        return this.playerID;
    }

    public setPlayerID(playerID: string) {
        Logger.w('set playerID: ' + playerID);
        this.playerID = playerID;
    }

    public getSessionID(): string {
        return this.sessionID;
    }

    public setSessionID(sessionID: string) {
        Logger.w('set sessionID: ' + sessionID);
        this.sessionID = sessionID;
    }

    public getGameSeqNo(): number {
        return this.gameSeqNo;
    }

    public setGameSeqNo(gameSeqNo: number) {
        Logger.w('set gameSeqNo: ' + gameSeqNo);
        this.gameSeqNo = gameSeqNo;
    }

    abstract hasRetried(): boolean;
    abstract isConnected(): boolean;
    abstract changeSoundStatus(val: boolean);
    abstract setPlatformApi();
    abstract changeOptionStatus(val: boolean);
    abstract updateTotalBet(val: number);
    abstract sendNotEnoughMsg();
}
