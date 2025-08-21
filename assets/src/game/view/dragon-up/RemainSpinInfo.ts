import { TimelineTool } from 'TimelineTool';
import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RemainSpinInfo')
export class RemainSpinInfo extends Component {
    @property({ type: Label })
    private curRemainSpinTimes: Label;
    // 加場次特效
    @property({ type: TimelineTool })
    private remainSpinFX: TimelineTool;

    private curSpinTime: number = 0;

    public setCurSpinTime(curSpinTime: number) {
        this.curSpinTime = curSpinTime;
        if (this.curSpinTime > 0) {
            this.curRemainSpinTimes.string = String(this.curSpinTime);
            this.node.active = true;
        } else {
            this.node.active = false;
        }
    }

    public updateReSpinInfo(reSpinTime: number) {
        this.curSpinTime = this.curSpinTime + reSpinTime;
        this.node.active = this.curSpinTime > 0;
        this.curRemainSpinTimes.string = String(this.curSpinTime);
        this.remainSpinFX.play('FreeGameAddSpin');
    }
}
