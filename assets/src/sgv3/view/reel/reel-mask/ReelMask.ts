import { _decorator, UITransform, math, Sprite } from 'cc';
const { ccclass } = _decorator;

@ccclass('ReelMask')
export class ReelMask extends Sprite {
    private _uiTransform: UITransform | null = null;

    private get uiTransform() {
        if (this._uiTransform == null) {
            this._uiTransform = this.getComponent(UITransform);
        }
        return this._uiTransform;
    }

    public set size(size: math.Size) {
        this.uiTransform!.setContentSize(size);
    }

    public get size(){
        return this.uiTransform.contentSize;
    }
}
