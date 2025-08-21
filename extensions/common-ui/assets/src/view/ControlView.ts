import { _decorator, Label, Node, Prefab, instantiate, UITransform, SystemEvent } from 'cc';
import { BetMenu } from './BetMenu';
import { NormalButton } from './NormalButton';
import { QuickSpinButton } from './QuickSpinButton';
import { QuickSpinMsg } from './QuickSpinMsg';
import { SoundToggleButton } from './SoundToggleButton';
import { SpinButton } from './SpinButton';
import BaseView from 'src/base/BaseView';
import { UIButton } from './UIButton';
import { SlideMenu } from './SlideMenu';
import { SlideButtonGroup } from './SlideButtonGroup';
import { BetMenuView } from './BetMenuView';
import { UrlLogoSetting } from 'src/core/ui/UrlLogoSetting';
const { ccclass, property } = _decorator;

@ccclass('ControlView')
export class ControlView extends BaseView {
    public static readonly HORIZONTAL: string = 'horizontal';
    public static readonly VERTICAL: string = 'vertical';
    private readonly AUTO_MENU_BUTTON_WIDTH: number = 170;
    private readonly AUTO_MENU_BUTTON_HEIGHT: number = 92;

    @property({ type: SpinButton })
    public spinButton: SpinButton;

    @property({ type: QuickSpinButton })
    public quickSpinButton: QuickSpinButton;

    @property({ type: NormalButton })
    public totalBetButton: NormalButton;

    @property({ type: NormalButton })
    public autoPlayButton: NormalButton;

    @property({ type: UIButton })
    public autoStopButton: UIButton;

    @property({ type: NormalButton })
    public homeButton: NormalButton;

    @property({ type: NormalButton })
    public reportButton: NormalButton;

    @property({ type: NormalButton })
    public helpButton: NormalButton;

    @property({ type: SoundToggleButton })
    public soundButton: SoundToggleButton;

    @property({ type: NormalButton })
    public settingButton: NormalButton;

    @property({ type: Label })
    public autoCountTxt: Label;

    @property({ type: Label })
    public versionAndSpinNum: Label;

    @property({ type: SlideMenu })
    public autoMenu: SlideMenu;

    @property({ type: Node })
    public autoOptions: Node;

    @property({ type: Prefab })
    public menuButtonPrefab: Prefab;

    @property({ type: QuickSpinMsg })
    public quickSpinMsg: QuickSpinMsg;

    @property({ type: Label })
    public curTime: Label;

    @property({ type: UIButton })
    public closeAutoMenuButton: UIButton;

    @property({ type: UIButton })
    public closeSettingMenuButton: UIButton;

    @property({ type: UIButton })
    public menuMask: UIButton;

    @property({ type: SlideButtonGroup })
    public baseButtonGroup: SlideButtonGroup;

    @property({ type: SlideButtonGroup })
    public settingButtonGroup: SlideButtonGroup;

    @property({ type: UrlLogoSetting })
    public logo: UrlLogoSetting;

    public buttonCallback: IControlViewMediator;
    public betMenu: BetMenu;
    public isAnyMenuOpen: boolean = false;
    private version: string;

    onLoad() {
        super.onLoad();
        this.registerPanelButton();
    }

    protected registerPanelButton() {
        this.spinButton.registerCallback(this.buttonCallback.spin.bind(this.buttonCallback));
        this.quickSpinButton.registerCallback(this.buttonCallback.onQuickBtn.bind(this.buttonCallback));
        this.autoPlayButton.registerCallback(this.buttonCallback.autoPlay.bind(this.buttonCallback));
        this.autoStopButton.registerCallback(this.buttonCallback.autoStop.bind(this.buttonCallback));
        this.reportButton.registerCallback(this.buttonCallback.openReport.bind(this.buttonCallback));
        this.helpButton.registerCallback(this.buttonCallback.openHelp.bind(this.buttonCallback));
        this.settingButton.registerCallback(this.buttonCallback.clickSettingButton.bind(this.buttonCallback));
        this.soundButton.node.on(
            SystemEvent.EventType.TOUCH_END,
            () => this.buttonCallback.toggleSound(),
            this.buttonCallback
        );
        this.homeButton.registerCallback(this.buttonCallback.gotoGameHall.bind(this.buttonCallback));
        this.totalBetButton.registerCallback(this.buttonCallback.totalBet.bind(this.buttonCallback));
        this.closeAutoMenuButton.registerCallback(this.buttonCallback.hideAllMenu.bind(this.buttonCallback));
        this.closeSettingMenuButton.registerCallback(this.buttonCallback.hideAllMenu.bind(this.buttonCallback));
        this.menuMask.registerCallback(this.buttonCallback.hideAllMenu.bind(this.buttonCallback));
    }

