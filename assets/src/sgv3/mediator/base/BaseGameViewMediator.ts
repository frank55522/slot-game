import { _decorator } from 'cc';
import BaseMediator from '../../../base/BaseMediator';
import BaseView from 'src/base/BaseView';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { ViewMediatorEvent } from '../../util/Constant';
import { GameSceneData } from '../../vo/config/GameSceneData';
import { GameScene } from '../../vo/data/GameScene';

const { ccclass } = _decorator;

@ccclass('BaseGameViewMediator')
export abstract class BaseGameViewMediator<T extends BaseView> extends BaseMediator<T> {
    // SceneData
    protected mySceneName: string = '';
    protected myGameScene: GameScene = null;
    protected mySceneData: GameSceneData = null;

    protected lastSetupEventList: string[];
    protected defaultInterestList: string[];
    protected myInterestsList: string[];

    public listNotificationInterests(): Array<any> {
        let result: string[];
        if (this.lastSetupEventList) {
            result = this.lastSetupEventList;
            this.lastSetupEventList = null;
        } else if (this.gameDataProxy.curScene == this.myGameScene) {
            this.lastSetupEventList = this.myInterestsList;
            result = this.myInterestsList;
        } else {
            this.lastSetupEventList = this.defaultInterestList;
            result = this.defaultInterestList;
        }
        return result;
    }

    /** 更新 Mediator 監聽的事件 */
    protected refreshMediatorEventList(): void {
        this.facade.removeMediator(this.mediatorName);
        this.facade.registerMediator(this);
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            // case SceneEvent.LOAD_BASE_COMPLETE:
            //     this.initView();
            //     break;
            case ViewMediatorEvent.ENTER:
                this.enterMediator();
                break;
            case ViewMediatorEvent.LEAVE:
                this.leaveMediator();
                break;
        }
    }

    /** 初始化view */
    protected abstract initView(): void;
    /** 進入場景處理 */
    protected abstract enterMediator();
    /** 離開場景處理 */
    protected abstract leaveMediator();

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
