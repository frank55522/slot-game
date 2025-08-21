import { JackpotPoolProxy } from '../../proxy/JackpotPoolProxy';
import { JackpotTypeObj } from '../../vo/jackpot/JackpotTypeObj';
import { JackpotPoolObj } from 'src/sgv3/vo/jackpot/JackpotPoolObj';

export class JackpotPoolCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'jackpotPoolNotify';
    protected jackpotPoolProxy: JackpotPoolProxy;

    public execute(notification: puremvc.INotification): void {
        let jackpotTypeObj: JackpotTypeObj = notification.getBody();
        let jackpotPoolObj: JackpotPoolObj[] = [];
        this.jackpotPoolProxy = this.getJackpotPoolProxy();

        if (jackpotTypeObj.typeItems.length > 3) {
            // 有含mini的是初始池
            this.jackpotPoolProxy.jackpotTypeObjInit = jackpotTypeObj;
        }

        if (this.jackpotPoolProxy.jackpotTypeObj.typeItems != null) {
            this.jackpotPoolProxy.jackpotTypeObj.typeItems.forEach((curItem) => {
                const target = jackpotTypeObj.typeItems.find((newItem) => newItem.poolName === curItem.poolName);
                if (target) {
                    jackpotPoolObj.push(target);
                }else{
                    jackpotPoolObj.push(curItem);
                }
            }); 
            jackpotTypeObj.typeItems = jackpotPoolObj;
        }

        this.jackpotPoolProxy.jackpotTypeObj = jackpotTypeObj;
    }

    protected getJackpotPoolProxy(): JackpotPoolProxy {
        return this.facade.retrieveProxy(JackpotPoolProxy.NAME) as JackpotPoolProxy;
    }
}
