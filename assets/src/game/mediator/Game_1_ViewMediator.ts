import { Logger } from '../../core/utils/Logger';
import { BaseGameViewMediator } from '../../sgv3/mediator/base/BaseGameViewMediator';
import { WebBridgeProxy } from '../../sgv3/proxy/WebBridgeProxy';
import { GameStateProxyEvent, ViewMediatorEvent, JackpotPool } from '../../sgv3/util/Constant';
import { Game_1_View } from '../view/Game_1_View';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { SceneManager } from '../../core/utils/SceneManager';
import { _decorator } from 'cc';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { GlobalTimer } from '../../sgv3/util/GlobalTimer';
import { BGMClipsEnum } from '../vo/enum/SoundMap';
import { AudioManager } from '../../audio/AudioManager';

const { ccclass } = _decorator;

@ccclass('Game_1_ViewMediator')
export class Game_1_ViewMediator extends BaseGameViewMediator<Game_1_View> {
    public static readonly NAME: string = 'Game_1_ViewMediator';

    protected defaultInterestList: string[] = [
        SceneManager.EV_ORIENTATION_VERTICAL,
        SceneManager.EV_ORIENTATION_HORIZONTAL,
        GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE,
        ViewMediatorEvent.LEAVE,
        'PLAY_WIN_ANIMATION'
    ];

    protected myInterestsList: string[] = [
        SceneManager.EV_ORIENTATION_VERTICAL,
        SceneManager.EV_ORIENTATION_HORIZONTAL,
        GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE,
        ViewMediatorEvent.ENTER,
        'PLAY_WIN_ANIMATION'
    ];

    public constructor(name?: string, component?: any) {
        super(name, component);
        window;
        Logger.i('[' + Game_1_ViewMediator.NAME + '] constructor()');

        // 取得該場景的資料
        let parseName: string[] = Game_1_ViewMediator.NAME.split('_');
        this.mySceneName = parseName[0] + '_' + parseName[1];
        this.myGameScene = this.mySceneName;
        this.mySceneData = this.gameDataProxy.getSceneDataByName(this.mySceneName);
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
                self.view.changeOrientation(this.gameDataProxy.orientationEvent, this.gameDataProxy.curScene);
                self.refreshMediatorEventList();
                break;
            case 'PLAY_WIN_ANIMATION':
                self.view.playWinAnimation();
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
        this.webBridgeProxy.sendGameState('BaseGame');
    }

    /** 離開場景處理 */
    protected leaveMediator() {
        if (this.gameDataProxy.preScene !== GameScene.Init && this.gameDataProxy.preScene !== this.mySceneName) return;
        if (this.gameDataProxy.curScene === GameScene.Game_3) {
            GlobalTimer.getInstance().removeTimer(GameScene.Game_1 + ' leave');
            GlobalTimer.getInstance()
                .registerTimer(
                    GameScene.Game_1 + ' leave',
                    1.0,
                    () => {
                        GlobalTimer.getInstance().removeTimer(GameScene.Game_1 + ' leave');
                        this.view.node.active = false;
                    },
                    self
                )
                .start();
        } else {
            this.view.node.active = false;
        }
        AudioManager.Instance.stop(BGMClipsEnum.BGM_Base).fade(0, 1);
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
    public get gameDataProxy(): GAME_GameDataProxy {
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
