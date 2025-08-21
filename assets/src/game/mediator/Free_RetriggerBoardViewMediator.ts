import { _decorator } from 'cc';
import BaseMediator from 'src/base/BaseMediator';
import { Free_RetriggerBoardView } from '../view/free-retrigger/Free_RetriggerBoardView';
import { ViewMediatorEvent } from 'src/sgv3/util/Constant';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
const { ccclass } = _decorator;

@ccclass('Free_RetriggerBoardViewMediator')
export class Free_RetriggerBoardViewMediator extends BaseMediator<Free_RetriggerBoardView> {
    public constructor(name?: string, component?: any) {
        super(name, component);
        this.view.init(this.gameDataProxy.language);
    }

    protected lazyEventListener(): void {}

    public listNotificationInterests(): Array<any> {
        return [ViewMediatorEvent.SHOW_RETRIGGER_BOARD];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case ViewMediatorEvent.SHOW_RETRIGGER_BOARD:
                this.showRetriggerBoard(notification.getBody()[0]);
                break;
        }
    }
    protected showRetriggerBoard(addRound: number) {
        this.view.retriggerShow(addRound);
    }

    private _gameDataProxy: GameDataProxy;
    private get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
