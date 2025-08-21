import * as i18n from 'i18n/LanguageData';
import { Component, director, instantiate, Prefab, Node, _decorator, sp, Asset } from 'cc';
import { AudioManager } from '../../audio/AudioManager';
import BaseMediator from '../../base/BaseMediator';
import { NetworkProxy } from '../../core/proxy/NetworkProxy';
import { Logger } from '../../core/utils/Logger';
import { SceneManager } from '../../core/utils/SceneManager';
import { CoreDefaultSettingCommand } from '../command/CoreDefaultSettingCommand';
import { CheckRecoveryFlowCommand } from '../command/recovery/CheckRecoveryFlowCommand';
import { GameDataProxy } from '../proxy/GameDataProxy';
import { WebBridgeProxy } from '../proxy/WebBridgeProxy';
import { SceneEvent } from '../util/Constant';
import { LoadingView } from '../view/LoadingView';
import { GameScene } from '../vo/data/GameScene';
import { GameProxyEvent } from '../vo/event/GameProxyEvent';
import { LoadEvent } from '../vo/event/LoadEvent';
import { PendingEvent } from '../vo/event/PendingEvent';
import { KibanaLog, LogType } from '../vo/log/KibanaLog';
import { GTMUtil } from '../../core/utils/GTMUtil';
import { ResManager } from 'src/core/utils/ResManager';
import { SpriteFrame } from 'cc';
const { ccclass } = _decorator;

/**
 * Asset 載入任務
 * @param status 當前載入狀態
 * @param onAssetLoaded AfterInitData後，載入的Asset要做的事情
 * @param onTaskFinished 當前任務完成後，載入的Asset要做的事情
 */
export interface ILoadTask {
    status: LoadStatus;
    info: ILoadInfo;
    loadedAsset?: Asset | Asset[];
    onAssetLoaded?: (asset: Asset | Asset[]) => void;
    onTaskFinished?: (asset: Asset | Asset[]) => void;
}
/**
 * Asset 載入內容
 * @param bundleName 資源包名稱
 * @param assetName 資源名稱
 * @param dir 該資源包的資料夾
 * @param type 資源類型 (預設為 Asset)
 */
export interface ILoadInfo {
    bundleName: string;
    assetName?: string;
    dir?: string;
    type?: new () => Asset;
}

export enum LoadStatus {
    NONE = 0,
    LOADING = 1,
    COMPLETE = 2
}

@ccclass('LoadingViewMediator')
export default class LoadingViewMediator extends BaseMediator<LoadingView> {
    protected rootView: Component;
    protected baseLoadList: ILoadTask[] = [];
    protected extraLoadList: ILoadTask[] = [];
    protected headGroup: any;
    protected triggerPending: boolean = false;
    protected pendEventInfo: PendingEvent = undefined;

    protected delayCloseLoadingTime: number = 0;

    public isEnterGame: boolean = false;
    private isInitData: boolean = false; // 是否已收到Server的資料
    private isUserInfoInit: boolean = false; // 是否已收到語系資訊
    private totalTaskNum: number = 0; // 預載任務數量
    private finishedTaskNum: number = 0; // 完成預載任務數量
    private progress: number = 0; // 預載進度百分比 (0~1)
    private retryInterval: number = 500;

    public constructor(name?: string, component?: any) {
        super(name, component);
        LoadingViewMediator.NAME = this.mediatorName;
        ResManager.instance.initDownloadSetting();
    }

    public onRegister(): void {
        Logger.i('LoadingViewMediator initial done');
        ResManager.instance.setLoadingStartTime('gameLoading');
        Logger.i('🛒 Start loading...');
        this.setLoadList();

        GTMUtil.setGTMEvent('Visible', {
            Member_ID: this.gameDataProxy.userId,
            Game_ID: this.gameDataProxy.machineType,
            DateTime: Date.now(),
            Session_ID: this.gameDataProxy.sessionId
        });
    }

    protected lazyEventListener(): void {}

