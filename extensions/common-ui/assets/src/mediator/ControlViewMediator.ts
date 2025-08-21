import { _decorator } from 'cc';
import { ControlView, IControlViewMediator } from '../view/ControlView';
import { AudioManager } from 'AudioManager';
import { UIProxy } from '../proxy/UIProxy';
import { ButtonName, ButtonState, SpeedMode } from '../proxy/UIEnums';
import { UIEvent } from '../proxy/UIEvent';
import { Logger } from 'Logger';
import { SceneEvent, SoundEvent } from 'src/sgv3/util/Constant';
import { AutoPlayClickOptionCommand } from 'src/sgv3/command/autoplay/AutoPlayClickOptionCommand';
import { OpenHelpCommand } from 'src/sgv3/command/help/OpenHelpCommand';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
import { WebBridgeProxy } from 'src/sgv3/proxy/WebBridgeProxy';
import BaseMediator from 'src/base/BaseMediator';
import { setEngineTimeScale } from 'src/core/utils/SceneManager';
import { GTMUtil } from 'src/core/utils/GTMUtil';

const { ccclass } = _decorator;

@ccclass('ControlViewMediator')
export class ControlViewMediator extends BaseMediator<ControlView> implements IControlViewMediator {
    protected isQuickSpin: boolean = false;
    protected isShowQuickSpinMsg: boolean = false;
    private isSoundOn: boolean = true;

    constructor(name?: string, component?: any) {
        super(name, component);
        this.facade.registerProxy(new UIProxy());
    }

    public onRegister() {
        Logger.i('ControlViewMediator initial done');
    }

    protected lazyEventListener(): void {
        this.view.buttonCallback = this;
    }

