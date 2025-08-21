import { Vec2 } from 'cc';
import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { DragonUpEvent } from '../../util/Constant';
import { LockType } from '../../vo/enum/Reel';
import { StateCommand } from './StateCommand';

export class Game4ShowWinCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME4_EV_SHOWWIN;
    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        let curResult = this.reelDataProxy.symbolFeature;
        let indexArray = new Array<Array<Vec2>>();
        let baseArray = new Array<Vec2>();
        let targertArray = new Array<Vec2>();
        for(let x=0;x< curResult.length;x++){
            for(let y=0;y< curResult[x].length;y++){
                if(curResult[x][y].lockType == LockType.NEW_LOCK){
                    targertArray.push(new Vec2(x,y));
                }else if(curResult[x][y].lockType == LockType.BASE_LOCK){
                    baseArray.push(new Vec2(x,y));
                }
            }
        }
        indexArray.push(baseArray);
        indexArray.push(targertArray);
        /** 通知show C2 表演 */
        this.sendNotification(DragonUpEvent.ON_ALL_CREDIT_COLLECT_START,indexArray);
    }

    // ======================== Get Set ======================== 
    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }
}
