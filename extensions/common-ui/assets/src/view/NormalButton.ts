import { _decorator, UIOpacity } from 'cc';
import { UIButton } from './UIButton';
import { ButtonState } from '../proxy/UIEnums';
const { ccclass } = _decorator;

@ccclass('NormalButton')
export class NormalButton extends UIButton {
    public readonly onlyGameIdleEnabled: boolean = true;

    private uiOpacity: UIOpacity;

    protected onLoad() {
        this.uiOpacity = this.getComponent(UIOpacity);
    }

    public setState(state: string) {
        this.state = state;
        if (state === ButtonState.ENABLED) {
            this.interactable = true;
            this.setOpacity(255);
        } else if (state === ButtonState.DISABLED) {
            this.interactable = false;
            this.setOpacity(175);
        }
        this.node.active = state !== ButtonState.INVISIBLE;
    }

    private setOpacity(opacity: number) {
        if (this.uiOpacity) {
            this.uiOpacity.opacity = opacity;
        }
    }
}
