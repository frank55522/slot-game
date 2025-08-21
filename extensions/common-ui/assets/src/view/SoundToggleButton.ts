import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SoundToggleButton')
export class SoundToggleButton extends Component {
    public static readonly STATUS_OFF: string = 'off';
    public static readonly STATUS_ON: string = 'on';

    @property({ type: Sprite})
    public target: Sprite;
    @property({ type: SpriteFrame })
    public enableSprite: SpriteFrame;
    @property({ type: SpriteFrame })
    public disableSprite: SpriteFrame;

    public currentState = '';

    /**
     * 改變按鈕狀態
     * @param hasSound 是否開啟音效
     */
    public changeState(hasSound: boolean) {
        if (hasSound) {
            this.currentState = SoundToggleButton.STATUS_ON;
            this.target.spriteFrame = this.enableSprite;
        } else {
            this.currentState = SoundToggleButton.STATUS_OFF;
            this.target.spriteFrame = this.disableSprite;
        }
    }
}
