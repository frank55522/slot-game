export class CoreStateMachineProxy extends puremvc.Proxy {
    public static readonly NAME: string = 'CoreStateMachineProxy';
    public static readonly EV_ON_PAUSE: string = 'EV_ON_PAUSE';
    public static readonly EV_ON_RESUME: string = 'EV_ON_RESUME';
    protected stateMachineMap: {
        [key: string]: Array<string>;
    };
    protected stateEventMap: {
        [key: string]: string;
    };
    private stateQueue: Array<StateMachineObject>;
    private preState: string;
    private curState: string;

    constructor(name: string = CoreStateMachineProxy.NAME) {
        super(name);
        const self = this;
        self.stateQueue = new Array<StateMachineObject>();
        self.preState = undefined;
        self.curState = undefined;
        // egret.lifecycle.onPause = () => self.onPauseEgret();
        // egret.lifecycle.onResume = () => self.onResumeEgret();
        self.initStateMachineMap();
        self.initStateEventMap();
    }

    private onPauseEgret() {
        this.facade.sendNotification(CoreStateMachineProxy.EV_ON_PAUSE);
    }

    private onResumeEgret() {
        this.facade.sendNotification(CoreStateMachineProxy.EV_ON_RESUME);
    }

    protected initStateMachineMap() {
        this.stateMachineMap = {};
    }

    protected initStateEventMap() {
        this.stateEventMap = {};
    }

    /**
     * 檢查接下來的狀態是否符合狀態機
     */
    public checkState(currentState: string, targetState: string): boolean {
        let stateList: Array<string> = this.stateMachineMap[currentState];
        for (let state of stateList) {
            if (state == targetState) return true;
        }
        return false;
    }

    /**
     * 更換狀態
     *
     * @param state 將更換的狀態
     */
    public changeState(obj: StateMachineObject): void {
        const self = this;
        const state = obj.gameState;
        self.preState = self.curState;
        self.curState = state;
        const event: string = self.changeState2Event(state);
        self.facade.sendNotification(event, obj);
    }

    /**
     * @returns 回傳上一狀態
     */
    public getPreviousState(): string {
        return this.preState;
    }

    /**
     * @returns 回傳目前狀態
     */
    public getCurrentState(): string {
        return this.curState;
    }

    /**
     * 取得狀態相對應的事件
     */
    private changeState2Event(state: string): string {
        return this.stateEventMap[state];
    }

    /**
     * 檢查目前狀態是否可進去維護，預設為立即觸發維護
     *
     * @param state 欲檢查的狀態
     *
     * @returns true為進行維護
     */
    public checkMaintenanceState(state: string): boolean {
        return true;
    }

    /**
     * 檢查目前狀態是否可進行斷線，預設為 undefined
     *
     * 回傳true與false為是否直接斷線，
     * 若無覆寫此方法時，一律以undefined定義不使用此功能
     *
     * @param state 欲檢查的狀態
     *
     * @returns true為立即斷線
     */
    public checkDisconnectedState(state: string): boolean {
        return undefined;
    }

    /**
     * @param state 將執行的狀態
     *
     * @return true 可執行目前的狀態
     */
    public lockState(state: StateMachineObject): boolean {
        const self = this;
        if (self.stateQueue.indexOf(state) == -1) {
            self.stateQueue.push(state);
        }
        if (self.stateQueue[0] == state) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 釋放當前狀態
     *
     * @returns state 下一個處理的狀態，預設為undefined
     */
    public unlockState(): StateMachineObject {
        const self = this;
        if (self.stateQueue.length) {
            self.stateQueue.shift();
            if (self.stateQueue.length) {
                return self.stateQueue[0];
            }
        }
        return undefined;
    }
}

/**
 * @author Vince vinceyang
 */
export class StateMachineObject {
    public body: any;
    public gameState: string;
    public constructor(gameState: string, body?: any) {
        this.gameState = gameState;
        this.body = body;
    }
}
