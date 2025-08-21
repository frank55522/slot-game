import { js } from 'cc';
import { DEBUG } from 'cc/env';
import { CoreSGMaintenanceCommand } from '../command/CoreSGMaintenanceCommand';
import { Logger } from '../utils/Logger';
import { TSMap } from '../utils/TSMap';
import { CloseHelpCommand } from 'src/sgv3/command/help/CloseHelpCommand';

/**
 * 與前端傳遞訊息的接口
 */
export class CoreWebBridgeProxy extends puremvc.Proxy {
    public static readonly NAME: string = 'CoreWebBridgeProxy';
    /**
     * 開關遊戲聲音
     *
     * @param enable true, if open
     */
    public static readonly EV_ENABLE_SOUND: string = 'EV_ENABLE_SOUND';

    public isAccountStatusMultipleLogin: boolean = false;
    public isTriggerErrorCode: boolean = false;

    protected cUrl: string;
    protected _listenerMap: TSMap<any, any>;

    public constructor() {
        super(CoreWebBridgeProxy.NAME);
        this.initAPI();
    }

    /**
     * 初始化遊戲提供給前端的API
     */
    protected initAPI(): void {
        // 宣告事件，開關 Help 需傳給 Container
        window['closeHelpPage'] = this.closeHelp.bind(this);
    }

    public get listenerMap(): TSMap<any, any> {
        if (this._listenerMap == null) {
            this._listenerMap = new TSMap<any, any>();
            let url_string = window.location.href;
            let url = new URL(url_string);
            this.cUrl = url.searchParams.get('curl');

            // 建立監聽器
            window.addEventListener('message', (e) => {
                // 非 container 網段即 return
                if (e.origin !== this.cUrl) return;
                this.handleContainerMsg(e);
            });
        }
        return this._listenerMap;
    }

    /**
     * 通知前端遊戲載入進度
     */
    public notifyGameProgress(progress: number): void {
        this.getWebFunRequest(this, 'setGameProgress', progress);
    }

    /**
     * 通知前端遊戲已經初始完畢
     */
    public notifyGameReady(): void {
        this.getWebFunRequest(this, 'notifyGameReady');
    }

    /**
     * 提供前端遊戲訊息代碼
     */
    public sendMsgCode(code: number, value: number = 0): void {
        this.isTriggerErrorCode = true;
        Logger.i('Show message: ' + code);
        this.getWebFunRequest(this, 'showErrorMsgByCode', code, value);
    }

    /**
     * 開啟 Help
     */
    public openHelp(message: any): void {
        var data = JSON.parse(message);
        window['curHelpVersion'](data.versionName);
        window['openGameHelp'](data.lang);
        window['curGameVersion'](data.gameVer);
        window['curTotalBet'](data.bet);
        this.getWebFunRequest(this, 'gameClientMsg', { event: 'toggleHelpPage', value: true });
    }
    /**
     * 關閉 Help
     */
    public closeHelp(): void {
        this.sendNotification(CloseHelpCommand.NAME);
        this.getWebFunRequest(this, 'gameClientMsg', { event: 'toggleHelpPage', value: false });
    }

    /**
     * 開啟報表
     */
    public openReport(): void {
        this.getWebFunRequest(this, 'gotoReport');
    }

    public openMoreGameMenu(): void {
        this.getWebFunRequest(this, 'openMoreGameMenu');
    }

    /**
     * 回到前端遊戲大廳
     */
    public quitGame(): void {
        this.getWebFunRequest(this, 'gotoGameHall');
    }

    /**
     * @param true, 顯示版號在前端的畫面
     */
    public enableUIVersion(enable: boolean): void {
        this.getWebFun('getUIVersion', enable);
    }

    /**
     * 取得遊戲版號
     */
    public getUIVersion(): any {
        /**
         * TODO
         */
        return this.getWebFun('getUIVersion');
    }

    /**
     * 向前端發出更新ticket需求
     */
    public updateTicket(): void {
        /**
         * TODO
         */
        this.getWebFun('updateTicket');
    }

    /**
     * 向前端發出重新選線需求
     */
    public reconnect(): void {
        /**
         * TODO
         */
        this.getWebFun('reconnect');
    }

    /**
     * 關閉前端的提示訊息
     */
    public resetWebErrors(): void {
        /**
         * TODO
         */
        this.getWebFun('resetWebErrors');
    }

    /**
     * @return null, if miss the web function. ex. getWebFun('function name', 'param1', 'param2')
     */
    public getWebFun(...param): any {
        let funName: string = param.shift();
        if (window[funName]) {
            return window[funName](...param);
        } else {
            Logger.w('Miss the web function: ' + funName);
            return null;
        }
    }

    // get web function by post message
    public getWebFunRequest(listener: any, ...param): any {
        // 請求 container 呼叫 web function，指定傳給 curl 網段
        let funName: string = param.shift();
        if (listener) this.listenerMap.set(funName, listener);
        window.parent.postMessage(
            JSON.stringify({
                name: funName,
                data: param
            }),
            this.cUrl
        );
    }

    /**
     * @returns null, if miss the web object
     */
    public getWebObj(objName: any): any {
        if (window[objName]) {
            return window[objName];
        } else {
            Logger.w('Miss the web object: ' + objName);
            return null;
        }
    }

    // get web object by post message
    public getWebObjRequest(listener: any, objName: any): any {
        this.listenerMap.set(objName, listener);
        // 請求 container 傳送需求資料，指定傳給 curl 網段
        window.parent.postMessage(
            JSON.stringify({
                name: objName,
                data: {}
            }),
            this.cUrl
        );
    }

    // send player data to server for log or record
    public sendPlayerData(data: {}) {
        window.parent.postMessage(JSON.stringify(data), this.cUrl);
    }

    // 處理監聽 message
    protected handleContainerMsg(e: MessageEvent) {
        let name = JSON.parse(e.data).name;
        if (this.listenerMap.has(name)) {
            let listener = this.listenerMap.get(name);
            listener.handleContainerMsg(e);
            this.listenerMap.delete(name);
        }
    }
}
