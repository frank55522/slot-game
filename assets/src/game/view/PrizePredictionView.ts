import { _decorator } from 'cc';
import { TimelineTool } from 'TimelineTool';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
import { AudioManager } from 'src/audio/AudioManager';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('PrizePredictionView')
export class PrizePredictionView extends BaseView {
    @property(TimelineTool)
    private anim: TimelineTool;

    private sounds: AudioClipsEnum[] = [AudioClipsEnum.PrizePrediction];
    private callBack: Function = null;
    onLoad() {
        super.onLoad();
    }

    play(cb: Function): void {
        const self = this;
        self.playSound();
        self.callBack = cb;
        self.anim.play('Show', () => {
            self.onFinish();
        });
    }

    private playSound() {
        let index = Math.floor(Math.random() * (this.sounds.length - 0.1)); //prevent random number equal 1 will out of range
        AudioManager.Instance.play(this.sounds[index]);
    }

    public stop() {
        this.onFinish();
    }

    public setActive(active: boolean) {
        this.node.active = active;
    }

    private onFinish() {
        const self = this;
        self.callBack?.();
        this.callBack = null;
    }

    public get isPlaying(): boolean {
        return this.callBack != null;
    }

    show() {
        this.anim.node.active = true;
    }

    hide() {
        this.anim.node.active = false;
    }
}
