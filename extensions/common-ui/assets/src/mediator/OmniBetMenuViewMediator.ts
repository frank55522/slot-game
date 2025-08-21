import { _decorator, Node, Vec3, instantiate, Label } from 'cc';
import { UIEvent } from '../proxy/UIEvent';
import { BetMenuButton } from '../view/BetMenuButton';
import { OmniBetMenuView } from '../view/OmniBetMenuView';
import BaseMediator from 'src/base/BaseMediator';
import { MathUtil } from 'src/core/utils/MathUtil';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
import { SceneEvent, ScreenEvent, SoundEvent } from 'src/sgv3/util/Constant';
import { BalanceUtil } from 'src/sgv3/util/BalanceUtil';
import { DenomMenuButton } from '../view/DenomMenuButton';
import { SentryTool } from 'src/core/utils/SentryTool';
import { NormalButton } from '../view/NormalButton';
import { ButtonName } from '../proxy/UIEnums';
import { UIProxy } from '../proxy/UIProxy';
const { ccclass } = _decorator;

@ccclass('OmniBetMenuViewMediator')
export class OmniBetMenuViewMediator extends BaseMediator<OmniBetMenuView> {
    protected selectedFeatureBetValue: number = 0;
    protected selectedFeatureBetIndex: number = 0;
    protected selectedDenomValue: number = 0;
    protected selectedDenomIndex: number = 0;
    protected selectedMultiplierValue: number = 0;
    protected selectedMultiplierIndex: number = 0;
    protected totalBet: number = 0;
    private settingBtnPos: Vec3 = new Vec3(403, 40);
    private denomButton: NormalButton;
    private denomDisplay: Label;

    protected lazyEventListener(): void {
        this.sendNotification(UIEvent.INJECT_BET_MENU, this.view);
        this.getBaseButtons();
        this.registerDenomButton();
        this.view.betMenu.confirmButton.registerCallback(this.onClickConfirmBet.bind(this));
    }

    public listNotificationInterests(): Array<any> {
        return [
            SceneEvent.LOAD_BASE_COMPLETE,
            UIEvent.CREATE_BET_MENU,
            UIEvent.SHOW_BET_MENU,
            UIEvent.HIDE_ALL_MENU,
            UIEvent.INJECT_FEATURE_BET_VIEW,
            UIEvent.ON_CLICK_FEATURE_BET
        ];
    }

    public handleNotification(notification: puremvc.INotification) {
        let name = notification.getName();
        switch (name) {
            case SceneEvent.LOAD_BASE_COMPLETE:
                this.updateTotalBetTxt();
                this.restoreBetMenu();
                this.view.init();
                break;
            case UIEvent.CREATE_BET_MENU:
                this.createFeatureBetMenu();
                this.createDenomMenu();
                this.createBetMultiplierMenu();
                break;
            case UIEvent.SHOW_BET_MENU:
                this.showBetMenu();
                break;
            case UIEvent.HIDE_ALL_MENU:
                this.hideAllMenu();
                break;
            case UIEvent.INJECT_FEATURE_BET_VIEW:
                this.injectFeatureBetView(notification.getBody());
                break;
            case UIEvent.ON_CLICK_FEATURE_BET:
                const featureIdx = notification.getBody();
                this.onClickFeatureBetOption(this.view.featureBetMenuButtons[featureIdx]);
                break;
        }
    }

    private getBaseButtons() {
        this.sendNotification(UIEvent.GET_BASE_BUTTONS, this.insertDenomDisplay.bind(this));
    }

    private insertDenomDisplay(baseButtons: Node) {
        let settingBtn: Node = baseButtons.getChildByName('SettingBtn');
        if (settingBtn) {
            settingBtn.setPosition(this.settingBtnPos);
        }
        let denomDisplay: Node = instantiate(this.view.denomDisplayPrefab);
        denomDisplay.setParent(baseButtons);
        this.denomButton = denomDisplay.getComponent(NormalButton);
        this.denomDisplay = denomDisplay.getComponentInChildren(Label);
    }

    private registerDenomButton() {
        this.UIProxy.registerButton(ButtonName.DENOM, this.denomButton);
        this.denomButton.registerCallback(this.showBetMenu.bind(this));
    }

