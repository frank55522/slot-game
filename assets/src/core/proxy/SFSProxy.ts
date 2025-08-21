import { TSMap } from '../utils/TSMap';
import { Logger } from '../utils/Logger';
import { GameProxy } from './GameProxy';
import { ISFSProxyConfig } from '../vo/ISFSProxyConfig';
import { SFTimeoutCommand } from '../command/SFTimeoutCommand';
import { CoreSFDisconnectionCommand } from '../command/CoreSFDisconnectionCommand';
import { CoreGameDataProxy } from './CoreGameDataProxy';
import { Formula } from '../utils/Formula';
import { GameModule } from '../../sgv3/vo/enum/GameModule';
import { director, Scheduler, System, macro, log } from 'cc';
import { CoreWebBridgeProxy } from './CoreWebBridgeProxy';
import { CoreMsgCode } from '../constants/CoreMsgCode';
import { SFReconnectCommand } from '../command/SFReconnectCommand';

export class SFSProxy extends GameProxy {
    public static readonly NAME: string = 'SFSProxy';
    public static readonly EV_ERROR: string = 'EV_ERROR';
    /**
     * 預設的keep alive時間，單位為毫秒
     *
     * @static
     *
     * @memberOf SFSProxy
     */
    public static readonly KEEP_ALIVE_DELAY = 5000;
    /**
     * 預設的SmartFox逾時時間，單位為毫秒
     *
     * @static
     *
     * @memberOf SFSProxy
     */
    public static readonly CONNECTION_TIMEOUT = 20000;
    /**
     * Keep alive的回應值
     *
     * @static
     *
     * @memberOf SFSProxy
     */
    public static KEEP_ALIVE_RESPONSE = 'heartbeat';
    /**
     * SmartFox連線逾時所有的鍵值
     *
     * @static
     *
     * @memberOf SFSProxy
     */
    public static KEY_TIMEOUT = 'SFS_TIMEOUT';
    /**
     * 無連線
     *
     * @static
     */
    public static STATE_DISCONNECTION = 'STATE_DISCONNECTION';
    /**
     * 連線中
     *
     * @static
     */
    public static STATE_CONNECTING = 'STATE_CONNECTING';
    /**
     * 連線中
     *
     * @static
     */
    public static STATE_RECONNECT_FAIL = 'STATE_RECONNECT_FAIL';
    /**
     * 註冊中
     *
     * @static
     */
    public static STATE_LOGIN = 'STATE_LOGIN';
    /**
     * 遊戲初始化中
     *
     * @static
     */
    public static STATE_INIT = 'STATE_INIT';
    /**
     * 已連線
     *
     * @static
     */
    public static STATE_CONNECTED = 'STATE_CONNECTED';
    /**
     * 連線狀態
     */
    private connectedState: string = SFSProxy.STATE_DISCONNECTION;
    private sfs: SFS2X.SmartFox = null;
    private keepAliveDelay: number = SFSProxy.KEEP_ALIVE_DELAY * 0.001; // 因為cocos的scheduler以秒為單位，因此單位轉成秒
    private keepAliveTimer: Scheduler; // egret.Timer;
    private timeoutHandlerMap: TSMap<string, TimeoutHandler>;
    private isTimeout: boolean;
    /**
     * 與Smartfox server連線時的timeout，onConnection、onLogin、GameInit各別計數此timeout
     */
    private connectedTimeout: number = 0;
    /**
     * 重連最大上限
     *
     * @static
     */
    public static MAX_RETRY: number = 2;
    /**
     * 計數重連次數
     */
    private retry: number = 0;

    public getConfig(): ISFSProxyConfig {
        return this.config as ISFSProxyConfig;
    }

    public setConfig(config: ISFSProxyConfig, otherData?: any): void {
        if (otherData != null) {
            config.zone = otherData['zone'];
            config.debug = false;
            config.machineType = Number(otherData['machineType']);
            config.gameType = Number(otherData['gameType']);
            config.uid = otherData['gameUid'];
            config.userName = otherData['gameUid'];
            config.useSSL = otherData['useSSL'];
            config.sessionID0 = otherData['sessionID'][0];
            config.sessionID1 = otherData['sessionID'][1];
            config.sessionID2 = otherData['sessionID'][2];
            config.sessionID3 = otherData['sessionID'][3];
            config.sessionID4 = otherData['sessionID'][4];
            config.gameUid = otherData['gameUid'];
            config.gamePass = otherData['gamePass'];
            config.gameLoginName = otherData['gameLoginName'] ?? 'gameLogin';
            config.jackpotGroup = otherData['jackpotGroup'];
            var strGsInfo: String = otherData['gsInfo'];
            let gsInfo: Array<string> = strGsInfo.split('_');
            config.host = gsInfo[0];
            config.port = Number(gsInfo[1]);
            // FIXME: 可能用不到的code，要試驗，用不著就刪除
            config.password = 'a';
            config.clientType = 'Web';
            config.t = otherData['t'];
        }
        this.config = config;

        this.setPlayerID('123456');
        this.setSessionID(this.config.sessionID0);
    }

