import { _decorator, Component, Node, tween, Tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SlideButtonGroup')
export class SlideButtonGroup extends Component {
    @property({ type: Vec3 })
    private showPosition: Vec3;
    @property({ type: Vec3 })
    private hidePosition: Vec3;

    public contentOpacity: number = 0;
    public contentPosition: Vec3;
    private opacity: UIOpacity = null;
    private showMenuTween: Tween<SlideButtonGroup> = null;
    private hideMenuTween: Tween<SlideButtonGroup> = null;
    private isShowMenu: boolean = true;

    protected onLoad(): void {
        this.contentPosition = this.node.getPosition();
        this.opacity = this.node.getComponent(UIOpacity);
        this.contentOpacity = this.opacity.opacity;
        this.registerTween();
    }

    private registerTween() {
        this.showMenuTween = tween(this as SlideButtonGroup)
            .call(() => {
                this.node.active = true;
                this.contentOpacity = 0;
            })
            .to(
                0.15,
                { contentPosition: this.showPosition, contentOpacity: 255 },
                {
                    onUpdate: () => {
                        this.node.setPosition(this.contentPosition);
                        this.opacity.opacity = this.contentOpacity;
                    }
                }
            );
        this.hideMenuTween = tween(this as SlideButtonGroup)
            .to(
                0.15,
                { contentPosition: this.hidePosition, contentOpacity: 0 },
                {
                    onUpdate: () => {
                        this.node.setPosition(this.contentPosition);
                        this.opacity.opacity = this.contentOpacity;
                    }
                }
            )
            .call(() => {
                this.node.active = false;
            });
    }

    public show() {
        if (this.isShowMenu == false) {
            this.isShowMenu = true;
            this.stopAllTween();
            this.showMenuTween.start();
        }
    }

    public hide() {
        if (this.isShowMenu) {
            this.isShowMenu = false;
            this.stopAllTween();
            this.hideMenuTween.start();
        }
    }

    private stopAllTween() {
        this.showMenuTween.stop();
        this.hideMenuTween.stop();
    }
}
