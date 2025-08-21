import { UIEvent } from 'common-ui/proxy/UIEvent';
import { Logger } from '../../../core/utils/Logger';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';
import { ScreenEvent } from '../../util/Constant';
import { GlobalTimer } from '../../util/GlobalTimer';
import { CheckNormalButtonStateCommand } from 'src/game/command/CheckNormalButtonStateCommand';

/**
 * 選擇自動模式次數
 * ([0,0] : 停止自動模式)
 */
export class AutoPlayClickOptionCommand extends puremvc.SimpleCommand {
    public static NAME = 'AutoPlayClickOptionCommand';

    public execute(notification: puremvc.INotification): void {
        Logger.i('[AutoPlayClickOptionCommand] execute()');
        let _getValue: any[] = notification.getBody() as any[];
        let _curTimes: number = +_getValue[0];
        let _maxTimes: number = +_getValue[1];
        // 先暫停所有計時器
        GlobalTimer.getInstance().removeTimer(GlobalTimer.KEY_AUTOPLAY);
        if (_curTimes == 0 && _maxTimes == 0) {
            // 停止自動模式
            this.gameDataProxy.onAutoPlay = false;
            this.gameDataProxy.curAutoTimes = this.gameDataProxy.maxAutoTimes = 0;
            this.sendNotification(UIEvent.UPDATE_AUTO_PLAY_COUNT, 0);
            this.sendNotification(CheckNormalButtonStateCommand.NAME);
        } else if (_curTimes < _maxTimes) {
            this.gameDataProxy.onAutoPlay = true;
            this.gameDataProxy.curAutoTimes = _curTimes;
            this.gameDataProxy.maxAutoTimes = _maxTimes;

            // 如果是以下遊戲狀態，直接 Spin.
            if (this.isSpinDown()) {
                this.sendNotification(ScreenEvent.ON_SPIN_DOWN);
            }
        } else {
            Logger.w(
                '[ClickAutoPlayOptionCommand] 輸入判斷無效的場次. curTimes:' +
                    _getValue[0] +
                    ' ,maxTimes:' +
                    _getValue[1]
            );
        }
    }

    /**
     * 判斷是否觸發spin down
     */
    protected isSpinDown(): boolean {
        return (
            this.gameDataProxy.gameState == StateMachineProxy.GAME1_IDLE ||
            this.gameDataProxy.gameState == StateMachineProxy.GAME1_SHOWWIN
        );
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _webBridgeProxy: WebBridgeProxy;
    protected get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }
}
