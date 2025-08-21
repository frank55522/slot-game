import { NetworkProxy } from '../../../core/proxy/NetworkProxy';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { GameScene } from '../../vo/data/GameScene';
import { NormalPlayCommand } from './NormalPlayCommand';

// TODO: 加入扣錢判斷
export abstract class SpinRequestCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'SpinRequestCommand';
    public static readonly FEATURERESPONSE: string = 'h5.featureResponse';

    public execute(notification: puremvc.INotification) {
        if (this.gameDataProxy.curScene == GameScene.Game_1) {
            // 會扣錢的!!

            if (this.gameDataProxy.featureMode != -1) {
                this.netProxy.sendFeatureRequest(this.gameDataProxy.featureMode);
                this.gameDataProxy.featureMode = -1;
                return;
            }
            this.sendRequest();
        } else {
            // 進入FG後，純粹表演
            this.sendNotification(NormalPlayCommand.NAME);
        }
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _netProxy: NetworkProxy;
    protected get netProxy(): NetworkProxy {
        if (!this._netProxy) {
            this._netProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._netProxy;
    }

    /**
     * 送出request
     * @author
     */
    protected abstract sendRequest(): void;
}
