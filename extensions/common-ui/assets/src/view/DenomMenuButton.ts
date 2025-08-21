import { _decorator, Component, Sprite, Label, Color } from 'cc';
const { ccclass } = _decorator;

@ccclass('DenomMenuButton')
export class DenomMenuButton extends Component {
    public static readonly STATUS_SELECTED: string = 'selected';
    public static readonly STATUS_DESELECTED: string = 'deselected';

    private _iconImg: Sprite;
    private get iconImg(): Sprite {
        if (this._iconImg == null) {
            this._iconImg = this.getComponent(Sprite);
        }
        return this._iconImg;
    }
    private _label: Label;
    private get label(): Label {
        if (this._label == null) {
            this._label = this.getComponentInChildren(Label);
        }
        return this._label;
    }

    public buttonVal: number;
    public index: number;

    public currentState = '';

    public setValue(value: number) {
        this.buttonVal = value;
    }

    public setLabel(label: string) {
        this.label.string = label;
    }

    protected onLoad(): void {
        this.changeState(DenomMenuButton.STATUS_DESELECTED);
    }

    /**
     * 改變按鈕狀態
     * @param state 狀態
     */
    public changeState(state: string) {
        this.currentState = state;
        if (state == DenomMenuButton.STATUS_SELECTED) {
            this.iconImg.color = Color.WHITE;
            this.label.color = Color.WHITE;
        } else {
            this.iconImg.color = Color.GRAY;
            this.label.color = Color.GRAY;
        }
    }
}
