import { _decorator } from 'cc';
import { AudioManager } from '../../audio/AudioManager';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
import { TimelineTool } from 'TimelineTool';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('ExpansionWildsView')
export class ExpansionWildsView extends BaseView {
    @property(TimelineTool)
    private animL: TimelineTool;

    @property(TimelineTool)
    private animR: TimelineTool;

    onLoad() {
        super.onLoad();
    }

    public show(): void {
        this.animL.node.active = this.animR.node.active = true;
        this.animL.play('L_WildExpand');
        this.animR.play('R_WildExpand');
        AudioManager.Instance.play(AudioClipsEnum.Free_Slogan);
    }

    public win(isFiveOfKind: boolean, callBack?: Function): void {
        if (isFiveOfKind) this.animR.play('Win');
        this.animL.play('Win');
    }

    public hide() {
        this.animL.node.active = this.animR.node.active = false;
    }
}
