import { _decorator, Component } from 'cc';
import { AudioManager } from 'src/audio/AudioManager';
import { TimelineTool } from 'TimelineTool';
const { ccclass, property } = _decorator;

@ccclass('EmblemControl')
export class EmblemControl extends Component {
    @property({ type: [TimelineTool] })
    public emblemTimeline: TimelineTool[] = [];

    private curLevel: number[] = [];
    private targetLevel: number[] = [];
    private updateLevelCallback: Function | null = null;
    private levelUpAudio: string = '';

    public initialLevel(index: number, level: number) {
        this.curLevel[index] = level;
        this.emblemTimeline[index].play(`lv${level}`);
    }

    public updateLevel(index: number, finalLevel: number, callback?: Function) {
        this.updateLevelCallback = callback;
        if (this.curLevel[index] != finalLevel) {
            if (this.curLevel[index] > finalLevel) {
                this.curLevel[index] = this.targetLevel[index] = finalLevel;
            } else {
                this.targetLevel[index] = this.curLevel[index] + 1;
            }
            this.curLevel[index] = this.targetLevel[index];
            this.emblemTimeline[index].play(
                `lv${this.curLevel[index]}`,
                this.updateLevelComplete.bind(this, index, finalLevel), false
            );
            if (this.levelUpAudio) {
                AudioManager.Instance.stop(this.levelUpAudio);
                AudioManager.Instance.play(this.levelUpAudio);
            }
        } else {
            this.updateLevelComplete(index, finalLevel);
        }
    }

    private updateLevelComplete(index: number, finalLevel: number) {
        if (this.curLevel[index] == finalLevel) {
            this.updateLevelCallback?.();
            this.updateLevelCallback = null;
        } else {
            this.updateLevel(index, finalLevel, this.updateLevelCallback!);
        }
    }

    public shake(index: number) {
        this.emblemTimeline[index].play('shake');
    }

    public setLevelUpAudio(audio: string) {
        this.levelUpAudio = audio;
    }

    public getLevel() {
        return this.curLevel[0]
    }
}
