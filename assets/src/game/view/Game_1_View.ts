import { _decorator, Prefab, Node } from 'cc';
import { SceneManager } from '../../core/utils/SceneManager';
import { GameUIOrientationSetting } from '../vo/GameUIOrientationSetting';
import BaseView from 'src/base/BaseView';
import { TimelineTool } from 'TimelineTool';
import { WinAnimationController } from '../animation/WinAnimationController';

const { ccclass, property } = _decorator;

@ccclass('Game_1_View')
export class Game_1_View extends BaseView {
    public static readonly HORIZONTAL: string = 'horizontal';
    public static readonly VERTICAL: string = 'vertical';

    @property({ type: Prefab})
    public reelPrefab: Prefab | null = null;

    @property({ type: TimelineTool })
    public winAnimationTimeline: TimelineTool | null = null;

    // 存儲程式碼生成的 UI Node，用於動畫
    private winUINodes: Node[] = [];

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
        // 對程式碼生成的 UI 播放動畫
        if (this.winUINodes.length > 0) {
            WinAnimationController.playWinAnimationOnNodes(this.winUINodes);
        }
        
        // 播放 Timeline 動畫
        if (this.winAnimationTimeline) {
            this.winAnimationTimeline.play('showWin', callback);
        }
    }

    public stopWinAnimation() {
        // 停止程式碼生成的 UI 動畫
        if (this.winUINodes.length > 0) {
            WinAnimationController.stopAnimationOnNodes(this.winUINodes);
        }
        
        if (this.winAnimationTimeline) {
            this.winAnimationTimeline.stop();
        }
    }

    /**
     * 註冊程式碼生成的 Win UI Node，以便播放動畫
     * 在第一題創建連線顯示 UI 時調用
     */
    public registerWinUINode(node: Node) {
        if (node && !this.winUINodes.includes(node)) {
            this.winUINodes.push(node);
        }
    }

    /**
     * 清除所有註冊的 Win UI Node
     */
    public clearWinUINodes() {
        this.winUINodes = [];
    }
}
