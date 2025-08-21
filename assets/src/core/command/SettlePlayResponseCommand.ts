import { UIEvent } from 'common-ui/proxy/UIEvent';
import { SpinRequestCommand } from '../../sgv3/command/spin/SpinRequestCommand';
import { GameDataProxy } from '../../sgv3/proxy/GameDataProxy';
import { ReelDataProxy } from '../../sgv3/proxy/ReelDataProxy';
import { StateMachineProxy } from '../../sgv3/proxy/StateMachineProxy';
import { WebBridgeProxy } from '../../sgv3/proxy/WebBridgeProxy';
import { ReelState } from '../../sgv3/vo/data/ReelState';
import { NetworkProxy } from '../proxy/NetworkProxy';
import { Logger } from '../utils/Logger';
import { SettlePlayResponseObject } from '../vo/SettlePlayResponseObject';

export class SettlePlayResponseCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'h5.settlePlayResponse';

    public execute(notification: puremvc.INotification): void {
        Logger.i('[SettlePlayResponseCommand] Execute');

        //ToDO: 暫時先用資料判斷來源是SmartFox，還是OddsWork.
        if (notification.getBody() != undefined) {
            let settlePlayResponse: SettlePlayResponseObject = notification.getBody();
            if (settlePlayResponse.result != 'OK') {
                Logger.e('[Error] SETTLE_PLAY IS FAIL!?');
            } else {
                this.gameDataProxy.canUpdateJackpotPool = true;
                this.gameDataProxy.setBmd(settlePlayResponse.balance);
                if (this.isCanUpdateBalance()) {
                    this.sendNotification(UIEvent.UPDATE_PLAYER_BALANCE, this.gameDataProxy.cash);
                }
            }
        }

        this.networkProxy.resetSendSpinState();
        if (this.reelDataProxy.reelState == ReelState.WaitRNG) {
            this.sendNotification(SpinRequestCommand.NAME);
        }
    }

    // ======================== Get Set ========================
    protected isCanUpdateBalance() {
        return (
            this.gameDataProxy.gameState == StateMachineProxy.GAME1_IDLE ||
            this.gameDataProxy.gameState == StateMachineProxy.GAME1_SHOWWIN
        );
    }

    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _networkProxy: NetworkProxy;
    protected get networkProxy(): NetworkProxy {
        if (!this._networkProxy) {
            this._networkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._networkProxy;
    }

    protected _webBridgeProxy: WebBridgeProxy;
    protected get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }
}
