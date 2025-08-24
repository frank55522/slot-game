import { _decorator, Prefab } from 'cc';
import { SceneManager } from '../../core/utils/SceneManager';
import { GameUIOrientationSetting } from '../vo/GameUIOrientationSetting';
import BaseView from 'src/base/BaseView';
import { TimelineTool } from 'TimelineTool';

const { ccclass, property } = _decorator;

@ccclass('Game_1_View')
export class Game_1_View extends BaseView {
    public static readonly HORIZONTAL: string = 'horizontal';
    public static readonly VERTICAL: string = 'vertical';

    @property({ type: Prefab})
    public reelPrefab: Prefab | null = null;

    @property({ type: TimelineTool })
    public winAnimationTimeline: TimelineTool | null = null;


    private _gameUIOrientation: Array<GameUIOrientationSetting> | null = null;

    private get gameUIOrientation() {
        if (this._gameUIOrientation == null) {
            this._gameUIOrientation = this.getComponentsInChildren(GameUIOrientationSetting);
        }
        return this._gameUIOrientation;
    }

    protected onLoad() {
        super.onLoad();
    }

    public changeOrientation(orientation: string, scene: string) {
        let ishorizontal = orientation == SceneManager.EV_ORIENTATION_HORIZONTAL;
        for (let i = 0; i < this.gameUIOrientation.length; i++) {
            this.gameUIOrientation[i].changeOrientation(ishorizontal, scene);
        }
    }

    public playWinAnimation(callback?: Function) {
        // 播放 Timeline 動畫
        if (this.winAnimationTimeline) {
            this.winAnimationTimeline.play('showWin', callback);
        }
    }

    public stopWinAnimation() {
        if (this.winAnimationTimeline) {
            this.winAnimationTimeline.stop();
        }
    }

}