    /**
     * 創建選單
     * @param _options 選單內容
     * @param onClickCallback 回傳方法
     */
    public createAutoMenu(_options: number[], _onClickCallback: Function): void {
        let i: number = _options.length - 1;
        while (i >= 0) {
            this.autoOptions.addChild(this.addAutoMenuButton(_options[i].toString(), _onClickCallback));
            i--;
        }
    }

    private addAutoMenuButton(countTxt: string, callback: Function): Node {
        const menuButtonNode = instantiate(this.menuButtonPrefab);
        const uiTransform = menuButtonNode.getComponent(UITransform);
        const label = menuButtonNode.getComponentInChildren(Label);
        uiTransform.contentSize.set(this.AUTO_MENU_BUTTON_WIDTH, this.AUTO_MENU_BUTTON_HEIGHT);
        label.string = countTxt;
        menuButtonNode.on(
            SystemEvent.EventType.TOUCH_END,
            () => {
                callback(countTxt);
            },
            this.buttonCallback
        );

        return menuButtonNode;
    }

    public showSettingMenu() {
        this.settingButtonGroup.show();
        this.baseButtonGroup.hide();
        this.spinButton.hide();
    }

    public hideSettingMenu() {
        this.baseButtonGroup.show();
        this.settingButtonGroup.hide();
        this.spinButton.show();
    }

    public showAutoMenu() {
        this.autoMenu.show();
    }

    public hideAutoMenu() {
        this.autoMenu.hide();
    }

    public showAutoPlayButton() {
        this.autoPlayButton.node.active = true;
        this.autoStopButton.node.active = false;
    }

    public showAutoStopButton() {
        this.autoPlayButton.node.active = false;
        this.autoStopButton.node.active = true;
    }

    public checkMenuStatus() {
        return this.settingButtonGroup.node.active || this.autoMenu.node.active || this.betMenu.node.active || this.isAnyMenuOpen;
    }

    public updateSpinSeqNumber(_seq: number) {
        this.versionAndSpinNum.string = this.version + '  ' + _seq.toString();
    }

    public setVersion(version: string) {
        this.versionAndSpinNum.string = version;
        this.version = version;
    }

    public updateQuickSpinState(state: string | boolean): void {
        let stateString: string = state.toString();
        this.quickSpinButton.setState(stateString);
    }

    public setBetMenu(betMenuView: BetMenuView) {
        this.betMenu = betMenuView.betMenu;
        this.betMenu.menuMask = this.menuMask;
        this.betMenu.closeButton.registerCallback(this.buttonCallback.hideAllMenu.bind(this.buttonCallback));
    }

    public curTimingStart() {
        let self = this;
        setCurTime();
        setInterval(setCurTime, 1000);

        function setCurTime() {
            let nowTime = new Date();
            let hours = nowTime.getHours();
            let minutes = nowTime.getMinutes();
            let timeString: string = self.convertTimeString(hours) + ':' + self.convertTimeString(minutes);
            self.curTime.string = timeString;
        }
    }

    private convertTimeString(time: number) {
        let newTime: string = '0';
        if (time < 10) {
            newTime += time.toString();
        } else {
            newTime = time.toString();
        }
        return newTime;
    }

    onDestroy() {
        super.onDestroy();
    }
}

export interface IControlViewMediator {
    spin();
    onQuickBtn();
    autoPlay();
    autoStop();
    totalBet();
    toggleSound();
    openHelp();
    openReport();
    gotoGameHall();
    clickSettingButton();
    hideAllMenu();
}