    /**
     * @param 袑始化SFS名稱
     * @param SmartFox逾時時間
     */
    public constructor(proxyName: string = SFSProxy.NAME) {
        super(proxyName);
        this.connectedState = SFSProxy.STATE_DISCONNECTION;
        this.isTimeout = false;
        this.timeoutHandlerMap = new TSMap<string, TimeoutHandler>();
    }

    public checkBeforeLoadGame(): boolean {
        Logger.i('checkBeforeLoadGame false');
        return false;
    }

    private initSmartFox(): void {
        const self = this;
        Logger.i('initSmartFox');
        let config = self.getConfig();
        self.disposeSmartFox();
        Formula.loggerClassContent(config);
        self.sfs = new SFS2X.SmartFox(config);
        if (!config['logLevel']) {
            config.logLevel = SFS2X.LogLevel.ERROR;
        }
        self.sfs.logger.level = config.logLevel;
        self.sfs.addEventListener(SFS2X.SFSEvent.CONNECTION, self.onConnection, self);
        self.sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, self.onConnectionLost, self);
        self.sfs.addEventListener(SFS2X.SFSEvent.LOGIN_ERROR, self.onLoginError, self);
        self.sfs.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, self.onExtensionResponse, self);
        self.sfs.addEventListener(SFS2X.SFSEvent.LOGIN, self.onLogin, self);
    }

    private disposeSmartFox(): void {
        const self = this;
        if (self.sfs) {
            Logger.i('DISPOSE SMARTFOX');
            self.sfs.removeEventListener(SFS2X.SFSEvent.CONNECTION, self.onConnection);
            self.sfs.removeEventListener(SFS2X.SFSEvent.CONNECTION_LOST, self.onConnectionLost);
            self.sfs.removeEventListener(SFS2X.SFSEvent.LOGIN_ERROR, self.onLoginError);
            self.sfs.removeEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, self.onExtensionResponse);
            self.sfs.removeEventListener(SFS2X.SFSEvent.LOGIN, self.onLogin);
            self.sfs = null;
        }
    }

    private onConnection(evtParams: SFS2X.ICONNECTION): void {
        const self = this;
        Logger.i('onConnection: ' + evtParams.success);
        if (self.connectedState == SFSProxy.STATE_RECONNECT_FAIL) {
            self.suspendAllTimeoutHandler();
            self.sfs.disconnect();
            return;
        }

        if (evtParams.success) {
            self.connectedState = SFSProxy.STATE_LOGIN;
            self.suspendTimeoutHandler(SFSProxy.KEY_TIMEOUT);
            self.enableKeepAlive();
            let config = self.getConfig();
            self.sendSFSRequest(
                SFSProxy.KEY_TIMEOUT,
                new SFS2X.LoginRequest(config.userName, config.password, null, config.zone),
                self.connectedTimeout
            );
        } else {
            self.connectedState = SFSProxy.STATE_DISCONNECTION;
            self.facade.sendNotification(SFSProxy.EV_ERROR, evtParams);
            Logger.i('SmartFox got the failed connection.');
        }
    }

    /**
     * 造成斷線的事件處理
     *
     * @param cmd 斷線原因
     * @param obj 斷線時的附加物件
     */
    private sendDisconnection(cmd: string, obj?: any): void {
        const self = this;
        self.suspendAllTimeoutHandler();
        self.connectedState = SFSProxy.STATE_DISCONNECTION;
        switch (cmd) {
            case SFTimeoutCommand.NAME:
                self.facade.sendNotification(cmd, obj);
                break;
            case SFReconnectCommand.NAME:
                if (self.isTimeout) break;
                self.facade.sendNotification(SFReconnectCommand.NAME, obj);
                break;
        }
    }

    private onConnectionLost(evtParams: SFS2X.ICONNECTION_LOST): void {
        const self = this;
        self.connectedState = SFSProxy.STATE_DISCONNECTION;
        self.disableKeepAlive();
        self.sendDisconnection(SFReconnectCommand.NAME, evtParams);
    }

    private onLoginError(evtParams: SFS2X.ILOGIN_ERROR): void {
        const self = this;
        self.connectedState = SFSProxy.STATE_DISCONNECTION;
        self.suspendAllTimeoutHandler();
        self.disableKeepAlive();
        self.facade.sendNotification(SFSProxy.EV_ERROR, evtParams);
    }

    /** SmartFox 接收Response API */
    public onExtensionResponse(evtParams: SFS2X.IEXTENSION_RESPONSE): void {
        const self = this;
        self.connectedState = SFSProxy.STATE_CONNECTED;
        if (evtParams.cmd == SFSProxy.KEEP_ALIVE_RESPONSE) {
            return;
        } else {
            Logger.d('onExtensionResponse ' + evtParams.cmd);
        }
        if (!self.facade.hasCommand(evtParams.cmd)) {
            Logger.i('Unavailable extension response: ' + evtParams.cmd);
            return;
        }
        let result: SFS2X.SFSObject = evtParams.params as SFS2X.SFSObject;
        let json = undefined;
        try {
            const entity: string = self.handleCodePoints(result.getByteArray('entity'));
            json = JSON.parse(entity);
        } catch (e) {}
        result = json ? json : result;
        self.facade.sendNotification(evtParams.cmd, result);
    }

    private handleCodePoints(array: any): any {
        let CHUNK_SIZE = 0x8000;
        let index = 0;
        let length = array.length;
        let result = '';
        let slice;
        while (index < length) {
            slice = array.slice(index, Math.min(index + CHUNK_SIZE, length));
            result += String.fromCharCode.apply(null, slice);
            index += CHUNK_SIZE;
        }
        return result;
    }

    private onLogin(evtParams: SFS2X.ILOGIN): void {
        Logger.i('onLogin');
        const self = this;
        self.suspendTimeoutHandler(SFSProxy.KEY_TIMEOUT);
        self.connectedState = SFSProxy.STATE_INIT;
        let gameDataProxy = self.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
        gameDataProxy.extendNetworkData = evtParams.user;
        let config = self.getConfig();
        let obj: SFS2X.SFSObject = new SFS2X.SFSObject();
        obj.putUtfString('uid', config.uid);
        obj.putInt('gameType', config.gameType);
        obj.putInt('machineType', config.machineType);
        obj.putUtfString('bankId', '');
        obj.putDouble('startBalance', 0);
        obj.putBool('debug', config.debug);
        obj.putUtfString('gameUid', config.gameUid ? config.gameUid : config.uid);
        obj.putUtfString('gamePass', config.gamePass ? config.gamePass : config.password);
        obj.putUtfString('userName', config.userName);
        obj.putUtfString('sessionID0', config.sessionID0 ? config.sessionID0 : '');
        obj.putUtfString('sessionID1', config.sessionID1 ? config.sessionID1 : '');
        obj.putUtfString('sessionID2', config.sessionID2 ? config.sessionID2 : '');
        obj.putUtfString('sessionID3', config.sessionID3 ? config.sessionID3 : '');
        obj.putUtfString('sessionID4', config.sessionID4 ? config.sessionID4 : '');
        obj.putBool('useSSL', config.useSSL ? config.useSSL : false);
        obj.putUtfString('password', config.password);
        obj.putUtfString('clientType', config.clientType);
        obj.putUtfString('t', config.t ? config.t : '');
        obj.putUtfString('gameLoginName', config.gameLoginName);
        obj.putUtfString('zone', config.zone);
        obj.putInt('port', config.port);
        obj.putUtfString('host', config.host);
        obj.putUtfString('jackpotGroup', config.jackpotGroup ? config.jackpotGroup : '');

        this.sfs.send(new SFS2X.ExtensionRequest(config.gameLoginName, obj));
    }

    /**
     * 向server提出連線要求
     *
     * @param delay 限制連時時間
     */
    public connect(timeout: number = SFSProxy.CONNECTION_TIMEOUT): void {
        const self = this;
        if (self.isConnected()) return;
        Logger.i('Connect to SFS');
        self.connectedState = SFSProxy.STATE_CONNECTING;
        self.connectedTimeout = timeout;
        self.initSmartFox();
        self.invokeTimeoutHandler(SFSProxy.KEY_TIMEOUT, timeout);
        self.sfs.connect();
        Logger.i('Connected');
    }

    /**
     * 向server提出斷線要求
     */
    public disconnect(): void {
        const self = this;
        if (!self.isConnecting()) {
            self.sendNotification(CoreSFDisconnectionCommand.NAME);
            return;
        }
        Logger.i('Disconnect SFS');
        self.suspendAllTimeoutHandler();
        self.sfs.disconnect();
    }

    /**
     * 送init需求至server
     */
    public sendInitRequest(): void {
        const reqName: string = 'h5.init';
        let req: SFS2X.SFSObject = new SFS2X.SFSObject();
        let entity: SFS2X.SFSObject = new SFS2X.SFSObject();
        let responseName: string = undefined;
        let timeOut: number = 0;

        req.putUtfString('code', reqName);
        req.putSFSObject('entity', entity);

        this.sendSFSRequest(responseName, new SFS2X.ExtensionRequest(reqName, req), timeOut);
        Logger.i('sendInitRequest');
    }

    /**
     * 送spin需求至server
     */
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
        const reqName: string = 'h5.spin';
        let req: SFS2X.SFSObject = new SFS2X.SFSObject();
        let entity: SFS2X.SFSObject = new SFS2X.SFSObject();
        let responseName: string = undefined;
        let timeOut: number = 0;
        let betRequest: SFS2X.SFSObject = new SFS2X.SFSObject();
        let extendSpinRequest: SFS2X.SFSObject = new SFS2X.SFSObject();

        betRequest.putUtfString('betType', GameModule[GameModule.WayGame]);
        betRequest.putInt('waysBet', waysBet);
        betRequest.putInt('wayGameBetColumn', waysBetColumn);
        if (denomMultiplier > 0) {
            betRequest.putInt('featureBet', featureBet);
            betRequest.putInt('denomMultiplier', denomMultiplier);
        }

        entity.putSFSObject('betRequest', betRequest);
        entity.putUtfString('denom', String(denom));
        entity.putUtfString('extraBetType', extraBetType);
        entity.putUtfString('playerBet', String(playerBet));
        entity.putUtfString('operation', operation);
        entity.putSFSObject('extendSpinRequest', extendSpinRequest);

        req.putSFSObject('entity', entity);

        if (this.isBetLegal(playerBet)) {
            this.sendSFSRequest(responseName, new SFS2X.ExtensionRequest(reqName, req), timeOut);
        } else {
            this.disconnect();
        }
    }

    private isBetLegal(playerBet: number): boolean {
        let isLegal: boolean = true;
        if (playerBet < 0) {
            isLegal = false;
        }
        return isLegal;
    }

    public sendLineSpinRequest(
        playerBet: number,
        extraBetType: string,
        denom: number,
        operation: string,
        betLine: number,
        lineBet: number
    ): void {
        const reqName: string = 'h5.spin';
        let req: SFS2X.SFSObject = new SFS2X.SFSObject();
        let entity: SFS2X.SFSObject = new SFS2X.SFSObject();
        let responseName: string = undefined;
        let timeOut: number = 0;
        let betRequest: SFS2X.SFSObject = new SFS2X.SFSObject();

        betRequest.putUtfString('betType', GameModule[GameModule.LineGame]);
        betRequest.putInt('betLine', betLine);
        betRequest.putInt('lineBet', lineBet);

        entity.putSFSObject('betRequest', betRequest);
        entity.putUtfString('denom', String(denom));
        entity.putUtfString('extraBetType', extraBetType);
        entity.putUtfString('playerBet', String(playerBet));
        entity.putUtfString('operation', operation);

        req.putSFSObject('entity', entity);

        if (this.isBetLegal(playerBet)) {
            this.sendSFSRequest(responseName, new SFS2X.ExtensionRequest(reqName, req), timeOut);
        } else {
            this.disconnect();
        }
    }

    public sendRecoveryData(data: string): void {
        let reqName = 'h5.saveData';
        let req: SFS2X.SFSObject = new SFS2X.SFSObject();
        let entity: SFS2X.SFSObject = new SFS2X.SFSObject();
        let responseName: string = undefined;
        let timeOut: number = 0;

        if (this.gameSeqNo == null) {
            Logger.i('gameSeqNo empty');
            this.gameSeqNo = 0;
        }

        entity.putUtfString('recoveryData', data);

        entity.putUtfString('playerID', this.playerID);
        entity.putUtfString('sessionID', this.sessionID);
        entity.putLong('gameSeqNo', this.gameSeqNo);

        req.putUtfString('code', reqName);
        req.putSFSObject('entity', entity);

        this.sendSFSRequest(responseName, new SFS2X.ExtensionRequest(reqName, req), timeOut);
    }

    public sendSettlePlay(totalWin: number): void {
        let reqName = 'h5.settlePlay';
        let req: SFS2X.SFSObject = new SFS2X.SFSObject();
        let entity: SFS2X.SFSObject = new SFS2X.SFSObject();
        let responseName: string = undefined;
        let timeOut: number = 0;

        if (this.gameSeqNo == null) {
            Logger.i('gameSeqNo empty');
            this.gameSeqNo = 0;
        }

        entity.putUtfString('playerID', this.playerID);
        entity.putUtfString('sessionID', this.sessionID);
        entity.putLong('gameSeqNo', this.gameSeqNo);

        req.putUtfString('code', reqName);
        req.putSFSObject('entity', entity);

        this.sendSFSRequest(responseName, new SFS2X.ExtensionRequest(reqName, req), timeOut);
    }

    public getRequestAndPlayConfirm(): boolean {
        return true;
    }

    public sendRngRequest(rng: Array<number>): void {
        const reqName: string = 'h5.rng';
        let req: SFS2X.SFSObject = new SFS2X.SFSObject();
        let entity: SFS2X.SFSObject = new SFS2X.SFSObject();
        let responseName: string = undefined;
        let timeOut: number = 0;

        entity.putLongArray('rng', rng);

        req.putUtfString('code', reqName);
        req.putSFSObject('entity', entity);

        this.sendSFSRequest(responseName, new SFS2X.ExtensionRequest(reqName, req), timeOut);
    }

    public sendFeatureRequest(featureId: number): void {
        const reqName: string = 'h5.feature';
        let req: SFS2X.SFSObject = new SFS2X.SFSObject();
        let entity: SFS2X.SFSObject = new SFS2X.SFSObject();
        let responseName: string = undefined;
        let timeOut: number = 0;

        entity.putInt('featureId', featureId);

        req.putUtfString('code', reqName);
        req.putSFSObject('entity', entity);

        this.sendSFSRequest(responseName, new SFS2X.ExtensionRequest(reqName, req), timeOut);
    }

    private sendKeepAliveRequest(): void {
        const reqName: string = 'GEN_HEARTBEAT';
        let req: SFS2X.SFSObject = new SFS2X.SFSObject();
        let entity: SFS2X.SFSObject = new SFS2X.SFSObject();
        let timeOut: number = 0;

        req.putUtfString('code', reqName);
        req.putSFSObject('entity', entity);

        this.sendSFSRequest(reqName, new SFS2X.ExtensionRequest(reqName, req), timeOut);
    }

    private sendSFSRequest(name: string, req: any, timeout: number): void {
        const self = this;
        if (timeout > 0) {
            this.invokeTimeoutHandler(name, timeout);
        }
        this.sfs.send(req);
    }

    private invokeTimeoutHandler(key: string, timeout: number): void {
        let timeoutHandler = this.timeoutHandlerMap.get(key);
        if (timeoutHandler) {
            if (timeoutHandler.getTimeout() == timeout) {
                timeoutHandler.reset();
            } else {
                this.suspendTimeoutHandler(key);
                timeoutHandler = this.createTimeoutHandler(key, timeout);
            }
        } else {
            timeoutHandler = this.createTimeoutHandler(key, timeout);
        }
        timeoutHandler.start();
    }

    private createTimeoutHandler(key: string, timeout: number): TimeoutHandler {
        const timeoutListener = new TimeoutHandlerListener(this);
        const timeoutHandler = new TimeoutHandler(timeoutListener, timeout);
        this.timeoutHandlerMap.set(key, timeoutHandler);
        return timeoutHandler;
    }

    private suspendTimeoutHandler(key: string): void {
        const timeoutHandler = this.timeoutHandlerMap.get(key);
        if (timeoutHandler) {
            timeoutHandler.stop();
            this.timeoutHandlerMap.delete(key);
        }
    }

    private suspendAllTimeoutHandler(): void {
        const self = this;
        this.timeoutHandlerMap.forEach(function (value: TimeoutHandler) {
            if (value) {
                value.stop();
            }
        });
    }

    public hasRetried(): boolean {
        const self = this;
        self.retry += 1;
        if (self.retry >= SFSProxy.MAX_RETRY) {
            self.retry = SFSProxy.MAX_RETRY;
            return true;
        }
        return false;
    }

    public reconnect(): void {
        if (this.isTimeout) {
            return;
        }
        Logger.i('Reconnecting');
        this.connect();
    }

    public reconnectFail(): void {
        this.connectedState = SFSProxy.STATE_RECONNECT_FAIL;
        this.disconnect();
    }

    public isConnected(): boolean {
        return this.connectedState == SFSProxy.STATE_CONNECTED;
    }

    public isConnecting(): boolean {
        return this.connectedState != SFSProxy.STATE_DISCONNECTION;
    }

    public getConnectedState(): string {
        return this.connectedState;
    }

    /**
     * 啟用keep alive機制
     *
     * @memberOf SmartFoxProxy
     */
    private enableKeepAlive(): void {
        if (this.keepAliveTimer == null) {
            this.keepAliveTimer = director.getScheduler();
            Scheduler.enableForTarget(<object>this);
            this.keepAliveTimer.schedule(
                this.onTimerProgress,
                <object>this,
                this.keepAliveDelay,
                macro.REPEAT_FOREVER,
                this.keepAliveDelay,
                true
            );
        }
        this.keepAliveTimer.resumeTarget(<object>this);
    }

    private onTimerProgress(): void {
        this.sendKeepAliveRequest();
    }

    /**
     * 停用keep alive機制
     *
     * @returns {void}
     *
     * @memberOf SmartFoxProxy
     */
    private disableKeepAlive(): void {
        if (this.keepAliveTimer == null) return;
        this.keepAliveTimer.pauseTarget(<object>this);
    }

    /**
     * 觸發逾時處理
     */
    public invokeTimeout(): void {
        const self = this;
        const currentState = self.connectedState;
        self.isTimeout = true;
        self.disconnect();
        self.sendDisconnection(SFTimeoutCommand.NAME, currentState);
    }

    /**
     * 觸發逾時處理
     */
    public sendNotEnoughMsgAndReload(): void {
        const webBridgeProxy = this.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
        webBridgeProxy.sendMsgCode(CoreMsgCode.ERR_BALANCE_NOT_ENOUGH_AND_RELOAD);
    }

    public changeSoundStatus(val) {}
    public setPlatformApi() {}
    public changeOptionStatus(val) {}
    public updateTotalBet(val) {}
    public sendNotEnoughMsg() {
        const webBridgeProxy = this.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
        webBridgeProxy.sendMsgCode(CoreMsgCode.ERR_BALANCE_NOT_ENOUGH);
    }
}

