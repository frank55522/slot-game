import { _decorator, Label, Sprite, tween, Tween, UIOpacity, Vec3 } from 'cc';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('BBWView')
export class BBWView extends BaseView {
    private initPosition: Vec3;
    @property({ type: Label })
    public balanceDisplay: Label;

    @property({ type: Label })
    public winDisplay: Label;

    @property({ type: Label })
    public totalBetDisplay: Label;

    @property({ type: Vec3 })
    public bottomPosition: Vec3;

    public opacity: UIOpacity = null;
    private setToBottomTween: Tween<UIOpacity> = null;
    private restorePositionTween: Tween<UIOpacity> = null;
    private isNeedRestore: boolean = false;

    protected start(): void {
        this.opacity = this.node.getComponent(UIOpacity);
        this.initPosition = this.node.getPosition();
        this.setToBottomTween = tween(this.opacity)
            .to(0.2, { opacity: 0 })
            .call(() => {
                this.node.setPosition(this.bottomPosition);
            })
            .delay(0.1)
            .to(0.3, { opacity: 204 });
        this.restorePositionTween = tween(this.opacity)
            .to(0, { opacity: 0 })
            .call(() => {
                this.node.setPosition(this.initPosition);
            })
            .to(0.05, { opacity: 255 });
    }

    public updateBalanceLabel(_val: string): void {
        this.balanceDisplay.string = _val;
    }

    public updateWinLabel(_val: string): void {
        this.winDisplay.string = _val;
    }

    public updateTotalBetLabel(_val: string): void {
        this.totalBetDisplay.string = _val;
    }

    public setToBottom() {
        if (this.isNeedRestore == false) {
            this.isNeedRestore = true;
            this.stopAllTween();
            this.setToBottomTween.start();
        }
    }

    public restorePosition() {
        if (this.isNeedRestore) {
            this.isNeedRestore = false;
            this.stopAllTween();
            this.restorePositionTween.start();
        }
    }

    private stopAllTween() {
        this.setToBottomTween?.stop();
        this.restorePositionTween?.stop();
    }
}
