import { _decorator, Button, Color, SystemEvent } from 'cc';
import { AudioManager } from 'src/audio/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('UIButton')
export abstract class UIButton extends Button {
    protected clickCallback: Function = null;

    @property({ type: String })
    protected soundName: string = '';

    @property({
        visible: function () {
            return this.isColorTransition();
        },
        override: true
    })
    get normalColor(): Readonly<Color> {
        return super.normalColor;
    }
    set normalColor(value: Readonly<Color>) {
        super.normalColor = value;
    }

    @property({
        visible: function () {
            return this.isColorTransition();
        },
        override: true
    })
    get pressedColor(): Readonly<Color> {
        return super.pressedColor;
    }
    set pressedColor(value: Readonly<Color>) {
        super.pressedColor = value;
    }

    @property({
        visible: function () {
            return this.isColorTransition();
        },
        override: true
    })
    get hoverColor(): Readonly<Color> {
        return super.hoverColor;
    }
    set hoverColor(value: Readonly<Color>) {
        super.hoverColor = value;
    }

    @property({
        visible: function () {
            return this.isColorTransition();
        },
        override: true
    })
    get disabledColor(): Readonly<Color> {
        return super.disabledColor;
    }
    set disabledColor(value: Readonly<Color>) {
        super.disabledColor = value;
    }

    @property({
        visible: function () {
            return this.isColorTransition() || this.isScaleTransition();
        },
        override: true
    })
    get duration() {
        return super.duration;
    }
    set duration(value) {
        super.duration = value;
    }

    @property({
        visible: function () {
            return this.isScaleTransition();
        },
        override: true
    })
    get zoomScale() {
        return super.zoomScale;
    }
    set zoomScale(value) {
        super.zoomScale = value;
    }

    @property({
        visible: function () {
            return this.isSpriteTransition();
        },
        override: true
    })
    get normalSprite() {
        return super.normalSprite;
    }
    set normalSprite(value) {
        super.normalSprite = value;
    }

    @property({
        visible: function () {
            return this.isSpriteTransition();
        },
        override: true
    })
    get pressedSprite() {
        return super.pressedSprite;
    }
    set pressedSprite(value) {
        super.pressedSprite = value;
    }

    @property({
        visible: function () {
            return this.isSpriteTransition();
        },
        override: true
    })
    get hoverSprite() {
        return super.hoverSprite;
    }
    set hoverSprite(value) {
        super.hoverSprite = value;
    }

    @property({
        visible: function () {
            return this.isSpriteTransition();
        },
        override: true
    })
    get disabledSprite() {
        return super.disabledSprite;
    }
    set disabledSprite(value) {
        super.disabledSprite = value;
    }

    private isColorTransition(): boolean {
        return this.transition === Button.Transition.COLOR;
    }

    private isSpriteTransition(): boolean {
        return this.transition === Button.Transition.SPRITE;
    }

    private isScaleTransition(): boolean {
        return this.transition === Button.Transition.SCALE;
    }

    public readonly onlyGameIdleEnabled: boolean = false;

    protected state: any;

    public getState(): string {
        return this.state;
    }

    public abstract setState(state: any);
    
    get interactable(): boolean {
        return this._interactable;
    }
    set interactable(value: boolean) {
        this._interactable = value;
        if (value) {
            this.node.on(SystemEvent.EventType.TOUCH_END, this.clickCallback);
        } else {
            this.node.off(SystemEvent.EventType.TOUCH_END, this.clickCallback);
        }
    }

    public registerCallback(callback: Function = null) {
        this.clickCallback = () => {
            callback();
            this.playSound();
        };
        this.interactable = true;
    }

    private playSound() {
        AudioManager.Instance.play(this.soundName);
    }
}
