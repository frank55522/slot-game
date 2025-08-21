import { _decorator } from 'cc';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';
import { MathUtil } from 'src/core/utils/MathUtil';
const { ccclass } = _decorator;

@ccclass('OpenHelpCommand')
export class OpenHelpCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'OpenHelpCommand';

    public execute(notification: puremvc.INotification) {
        if (this.gameDataProxy.isHelpOpen) return;

        this.gameDataProxy.isHelpOpen = true;
        this.OpenHelp();
    }

    private OpenHelp() {
        this.webBridgeProxy.openHelp(
            JSON.stringify({
                lang: this.gameDataProxy.language,
                bet: this.gameDataProxy.isOmniChannel() ? this.gameDataProxy.curBet : this.gameDataProxy.convertCredit2Cash(this.gameDataProxy.curBet),
                gameVer: this.gameDataProxy.gameVer,
                versionName: this.getVersionName(),
                decimalPlace: MathUtil.decimalPlace
            })
        );
    }

    protected getVersionName(): string {
        if (this.gameDataProxy.isOmniChannel()) {
            return 'omni_channel';
        }
        return 'online';
    }

    // ======================== Get Set ========================
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
