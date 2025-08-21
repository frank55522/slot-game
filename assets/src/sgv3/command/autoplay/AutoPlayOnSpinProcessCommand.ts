import { UIEvent } from 'common-ui/proxy/UIEvent';
import { Logger } from '../../../core/utils/Logger';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';

/**
 * 自動模式在 SPIN 狀態下，要更新當前次數
 *
 */
export class AutoPlayOnSpinProcessCommand extends puremvc.SimpleCommand {
    public static NAME = 'AutoPlayOnSpinProcessCommand';

    public execute(notification: puremvc.INotification): void {
        Logger.i('[AutoPlayOnSpinProcess]');
        let gameDataProxy: GameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        let webBridgeProxy: WebBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        gameDataProxy.curAutoTimes++;
        let remainingTimes = gameDataProxy.maxAutoTimes - gameDataProxy.curAutoTimes;
        webBridgeProxy.updateWebAutoTimesSpan(gameDataProxy.curAutoTimes);
        this.sendNotification(UIEvent.UPDATE_AUTO_PLAY_COUNT, remainingTimes);
    }
}
