import { _decorator, Component } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { ReelDataProxy } from '../../sgv3/proxy/ReelDataProxy';
import { ReelEvent, SceneEvent, WinEvent } from '../../sgv3/util/Constant';
import { ReelFXView } from '../view/ReelFXView';
import { AudioManager } from 'src/audio/AudioManager';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
import { SingleReelContent } from '../../sgv3/view/reel/single-reel/SingleReelContent';
const { ccclass, property } = _decorator;

@ccclass('ReelFXViewMediator')
export class ReelFXViewMediator extends BaseMediator<ReelFXView> {
    protected lazyEventListener(): void {}

    public listNotificationInterests(): Array<any> {
        return [
            ReelEvent.ON_SINGLE_REEL_START_STOP,
            ReelEvent.ON_SINGLE_REEL_STOP_END,
            ReelEvent.ON_REELS_EMERGENCY_STOP,
            WinEvent.FORCE_WIN_DISPOSE,
            SceneEvent.LOAD_BASE_COMPLETE
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case ReelEvent.ON_SINGLE_REEL_START_STOP:
                this.onShowReelSqueeze(notification.getBody());
                break;
            case ReelEvent.ON_SINGLE_REEL_STOP_END:
                this.onHideReelSqueeze(notification.getBody());
                break;
            case ReelEvent.ON_REELS_PERFORM_END:
                this.stop();
                break;
            case ReelEvent.ON_REELS_EMERGENCY_STOP:
                this.view.isEmergencyStop = true;
                break;
            case WinEvent.FORCE_WIN_DISPOSE:
                this.view.isEmergencyStop = false;
                this.view.stop();
                break;
            case SceneEvent.LOAD_BASE_COMPLETE:
                this.view.node.active = true;
                break;
        }
    }

    onShowReelSqueeze(singleReelContent: SingleReelContent): void {
        let fovLength = singleReelContent.stripIndexer.fovLength;
        let id = singleReelContent.stripIndexer.reelIndex;
        let nextReelStopIndex = id < this.reelDataProxy.isSlowMotionAry.length ? id : -1;
        if (this.view.isEmergencyStop) {
            this.stop();
            return;
        } else if (nextReelStopIndex == -1) {
            this.playEnd(fovLength);
            return;
        }
        this.playShow(singleReelContent);
    }

    onHideReelSqueeze(data: { fovLength: number; isHit: boolean }): void {
        let { fovLength, isHit } = data;
        // 急停的情況，且不是正在瞇牌，則不播放動畫
        if (this.view.isEmergencyStop && !this.view.isShowing) {
            this.stop();
            return;
        }
        this.playEnd(fovLength, isHit);
    }

    /* 播放動畫
     * @param fovLength 本次reel的高
     */
    playShow(singleReelContent: SingleReelContent): void {
        this.view.playShow(singleReelContent);
        AudioManager.Instance.play(AudioClipsEnum.BigWinPrediction);
    }

    playEnd(fovLength: number, isHit: boolean = false): void {
        this.view.playEnd(fovLength);
        if (isHit) {
            AudioManager.Instance.play(AudioClipsEnum.BigWinHit);
        }
        AudioManager.Instance.stop(AudioClipsEnum.BigWinPrediction).fade(0, 0.1);
    }

    stop(): void {
        this.view.isStoping = true;
        this.view.stop();
        AudioManager.Instance.stop(AudioClipsEnum.BigWinPrediction).fade(0, 0.1);
    }

    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }
}
