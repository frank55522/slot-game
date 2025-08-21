import { DEBUG } from 'cc/env';
import { StateMachineCommand } from '../../core/command/StateMachineCommand';
import { StateMachineObject } from '../../core/proxy/CoreStateMachineProxy';
import { CoreWebBridgeProxy } from '../../core/proxy/CoreWebBridgeProxy';
import { MathUtil } from '../../core/utils/MathUtil';
import { AutoPlayClickOptionCommand } from '../command/autoplay/AutoPlayClickOptionCommand';
import { ScreenEvent, WinEvent } from '../util/Constant';
import { GameScene } from '../vo/data/GameScene';
import { GameDataProxy } from './GameDataProxy';
import { StateMachineProxy } from './StateMachineProxy';
import { ServiceProvider } from '../../core/vo/NetworkType';
import { UIEvent } from 'common-ui/proxy/UIEvent';
import { SpeedMode } from 'common-ui/proxy/UIEnums';

/**
 * [GAME to HTML]
 * - 與 Html 通訊橋樑
 */
export class WebBridgeProxy extends CoreWebBridgeProxy {
    /** 通知 web 當前場景 */
    public static curScene: string = '';

    private waitSpinResponse: boolean = false;
    /** Web是否按下 Click To Play */
    private _isClickToPlay: boolean = false || DEBUG;
    public set isClickToPlay(value: boolean) {
        this._isClickToPlay = value;
    }
    public get isClickToPlay(): boolean {
        return this._isClickToPlay;
    }

    /**
     * 初始化遊戲提供給前端的API
     */
    protected initAPI(): void {
        window['onWebListClick'] = (_val) => this.onWebListClick(_val);
        window['onSpinBtnClick'] = () => this.spinRequest();
        window['setTurboValue'] = (_val) => this.setQuickValue(_val);
        window['onWebAutoPlayClick'] = (_val, _val2) => this.onWebAutoPlayClick(_val, _val2);
        window['setGameFeature'] = (_val) => this.setFeature(_val);
        window['checkMenuEnable'] = () => this.checkMenuEnable();
        window['enableCreditLimit'] = (val) => this.enableCreditLimit(val);
        window['checkControlPanelBtnEnable'] = () => this.checkControlPanelBtnEnable();
        window['onAutoPlay'] = () => this.onAutoPlay();

        // if (DEBUG || window['serviceProvider'] === ServiceProvider.OTHERS) {
        //     // 無container包 直接spin
        //     window['onWebSpinBtnClick'] = () => this.onSpin();
        // }
    }

    /**
     * [HTML to GAME]
     * - Html 開啟選單，通知遊戲判斷當前狀態可否開啟 Html 選單或處理未完成的遊戲表現.
     * @param _listKey 選單名稱
     */
    public onWebListClick(_listKey: string): boolean {
        // JP 開啟時，需先嘗試關閉 JP
        if (this.gameDataProxy.onHitJackpot) {
            this.sendNotification(WinEvent.HIDE_BOARD_REQUEST);
            return false;
        }

        // 如果開啟的選單為自動玩選單，則暫停自動玩.
        // 如果為自動模式，不允許開啟選單.
        if (this.gameDataProxy.onAutoPlay) {
            if (_listKey == 'autoPlay') {
                this.sendNotification(AutoPlayClickOptionCommand.NAME, [0, 0]);
            } else {
                return false;
            }
        }

        // 預設 GameScene.Game_1 才可以使用選單功能
        if (this.gameDataProxy.curScene != GameScene.Game_1) {
            return false;
        }

        // 判斷各狀態下，點擊開啟選單的判斷
        return this.checkGameStatus();
    }

    /**
     *check game status
     *
     * @protected
     * @abstract
     * @memberof ClickWebListCommand
     */
    protected checkGameStatus(): boolean {
        switch (this.gameDataProxy.gameState) {
            case StateMachineProxy.GAME1_IDLE:
                // 確認分級面板表演
                if (this.gameDataProxy.scrollingWinLabel) {
                    // 滾停分級面板
                    this.sendNotification(WinEvent.FORCE_WIN_LABEL_COMPLETE);
                    return false;
                } else {
                    // 關閉分級面板
                    this.sendNotification(WinEvent.HIDE_BOARD_REQUEST);
                    return true;
                }
            case StateMachineProxy.GAME1_SHOWWIN:
                // 確認滾分表演
                if (this.gameDataProxy.scrollingWinLabel) {
                    // 即滾滿
                    this.sendNotification(WinEvent.FORCE_WIN_LABEL_COMPLETE);
                    return false;
                } else {
                    // 切狀態至 end
                    this.sendNotification(WinEvent.HIDE_BOARD_REQUEST);
                    this.sendNotification(
                        StateMachineCommand.NAME,
                        new StateMachineObject(StateMachineProxy.GAME1_AFTERSHOW)
                    );
                    //如果有中jp 並且showwin滾分滾滿就判斷jp不能開啟
                    if (this.gameDataProxy.jackpotData.length > 0) return false;
                    else return true;
                }
            default:
                return false;
        }
    }

