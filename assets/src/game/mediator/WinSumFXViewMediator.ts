import { _decorator } from 'cc';
import BaseMediator from 'src/base/BaseMediator';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
import { WinSumFXView } from '../view/WinSumFXView';
import { AudioManager } from 'src/audio/AudioManager';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
import { FreeGameEvent } from 'src/sgv3/util/Constant';
import { UIEvent } from 'common-ui/proxy/UIEvent';
const { ccclass } = _decorator;

@ccclass('WinSumFXViewMediator')
export class WinSumFXViewMediator extends BaseMediator<WinSumFXView> {
    protected lazyEventListener(): void {}

    public listNotificationInterests(): Array<any> {
        return [FreeGameEvent.ON_BEFORE_END_SCORE_SHOW_SKIP];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case FreeGameEvent.ON_BEFORE_END_SCORE_SHOW_SKIP:
                this.winScoreSum();
                break;
        }
    }

    private winScoreSum() {
        this.view.winSumAnim.ParticlePlay();
        let totalWin: number = this.gameDataProxy.convertCredit2Cash(this.gameDataProxy.spinEventData.playerTotalWin);
        this.sendNotification(UIEvent.UPDATE_PLAYER_WIN, totalWin);
        AudioManager.Instance.play(AudioClipsEnum.Free_Calculation);
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
