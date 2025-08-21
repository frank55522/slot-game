import { StateMachineCommand } from '../../../core/command/StateMachineCommand';
import { StateMachineObject } from '../../../core/proxy/CoreStateMachineProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { GlobalTimer } from '../../util/GlobalTimer';

/** Maintenance遇到game1ShowWin要移到game1_end */
export class MaintainGame1ShowwinCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MaintainGame1ShowwinCommand';
    /** 預設時間為500ms */
    protected delayTime: number = 0.5;

    public execute(notification: puremvc.INotification): void {
        if (this.stateMachineProxy.checkMaintenanceGame1Showwin())
            // 如果狀態為Game1ShowWin才會處理
            GlobalTimer.getInstance()
                .registerTimer(MaintainGame1ShowwinCommand.NAME, this.delayTime, this.endGame1ShowWin, this)
                .start();
    }

    /** 滾分結束轉換狀態到Game1End，執行時必須確保狀態仍在Game1ShowWin */
    protected endGame1ShowWin() {
        GlobalTimer.getInstance().removeTimer(MaintainGame1ShowwinCommand.NAME);
        if (this.stateMachineProxy.checkMaintenanceGame1Showwin()) {
            this.sendNotification(StateMachineCommand.NAME, new StateMachineObject(StateMachineProxy.GAME1_AFTERSHOW));
        }
    }

    // ======================== Get Set ========================
    protected _stateMachineProxy: StateMachineProxy;
    public get stateMachineProxy(): StateMachineProxy {
        if (!this._stateMachineProxy) {
            this._stateMachineProxy = this.facade.retrieveProxy(StateMachineProxy.NAME) as StateMachineProxy;
        }
        return this._stateMachineProxy;
    }
}
