import { _decorator, Sprite } from 'cc';
import { AudioManager } from 'src/audio/AudioManager';
import BaseView from 'src/base/BaseView';
import { TimelineTool } from 'TimelineTool';
const { ccclass, property } = _decorator;

@ccclass('FeatureBetView')
export class FeatureBetView extends BaseView {
    @property({ type: Sprite })
    public symbolList: Sprite[] = [];
    @property({ type: TimelineTool })
    public symbolFXlList: TimelineTool[] = [];

    private preFeatureIdx: number = 0;
    private soundList: string[] = [];
    private fxActiveList: boolean[] = [];
    // [9, 10, J, Q, K, A]
    private symbolActiveList: boolean[][] = [
        [true, true, true, true, true, true],
        [false, true, true, true, true, true],
        [false, false, true, true, true, true],
        [false, false, false, false, true, true],
        [false, false, false, false, false, false]
    ];

    public setSoundList(soundList: string[]) {
        this.soundList = soundList;
    }

    public onClickFeatureBet(featureIdx: number) {
        this.playFeatureBetSound(featureIdx);
        this.setSymbol(featureIdx);
    }

    private playFeatureBetSound(featureIdx: number) {
        if (this.preFeatureIdx < featureIdx) {
            AudioManager.Instance.stop(this.soundList[featureIdx]);
            AudioManager.Instance.play(this.soundList[featureIdx]);
        }
        this.preFeatureIdx = featureIdx;
    }

    public restoreFeatureBet(featureIdx: number) {
        this.restoreSymbol(featureIdx);
    }

    private setSymbol(featureIdx: number) {
        for (let i = 0; i < this.symbolList.length; i++) {
            const active = this.symbolActiveList[featureIdx][i];
            if (!active) {
                this.setSymbolActive(i, false);
            }
            this.setSymbolFXActive(i, active);
        }
    }

    private setSymbolActive(index: number, active: boolean) {
        this.symbolList[index].node.active = active;
    }

    private setSymbolFXActive(index: number, active: boolean) {
        if (this.fxActiveList[index] != active) {
            this.fxActiveList[index] = active;
            if (active) {
                this.symbolFXlList[index].play('Appear');
            } else {
                this.symbolFXlList[index].play('Disappear');
            }
        }
    }

    private restoreSymbol(featureIdx: number) {
        for (let i = 0; i < this.symbolFXlList.length; i++) {
            const active = this.symbolActiveList[featureIdx][i];
            if (this.fxActiveList[i] != active) {
                this.fxActiveList[i] = active;
                if (active) {
                    this.symbolFXlList[i].play('Default');
                } else {
                    this.symbolFXlList[i].play('Empty');
                }
            }
        }
    }

    public hideAllMenu() {
        for (let i = 0; i < this.symbolFXlList.length; i++) {
            this.setSymbolActive(i, this.fxActiveList[i]);
            if (this.fxActiveList[i]) {
                if (this.symbolFXlList[i].isPlaying) {
                    this.symbolFXlList[i].play('Default');
                }
            }
            if (this.symbolFXlList[i].isPlaying) {
                this.symbolFXlList[i].play('Empty');
            }
        }
    }
}