    public listNotificationInterests(): Array<any> {
        return [
            LoadEvent.LOAD_GROUP_COMPLETE,
            LoadEvent.LOAD_ITEM_PROGRESS,
            GameProxyEvent.RESPONSE_INIT,
            SceneEvent.LOAD_LOGO_URL,
            SceneEvent.LOAD_PROVIDER_URL,
            SceneEvent.BATCH_LOADING_COMPLETE,
            SceneEvent.PENDING_EVENT_AND_SHOW_LOADING,
            SceneEvent.LOAD_USER_INFO_COMPLETE,
            SceneEvent.LOAD_GAME_DATA_COMPLETE,
            SceneManager.EV_ORIENTATION_VERTICAL,
            SceneManager.EV_ORIENTATION_HORIZONTAL
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        const self = this;
        let name = notification.getName();
        switch (name) {
            case LoadEvent.LOAD_GROUP_COMPLETE:
                self.onLoadGroupComplete(notification);
                break;
            case LoadEvent.LOAD_ITEM_PROGRESS:
                self.onResourceProgress(notification);
                break;
            case SceneEvent.LOAD_USER_INFO_COMPLETE:
                this.setLoadListAfterUserInfo();
                break;
            case SceneEvent.LOAD_GAME_DATA_COMPLETE:
                self.setLoadListAfterGameData();
                break;
            case GameProxyEvent.RESPONSE_INIT:
                self.afterInitData();
                break;
            case SceneEvent.PENDING_EVENT_AND_SHOW_LOADING:
                self.triggerPendLoading(notification);
                break;
        }
    }

    /** 寫入Log */
    public writeLog(url: string) {
        let log = new KibanaLog();
        log.fileURL = url;
        log.errorCode = 220;
        Logger.init(LogType.ERROR_LOADITEM, this.gameDataProxy.gameType, this.gameDataProxy.machineType);
        Logger.kibana(log);
    }

    //#region Loading Flow
    /**
     * 未收到Server的資料前，就開始載入的資源清單
     * !注意: Task的順序等於實例化(instantiate)的順序， GameProxyEvent.RESPONSE_INIT 後才開始實例化。
     */
    protected setLoadList() {
        /** preload 要預載的資源任務 */
        const baseLoad: ILoadTask[] = [
            {
                status: LoadStatus.NONE,
                info: { bundleName: 'audio', assetName: 'AudioManager' },
                onTaskFinished: (prefab: Prefab) => {
                    this.instantiateToSceneManager(prefab);
                    if (this.isUserInfoInit) AudioManager.Instance.setLoadList();
                }
            },
            {
                status: LoadStatus.NONE,
                info: { bundleName: 'scenes', assetName: GameScene.Game_1 },
                onAssetLoaded: this.instantiateByDeactive.bind(this)
            },
            {
                status: LoadStatus.NONE,
                info: { bundleName: 'preload', dir: '' },
                onAssetLoaded: this.instantiateToSceneManager.bind(this)
            },
            {
                status: LoadStatus.NONE,
                info: { bundleName: 'common-ui', assetName: 'BBWView' },
                onAssetLoaded: this.instantiatePrefab.bind(this)
            },
            {
                status: LoadStatus.NONE,
                info: { bundleName: 'common-ui', assetName: 'ControlPanel' },
                onAssetLoaded: this.instantiatePrefab.bind(this)
            }
        ];
        this.baseLoadList = this.baseLoadList.concat(baseLoad);

        /** 載完 preload 要載的資源任務 */
        const extraLoad: ILoadTask[] = [
            {
                status: LoadStatus.NONE,
                info: { bundleName: 'extend', dir: '' },
                onAssetLoaded: this.instantiateToSceneManager.bind(this)
            },
            {
                status: LoadStatus.NONE,
                info: { bundleName: 'scenes', assetName: GameScene.Game_2 },
                onAssetLoaded: this.instantiateByDeactive.bind(this)
            },
            {
                status: LoadStatus.NONE,
                info: { bundleName: 'scenes', assetName: GameScene.Game_3 },
                onAssetLoaded: this.instantiateByDeactive.bind(this)
            },
            {
                status: LoadStatus.NONE,
                info: { bundleName: 'scenes', assetName: GameScene.Game_4 },
                onAssetLoaded: this.instantiateByDeactive.bind(this)
            }
        ];
        this.extraLoadList = this.extraLoadList.concat(extraLoad);

        // 加載參數設定
        this.headGroup = this.baseLoadList;
        this.totalTaskNum = this.baseLoadList.length;
        if (this.extraLoadList.length == 0) this.gameDataProxy.isCompletedBatchLoading = true;
        this.loadAssetByTaskList(this.baseLoadList);
    }

    /**
     * 收到語系資訊後，決定要載入的語系資源
     */
    protected setLoadListAfterUserInfo() {
        Logger.i(`🛒 loading After UserInfo... language:[${i18n._language}]`);
        this.baseLoadList.push({
            status: LoadStatus.NONE,
            info: { bundleName: i18n._language, dir: '', type: sp.SkeletonData }
        });
        this.baseLoadList.push({
            status: LoadStatus.NONE,
            info: { bundleName: i18n._language, dir: '', type: SpriteFrame }
        });
        this.totalTaskNum = this.baseLoadList.length;
        this.loadAssetByTaskList(this.baseLoadList);

        //語系資訊收到後才開始加載對應的音效資源
        this.isUserInfoInit = true;
        AudioManager.Instance?.setLoadList();
    }

    /**
     * 可以判斷 isOmniChannel 及 isDemoGame 後，要載入的資源
     */
    protected async setLoadListAfterGameData() {
        const isOmniChannel = i18n._version === 'omni';
        Logger.i(`🛒 loading After GameData... isOmniChannel:[${isOmniChannel}]`);
        if (isOmniChannel) {
            this.baseLoadList.push({
                status: LoadStatus.NONE,
                info: { bundleName: 'common-ui', assetName: 'OmniBetMenuView' },
                onAssetLoaded: this.instantiatePrefab.bind(this)
            });
            this.baseLoadList.push({
                status: LoadStatus.NONE,
                info: { bundleName: 'feature-bet', assetName: 'FeatureBetView' },
                onAssetLoaded: this.instantiatePrefab.bind(this)
            });
        } else {
            this.baseLoadList.push({
                status: LoadStatus.NONE,
                info: { bundleName: 'common-ui', assetName: 'BetMenuView' },
                onAssetLoaded: this.instantiatePrefab.bind(this)
            });
        }

        if (this.gameDataProxy.isDemoGame) {
            // 如果是 Demo 模式，新增 demo-panel 到 baseLoadList
            this.baseLoadList.push({
                status: LoadStatus.NONE,
                info: { bundleName: 'demo-panel', assetName: 'DemoPanel' },
                onAssetLoaded: this.instantiatePrefab.bind(this)
            });
        }

        this.totalTaskNum = this.baseLoadList.length;
        this.loadAssetByTaskList(this.baseLoadList);
    }

    /**
     * slot 必須在取得預設資料後才處理
     */
    protected afterInitData() {
        if (this.gameDataProxy.isMaintaining) {
            Logger.i('🚧 Maintaining');
            this.gameDataProxy.isMaintaining = false;
            this.sendNotification(CoreDefaultSettingCommand.NAME);
        } else {
            Logger.i('🎫 RESPONSE_INIT');
            this.isInitData = true;
            GTMUtil.setGTMEvent('StartLoading', {
                Member_ID: this.gameDataProxy.userId,
                Game_ID: this.gameDataProxy.machineType,
                DateTime: Date.now(),
                Session_ID: this.gameDataProxy.sessionId
            });
            // 收到預設資料後，確認已載入的資源是否可以實例化了
            this.loadAssetByTaskList(this.baseLoadList);
        }
    }

    protected onLoadGroupComplete(v: puremvc.INotification): void {
        if (v.getBody() == LoadEvent.PRELOAD_GROUP) {
            // 開始 smartfox 連線
            if (!!this.netProxy.getConfig() && this.gameDataProxy.curScene == GameScene.Init) this.netProxy.connect();
        } else {
            if (this.headGroup == v.getBody()) {
                // preload 資源生成完畢，通知載入完成
                this.notifyBaseResComplete();
                this.sendNotification(LoadEvent.LOAD_ITEM_PROGRESS, 1);
                // 直接進遊戲 (要晚1frame，否則會異常)
                this.view.scheduleOnce(this.delayEnterLobby.bind(this));
            } else {
                // extend 資源生成完畢，通知載入完成
                this.loadBatchComplete();
            }
        }
    }

    private loadBatchComplete() {
        this.gameDataProxy.isCompletedBatchLoading = true;
        if (this.pendEventInfo) {
            this.sendNotification(this.pendEventInfo.triggerEvent, this.pendEventInfo.eventParam);
        }
        this.pendEventInfo = null;
        this.view.loadingComplete();
        Logger.i(`🚗 Batch loading complete ${Date.now() - ResManager.instance.getLoadingStartTime('gameLoading')}ms`);
    }

    /** 因為一開始的loading畫面，如果沒有delay會看到loading bar未載完就進入遊戲的狀況 */
    protected delayEnterLobby(): void {
        GTMUtil.setGTMEvent('EnterGame', {
            Member_ID: this.gameDataProxy.userId,
            Game_ID: this.gameDataProxy.machineType,
            DateTime: Date.now(),
            Session_ID: this.gameDataProxy.sessionId
        });
        Logger.i('🚪 Enter Game');
        //進行 Recovery流程
        this.sendNotification(CheckRecoveryFlowCommand.NAME);

        this.isEnterGame = true;
        this.closeLoadingView();
    }

    /** 關閉loadingView */
    protected closeLoadingView(): void {
        this.view.hideContent();
    }

    private loadAssetByTaskList(taskList: ILoadTask[]) {
        for (const task of taskList) {
            if (task.status != LoadStatus.NONE) {
                continue;
            }
            task.status = LoadStatus.LOADING;
            this.runTask(task, taskList);
        }
        this.checkTasksComplete(taskList);
    }

    private async runTask(task: ILoadTask, taskList: ILoadTask[]) {
        const info = task.info;
        const tag = `${info.bundleName}/${info.assetName || info.dir}`;
        Logger.i(`🚚 loadAssets... ${tag}`);
        if (info.dir !== undefined) {
            await ResManager.instance
                .loadAssetDir(info.bundleName, info.dir, info.type || Asset)
                .then((assets) => {
                    task.loadedAsset = assets;
                    task.status = LoadStatus.COMPLETE;
                    if (task.onTaskFinished) task.onTaskFinished(assets);
                    this.checkTasksComplete(taskList, task);
                })
                .catch((error) => {
                    setTimeout(() => {
                        this.runTask(task, taskList);
                    }, this.retryInterval);
                });
        } else if (info.assetName) {
            await ResManager.instance
                .loadAsset(info.bundleName, info.assetName, info.type || Asset)
                .then((asset) => {
                    task.loadedAsset = asset;
                    task.status = LoadStatus.COMPLETE;
                    if (task.onTaskFinished) task.onTaskFinished(asset);
                    this.checkTasksComplete(taskList, task);
                })
                .catch((error) => {
                    setTimeout(() => {
                        this.runTask(task, taskList);
                    }, this.retryInterval);
                });
        }
    }

    private checkTasksComplete(taskList: ILoadTask[], task?: ILoadTask) {
        const isBaseLoadList = this.headGroup == taskList;
        if (isBaseLoadList && task) {
            // 預載任務完成，推進進度條
            this.finishedTaskNum++;
            this.onPreloadProgress(this.finishedTaskNum, this.totalTaskNum);
        }

        // 檢查所有任務是否完成下載 or 已生成
        if (taskList.length === 0) return;
        for (const task of taskList) {
            if (task.status != LoadStatus.COMPLETE) return;
        }

        if (this.isInitData) {
            // 已收到Game初始資料，開始實例化
            Logger.i(`${isBaseLoadList ? '🚙 preload' : '🚗 extend'} start instantiate...`);
            for (const task of taskList) {
                if (!task.onAssetLoaded) continue;
                task.onAssetLoaded(task.loadedAsset);
            }
            // 生成完畢，清空該載入任務清單
            taskList.length = 0;
            this.sendNotification(LoadEvent.LOAD_GROUP_COMPLETE, taskList);
        }

        if (isBaseLoadList) {
            // 所有預載任務完成，繼續載入extend資源
            this.loadAssetByTaskList(this.extraLoadList);
        }
    }

    //#region onAssetLoaded
    private instantiatePrefab(prefab: Prefab): Promise<Node> {
        return new Promise((resolve, reject) => {
            const node: Node = instantiate(prefab);
            director.getScene().addChild(node);
            resolve(node);
        });
    }

    private instantiatePrefabs(prefabs: Prefab[]): Promise<Node[]> {
        return new Promise((resolve, reject) => {
            const nodes: Node[] = [];
            for (const prefab of prefabs) {
                const node: Node = instantiate(prefab);
                director.getScene().addChild(node);
                nodes.push(node);
            }
            resolve(nodes);
        });
    }

    private instantiateByDeactive(prefab: Prefab) {
        this.instantiatePrefab(prefab).then((node: Node) => {
            node.active = false;
        });
    }

    private instantiateToSceneManager(prefabs: Prefab[] | Prefab) {
        if (!Array.isArray(prefabs)) {
            prefabs = [prefabs];
        }
        this.instantiatePrefabs(prefabs).then((nodes: Node[]) => {
            for (const node of nodes) {
                node.setParent(SceneManager.instance.node);
            }
        });
    }

    wait(obj, millisecond) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(obj);
            }, millisecond);
        });
    }

    private onPreloadProgress(completedCount: number, totalCount: number) {
        // 進度條客製處理 (前面50%是Web偽裝，因此這邊要從50%開始，並預留5%在 onLoadGroupComplete)
        const webProgress = 0.5;
        const cocosProgress = 0.45 * (completedCount / totalCount);
        this.sendNotification(LoadEvent.LOAD_ITEM_PROGRESS, webProgress + cocosProgress);
    }

    private onResourceProgress(notification: puremvc.INotification): void {
        let progress: number = notification.getBody();
        //防倒退: 中間收到資料插入任務，導致 totalTaskNum 變大，progress 比例變小，因此取大的比例。
        this.progress = Math.max(progress, this.progress);
        //通知Container載入進度
        this.webBridgeProxy.notifyGameProgress(this.progress);
    }

    /**
     * 通知baseGame complete
     * @author luke
     */
    protected notifyBaseResComplete() {
        const self = this;
        self.sendNotification(CoreDefaultSettingCommand.NAME);
        self.sendNotification(SceneEvent.LOAD_BASE_COMPLETE);
        self.sendNotification(self.gameDataProxy.orientationEvent);
        this.webBridgeProxy.notifyGameReady();
        // 載入其他音效 (非preload)
        AudioManager.Instance.loadAudio();

        GTMUtil.setGTMEvent('LoadComplete', {
            Member_ID: this.gameDataProxy.userId,
            Game_ID: this.gameDataProxy.machineType,
            DateTime: Date.now(),
            Session_ID: this.gameDataProxy.sessionId
        });
        Logger.i(`🚙 Base loading complete ${Date.now() - ResManager.instance.getLoadingStartTime('gameLoading')}ms`);
    }

    /** 觸發 pendloading */
    protected triggerPendLoading(notification: puremvc.INotification) {
        this.triggerPending = true;
        this.pendEventInfo = notification.getBody() as PendingEvent;
        this.view.showPendingLoading();
        this.loadAssetByTaskList(this.extraLoadList);
    }

    // ======================== Get Set ========================
    protected _netProxy: NetworkProxy;
    public get netProxy(): NetworkProxy {
        return this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
    }

    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _webBridgeProxy: WebBridgeProxy;
    public get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }
}
