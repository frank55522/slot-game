import { _decorator } from 'cc';
import BaseMediator from 'src/base/BaseMediator';
import { JackpotWinInfoView } from '../view/JackpotWinInfoView';
import { ViewMediatorEvent } from 'src/sgv3/util/Constant';
import { UIEvent } from 'common-ui/proxy/UIEvent';
const { ccclass } = _decorator;

@ccclass('JackpotWinInfoViewMediator')
export class JackpotWinInfoViewMediator extends BaseMediator<JackpotWinInfoView> {
    protected lazyEventListener(): void {}

    public listNotificationInterests(): Array<any> {
        return [ViewMediatorEvent.JACKPOT_WON_SHOW, ViewMediatorEvent.JACKPOT_WON_CLOSE, UIEvent.CLEAR_PLAYER_WIN];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case ViewMediatorEvent.JACKPOT_WON_SHOW:
                this.view.showJackpotWonMsg(notification.getBody());
                break;
            case ViewMediatorEvent.JACKPOT_WON_CLOSE:
            case UIEvent.CLEAR_PLAYER_WIN:
                this.view.closeJackpotWonMsg();
                break;
        }
    }
}
