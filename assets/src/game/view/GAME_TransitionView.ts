import { _decorator } from 'cc';
import { TimelineTool } from 'TimelineTool';
import { AudioManager } from '../../audio/AudioManager';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
import BaseView from 'src/base/BaseView';

const { ccclass, property } = _decorator;

@ccclass('GAME_TransitionView')
export class GAME_TransitionView extends BaseView {
    public static readonly HORIZONTAL: string = 'horizontal';
    public static readonly VERTICAL: string = 'vertical';

    public currentState = '';

    @property(TimelineTool)
    private Transition: TimelineTool | null = null;

    protected isTransitionBG: boolean = false; //判斷是否進行轉場.

    protected onLoad() {
        super.onLoad('TransitionViewMediator');
    }

    /** 更改orientation mode */
    public changeOrientation(mode: string) {
        this.currentState = mode;
    }

    /** 轉場動畫*/
    public showTransition(): void {
        const self = this;
        this.setNodeActivity(true);
        this.Transition?.play('FS_Transition');
        AudioManager.Instance.play(AudioClipsEnum.FeatureSelection_DragonRoar);
    }

    public setNodeActivity(active: boolean) {
        this.node.active = active;
    }
}
