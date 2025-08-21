import { _decorator } from 'cc';
import { StateMachineCommand } from '../../core/command/StateMachineCommand';
import { StateMachineObject } from '../../core/proxy/CoreStateMachineProxy';
import { Logger } from '../../core/utils/Logger';
import { SceneManager } from '../../core/utils/SceneManager';
import { BaseGameViewMediator } from '../../sgv3/mediator/base/BaseGameViewMediator';
import { StateMachineProxy } from '../../sgv3/proxy/StateMachineProxy';
import { WebBridgeProxy } from '../../sgv3/proxy/WebBridgeProxy';
import { GameStateProxyEvent, JackpotPool, ViewMediatorEvent } from '../../sgv3/util/Constant';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { AudioManager } from '../../audio/AudioManager';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { Game_2_View } from '../view/Game_2_View';
import { BGMClipsEnum } from '../vo/enum/SoundMap';
const { ccclass } = _decorator;

@ccclass('Game_2_ViewMediator')
export class Game_2_ViewMediator extends BaseGameViewMediator<Game_2_View> {
    public static readonly NAME: string = 'Game_2_ViewMediator';

    protected defaultInterestList: string[] = [
        SceneManager.EV_ORIENTATION_VERTICAL,
        SceneManager.EV_ORIENTATION_HORIZONTAL,
        GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE,
        ViewMediatorEvent.LEAVE
    ];

    protected myInterestsList: string[] = [
        SceneManager.EV_ORIENTATION_VERTICAL,
        SceneManager.EV_ORIENTATION_HORIZONTAL,
        GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE,
        ViewMediatorEvent.ENTER
    ];

    public constructor(name?: string, component?: any) {
        super(name, component);
        window;
        Logger.i('[' + Game_2_ViewMediator.NAME + '] constructor()');

        // 取得該場景的資料
        let parseName: string[] = Game_2_ViewMediator.NAME.split('_');
        this.mySceneName = parseName[0] + '_' + parseName[1];
        this.mySceneData = this.gameDataProxy.getSceneDataByName(this.mySceneName);
        this.myGameScene = this.mySceneName;
        this.mySceneData.reelPrefab = this.view.reelPrefab;
    }

    protected lazyEventListener(): void {}

    public handleNotification(notification: puremvc.INotification): void {
        super.handleNotification(notification);
        const self = this;
        let name = notification.getName();
        switch (name) {
            case SceneManager.EV_ORIENTATION_VERTICAL:
                self.onOrientationVertical();
                break;
            case SceneManager.EV_ORIENTATION_HORIZONTAL:
                self.onOrientationHorizontal();
                break;
            case GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE: // 讓Mediator進入畫面前必須要重整監聽事件
                self.refreshMediatorEventList();
                self.view.changeOrientation(this.gameDataProxy.orientationEvent, this.gameDataProxy.curScene);
                break;
        }
    }

    /** 建立畫面 */
    protected initView(): void {}

    /** 進入場景處理 */
    protected enterMediator() {
        if (this.gameDataProxy.curScene !== this.mySceneName) return;
        this.view.node.active = true;
        this.facade.sendNotification(JackpotPool.CHANGE_SCENE);
        this.webBridgeProxy.sendGameState('FreeGame');
        this.facade.sendNotification(
            StateMachineCommand.NAME,
            new StateMachineObject(StateMachineProxy.GAME2_TRANSITIONS)
        );
        AudioManager.Instance.play(BGMClipsEnum.BGM_FreeGame).loop(true).volume(0).fade(1, 1);
    }

    /** 離開場景處理 */
    protected leaveMediator() {
        if (this.gameDataProxy.preScene !== GameScene.Init && this.gameDataProxy.preScene !== this.mySceneName) return;
        this.view.node.active = false;
        this.facade.sendNotification(JackpotPool.EXIT_SCENE, GameScene.Game_2);

        AudioManager.Instance.stop(BGMClipsEnum.BGM_FreeGame).fade(0, 1);
    }

    /** 執行橫式轉換 */
    protected onOrientationHorizontal(): void {
        let curScene = this.gameDataProxy.curScene;
        this.view?.changeOrientation(SceneManager.EV_ORIENTATION_HORIZONTAL, curScene);
    }

    /** 執行直式轉換 */
    protected onOrientationVertical(): void {
        let curScene = this.gameDataProxy.curScene;
        this.view?.changeOrientation(SceneManager.EV_ORIENTATION_VERTICAL, curScene);
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GAME_GameDataProxy;
    protected get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }

    private _webBridgeProxy: WebBridgeProxy;
    protected get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }
}