    /**
     * [HTML to GAME]
     * - 網頁端點擊 Spin Btn，廣播 SPIN_BTN_CLICK 事件.
     */
    public onSpin(): void {
        if (!this.checkWebSpinBtnClick()) return;
        this.facade.sendNotification(ScreenEvent.ON_SPIN_DOWN);
    }

    public spinRequest(): void {
        if (DEBUG || window['serviceProvider'] === ServiceProvider.OTHERS) {
            this.onSpin();
        } else {
            this.getWebFunRequest(this, 'onWebSpinBtnClick');
        }
    }

    public handleContainerMsg(e: MessageEvent) {
        switch (JSON.parse(e.data).name) {
            case 'onWebSpinBtnClick':
                this.onSpin();
                break;
            case 'updateTurboMode':
                let data = JSON.parse(e.data).data;
                this.setQuickValue(data);
                break;
            default:
                super.handleContainerMsg(e);
                break;
        }
    }

    /**
     * 告知 Container 是否正在 Spin (做彩金訊息是否可點擊並跳轉遊戲的狀態)
     */
    public isSpinning(isSpinning: boolean): void {
        this.getWebFunRequest(this, 'gameClientMsg', { event: 'isSpining', value: isSpinning });
    }

    /**
     * 提供給外部複寫收到onWebSpinBtnClick要做的事件
     * @return 是否可以執行slot spin事件
     * */
    protected checkWebSpinBtnClick(): boolean {
        return true && this._isClickToPlay;
    }

    /**
     * [HTML to GAME]
     * - 切換加速模式
     * @param _value - true 啟動加速.
     * @param _value - false 關閉加速.
     */
    protected setQuickValue(_val: boolean): void {
        if (this.gameDataProxy.curScene == GameScene.Game_1) {
            this.sendNotification(UIEvent.SET_QUICK_SPIN_FROM_WEB, _val);
        } else {
            this.gameDataProxy.curSpeedMode = SpeedMode.STATUS_QUICK;
        }
    }

    /**
     * [HTML to GAME]
     * - 網頁端點擊 AutoPlay 選項，廣播 AUTOPLAY_BTN_CLICK 事件.
     */
    public onWebAutoPlayClick(_currTimes: number, _maxTimes: number): void {
        // 除了在 baseGame 且非自動玩的情況下，選單才會出現小手提式點擊.
        this.setElementStyle('linebetMenu', 'hover', _maxTimes != 0 ? 'add' : 'remove');

        this.sendNotification(AutoPlayClickOptionCommand.NAME, [_currTimes, _maxTimes]);
    }

    /**
     * [HTML to GAME]
     * - 收到web打過來的ticket
     * @param _value - ticket
     */
    public setFeature(result: number): void {
        this.gameDataProxy.featureMode = result;
        this.sendNotification(ScreenEvent.ON_SPIN_DOWN);
    }

    // ===========================
    // 以下是 GAME to HTML Method
    // ===========================

    /**
     * 通知 Html 遊戲狀態改變
     * @param _scene web背景 如BaseGame FreeGame
     * @param _state 提供給web單元測試用 WebGameState
     */
    public sendGameState(_scene: string, _state?: string): void {
        WebBridgeProxy.curScene = _scene;
        let setParam: string[] = [_scene, _state];
        this.getWebFun('sendGameState', setParam);
        this.getWebFun('setGameState', setParam);
    }

    /**
     * 通知遊戲基礎類型給 Html 排版畫面，有些文案或選單會不同.
     * @param _type 遊戲類型
     * @param _type - "Line"
     * @param _type - "Way"
     */
    public setLineOrWayGame(_type: string): void {
        this.getWebFun('setLineOrWayGame', _type);
    }

