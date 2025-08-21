import { director, Scheduler } from 'cc';
import { Logger } from '../../core/utils/Logger';
import { TSMap } from '../../core/utils/TSMap';

export class GlobalTimer {
    public static readonly KEY_AUTOPLAY = 'autoPlay';

    /** GlobalTimer 實體 */
    private static instance: GlobalTimer = new GlobalTimer();

    public timerInfos: TSMap<string, ScheduleTimer>;

    constructor() {
        this.timerInfos = new TSMap<string, ScheduleTimer>();
    }

    public static getInstance(): GlobalTimer {
        return this.instance;
    }

    /** 移除Timer */
    public removeTimer(id: string) {
        if (this.stop(id)) {
            this.timerInfos.delete(id);
        }
    }

    /** 移除所有Timer */
    public removeAllTimer() {
        this.stopAllTimer();
        this.timerInfos.clear();
    }

    /**
     * 註冊Timer, repeat 等於無限多次，如果id已經存在還要註冊就會死掉
     * @param id 識別key
     * @param delayTime 延遲執行
     * @param timerHandler 處理事件
     * @param object 呼叫的物件
     * @param repeat 可以讓定時器觸發 repeat + 1 次，使用 `macro.REPEAT_FOREVER`
     * 可以讓定時器一直循環觸發。<br/>
     *  */
    public registerTimer(
        id: string,
        delayTime: number,
        timerHandler: Function,
        object: any,
        repeat: number = 0 //repeat 值可以讓定時器觸發 repeat + 1 次
    ): ScheduleTimer {
        const self = this;
        // 先進行清除 關閉
        if (self.timerInfos.get(id) != undefined) {
            throw new Error(`id: ${id} is exist!!`);
        }

        // delayTime 不可為 0 以下
        if (delayTime <= 0) {
            delayTime = 0.01;
        }

        let scheduleTimer = new ScheduleTimer(delayTime, timerHandler, object, repeat);
        self.timerInfos.set(id, scheduleTimer);
        return scheduleTimer;
    }

    /** 啟動Timer */
    public start(id: string) {
        const self = this;
        if (self.timerInfos.get(id) != undefined) {
            self.timerInfos.get(id).start();
            return true;
        } else {
            Logger.w('[' + id + '] Timer Id is not exist.');
            return false;
        }
    }

    /** 關閉Timer */
    public stop(id: string): boolean {
        const self = this;
        if (self.timerInfos.get(id) != undefined) {
            self.timerInfos.get(id).stop();
            return true;
        } else {
            return false;
        }
    }

    /** 暫停所有Timer */
    public stopAllTimer() {
        let key: string;
        let timer: ScheduleTimer;
        for (key in this.timerInfos.values()) {
            timer = this.timerInfos.get(key);
            timer.stop();
        }
    }
}

export class ScheduleTimer {
    private handler: Scheduler;

    private delay: number;

    private callBack: Function;

    private callBackObj: any;

    private repeat: number;

    // private curRepeat: number;

    public constructor(delay: number, callBack: Function, object: any, repeat: number = 0) {
        this.delay = delay;
        this.callBack = callBack;
        this.callBackObj = object;
        this.repeat = repeat;
    }

    public start(): void {
        // this.curRepeat = 0;
        Scheduler.enableForTarget(this.callBackObj);
        this.handler = director.getScheduler();
        this.handler.schedule(this.callBack, this.callBackObj, this.delay, this.repeat, this.delay, false);
    }

    public stop(): void {
        // this.curRepeat = 0;
        if (this.handler.isScheduled(this.callBack, this.callBackObj))
            this.handler.unschedule(this.callBack, this.callBackObj);
    }

    // private onComplete(): void {
    //     this.curRepeat++;
    //     if (this.curRepeat === this.repeat + 1) {
    //         egret.Tween.removeTweens(this);
    //     }
    // }
}
