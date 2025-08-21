import { _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { GameStateProxyEvent, StateWinEvent, ViewMediatorEvent } from '../../sgv3/util/Constant';
import { GlobalTimer } from '../../sgv3/util/GlobalTimer';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { BackgroundEffectView } from '../view/BackgroundEffectView';
import { StateMachineProxy } from 'src/sgv3/proxy/StateMachineProxy';
import { StateMachineCommand } from 'src/core/command/StateMachineCommand';
import { StateMachineObject } from 'src/core/proxy/CoreStateMachineProxy';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
const { ccclass } = _decorator;

@ccclass('BackgroundEffectViewMediator')
export class BackgroundEffectViewMediator extends BaseMediator<BackgroundEffectView> {
    protected lazyEventListener(): void {
        this.view.playBaseGameSceneAnim();
        this.initView();
    }

    public listNotificationInterests(): Array<any> {
        return [
            GameStateProxyEvent.ON_SCENE_CHANGED,
            ViewMediatorEvent.INIT_EMBLEM_LEVEL,
            ViewMediatorEvent.UPDATE_EMBLEM_LEVEL,
            StateWinEvent.ON_GAME3_TRANSITIONS
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case GameStateProxyEvent.ON_SCENE_CHANGED:
                this.onSceneChangeToPlayAnime();
                break;
            case ViewMediatorEvent.INIT_EMBLEM_LEVEL:
                this.initEmblemLevel(notification.getBody());
                break;
            case ViewMediatorEvent.UPDATE_EMBLEM_LEVEL:
                this.updateEmblemLevel(notification.getBody());
                break;
            case StateWinEvent.ON_GAME3_TRANSITIONS:
                this.view.shakeEmblem();
                break;
        }
    }

    private initView() {
        let initLevel: number[] = [];
        initLevel = this.gameDataProxy.getInitEmblemLevel();
        this.initEmblemLevel(initLevel);
        this.view.setLevelUpAudio(AudioClipsEnum.JP_CoinGrow);
    }

    private initEmblemLevel(level: number[]) {
        this.view.initEmblemLevel(level);
    }

    private updateEmblemLevel(level: number[]) {
        if (level != null) {
            this.view.updateEmblemLevel(level, this.updateEmblemLevelComplete.bind(this));
        } else {
            this.updateEmblemLevelComplete();
        }
    }

    private updateEmblemLevelComplete() {
        if (this.gameDataProxy.isHitMiniGame()) {
            this.gameDataProxy.isReadyEnterMiniGame = true;
            if (
                this.gameDataProxy.gameState == StateMachineProxy.GAME1_SHOWWIN &&
                this.gameDataProxy.showWinOnceComplete == false &&
                this.gameDataProxy.scrollingWinLabel == false
            ) {
                this.sendNotification(
                    StateMachineCommand.NAME,
                    new StateMachineObject(StateMachineProxy.GAME1_AFTERSHOW)
                );
            }
        }
    }

    onSceneChangeToPlayAnime() {
        this.view.showBgEffect();

        const curScene = this.gameDataProxy.curScene;
        switch (curScene) {
            case GameScene.Game_1:
                this.view.playBaseGameSceneAnim();
                break;
            case GameScene.Game_2:
            case GameScene.Game_4:
                this.view.playFreeGameSceneAnime();
                break;
        }
    }

    delayHideBgEffect() {
        GlobalTimer.getInstance()
            .registerTimer(
                'Game_HideBgEffect',
                5,
                () => {
                    GlobalTimer.getInstance().removeTimer('Game_HideBgEffect');
                    this.view.hideBgEffect();
                },
                this
            )
            .start();
    }

    protected _gameDataProxy: GAME_GameDataProxy;
    public get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
