import { _decorator } from 'cc';
import BaseMediator from 'src/base/BaseMediator';
import { GrandFreeView } from '../view/GrandFreeView';
import { JackpotPool, ViewMediatorEvent } from 'src/sgv3/util/Constant';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
const { ccclass } = _decorator;

@ccclass('GrandFreeViewMediator')
export class GrandFreeViewMediator extends BaseMediator<GrandFreeView> {
    protected lazyEventListener(): void {}

    public listNotificationInterests(): string[] {
        return [ViewMediatorEvent.SHOW_FEATURE_SELECTION, JackpotPool.CHANGE_SCENE];
    }

    public handleNotification(notification: any): void {
        let name = notification.getName();
        switch (name) {
            case ViewMediatorEvent.SHOW_FEATURE_SELECTION:
                this.view.showTween();
                break;
            case JackpotPool.CHANGE_SCENE:
                this.view.showByScene(this.gameDataProxy.curScene);
                break;
        }
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
