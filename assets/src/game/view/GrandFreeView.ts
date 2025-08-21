import { _decorator, tween, UIOpacity } from 'cc';
import BaseView from 'src/base/BaseView';
import { GameScene } from 'src/sgv3/vo/data/GameScene';
const { ccclass, property } = _decorator;

@ccclass('GrandFreeView')
export class GrandFreeView extends BaseView {
    @property({ type: UIOpacity })
    public uiOpacity: UIOpacity | null = null;

    public showByScene(gameScene: string): void {
        switch (gameScene) {
            case GameScene.Game_1:
            case GameScene.Game_3:
                this.node.active = false;
                this.uiOpacity.opacity = 0;
                break;
            case GameScene.Game_2:
            case GameScene.Game_4:
                this.node.active = true;
                this.uiOpacity.opacity = 255;
                break;
        }
    }

    public showTween(): void {
        this.node.active = true;
        tween(this.uiOpacity).to(1, { opacity: 255 }).start();
    }
}
