import { Game1CountdownCommand } from '../../../sgv3/command/state/Game1CountdownCommand';
import { StateMachineProxy } from '../../../sgv3/proxy/StateMachineProxy';
import { GlobalTimer } from '../../../sgv3/util/GlobalTimer';
import { GAME_GameDataProxy } from '../../proxy/GAME_GameDataProxy';

export class GAME_Game1CountdownCommand extends Game1CountdownCommand {
    private readonly COUNTDOWN_DURATION = 5; // 5秒倒數
    private readonly TIMER_KEY = 'game1CountdownDisplay';
    private currentCountdown: number = 0;

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        
        // 檢查是否啟用倒數計時
        if (!this.gameDataProxy.isCountdownEnabled) {
            // 倒數被關閉，直接進入下一個狀態
            this.changeState(StateMachineProxy.GAME1_ROLLCOMPLETE);
            return;
        }
        
        // 觸發HTML覆蓋層顯示倒數
        this.sendNotification('SHOW_COUNTDOWN_DISPLAY');
        
        // 開始倒數邏輯
        this.startCountdownProcess();
    }

    private startCountdownProcess(): void {
        this.currentCountdown = this.COUNTDOWN_DURATION;
        
        // 立即顯示初始倒數（5秒）
        this.updateCountdownDisplay(this.currentCountdown);
        
        // 開始計時器，每秒執行一次
        this.scheduleCountdownTimer();
    }

    private scheduleCountdownTimer(): void {
        // 確保先清除任何現有的計時器
        GlobalTimer.getInstance().removeTimer(this.TIMER_KEY);
        
        // 註冊新的計時器
        GlobalTimer.getInstance().registerTimer(this.TIMER_KEY, 1, () => {
            this.onCountdownTick();
        }, this).start();
    }

    private onCountdownTick(): void {
        this.currentCountdown--;
        
        if (this.currentCountdown > 0) {
            // 更新顯示並繼續倒數
            this.updateCountdownDisplay(this.currentCountdown);
            // 重新註冊下一秒的計時器
            this.scheduleCountdownTimer();
        } else {
            // 倒數完成
            this.finishCountdown();
        }
    }

    private updateCountdownDisplay(remainingTime: number): void {
        this.sendNotification('UPDATE_COUNTDOWN_DISPLAY', remainingTime);
    }

    private finishCountdown(): void {
        // 清理計時器
        GlobalTimer.getInstance().removeTimer(this.TIMER_KEY);
        
        // 隱藏倒數顯示
        this.sendNotification('HIDE_COUNTDOWN_DISPLAY');
        
        // 進入下一個狀態
        this.changeState(StateMachineProxy.GAME1_ROLLCOMPLETE);
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GAME_GameDataProxy;
    protected get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }
}