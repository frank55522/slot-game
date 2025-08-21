import { _decorator, Component, Node, Vec3, math, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('OrientationSetting')
export class OrientationSetting {
    @property({})
    public isChangeScale: boolean = false;
    @property({})
    public isChangeContentSize: boolean = false;
    @property({})
    public isChangePosition: boolean = false;
    @property({
        visible() {
            return this.isChangePosition;
        }
    })
    public position: Vec3 = new Vec3();
    @property({
        visible() {
            return this.isChangeScale;
        }
    })
    public scale: Vec3 = new Vec3();
    @property({
        visible() {
            return this.isChangeContentSize;
        }
    })
    public size: math.Size = new math.Size();
}

@ccclass('UIOrientation')
export class UIOrientation extends Component {
    @property({ type: OrientationSetting, visible: true })
    private _horizontalSetting: OrientationSetting = new OrientationSetting();
    @property({ type: OrientationSetting, visible: true })
    private _verticalSetting: OrientationSetting = new OrientationSetting();

    private _curSetting: OrientationSetting | null = null;

    private _transform: UITransform | null = null;

    private get uiTransform() {
        if (this._transform == null) {
            this._transform = this.getComponent(UITransform);
        }
        return this._transform;
    }

    public changeOrientation(isHorizontal: boolean) {
        this._curSetting = isHorizontal ? this._horizontalSetting : this._verticalSetting;
        if(this._curSetting.isChangeScale) this.node.scale = this._curSetting.scale;
        if(this._curSetting.isChangePosition) this.node.position = this._curSetting.position; 
        if(this._curSetting.isChangeContentSize) this.uiTransform.setContentSize(this._curSetting.size);
    }
}
