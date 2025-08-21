import { _decorator } from 'cc';
import BaseView from 'src/base/BaseView';
import { EmblemControl } from './EmblemControl';
import { TimelineTool } from 'TimelineTool';
const { ccclass, property } = _decorator;

@ccclass('BackgroundEffectView')
export class BackgroundEffectView extends BaseView {
    @property(TimelineTool)
    private anim: TimelineTool;
    @property({ type: EmblemControl })
    public emblemControl: EmblemControl | null = null;

    public showBgEffect() {
        this.node.active = true;
    }

    public hideBgEffect() {
        this.node.active = false;
    }

    public playBaseGameSceneAnim() {
        this.anim.play('base');
    }

    public playFreeGameSceneAnime() {
        this.anim.play('free');
    }

    public initEmblemLevel(level: number[]) {
        this.emblemControl?.initialLevel(0, level[0]);
    }

    public updateEmblemLevel(level: number[], callback: Function) {
        this.emblemControl?.updateLevel(0, level[0], callback);
    }

    public shakeEmblem() {
        this.emblemControl?.shake(0);
    }

    public setLevelUpAudio(audio: string) {
        this.emblemControl?.setLevelUpAudio(audio);
    }
}