    /**
     * 設定 Html 指定的元件隱藏或顯示
     * @param _objId 元件ID
     * @param _value 元件狀態
     * @param _value - "inline-block" 顯示
     * @param _value - "none" 隱藏
     * @param _value - ...
     */
    public setElementDisplayById(_objId: string, _value: string): void {
        if (_objId == 'maxSpinIcon' && _value == 'inline-block') {
            this.sendGameState(WebBridgeProxy.curScene, 'maxSpin');
        }

        this.getWebFun('setElementDisplayById', _objId, _value);
    }

    /**
     * 設定 HTML 指定的元件新增或移除指定的 Style 設定
     * @param elemId 元件 ID
     * @param styleName Style 名稱
     * @param action 動作
     * @param action - "remove"
     * @param action - "add"
     */
    public setElementStyle(elemId: string, styleName: string, action: string): void {
        this.getWebFunRequest(this, 'toggleElementStyle', elemId, styleName, action);
    }

    /** 取得 UserInfo Object. */
    public getUserInfoObj(): Object {
        return this.getWebObj('userInfo');
    }

    /** 更新 Html AutoTimes 欄位的值. */
    public updateWebAutoTimesSpan(_data: any): void {
        this.getWebFun('updateWebAutoTimesSpan', String(_data));
        this.getWebFun('updateMobileAutoTimesSpan', String(_data));
    }

    /**
     * 通知 Html 顯示錯誤面板，且關閉 AutoPlay 模式.
     * @param _msg error code.
     */
    public sendMsgCode(_code, _value: number = 0): void {
        super.sendMsgCode(_code, _value);
        // 停止自動模式
        this.sendNotification(AutoPlayClickOptionCommand.NAME, [0, 0]);
    }

    /**
     * [GAME to HTML]
     * - 通知 web 初始化featureGame數量
     */
    public setFeatureCount(featureCount: number): void {
        if (this.gameDataProxy.isDemoGame && featureCount > 0) {
            this.getWebFun('setGameFeatureCount', featureCount);
        }
    }

    public checkMenuEnable(): boolean {
        const self = this;

        if (self.gameDataProxy.onAutoPlay) return false;
        if (self.gameDataProxy.curScene != GameScene.Game_1) return false;
        if (self.gameDataProxy.gameState == StateMachineProxy.GAME1_SPIN) return false;
        if (
            (self.gameDataProxy.gameState != StateMachineProxy.GAME1_INIT ||
                self.gameDataProxy.gameState != StateMachineProxy.GAME1_IDLE) &&
            self.gameDataProxy.isHitSpecial()
        )
            return false;
        return true;
    }

    //ctrlPanel btn狀態控制 -1=不變; 0=全暗; 1=全亮; 2=spin亮,其他全暗;
    public checkControlPanelBtnEnable(): number {
        const self = this;

        if (
            self.gameDataProxy.gameState == StateMachineProxy.GAME2_SHOWWIN ||
            self.gameDataProxy.gameState == StateMachineProxy.GAME2_IDLE
        )
            return 2;
        if (self.gameDataProxy.curScene == GameScene.Game_2) return 0;
        // if (self.curAutoTimes != 0 && self.onAutoPlay && (self.gameState == sgv3.StateMachineProxy.GAME1_SHOWWIN)) return 1;
        if (self.gameDataProxy.onAutoPlay && self.gameDataProxy.gameState == StateMachineProxy.GAME1_SHOWWIN) return 2;
        if (self.gameDataProxy.onAutoPlay) return 0;
        if (
            self.gameDataProxy.gameState == StateMachineProxy.GAME1_SPIN ||
            self.gameDataProxy.gameState == StateMachineProxy.GAME2_SPIN
        )
            return 0;
        if (self.gameDataProxy.gameState != StateMachineProxy.GAME1_IDLE && self.gameDataProxy.isHitSpecial()) return 0;

        return 1; //可tack win、可觸發自身功能、可滾滿時要開啟 (急停QA説例外)
    }

    public enableCreditLimit(creditLimit: number): void {
        const self = this;

        let limit = MathUtil.sub(self.gameDataProxy.cash, creditLimit);
        if (window['setCreditLimit']) {
            window['setCreditLimit'](limit);
        }
    }

    public onAutoPlay(): boolean {
        return this.gameDataProxy.onAutoPlay;
    }

    public notifyWebControlBtnEnable(): void {
        if (!!window['notifyWebControlBtnEnable']) this.getWebFun('notifyWebControlBtnEnable');
    }

    public notifyWebMenuBtnEnable(): void {
        if (!!window['notifyWebMenuBtnEnable']) this.getWebFun('notifyWebMenuBtnEnable');
    }

    /** 遊戲資料 */
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (this._gameDataProxy == null) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
