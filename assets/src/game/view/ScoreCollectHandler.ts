import { _decorator, Component, Label, Font, Node } from 'cc';
import { ParticleContentTool } from 'ParticleContentTool';
import { TimelineTool } from 'TimelineTool';
const { ccclass, property } = _decorator;

@ccclass('ScoreCollectHandler')
export class ScoreCollectHandler extends Component {
    @property(Label) private countLabel: Label | null = null;

    @property(Label) private scoreLabel: Label | null = null;

    @property(Node) private countGroup: Node | null = null;

    @property([ParticleContentTool]) private particles: ParticleContentTool[] = [];

    @property(TimelineTool)
    private scoreCollectAnimation: TimelineTool | null = null;

    public ballCountUpdate(info: string) {
        if (!this.countGroup.active) {
            this.countGroup.active = true;
            this.scoreLabel.node.active = false;
        }
        this.countLabel.string = info;
    }

    public ballCountHide() {
        if (this.countGroup.active) {
            this.countGroup.active = false;
            this.scoreLabel.node.active = false;
        }
        this.countLabel.string = String();
    }

    public onScoreCollect(score: string, PlayType: number) {
        if (!this.scoreLabel.node.active) {
            this.countGroup.active = false;
            this.scoreLabel.node.active = true;
        }
        this.scoreLabel.string = score;
        let playName: string = '';
        switch (PlayType) {
            case 0:
                playName = 'BGCollect';
                break;
            case 1:
                playName = 'FGCollect';
                break;
            case 2:
                playName = 'DUCollect';
                break;
            case 3:
                playName = 'hide';
                break;
            case 4:
                playName = 'show';
                break;
        }
        this.scoreCollectAnimation.play(playName);
    }

    //** 結算分數加總 表演*/
    public onScoreSum() {
        this.scoreCollectAnimation.play('sum');
    }

    public allFXClear() {
        for (let i in this.particles) {
            this.particles[i].ParticleClear();
        }
    }
}
