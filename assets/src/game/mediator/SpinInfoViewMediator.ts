import { _decorator } from 'cc';
import BaseMediator from 'src/base/BaseMediator';
import { SpinInfoView } from '../view/SpinInfoView';
import { DragonUpEvent, SpinResultProxyEvent, ViewMediatorEvent, StateWinEvent } from 'src/sgv3/util/Constant';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
import { GameScene } from 'src/sgv3/vo/data/GameScene';
import { StateMachineProxy } from 'src/sgv3/proxy/StateMachineProxy';
import { FreeGameOneRoundResult } from 'src/sgv3/vo/result/FreeGameOneRoundResult';
const { ccclass } = _decorator;

@ccclass('SpinInfoViewMediator')
export class SpinInfoViewMediator extends BaseMediator<SpinInfoView> {
    protected lazyEventListener(): void { }

    public listNotificationInterests(): Array<any> {
        let eventList = [
            ViewMediatorEvent.SHOW_FREE_SPIN_MSG,
            ViewMediatorEvent.CLOSE_FREE_SPIN_MSG,
            ViewMediatorEvent.SHOW_WON_SPIN_DATA,
            ViewMediatorEvent.SHOW_RETRIGGER_BOARD,
            StateMachineProxy.GAME2_INIT,
            StateMachineProxy.GAME4_INIT,
            DragonUpEvent.ON_RESPIN_NEXT_END,
            SpinResultProxyEvent.RESPONSE_SPIN,
            StateWinEvent.ON_GAME2_TRANSITIONS,
            StateWinEvent.ON_GAME4_TRANSITIONS
        ];
        return eventList;
    }

    public handleNotification(notification: puremvc.INotification): void {
        if (!this.view.node.activeInHierarchy) return;
        let name = notification.getName();
        let freeGameOneRoundResult = this.gameDataProxy.curRoundResult as FreeGameOneRoundResult;
        const self = this;
        switch (name) {
            case ViewMediatorEvent.SHOW_FREE_SPIN_MSG:
                switch (this.gameDataProxy.curScene) {
                    case GameScene.Game_2:
                        this.view.showFreeInfoMsg();
                        break;
                    case GameScene.Game_4:
                        this.view.showRemainInfoMsg();
                        break;
                }
                break;
            case ViewMediatorEvent.CLOSE_FREE_SPIN_MSG:
                this.view.closeFreeInfoMsg();
                break;
            case StateMachineProxy.GAME2_INIT:
            case StateMachineProxy.GAME4_INIT:
                this.view.showMaxSpinInfo(false);
                break;
            case DragonUpEvent.ON_RESPIN_NEXT_END:
                let infoArray: Array<any> = notification.getBody();
                this.view.remainSpinInfo.updateReSpinInfo(infoArray[0]);
                this.view.showMaxSpinInfo(infoArray[0] == 0 ? false : infoArray[1]);
                break;
            case SpinResultProxyEvent.RESPONSE_SPIN:
                this.onResponseSpin(notification.getBody());
                break;
            case ViewMediatorEvent.SHOW_WON_SPIN_DATA:
                switch (this.gameDataProxy.curScene) {
                    case GameScene.Game_2:
                        this.view.updateMsgContent(1, notification.getBody());
                        break;
                    case GameScene.Game_4:
                        this.view.remainSpinInfo.setCurSpinTime(notification.getBody());
                        break;
                }
                break;
            case ViewMediatorEvent.SHOW_RETRIGGER_BOARD:
                this.view.addMsgContent(
                    notification.getBody(),
                    freeGameOneRoundResult.displayLogicInfo.maxTriggerCountFlag
                );
                break;
            case StateWinEvent.ON_GAME2_TRANSITIONS:
            case StateWinEvent.ON_GAME4_TRANSITIONS:
                this.view.showMaxSpinInfo(false);
                break;
        }
    }

    private onResponseSpin(roundInfo: Array<number>) {
        if (roundInfo == null) {
            return;
        }
        //Index 0:為roundNumber, Index 1:為TotalRound
        switch (this.gameDataProxy.curScene) {
            case GameScene.Game_2:
                this.view.updateMsgContent(roundInfo[0], roundInfo[1]);
                break;
            case GameScene.Game_4:
                this.view.remainSpinInfo.setCurSpinTime(roundInfo[1] - roundInfo[0]);
                if (roundInfo[1] - roundInfo[0] == 0) {
                    this.view.showMaxSpinInfo(false);
                }
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
