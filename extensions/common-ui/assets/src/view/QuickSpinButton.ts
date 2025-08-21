import { _decorator, Sprite, UIOpacity, Color, SpriteFrame, Node } from 'cc';
import { UIButton } from './UIButton';
import { ButtonState, SpeedMode } from '../proxy/UIEnums';
const { ccclass, property } = _decorator;

@ccclass('QuickSpinButton')
export class QuickSpinButton extends UIButton {
    public static readonly STATUS_ON: string = 'on';
    public static readonly STATUS_OFF: string = 'off';

    @property({ type: SpriteFrame })
    public quickOnSprite: SpriteFrame;
    @property({ type: Color })
    public quickOnColor: Color;
    @property({ type: SpriteFrame })
    public quickOffSprite: SpriteFrame;
    @property({ type: Color })
    public quickOffColor: Color;
    @property({ type: SpriteFrame })
    public turboOnSprite: SpriteFrame;
    @property({ type: Color })
    public turboOnColor: Color;
    
    protected iconImg: Sprite;
    private uiOpacity: UIOpacity;

    protected onLoad() {
        this.iconImg = this.getComponent(Sprite);
        this.uiOpacity = this.getComponent(UIOpacity);
    }
    public setState(state: string) {
        this.state = state;
        switch (state) {
            case SpeedMode.STATUS_QUICK:
                this.iconImg.spriteFrame = this.quickOnSprite;
                this.iconImg.color = this.quickOnColor;
                break;
            case SpeedMode.STATUS_NORMAL:
                this.iconImg.spriteFrame = this.quickOffSprite;
                this.iconImg.color = this.quickOffColor;
                break;
            case SpeedMode.STATUS_TURBO:
                this.iconImg.spriteFrame = this.turboOnSprite;
                this.iconImg.color = this.turboOnColor;
                break;
            case ButtonState.ENABLED:
                this.interactable = true;
                this.uiOpacity.opacity = 255;
                break;
            case ButtonState.DISABLED:
                this.interactable = false;
                this.uiOpacity.opacity = 175;
                break;
        }
    }
}