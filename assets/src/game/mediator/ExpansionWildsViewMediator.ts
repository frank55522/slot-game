import { _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { GameDataProxy } from '../../sgv3/proxy/GameDataProxy';
import { FreeGameEvent, ReelEvent, WinEvent } from '../../sgv3/util/Constant';
import { FreeGameOneRoundResult } from '../../sgv3/vo/result/FreeGameOneRoundResult';
import { WAY_AllWinData } from '../../sgv3way/vo/datas/WAY_AllWinData';
import { ExpansionWildsView } from '../view/ExpansionWildsView';
import { GameScene } from 'src/sgv3/vo/data/GameScene';
import { AudioManager } from 'src/audio/AudioManager';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
const { ccclass } = _decorator;

@ccclass('ExpansionWildsViewMediator')
export class ExpansionWildsViewMediator extends BaseMediator<ExpansionWildsView> {
    protected lazyEventListener(): void {}

    private isFirstPlayWildSound: boolean = true;

    public listNotificationInterests(): Array<any> {
        return [FreeGameEvent.ON_EXPAND_WILD, ReelEvent.SHOW_REELS_LOOP_WIN, WinEvent.FORCE_WIN_DISPOSE];
    }

    public handleNotification(notification: puremvc.INotification): void {
        if (this.gameDataProxy.curScene != GameScene.Game_2) return;
        let name = notification.getName();
        switch (name) {
            case FreeGameEvent.ON_EXPAND_WILD:
                this.ExpandWild();
                break;
            case ReelEvent.SHOW_REELS_LOOP_WIN:
                this.ShowWin(notification.getBody());
                break;
            case WinEvent.FORCE_WIN_DISPOSE:
                this.view.hide();
                this.isFirstPlayWildSound = true;
                break;
        }
    }

    private ExpandWild() {
        this.view.show();
    }

    private ShowWin(index: number) {
        if (
            (this.gameDataProxy.curRoundResult as FreeGameOneRoundResult)?.extendInfoForFreeGameResult.isRespinFeature
        ) {
            const winData = this.gameDataProxy.curWinData as WAY_AllWinData;
            let isFiveOfKind = winData.wayInfos[index].hitNumber == 5;
            this.view.win(isFiveOfKind);
            if (isFiveOfKind && this.isFirstPlayWildSound) {
                this.isFirstPlayWildSound = false;
                AudioManager.Instance.play(AudioClipsEnum.Free_Wild);
            }
        }
    }

    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
