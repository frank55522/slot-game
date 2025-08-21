import { JackpotPool } from '../util/Constant';
import { JackpotTypeObj } from '../vo/jackpot/JackpotTypeObj';

export class JackpotPoolProxy extends puremvc.Proxy {
    public static readonly NAME: string = 'JackpotPoolProxy';

    constructor() {
        super(JackpotPoolProxy.NAME);
    }

    public _jackpotTypeObj: JackpotTypeObj = new JackpotTypeObj();
    public set jackpotTypeObj(val: JackpotTypeObj) {
        this._jackpotTypeObj = val;
        this.sendNotification(JackpotPool.POOL_VALUE_UPDATE, this._jackpotTypeObj);
    }

    public get jackpotTypeObj(): JackpotTypeObj {
        return this._jackpotTypeObj;
    }

    public _jackpotTypeObjInit: JackpotTypeObj = new JackpotTypeObj();
    public set jackpotTypeObjInit(val: JackpotTypeObj) {
        this._jackpotTypeObjInit = val;
        this.sendNotification(JackpotPool.POOL_VALUE_UPDATE, this._jackpotTypeObjInit);
    }

    public get jackpotTypeObjInit(): JackpotTypeObj {
        return this._jackpotTypeObjInit;
    }
}
