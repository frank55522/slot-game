import { Component, JsonAsset, _decorator } from 'cc';
import { Logger } from '../../core/utils/Logger';
import { DefObj } from '../vo/DefCase';
import { MTCase } from '../vo/MTCase';
import { MTTask } from '../vo/MTTask';
import { TaskHandlerListener, TaskHandler } from './TaskHandler';
const { ccclass, property } = _decorator;

@ccclass('MTCaseManager')
export class MTCaseManager extends Component {
    @property({ type: JsonAsset })
    public caseList: JsonAsset[] = [];

    @property({ type: JsonAsset })
    public taskList: JsonAsset[] = [];

    private static readonly TASK_TYPE_NORMAL: number = 0;
    private static readonly TASK_TYPE_REF: number = 1;

    private static readonly ALERT_DESCRIPTION_UNDEFINE = 'Cannot find the description in this case';
    private static readonly ALERT_TASKS_UNDEFINE = 'Cannot find the tasks in this case';

    public static readonly TEMP_CASE = '_TEMP_CASE';

    /**
     * key: 檔案url
     * value: case info
     */
    private caseObjMap: { [key: string]: DefObj };

    /**
     * key: 檔案url
     * value: task info
     */
    private taskObjMap: { [key: string]: DefObj };

    /**
     * key: case name
     * value: case object
     */
    private caseMap: { [key: string]: MTCase };

    /**
     * key: task name
     * value: task object
     */
    private taskMap: { [key: string]: MTTask };

    /**
     * key: task name
     * value: task object
     */
    private selectedTaskMap: { [key: string]: MTTask };

    private resPath: string;
    private loadingCaseListener: LoadingCaseListener;
    private selectedCase: MTCase;

    public setLoadingCaseListener(l: LoadingCaseListener) {
        this.loadingCaseListener = l;
        this.caseMap = {};
        this.taskMap = {};
        this.selectedTaskMap = {};
    }

    /**
     * @param text JSON格式描述的測試案例
     */
    public addCase(text: string): void {
        let mtCase: MTCase = this.checkJson(text, 'Temp case is failed');
        this.caseMap[MTCaseManager.TEMP_CASE] = mtCase;
    }

    public getTask(name: string): MTTask {
        return this.selectedTaskMap[name];
    }

    public handleTask(name: string, l: TaskHandlerListener): void {
        let task = this.selectedTaskMap[name];
        if (task) {
            let taskHandler = new TaskHandler(task, l, this.selectedTaskMap);
            taskHandler.run();
        } else {
            Logger.w(MTCaseManager.ALERT_TASKS_UNDEFINE);
        }
    }

    /**
     * @return Current flow description
     */
    public getCaseDescription(): string {
        if (!this.selectedCase) {
            return 'No case is selected';
        }

        let description: string = this.selectedCase.description;

        if (description == undefined) {
            return MTCaseManager.ALERT_DESCRIPTION_UNDEFINE;
        }

        let tasks: Array<MTTask> = this.selectedCase.tasks;

        if (!tasks) {
            return MTCaseManager.ALERT_TASKS_UNDEFINE;
        }

        for (let iTask = 0; iTask < tasks.length; iTask++) {
            let index: number = iTask + 1;
            description += '\n\n' + index + '. ' + tasks[iTask].description;
        }

        return description;
    }

    /**
     * @param name case name
     */
    public selectCase(name: string): void {
        this.selectedTaskMap = {};

        let caseObj = this.caseMap[name];
        if (!caseObj) {
            this.loadingCaseListener.onErrorSelect(name);
            return;
        }

        this.selectedCase = caseObj;

        if (!caseObj.tasks) {
            this.loadingCaseListener.onError(MTCaseManager.ALERT_TASKS_UNDEFINE);
            return;
        }

        for (let task of caseObj.tasks) {
            let type = this.getTaskType(task);
            switch (type) {
                case MTCaseManager.TASK_TYPE_REF:
                    this.onTaskTypeRef(task);
                    break;
                default:
                    this.onTaskTypeNormal(task);
                    break;
            }
        }

        this.loadingCaseListener.onSelect(name);
    }

    private getTaskType(task: MTTask): number {
        if (task.task) {
            return MTCaseManager.TASK_TYPE_REF;
        }

        return MTCaseManager.TASK_TYPE_NORMAL;
    }

    private onTaskTypeNormal(task: MTTask): void {
        this.selectedTaskMap[task.name] = task;
    }

    private onTaskTypeRef(task: MTTask): void {
        let taskName = task.task;
        if (taskName.includes('.json')) {
            taskName = taskName.replace('.json', '');
        }
        let taskObj = this.taskMap[taskName];

        task.name = taskObj.name;
        task.data = taskObj.data;
        task.description = taskObj.description;
        task.event = taskObj.event;
        task.delay = taskObj.delay;
        task.repeat = taskObj.repeat;
        task.duration = taskObj.duration;
        task.relate = taskObj.relate;
        task.task = undefined;

        this.selectedTaskMap[task.name] = task;
    }

    /**
     * 讀取所有案例的描述檔，為json格式
     */
    public loadCases(): void {
        let size: number = this.caseList.length;
        this.loadingCaseListener.onStart(size);

        for (let caseInfo of this.caseList) {
            this.loadingCase(caseInfo);
        }

        for (let taskInfo of this.taskList) {
            this.loadingTask(taskInfo);
        }
    }

    private checkJson(data: JsonAsset | string, message: string): any {
        let json = undefined;
        if (typeof data === 'string') {
            try {
                json = JSON.parse(data);
            } catch (e) {
                this.loadingCaseListener.onError(message);
                Logger.e('Failed format: ' + message);
            }
        } else {
            json = data.json;
        }

        return json;
    }

    private loadingCase(data: JsonAsset) {
        let caseObj: MTCase = this.checkJson(data, data.name + '.json');
        if (!caseObj) return;

        let name = data.name;
        this.caseMap[name] = caseObj;
        this.loadingCaseListener.onCompleteCase(name);
    }

    private loadingTask(data: JsonAsset) {
        let taskObj: MTTask = this.checkJson(data, data.name + '.json');
        if (!taskObj) return;

        let name = data.name;
        this.taskMap[name] = taskObj;
        this.loadingCaseListener.onCompleteTask(name);
    }
}

export interface LoadingCaseListener {
    /**
     * @param total case數量
     */
    onStart(total: number);

    /**
     * @param name 已完成載入的case名稱
     */
    onCompleteCase(name: string);

    /**
     * @param name 已完成載入的task名稱
     */
    onCompleteTask(name: string);

    /**
     * @param url 載入失敗的檔案路徑
     */
    onError(url: string);

    /**
     * @param name 已選擇的測試案例名稱
     */
    onSelect(name: string): void;

    /**
     * @param name 錯誤的測試案例名稱
     */
    onErrorSelect(name: string): void;
}
