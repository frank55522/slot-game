import { _decorator, CCClass, Component, Enum, sp } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

enum SpinesEnum {
    None = 0
}

@ccclass('mixData')
export class mixData {
    @property({ type: Enum(SpinesEnum) })
    public animation_1: SpinesEnum = SpinesEnum.None;

    @property({ type: Enum(SpinesEnum) })
    public animation_2: SpinesEnum = SpinesEnum.None;

    @property({ type: Number })
    public mixTime: number = 0.2;
}

@ccclass('SpineMixSettings')
@executeInEditMode(true)
export class SpineMixSettings extends Component {
    private _spine: sp.Skeleton | null = null;
    private get spine(): sp.Skeleton {
        return (this._spine ??= this.getComponent(sp.Skeleton));
    }

    @property({ type: [mixData] })
    public mixData: mixData[] = [];

    protected onLoad(): void {
        this.setMixData();
    }

    private setMixData() {
        for (let i = 0; i < this.mixData.length; i++) {
            let anim1 = Object.getOwnPropertyDescriptor(
                this.spine.skeletonData.getAnimsEnum(),
                this.mixData[i].animation_1
            ).value;
            let anim2 = Object.getOwnPropertyDescriptor(
                this.spine.skeletonData.getAnimsEnum(),
                this.mixData[i].animation_2
            ).value;
            this.setMix(anim1, anim2, this.mixData[i].mixTime);
        }
    }

    /**
     * 設定動畫混和
     * @param anim1
     * @param anim2
     * @param mixTime 混和時間
     */
    public setMix(anim1: string, anim2: string, mixTime: number) {
        this.spine?.setMix(anim1, anim2, mixTime);
        this.spine?.setMix(anim2, anim1, mixTime);
    }

    protected update(dt: number): void {
        this.updateEditorEnum();
    }

    private updateEditorEnum() {
        if (EDITOR) {
            if (this.spine != null) {
                for (let i = 0; i < this.mixData.length; i++) {
                    this._refreshEnum_AnimationOfSpine(this.spine.skeletonData.getAnimsEnum(), this.mixData[i]);
                }
            }
        }
    }

    _refreshEnum_AnimationOfSpine(value: {}, myself: any) {
        if (EDITOR) {
            const arr = [];
            for (let key in value) {
                arr.push({ name: key, value: value[key] });
            }
            CCClass.Attr.setClassAttr(myself, 'animation_1', 'enumList', arr);
            CCClass.Attr.setClassAttr(myself, 'animation_2', 'enumList', arr);
        }
    }
}
