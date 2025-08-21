import { _decorator } from 'cc';
import BaseMediator from 'src/base/BaseMediator';
import { SpinAreaView } from '../view/SpinAreaView';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
import { UIEvent } from 'common-ui/proxy/UIEvent';
import { GameStateProxyEvent } from 'src/sgv3/util/Constant';
const { ccclass } = _decorator;

@ccclass('SpinAreaViewMediator')
export class SpinAreaViewMediator extends BaseMediator<SpinAreaView> {
    protected lazyEventListener(): void {
        this.view.buttonCallback = this;
    }

    public listNotificationInterests(): string[] {
        return [GameStateProxyEvent.ON_SCENE_CHANGED];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case GameStateProxyEvent.ON_SCENE_CHANGED:
                this.onSceneChanged();
                break;
        }
    }

    private onSceneChanged() {
        this.view.changeAreaSize(this.gameDataProxy.curScene);
    }

    public spin() {
        this.sendNotification(UIEvent.SPIN_KEY_DOWN);
    }
    // ======================== Get Set ========================
    private _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }

        return this._gameDataProxy;
    }
}
