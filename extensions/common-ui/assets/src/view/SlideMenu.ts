import { _decorator, Component, Node, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { UIButton } from './UIButton';
const { ccclass, property } = _decorator;

@ccclass('SlideMenu')
export class SlideMenu extends Component {
    @property({ type: Vec3 })
    private showPosition: Vec3;
    @property({ type: Vec3 })
    private hidePosition: Vec3;

    @property({ type: UIButton })
    public menuMask: UIButton;

    public contentOpacity: number = 0;
    private maskOpacity: UIOpacity = null;
    private showMaskTween: Tween<UIOpacity> = null;
    private hideMaskTween: Tween<UIOpacity> = null;
    private childrenOpacity: UIOpacity[] = [];
    private contentTween: Tween<SlideMenu> = null;
    private showMenuTween: Tween<Node> = null;
    private hideMenuTween: Tween<Node> = null;
    private isShowMenu: boolean = true;

    protected onLoad(): void {
        this.maskOpacity = this.menuMask.node.getComponent(UIOpacity);
        this.childrenOpacity = this.node.getComponentsInChildren(UIOpacity);
        this.registerTween();
    }

    private registerTween() {
        this.showMaskTween = tween(this.maskOpacity)
            .call(() => {
                this.menuMask.node.active = true;
                this.menuMask.interactable = false;
                this.maskOpacity.opacity = 0;
            })
            .to(0.3, { opacity: 255 })
            .call(() => {
                this.menuMask.interactable = true;
            });
        this.hideMaskTween = tween(this.maskOpacity)
            .call(() => {
                this.menuMask.interactable = false;
            })
            .to(0.2, { opacity: 0 })
            .call(() => {
                this.menuMask.node.active = false;
            });

        this.contentTween = tween(this as SlideMenu).to(
            0.2,
            { contentOpacity: 255 },
            {
                onUpdate: () => {
                    this.childrenOpacity.forEach((opacity) => {
                        opacity.opacity = this.contentOpacity;
                    });
                }
            }
        );

        this.showMenuTween = tween(this.node)
            .call(() => {
                this.contentOpacity = 0;
                this.childrenOpacity.forEach((opacity) => {
                    opacity.opacity = 0;
                });
            })
            .call(() => {
                this.node.active = true;
            })
            .to(0.2, { position: this.showPosition })
            .delay(0.1)
            .call(() => {
                this.contentTween.start();
            });
        this.hideMenuTween = tween(this.node)
            .to(0.1, { position: this.hidePosition })
            .call(() => {
                this.node.active = false;
                this.hideMaskTween.start();
            });
    }

    public show() {
        if (this.isShowMenu == false) {
            this.isShowMenu = true;
            this.stopAllTween();
            this.showMaskTween.start();
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
        this.showMaskTween.stop();
        this.hideMaskTween.stop();
        this.showMenuTween.stop();
        this.hideMenuTween.stop();
        this.contentTween.stop();
    }

    public refreshOpacityList() {
        this.childrenOpacity = this.node.getComponentsInChildren(UIOpacity);
    }
}
