import { _decorator } from 'cc';
import { UIEvent } from '../proxy/UIEvent';
import { BetMenuButton } from '../view/BetMenuButton';
import { BetMenuView } from '../view/BetMenuView';
import BaseMediator from 'src/base/BaseMediator';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
import { SceneEvent, ScreenEvent, SoundEvent } from 'src/sgv3/util/Constant';
import { SentryTool } from 'src/core/utils/SentryTool';
const { ccclass } = _decorator;

@ccclass('BetMenuViewMediator')
export class BetMenuViewMediator extends BaseMediator<BetMenuView> {
    protected selectedBetValue: number = 0;
    protected selectedBetIndex: number = 0;

    protected lazyEventListener(): void {
        this.sendNotification(UIEvent.INJECT_BET_MENU, this.view);
    }

    public listNotificationInterests(): Array<any> {
        return [SceneEvent.LOAD_BASE_COMPLETE, UIEvent.CREATE_BET_MENU, UIEvent.SHOW_BET_MENU, UIEvent.HIDE_ALL_MENU];
    }

    public handleNotification(notification: puremvc.INotification) {
        let name = notification.getName();
        switch (name) {
            case SceneEvent.LOAD_BASE_COMPLETE:
                this.updateTotalBetTxt();
                this.restoreBetMenu();
                break;
            case UIEvent.CREATE_BET_MENU:
                this.createBetMenu();
                break;
            case UIEvent.SHOW_BET_MENU:
                this.showBetMenu();
                break;
            case UIEvent.HIDE_ALL_MENU:
                this.hideAllMenu();
                break;
        }
    }

    private restoreBetMenu() {
        this.restoreBet();
    }

    private restoreBet() {
        try {
            this.view.betMenuButtons[this.selectedBetIndex].changeState(BetMenuButton.STATUS_DESELECTED);
            const currentBetValue = this.gameDataProxy.totalBetList[this.gameDataProxy.totalBetIdx];
            if (this.selectedBetValue !== currentBetValue) {
                this.selectedBetValue = currentBetValue;
                this.selectedBetIndex = this.findBetButtonIndex(this.selectedBetValue);
                this.sendNotification(UIEvent.ON_CLICK_BET_BUTTON, this.selectedBetValue);
            }
            this.view.betMenuButtons[this.selectedBetIndex].changeState(BetMenuButton.STATUS_SELECTED);
        } catch (error) {
            SentryTool.addLog(
                'error',
                `index: ${this.selectedBetIndex}, totalBetIdx: ${this.gameDataProxy.totalBetIdx}`
            );
            SentryTool.captureException(error);
        }
    }

    private findBetButtonIndex(value: number): number {
        return this.view.betMenuButtons.findIndex((betButton) => betButton.buttonVal === value);
    }

    private createBetMenu() {
        this.view.createBetMenu(this.gameDataProxy.totalBetList, (betMenuButton) =>
            this.onClickBetOption(betMenuButton)
        );
    }

    private onClickBetOption(betMenuButton: BetMenuButton): void {
        this.view.betMenuButtons[this.selectedBetIndex].changeState(BetMenuButton.STATUS_DESELECTED);
        betMenuButton.changeState(BetMenuButton.STATUS_SELECTED);
        this.selectedBetIndex = betMenuButton.index;
        this.gameDataProxy.resetBetInfo(betMenuButton.buttonVal);
        this.gameDataProxy.totalBetList.forEach((bet, index) => {
            if (bet === betMenuButton.buttonVal) {
                this.gameDataProxy.totalBetIdx = index;
                return;
            }
        });
        this.hideAllMenu();
        this.updateTotalBetTxt();
        this.sendNotification(UIEvent.CLEAR_PLAYER_WIN); //清除贏分
        this.sendNotification(SoundEvent.BUTTON_DOWN_SOUND);
    }

    private updateTotalBetTxt() {
        this.sendNotification(UIEvent.UPDATE_TOTAL_BET, this.gameDataProxy.curTotalBet);
        this.sendNotification(ScreenEvent.ON_BET_CHANGE);
    }

    private showBetMenu() {
        this.view.showBetMenu();
        this.sendNotification(UIEvent.SET_BBW_POSITION_TO_BOTTOM);
    }

    public hideAllMenu() {
        this.sendNotification(UIEvent.RESTORE_BBW_POSITION);
        this.view.hideBetMenu();
        this.restoreBetMenu();
    }

    // ======================== Get Set ========================
    private _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }

        return this._gameDataProxy;
    }
}
