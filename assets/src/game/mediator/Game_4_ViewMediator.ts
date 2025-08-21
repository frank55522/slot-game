import { Logger } from '../../core/utils/Logger';
import { BaseGameViewMediator } from '../../sgv3/mediator/base/BaseGameViewMediator';
import { WebBridgeProxy } from '../../sgv3/proxy/WebBridgeProxy';
import { GameStateProxyEvent, JackpotPool, ReelEvent, ViewMediatorEvent } from '../../sgv3/util/Constant';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { SceneManager } from '../../core/utils/SceneManager';
import { game, _decorator } from 'cc';
import { Game_4_View } from '../view/Game_4_View';
import { StateMachineCommand } from '../../core/command/StateMachineCommand';
import { StateMachineObject } from '../../core/proxy/CoreStateMachineProxy';
import { StateMachineProxy } from '../../sgv3/proxy/StateMachineProxy';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { BGMClipsEnum } from '../vo/enum/SoundMap';
import { AudioManager } from '../../audio/AudioManager';
import { TopUpGameOneRoundResult } from '../../sgv3/vo/result/TopUpGameOneRoundResult';

const { ccclass } = _decorator;

@ccclass('Game_4_ViewMediator')
export class Game_4_ViewMediator extends BaseGameViewMediator<Game_4_View> {
    public static readonly NAME: string = 'Game_4_ViewMediator';

    private game_4_View: Game_4_View = null;

    protected defaultInterestList: string[] = [
        SceneManager.EV_ORIENTATION_VERTICAL,
        SceneManager.EV_ORIENTATION_HORIZONTAL,
        // SceneEvent.LOAD_BASE_COMPLETE,
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
        Logger.i('[' + Game_4_ViewMediator.NAME + '] constructor()');
        this.game_4_View = component;

        // 取得該場景的資料
        let parseName: string[] = Game_4_ViewMediator.NAME.split('_');
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
                self.view.changeOrientation(this.gameDataProxy.orientationEvent, this.gameDataProxy.curScene);
                self.refreshMediatorEventList();
                break;
            case ViewMediatorEvent.ENTER:
                this.initView();
                break;
        }
    }

    /** 建立畫面 */
    protected initView(): void {}

    /** 進入場景處理 */
    protected enterMediator() {
        if (this.gameDataProxy.curScene !== this.mySceneName) return;
        let curRoundResult = this.gameDataProxy.curRoundResult as TopUpGameOneRoundResult;
        // 取得當前場次的倍數加成
        let curMultiple: number = curRoundResult.extendInfoForTopUpGameResult.accumulateMultiplier;
        curRoundResult.extendInfoForTopUpGameResult.goldMultiplierScreenLabel.forEach((multipleArr) =>
            multipleArr.forEach((value) => {
                if (value > 0) {
                    curMultiple -= value;
                }
            })
        );
        this.view.init(curMultiple);
        this.view.togglePosTweenView(true);
        this.view.node.active = true;
        this.facade.sendNotification(JackpotPool.CHANGE_SCENE);

        this.webBridgeProxy.sendGameState('TopUpGame');
        this.facade.sendNotification(
            StateMachineCommand.NAME,
            new StateMachineObject(StateMachineProxy.GAME4_TRANSITIONS)
        );
        AudioManager.Instance.play(BGMClipsEnum.BGM_DragonUp).loop(true).volume(0).fade(1, 0.8);
    }

    /** 離開場景處理 */
    protected leaveMediator() {
        if (this.gameDataProxy.preScene !== GameScene.Init && this.gameDataProxy.preScene !== this.mySceneName) return;
        this.view.togglePosTweenView(false);
        this.view.node.active = false;
        AudioManager.Instance.stop(BGMClipsEnum.BGM_DragonUp).fade(0, 1);
    }

    /** 執行橫式轉換 */
    protected onOrientationHorizontal(): void {
        let curScene = this.gameDataProxy.curScene;
        this.game_4_View.changeOrientation(SceneManager.EV_ORIENTATION_HORIZONTAL, curScene);
    }

    /** 執行直式轉換 */
    protected onOrientationVertical(): void {
        let curScene = this.gameDataProxy.curScene;
        this.game_4_View.changeOrientation(SceneManager.EV_ORIENTATION_VERTICAL, curScene);
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
