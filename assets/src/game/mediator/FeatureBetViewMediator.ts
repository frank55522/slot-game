import { _decorator } from 'cc';
import BaseMediator from 'src/base/BaseMediator';
import { FeatureBetView } from '../view/FeatureBetView';
import { SceneEvent } from 'src/sgv3/util/Constant';
import { UIEvent } from 'common-ui/proxy/UIEvent';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
const { ccclass } = _decorator;

@ccclass('FeatureBetViewMediator')
export class FeatureBetViewMediator extends BaseMediator<FeatureBetView> {
    protected lazyEventListener(): void {}

    public listNotificationInterests(): string[] {
        return [
            SceneEvent.LOAD_BASE_COMPLETE,
            UIEvent.ON_CLICK_BET_BUTTON,
            UIEvent.RESTORE_BET_BUTTON,
            UIEvent.HIDE_ALL_MENU,
            UIEvent.UPDATE_TOTAL_BET
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case SceneEvent.LOAD_BASE_COMPLETE:
                this.intiView();
                break;
            case UIEvent.ON_CLICK_BET_BUTTON:
                this.onClickFeatureBet(notification.getBody());
                break;
            case UIEvent.RESTORE_BET_BUTTON:
                this.restoreFeatureBet(notification.getBody());
                break;
            case UIEvent.HIDE_ALL_MENU:
            case UIEvent.UPDATE_TOTAL_BET:
                this.view.hideAllMenu();
                break;
        }
    }

    private intiView() {
        this.sendNotification(UIEvent.INJECT_FEATURE_BET_VIEW, { viewNode: this.view.node, index: 4 });
        const featureBetList = this.gameDataProxy.initEventData.featureBetList;
        let soundList: string[] = [];
        for (let i = 0; i < featureBetList.length; i++) {
            soundList.push(`Bet0${i + 1}`);
        }
        this.view.setSoundList(soundList);
    }

    private onClickFeatureBet(featureBet: number) {
        const featureIdx = this.gameDataProxy.initEventData.featureBetList.indexOf(featureBet);
        this.view.onClickFeatureBet(featureIdx);
    }

    private restoreFeatureBet(featureBet: number) {
        const featureIdx = this.gameDataProxy.initEventData.featureBetList.indexOf(featureBet);
        this.view.restoreFeatureBet(featureIdx);
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
