import { _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { FreeGameEvent, GameStateProxyEvent, ViewMediatorEvent } from '../../sgv3/util/Constant';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { Game_2_SpecialView } from '../view/free-retrigger/Game_2_SpecialView';
import { FreeGameSpecialInfo } from '../vo/FreeGameSpecialInfo';
const { ccclass } = _decorator;

@ccclass('Game_2_SpecialViewMediator')
export class Game_2_SpecialViewMediator extends BaseMediator<Game_2_SpecialView> {
    public static readonly NAME: string = 'Game_2_SpecialViewMediator';

    public constructor(name?: string, component?: any) {
        super(name, component);
        this.view.init(this.gameDataProxy.language);
    }

    protected lazyEventListener(): void {
        this.view.node.active = false;
    }

    public listNotificationInterests(): Array<any> {
        return [
            FreeGameEvent.ON_SIDE_BALL_SHOW,
            FreeGameEvent.ON_SIDE_BALL_SCORE_SHOW,
            GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        let self = this;
        switch (name) {
            case FreeGameEvent.ON_SIDE_BALL_SHOW:
                self.onSideBallShow(notification.getBody());
                break;
            case FreeGameEvent.ON_SIDE_BALL_SCORE_SHOW:
                self.onHitSpecial(notification.getBody());
                break;
            case GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE:
                this.sceneChange();
                break;
        }
    }
    private onSideBallShow(freeGameSpecialInfo: FreeGameSpecialInfo) {
        this.view.showSideBall(freeGameSpecialInfo, !this.gameDataProxy.isOmniChannel());
    }

    protected onHitSpecial(showWinEvent: Function) {
        this.view.showSideBallScore(this.onCollectCredit.bind(this), showWinEvent.bind(this));
    }

    private onCollectCredit(hitInfo: Array<any>) {
        this.facade.sendNotification(ViewMediatorEvent.COLLECT_CREDIT_BALL, hitInfo);
    }

    public sceneChange() {
        this.view.node.active = this.gameDataProxy.curScene == GameScene.Game_2;
    }

    private _gameDataProxy: GAME_GameDataProxy;
    private get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