    private createFeatureBetMenu() {
        const featureBetList = this.gameDataProxy.initEventData.featureBetList;
        this.view.createFeatureBetMenu(featureBetList, (betMenuButton) => this.onClickFeatureBetOption(betMenuButton));
    }

    private createDenomMenu() {
        const denomMultiplierList = this.gameDataProxy.initEventData.denomMultiplier;
        const denomList = this.getUniqueNumbers(denomMultiplierList);
        this.view.createDenomMenu(denomList, (denom) => this.onClickDenomOption(denom));
    }

    private createBetMultiplierMenu() {
        const multiplierList = this.gameDataProxy.initEventData.betMultiplier;
        this.view.createBetMultiplierMenu(multiplierList, (multiplier) => this.onClickMultiplierOption(multiplier));
    }
    // 過濾陣列中重複的數字
    private getUniqueNumbers(arr: number[]): number[] {
        return Array.from(new Set(arr));
    }

    private onClickFeatureBetOption(betMenuButton: BetMenuButton): void {
        this.view.featureBetMenuButtons[this.selectedFeatureBetIndex].changeState(BetMenuButton.STATUS_DESELECTED);
        betMenuButton.changeState(BetMenuButton.STATUS_SELECTED);
        this.selectedFeatureBetValue = betMenuButton.buttonVal;
        this.selectedFeatureBetIndex = betMenuButton.index;
        this.updateTotalBetDisplay();
        this.sendNotification(SoundEvent.BUTTON_DOWN_SOUND);
        this.sendNotification(UIEvent.ON_CLICK_BET_BUTTON, this.selectedFeatureBetValue);
    }

    private onClickDenomOption(denomButton: DenomMenuButton) {
        this.view.denomMenuButtons[this.selectedDenomIndex].changeState(DenomMenuButton.STATUS_DESELECTED);
        denomButton.changeState(DenomMenuButton.STATUS_SELECTED);
        this.selectedDenomValue = denomButton.buttonVal;
        this.selectedDenomIndex = denomButton.index;
        this.updateTotalBetDisplay();
        this.sendNotification(SoundEvent.BUTTON_DOWN_SOUND);
        this.sendNotification(UIEvent.ON_CLICK_DENOM_BUTTON, this.getMultiplierOfDenom());
    }

    private onClickMultiplierOption(betMenuButton: BetMenuButton) {
        this.view.multiplierMenuButtons[this.selectedMultiplierIndex].changeState(BetMenuButton.STATUS_DESELECTED);
        betMenuButton.changeState(BetMenuButton.STATUS_SELECTED);
        this.selectedMultiplierValue = betMenuButton.buttonVal;
        this.selectedMultiplierIndex = betMenuButton.index;
        this.updateTotalBetDisplay();
        this.sendNotification(SoundEvent.BUTTON_DOWN_SOUND);
    }

    public onClickConfirmBet() {
        this.gameDataProxy.resetBetInfo(
            this.totalBet,
            this.selectedDenomValue,
            this.selectedMultiplierValue,
            this.selectedFeatureBetValue
        );
        this.updateTotalBetTxt();
        this.sendNotification(UIEvent.CLEAR_PLAYER_WIN); //清除贏分
        this.sendNotification(UIEvent.RESTORE_BBW_POSITION);
        this.hideAllMenu();
    }

    private updateTotalBetTxt() {
        this.sendNotification(UIEvent.UPDATE_TOTAL_BET, this.gameDataProxy.curTotalBet);
        this.sendNotification(ScreenEvent.ON_BET_CHANGE);
    }

    private updateTotalBetDisplay() {
        this.totalBet = MathUtil.mul(
            this.selectedFeatureBetValue,
            this.selectedDenomValue,
            this.selectedMultiplierValue
        );
        this.view.setTotalBetDisplayInBetMenu(
            this.selectedFeatureBetValue,
            this.selectedMultiplierValue,
            BalanceUtil.dollarSign + this.selectedDenomValue,
            BalanceUtil.formatBalanceWithDollarSign(this.totalBet)
        );
    }

    private restoreBetMenu() {
        this.restoreDenom();
        this.restoreMultiplier();
        this.restoreFeatureBet();
        this.updateTotalBetDisplay();
    }

