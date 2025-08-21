import { _decorator, SystemEvent } from 'cc';
import { BBWView } from '../view/BBWView';
import BaseMediator from 'src/base/BaseMediator';
import { BalanceUtil } from 'src/sgv3/util/BalanceUtil';
import { UIEvent } from '../proxy/UIEvent';
import { WinEvent } from 'src/sgv3/util/Constant';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
import { MathUtil } from 'src/core/utils/MathUtil';
const { ccclass } = _decorator;

@ccclass('BBWViewMediator')
export class BBWViewMediator extends BaseMediator<BBWView> {
    private isShowCredit: boolean = false;
    private curBalanceInCash: number = 0;
    private curWinInCash: number = 0;
    private curTotalBetInCash: number = 0;

    protected lazyEventListener(): void {
        if (this.gameDataProxy.isOmniChannel()) {
            this.view.node.on(SystemEvent.EventType.TOUCH_END, this.onClick, this);
        }
    }

    public listNotificationInterests(): string[] {
        let eventList = [
            UIEvent.UPDATE_PLAYER_BALANCE,
            UIEvent.UPDATE_PLAYER_WIN,
            UIEvent.UPDATE_TOTAL_BET,
            UIEvent.CLEAR_PLAYER_WIN,
            UIEvent.SET_BBW_POSITION_TO_BOTTOM,
            UIEvent.RESTORE_BBW_POSITION
        ];
        return eventList;
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case UIEvent.UPDATE_PLAYER_BALANCE:
                this.updatePlayerBalance(notification.getBody());
                break;
            case UIEvent.UPDATE_PLAYER_WIN:
                this.updatePlayerWin(notification.getBody());
                break;
            case UIEvent.UPDATE_TOTAL_BET:
                this.updateTotalBetTxt(notification.getBody());
                break;
            case UIEvent.CLEAR_PLAYER_WIN:
                this.clearPlayerWinTxt();
                break;
            case UIEvent.SET_BBW_POSITION_TO_BOTTOM:
                this.view.setToBottom();
                break;
            case UIEvent.RESTORE_BBW_POSITION:
                this.view.restorePosition();
                this.updateBBWContent();
                break;
        }
    }

    private updatePlayerBalance(cash: number) {
        this.curBalanceInCash = cash;
        let balance: string;
        balance = this.getDisplayContent(cash);
        this.view.updateBalanceLabel(balance);
    }

    private updatePlayerWin(cash: number) {
        this.curWinInCash = cash;
        let win: string;
        win = this.getDisplayContent(cash);
        this.view.updateWinLabel(win);
    }

    private updateTotalBetTxt(totalBet: number) {
        this.curTotalBetInCash = totalBet;
        let bet: string;
        bet = this.getDisplayContent(totalBet);
        this.view.updateTotalBetLabel(bet);
    }

    private getDisplayContent(cash: number): string {
        let display: string;
        if (this.isShowCredit) {
            let credit = this.gameDataProxy.getCreditByDenomMultiplier(cash);
            display = MathUtil.floor(credit, 0).toString();
        } else {
            display = BalanceUtil.formatBalanceWithDollarSign(cash);
        }
        return display;
    }

    private clearPlayerWinTxt() {
        this.curWinInCash = 0;
        let clearWinTxt = this.isShowCredit ? '0' : BalanceUtil.formatBalanceWithDollarSign(0);
        if (this.view.winDisplay.string != clearWinTxt) {
            this.view.updateWinLabel(clearWinTxt); //贏分顯示歸零
            this.sendNotification(WinEvent.FORCE_WIN_DISPOSE); //清除贏分表演
        }
    }

    private onClick() {
        this.isShowCredit = !this.isShowCredit;
        this.updateBBWContent();
    }

    private updateBBWContent() {
        this.updatePlayerBalance(this.curBalanceInCash);
        this.updatePlayerWin(this.curWinInCash);
        this.updateTotalBetTxt(this.curTotalBetInCash);
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
