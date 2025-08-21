import { _decorator, Color, Sprite, tween, Tween, UIOpacity } from 'cc';
import { UIButton } from './UIButton';
import { ButtonState } from '../proxy/UIEnums';
import { UrlLogoSetting } from 'src/core/ui/UrlLogoSetting';
const { ccclass, property } = _decorator;

@ccclass('SpinButton')
export class SpinButton extends UIButton {
    @property({ type: Sprite })
    public spinBG: Sprite;

    @property({ type: Sprite })
    public spinArrow: Sprite;

    @property({ type: Sprite })
    public spinStop: Sprite;

    @property({ type: UrlLogoSetting })
    public providerInfo: UrlLogoSetting;

    public static readonly STATUS_IDLE: string = 'idle';
    public static readonly STATUS_STOP: string = 'stop';
    private static readonly OPACITY_LOWEST_LIMIT: number = 1; /* 避免opacity為 0 時切換圖檔有機率顯示大小錯誤 */
    private showMenuTween: Tween<UIOpacity> = null;
    private hideMenuTween: Tween<UIOpacity> = null;

    private buttonOpacity: UIOpacity;
    private spinUIOpacity: UIOpacity;
    private stopUIOpacity: UIOpacity;
    private isShow: boolean = true;

    protected onLoad(): void {
        this.setState(SpinButton.STATUS_IDLE);
        this.buttonOpacity = this.node.getComponent(UIOpacity);
        this.spinUIOpacity = this.spinArrow.getComponent(UIOpacity);
        this.stopUIOpacity = this.spinStop.getComponent(UIOpacity);
        this.registerTween();
    }

    private registerTween() {
        this.showMenuTween = tween(this.buttonOpacity)
            .call(() => {
                this.node.active = true;
                this.buttonOpacity.opacity = 0;
            })
            .to(0.15, { opacity: 255 });
        this.hideMenuTween = tween(this.buttonOpacity)
            .call(() => {
                this.buttonOpacity.opacity = 255;
            })
            .to(0.15, { opacity: 0 })
            .call(() => {
                this.node.active = false;
            });
    }

    public initLogo(url: string) {
        this.providerInfo.url = url;
        this.providerInfo.updateFrame();
    }

    public setState(state: string) {
        this.state = state;
        switch (state) {
            case ButtonState.ENABLED:
                this.interactable = true;
                this.disableButton(false);
                break;
            case ButtonState.DISABLED:
                this.interactable = false;
                this.disableButton(true);
                break;
            case SpinButton.STATUS_IDLE:
                this.setSpinIdle();
                break;
            case SpinButton.STATUS_STOP:
                this.setSpinStop();
                break;
        }
    }

    private setSpinIdle() {
        this.spinArrow.node.active = true;
        this.spinStop.node.active = false;
    }

    private setSpinStop() {
        this.spinArrow.node.active = false;
        this.spinStop.node.active = true;
    }

    public hideSpinIcon(disabled: boolean) {
        if (disabled) {
            this.spinUIOpacity.opacity = SpinButton.OPACITY_LOWEST_LIMIT;
            this.stopUIOpacity.opacity = SpinButton.OPACITY_LOWEST_LIMIT;
        } else {
            this.spinUIOpacity.opacity = 255;
            this.stopUIOpacity.opacity = 255;
        }
    }

    public disableButton(isDisable: boolean) {
        let color: Color = SpinStateColor.getColor(isDisable);

        this.spinArrow.color = color;
        this.spinStop.color = color;
        this.spinBG.color = color;
        this.providerInfo.logo.color = color;
    }

    public show() {
        if (this.isShow == false) {
            this.isShow = true;
            this.stopAllTween();
            this.showMenuTween.start();
        }
    }

    public hide() {
        if (this.isShow) {
            this.isShow = false;
            this.stopAllTween();
            this.hideMenuTween.start();
        }
    }

    private stopAllTween() {
        this.showMenuTween.stop();
        this.hideMenuTween.stop();
    }
}

export class SpinStateColor {
    public static ENABLE: Color = new Color(255, 255, 255);
    public static DISABLE: Color = new Color(160, 160, 160);

    public static getColor(isDisable: boolean): Color {
        return isDisable ? this.DISABLE : this.ENABLE;
    }
}
