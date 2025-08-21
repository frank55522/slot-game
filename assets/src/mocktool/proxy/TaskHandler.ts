import { director, Scheduler } from 'cc';
import { MTTask } from '../vo/MTTask';

/**
 * Task執行器
 */
export class TaskHandler {
    private task: MTTask;
    private listener: TaskHandlerListener;
    private handler: Scheduler;
    private subHandlerList: Array<TaskHandler>;
    private isRun: boolean;
    private taskMap: { [key: string]: MTTask };

    public constructor(task: MTTask, l: TaskHandlerListener, taskMap: { [key: string]: MTTask }) {
        this.task = task;
        this.listener = l;
        this.isRun = false;
        this.subHandlerList = new Array<TaskHandler>();
        this.taskMap = taskMap;
    }

    public run(): void {
        if (this.isRun) return;

        this.isRun = true;

        let delay = this.task.delay * 0.001; // 因為cocos的scheduler以秒為單位，因此單位轉成秒
        this.handler = director.getScheduler();
        Scheduler.enableForTarget(<Object>this);
        this.handler.schedule(this.onStartTask, <Object>this, 0, 0, delay, false);
    }

    private onStartTask(): void {
        if (!this.isRun) return;

        let duration = this.task.duration;
        let repeat = this.task.repeat;

        if (repeat == 1) {
            this.listener.onResponse(this.deepCopy(this.task));
        } else {
            this.handler.schedule(this.onRepeatTask, <Object>this, duration, repeat == 0 ? 0 : repeat - 2, 0, false);
        }

        let relatedTaskList = this.task.relate;
        if (relatedTaskList) {
            for (let subTask of relatedTaskList) {
                let taskObj = this.taskMap[subTask];

                let subHandler = new TaskHandler(taskObj, this.listener, this.taskMap);
                this.subHandlerList.push(subHandler);
                subHandler.run();
            }
        }
    }

    private onRepeatTask(max: number, counter: number = 0): void {
        if (!this.isRun) return;

        this.listener.onResponse(this.deepCopy(this.task));
    }

    public stop(): void {
        if (!this.isRun) return;

        this.isRun = false;
        this.handler.unscheduleAllForTarget(this);

        for (let sub of this.subHandlerList) {
            sub.stop();
        }
    }

    private deepCopy(task: MTTask): MTTask {
        return JSON.parse(JSON.stringify(this.task));
    }
}

/**
 * Callback after calling MTCaseManager.runTask()
 */
export interface TaskHandlerListener {
    onResponse(task: MTTask);
}
