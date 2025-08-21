import { Logger } from '../../../core/utils/Logger';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { ScreenEvent } from '../../util/Constant';
import { GlobalTimer } from '../../util/GlobalTimer';
import { AutoPlayClickOptionCommand } from './AutoPlayClickOptionCommand';
import { NetworkProxy } from '../../../core/proxy/NetworkProxy';
import { WinType } from '../../vo/enum/WinType';

/**
 * 自動模式在 IDLE 狀態下，當前次數小於目標次數時，要自動下一把
 */
export class AutoPlayOnIdleProcessCommand extends puremvc.SimpleCommand {
    public static NAME = 'AutoPlayOnIdleProcessCommand';

    protected defaultSpinTime: number = 0.5;
    protected bigWinSpinTime: number = 0.5;
    protected timerKey = AutoPlayOnIdleProcessCommand.NAME;

    public execute(notification: puremvc.INotification): void {
        Logger.i('[AutoPlayOnIdleProcess]');
        if (!this.networkProxy.isConnected()) {
            Logger.i('[AutoPlayOnIdleProcess] isReconnecting');
            this.sendNotification(AutoPlayClickOptionCommand.NAME, [0, 0]);
            return;
        }

        GlobalTimer.getInstance().removeTimer(GlobalTimer.KEY_AUTOPLAY);
        if (this.gameDataProxy.curAutoTimes < this.gameDataProxy.maxAutoTimes) {
            let nextTime = this.isChangeDelaySpinTime() ? this.bigWinSpinTime : this.defaultSpinTime;
            GlobalTimer.getInstance()
                .registerTimer(GlobalTimer.KEY_AUTOPLAY, nextTime, this.notifySpinDown, this)
                .start();
        } else {
            this.sendNotification(AutoPlayClickOptionCommand.NAME, [0, 0]);
        }
    }

    /** 發出Spin down通知 */
    protected notifySpinDown() {
        GlobalTimer.getInstance().removeTimer(GlobalTimer.KEY_AUTOPLAY);
        this.sendNotification(ScreenEvent.ON_SPIN_DOWN);
    }

    /**
     * 判斷是否調整DelaySpinTime
     * 預設為autoplay下 並且表演層級為大獎
     */
    protected isChangeDelaySpinTime(): boolean {
        return (
            this.gameDataProxy.onAutoPlay &&
            this.gameDataProxy.spinEventData &&
            this.gameDataProxy.spinEventData.baseGameResult &&
            this.gameDataProxy.spinEventData.baseGameResult.displayInfo &&
            // this.gameDataProxy.spinEventData.baseGameResult.displayInfo.bigWinType != 'none'
            this.gameDataProxy.spinEventData.baseGameResult.displayInfo.winType >= WinType.bigWin
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

    protected _networkProxy: NetworkProxy;
    protected get networkProxy(): NetworkProxy {
        if (!this._networkProxy) {
            this._networkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._networkProxy;
    }
}