    private restoreFeatureBet() {
        try {
            this.view.featureBetMenuButtons[this.selectedFeatureBetIndex].changeState(BetMenuButton.STATUS_DESELECTED);
            if (this.selectedFeatureBetValue !== this.gameDataProxy.curFeatureBet) {
                this.selectedFeatureBetValue = this.gameDataProxy.curFeatureBet;
                this.selectedFeatureBetIndex = this.findBetButtonIndex(this.selectedFeatureBetValue);
                this.sendNotification(UIEvent.RESTORE_BET_BUTTON, this.selectedFeatureBetValue);
            }
            this.view.featureBetMenuButtons[this.selectedFeatureBetIndex].changeState(BetMenuButton.STATUS_SELECTED);
        } catch (error) {
            SentryTool.addLog(
                'error',
                `index: ${this.selectedFeatureBetIndex}, curFeatureBet: ${this.gameDataProxy.curFeatureBet}`
            );
            SentryTool.captureException(error);
        }
    }

    private findBetButtonIndex(value: number): number {
        return this.view.featureBetMenuButtons.findIndex((betButton) => betButton.buttonVal === value);
    }

    private restoreDenom() {
        try {
            this.view.denomMenuButtons[this.selectedDenomIndex].changeState(DenomMenuButton.STATUS_DESELECTED);
            if (this.selectedDenomValue !== this.gameDataProxy.curDenomMultiplier) {
                this.selectedDenomValue = this.gameDataProxy.curDenomMultiplier;
                this.selectedDenomIndex = this.findDenomButtonIndex(this.selectedDenomValue);
                this.sendNotification(UIEvent.ON_CLICK_DENOM_BUTTON, this.getMultiplierOfDenom());
            }
            this.sendNotification(UIEvent.SET_DENOM_DISPLAY, BalanceUtil.dollarSign + this.selectedDenomValue);
            this.denomDisplay.string = BalanceUtil.dollarSign + this.selectedDenomValue;
            this.view.denomMenuButtons[this.selectedDenomIndex].changeState(DenomMenuButton.STATUS_SELECTED);
        } catch (error) {
            SentryTool.addLog(
                'error',
                `index: ${this.selectedDenomIndex}, curDenomMultiplier: ${this.gameDataProxy.curDenomMultiplier}`
            );
            SentryTool.captureException(error);
        }
    }

    private findDenomButtonIndex(value: number): number {
        return this.view.denomMenuButtons.findIndex((denomButton) => denomButton.buttonVal === value);
    }

    private restoreMultiplier() {
        try {
            this.view.multiplierMenuButtons[this.selectedMultiplierIndex].changeState(BetMenuButton.STATUS_DESELECTED);
            if (this.selectedMultiplierValue !== this.gameDataProxy.curBet) {
                this.selectedMultiplierValue = this.gameDataProxy.curBet;
                this.selectedMultiplierIndex = this.findMultiplierButtonIndex(this.selectedMultiplierValue);
            }
            this.view.multiplierMenuButtons[this.selectedMultiplierIndex].changeState(BetMenuButton.STATUS_SELECTED);
        } catch (error) {
            SentryTool.addLog('error', `index: ${this.selectedMultiplierIndex}, curBet: ${this.gameDataProxy.curBet}`);
            SentryTool.captureException(error);
        }
    }

    private findMultiplierButtonIndex(value: number): number {
        return this.view.multiplierMenuButtons.findIndex((multiplierButton) => multiplierButton.buttonVal === value);
    }

    private showBetMenu() {
        this.view.showBetMenu();
        this.sendNotification(UIEvent.SET_BBW_POSITION_TO_BOTTOM);
    }

    private hideAllMenu() {
        this.view.hideBetMenu();
        this.restoreBetMenu();
    }

    private injectFeatureBetView(data: { viewNode: Node; index: number }) {
        this.view.injectFeatureBetView(data.viewNode, data.index);
    }

    // 選擇Denom的倍數
    private getMultiplierOfDenom() {
        const minimumDenom = this.view.denomMenuButtons[0].buttonVal;
        const multiplierOfDenom = MathUtil.div(this.selectedDenomValue, minimumDenom);
        return multiplierOfDenom;
    }
    // ======================== Get Set ========================
    private _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }

        return this._gameDataProxy;
    }
    
    private _UIProxy: UIProxy;
    public get UIProxy(): UIProxy {
        if (!this._UIProxy) {
            this._UIProxy = this.facade.retrieveProxy(UIProxy.NAME) as UIProxy;
        }
        return this._UIProxy;
    }
}
