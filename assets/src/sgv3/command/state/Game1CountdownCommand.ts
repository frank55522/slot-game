import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { StateCommand } from './StateCommand';
import { GlobalTimer } from '../../util/GlobalTimer';

export class Game1CountdownCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME1_EV_COUNTDOWN;

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        
        // 基礎倒數邏輯，預設5秒後進入ROLLCOMPLETE狀態
        const countdownTime = 5;
        const timerKey = 'game1Countdown';
        
        console.log(`[Game1CountdownCommand] 開始 ${countdownTime} 秒倒數`);
        
        // 使用GlobalTimer進行倒數
        GlobalTimer.getInstance().registerTimer(timerKey, countdownTime, () => {
            console.log('[Game1CountdownCommand] 倒數完成，進入ROLLCOMPLETE狀態');
            GlobalTimer.getInstance().removeTimer(timerKey);
            this.changeState(StateMachineProxy.GAME1_ROLLCOMPLETE);
        }, this).start();
    }
}