/**
 *
 * Implements the timeout callback
 *
 */
export class TimeoutHandlerListener implements ITimeoutHandler {
    private sfsProxy: SFSProxy;
    public constructor(sfsProxy: SFSProxy) {
        this.sfsProxy = sfsProxy;
    }
    public onTimeout(): void {
        this.sfsProxy.invokeTimeout();
    }
}

/**
 *
 * Timeout handler
 *
 */
export class TimeoutHandler extends System {
    private isTimeoutParam: boolean;
    private listener: ITimeoutHandler;
    private timeout: number;
    private handler: Scheduler;

    constructor(l: ITimeoutHandler, timeout: number) {
        super();
        this.isTimeoutParam = false;
        this.listener = l;
        this.timeout = timeout * 0.001; // 因為cocos的scheduler以秒為單位，因此單位轉成秒
        Scheduler.enableForTarget(this);
        this.handler = director.getScheduler();
        this.handler.schedule(this.onTimeout, this, 0, 1, this.timeout, true);
    }

    private onTimeout(): void {
        this.isTimeoutParam = true;
        this.listener.onTimeout();
    }

    /**
     * @return 取得逾時時間
     */
    public getTimeout(): number {
        return this.timeout;
    }

    public start(): void {
        this.isTimeoutParam = false;
        if (this.handler.isTargetPaused(this)) {
            this.handler.resumeTarget(this);
        }
    }

    public reset(): void {
        this.isTimeoutParam = false;
        this.handler.schedule(this.onTimeout, this, 0, 1, this.timeout, true);
    }

    public stop(): void {
        if (!this.handler.isTargetPaused(this)) {
            this.handler.pauseTarget(this);
            this.handler.unschedule(this.onTimeout, this);
        }
    }

    public isTimeout(): boolean {
        return this.isTimeoutParam;
    }
}

/**
 *
 * Status callback of the timeout handler
 *
 */
export interface ITimeoutHandler {
    onTimeout(): void;
}