    public listNotificationInterests(): string[] {
        let eventList = [
            SceneEvent.LOAD_UI_VERSION_COMPLETE,
            SceneEvent.LOAD_GAME_DATA_COMPLETE,
            SceneEvent.LOAD_BASE_COMPLETE,
            UIEvent.UPDATE_AUTO_PLAY_COUNT,
            UIEvent.UPDATE_SPIN_SEQ_NUM,
            UIEvent.SPIN_KEY_DOWN,
            UIEvent.CHANGE_BUTTON_STATE,
            UIEvent.ENABLE_NORMAL_BUTTON,
            UIEvent.DISABLE_NORMAL_BUTTON,
            UIEvent.SET_QUICK_SPIN_STATUS,
            UIEvent.CHECK_QUICK_SPIN_STATUS,
            UIEvent.SET_QUICK_SPIN_FROM_WEB,
            UIEvent.INJECT_BET_MENU,
            UIEvent.ANY_MENU_OPEN,
            UIEvent.GET_BASE_BUTTONS
        ];

        return eventList;
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case SceneEvent.LOAD_UI_VERSION_COMPLETE:
                this.view.setVersion(this.gameDataProxy.gameAndUiVer);
                break;
            case SceneEvent.LOAD_GAME_DATA_COMPLETE:
                this.onLoadGameDataComplete();
                break;
            case SceneEvent.LOAD_BASE_COMPLETE:
                this.controlViewInit();
                break;
            case UIEvent.UPDATE_AUTO_PLAY_COUNT:
                this.onAutoPlayTimesChange(notification.getBody());
                break;
            case UIEvent.UPDATE_SPIN_SEQ_NUM:
                this.view.updateSpinSeqNumber(notification.getBody());
                break;
            case UIEvent.SPIN_KEY_DOWN:
                this.spin();
                break;
            case UIEvent.CHANGE_BUTTON_STATE:
                this.changeButtonState(notification);
                break;
            case UIEvent.ENABLE_NORMAL_BUTTON:
                this.enableNormalButton();
                break;
            case UIEvent.DISABLE_NORMAL_BUTTON:
                this.disableNormalButton();
                break;
            case UIEvent.SET_QUICK_SPIN_STATUS:
                this.setQuickSpinStatus(notification.getBody());
                break;
            case UIEvent.CHECK_QUICK_SPIN_STATUS:
                this.checkQuickSpin();
                break;
            case UIEvent.SET_QUICK_SPIN_FROM_WEB:
                this.setQuickSpinFromWeb(notification.getBody());
                break;
            case UIEvent.INJECT_BET_MENU:
                this.view.setBetMenu(notification.getBody());
                break;
            case UIEvent.ANY_MENU_OPEN:
                this.view.isAnyMenuOpen = notification.getBody();
                break;
            case UIEvent.GET_BASE_BUTTONS:
                this.returnBaseButtons(notification.getBody());
                break;
        }
    }

    private controlViewInit() {
        this.view.curTimingStart();
        this.view.setVersion(this.gameDataProxy.gameAndUiVer);
        this.onLoadGameDataComplete();
        this.registerButtonInProxy();
        this.createAutoMenu();
        this.initSpinLogo(this.gameDataProxy.spinLogoUrl);
        this.initLogo(this.gameDataProxy.providerLogoUrl);
    }

    public onLoadGameDataComplete() {
        if (this.gameDataProxy.isDemoGame) {
            this.view.reportButton.setState(ButtonState.INVISIBLE);
        }

        if (this.gameDataProxy.hasGoHome == false) {
            this.view.homeButton.setState(ButtonState.INVISIBLE);
        }

        if (this.gameDataProxy.soundEnableState == false) {
            this.toggleSound();
        }
    }

    private registerButtonInProxy() {
        this.UIProxy.registerButton(ButtonName.SPIN, this.view.spinButton);
        this.UIProxy.registerButton(ButtonName.QUICK_SPIN, this.view.quickSpinButton);
        this.UIProxy.registerButton(ButtonName.TOTAL_BET, this.view.totalBetButton);
        this.UIProxy.registerButton(ButtonName.AUTO_PLAY, this.view.autoPlayButton);
        this.UIProxy.registerButton(ButtonName.AUTO_STOP, this.view.autoStopButton);
        this.UIProxy.registerButton(ButtonName.SETTING, this.view.settingButton);
    }

    private createAutoMenu() {
        this.view.createAutoMenu(this.gameDataProxy.initEventData.autoPlayTimesList, (autoCountNum) =>
            this.onClickAutoOption(autoCountNum)
        );
    }

    private onClickAutoOption(autoCountNum: string): void {
        this.hideAllMenu();
        this.view.showAutoStopButton();
        this.sendNotification(AutoPlayClickOptionCommand.NAME, [0, +autoCountNum]);
        this.sendNotification(SoundEvent.BUTTON_DOWN_SOUND);

        GTMUtil.setGTMEvent('Button_Type', {
            Member_ID: this.gameDataProxy.userId,
            Game_ID: this.gameDataProxy.machineType,
            Button_Name: 'AutoPlay',
            Button_Value: autoCountNum,
            DateTime: Date.now(),
            Session_ID: this.gameDataProxy.sessionId
        });
    }

    private onAutoPlayTimesChange(remainingTimes: number) {
        if (remainingTimes > 0) {
            this.toggleAutoNum(true);
            this.view.autoCountTxt.string = remainingTimes.toString();
        } else {
            this.toggleAutoNum(false);
            this.view.showAutoPlayButton();
        }
    }

    private toggleAutoNum(status: boolean) {
        this.view.spinButton.hideSpinIcon(status);
        this.view.autoCountTxt.node.active = status;
    }

    public spin() {
        if (this.canSpin()) {
            this.webBridgeProxy.spinRequest();
        }
    }

    private canSpin() {
        return this.gameDataProxy.isHelpOpen == false && this.view.checkMenuStatus() == false;
    }

    private changeButtonState(notification: puremvc.INotification) {
        let buttonName: string = notification.getBody().name;
        let state = notification.getBody().state;

        this.UIProxy.setButtonState(buttonName, state);
    }

    private enableNormalButton() {
        this.UIProxy.buttons.forEach((button) => {
            if (button.onlyGameIdleEnabled) button.setState(ButtonState.ENABLED);
        });
        this.webBridgeProxy.isSpinning(false);
    }

    private disableNormalButton() {
        this.UIProxy.buttons.forEach((button, key) => {
            if (key !== ButtonName.AUTO_PLAY || this.view.autoStopButton.node.active === false) {
                if (button.onlyGameIdleEnabled) button.setState(ButtonState.DISABLED);
            }
        });
        this.hideAllMenu();
        this.webBridgeProxy.isSpinning(true);
    }

    protected setQuickSpinStatus(isQuickSpin: boolean) {
        let state: string = isQuickSpin ? this.gameDataProxy.curSpeedMode : SpeedMode.STATUS_NORMAL;
        this.view.updateQuickSpinState(state);
        this.view.quickSpinMsg.showMsg(isQuickSpin, this.isShowQuickSpinMsg);
        this.isShowQuickSpinMsg = false;
    }

    private checkQuickSpin() {
        if (this.isQuickSpin) {
            this.UIProxy.isQuickSpin = this.isQuickSpin;
        }
    }

    protected setQuickSpinFromWeb(isQuickSpin: boolean) {
        if (this.UIProxy.isQuickSpin != isQuickSpin) {
            this.onQuickBtn(isQuickSpin);
        }
    }

    public onQuickBtn(isQuickSpin: boolean | null = null): void {
        if (this.gameDataProxy.curSpeedMode == SpeedMode.STATUS_TURBO || isQuickSpin === false) {
            // 切換成一般模式
            this.gameDataProxy.curSpeedMode = SpeedMode.STATUS_NORMAL;
            this.isShowQuickSpinMsg = true;
            this.UIProxy.isQuickSpin = this.isQuickSpin = false;
            setEngineTimeScale(1);
        } else if (this.gameDataProxy.curSpeedMode == SpeedMode.STATUS_QUICK) {
            //一段加速 切換成 二段加速
            this.gameDataProxy.curSpeedMode = SpeedMode.STATUS_TURBO;
            this.setQuickSpinStatus(true);
            setEngineTimeScale(3);
        } else if (this.gameDataProxy.curSpeedMode == SpeedMode.STATUS_NORMAL || isQuickSpin === true) {
            //一般模式 切換成 一段加速
            this.gameDataProxy.curSpeedMode = SpeedMode.STATUS_QUICK;
            this.isShowQuickSpinMsg = true;
            this.UIProxy.isQuickSpin = this.isQuickSpin = true;
            setEngineTimeScale(1);
        }

        GTMUtil.setGTMEvent('Button_Type', {
            Member_ID: this.gameDataProxy.userId,
            Game_ID: this.gameDataProxy.machineType,
            Button_Name: 'QuickSpin',
            Button_Value: this.gameDataProxy.curSpeedMode,
            DateTime: Date.now(),
            Session_ID: this.gameDataProxy.sessionId
        });

        this.quickSpin(); //按鈕被點擊後統一要做的動作
    }

    public quickSpin() {
        this.hideAllMenu();
        this.webBridgeProxy.getWebFunRequest(this, 'updateTurboMode', this.isQuickSpin);
    }

    public autoPlay() {
        if (this.view.checkMenuStatus()) {
            this.hideAllMenu();
            return;
        }

        this.view.showAutoMenu();
        this.sendNotification(UIEvent.SET_BBW_POSITION_TO_BOTTOM);
    }

    public autoStop() {
        this.sendNotification(AutoPlayClickOptionCommand.NAME, [0, 0]);
        this.view.showAutoPlayButton();
    }

    public totalBet() {
        if (this.view.checkMenuStatus()) {
            this.hideAllMenu();
            return;
        }
        this.sendNotification(UIEvent.SHOW_BET_MENU);
    }

    public clickSettingButton() {
        if (this.view.checkMenuStatus()) {
            this.hideAllMenu();
            return;
        }

        this.openSettingMenu();
    }

    public openSettingMenu() {
        this.view.showSettingMenu();
    }

    public closeSettingMenu() {
        this.view.hideSettingMenu();
    }

    public toggleSound() {
        let state = !this.isSoundOn;
        this.isSoundOn = state;
        AudioManager.Instance.audioOnOff(state);
        this.view.soundButton.changeState(state);
        this.gameDataProxy.soundEnableState = state;
        GTMUtil.setGTMEvent('Button_Type', {
            Member_ID: this.gameDataProxy.userId,
            Game_ID: this.gameDataProxy.machineType,
            Button_Name: 'ToggleSound',
            Button_Value: state,
            DateTime: Date.now(),
            Session_ID: this.gameDataProxy.sessionId
        });
    }

    public openHelp() {
        try {
            this.sendNotification(OpenHelpCommand.NAME);
            this.closeSettingMenu();

            GTMUtil.setGTMEvent('Button_Type', {
                Member_ID: this.gameDataProxy.userId,
                Game_ID: this.gameDataProxy.machineType,
                Button_Name: 'OpenHelp',
                Button_Value: true,
                DateTime: Date.now(),
                Session_ID: this.gameDataProxy.sessionId
            });
        } catch (error) {
            Logger.e(error);
        }
    }

    public openReport() {
        try {
            this.webBridgeProxy.openReport();
            this.closeSettingMenu();

            GTMUtil.setGTMEvent('Button_Type', {
                Member_ID: this.gameDataProxy.userId,
                Game_ID: this.gameDataProxy.machineType,
                Button_Name: 'OpenReport',
                Button_Value: true,
                DateTime: Date.now(),
                Session_ID: this.gameDataProxy.sessionId
            });
        } catch (error) {
            Logger.e(error);
        }
    }

    public gotoGameHall() {
        try {
            this.webBridgeProxy.quitGame();
            this.closeSettingMenu();

            GTMUtil.setGTMEvent('Button_Type', {
                Member_ID: this.gameDataProxy.userId,
                Game_ID: this.gameDataProxy.machineType,
                Button_Name: 'GoToGameHall',
                Button_Value: true,
                DateTime: Date.now(),
                Session_ID: this.gameDataProxy.sessionId
            });
        } catch (error) {
            Logger.e(error);
        }
    }

    public hideAllMenu() {
        this.sendNotification(UIEvent.RESTORE_BBW_POSITION);
        this.sendNotification(UIEvent.HIDE_ALL_MENU);
        this.view.hideAutoMenu();
        this.closeSettingMenu();
    }

    protected initSpinLogo(url: string) {
        this.view.spinButton.initLogo(url);
    }

    protected initLogo(url: string) {
        this.view.logo.url = url;
        this.view.logo.updateFrame();
    }

    private returnBaseButtons(callback: Function) {
        callback(this.view.baseButtonGroup.node);
    }

    // ======================== Get Set ========================
    private _UIProxy: UIProxy;
    public get UIProxy(): UIProxy {
        if (!this._UIProxy) {
            this._UIProxy = this.facade.retrieveProxy(UIProxy.NAME) as UIProxy;
        }
        return this._UIProxy;
    }

    private _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }

        return this._gameDataProxy;
    }

    private _webBridgeProxy: WebBridgeProxy;
    public get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }
}
