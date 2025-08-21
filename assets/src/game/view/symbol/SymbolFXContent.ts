import { _decorator, Label, Font, Component, Enum, Sprite, SpriteFrame, Vec3 } from 'cc';
import { TimelineTool } from 'TimelineTool';
import { LockType, SymbolId } from '../../../sgv3/vo/enum/Reel';
const { ccclass, property } = _decorator;

@ccclass('SymbolFXContent')
export class SymbolFXContent extends Component {
    @property({ type: Enum(SymbolId), visible: true })
    public symbolType: SymbolId = SymbolId.C1;
    @property({ type: TimelineTool })
    public animation: TimelineTool | null = null;

    @property({
        type: Label,
        visible() {
            return this.symbolType == SymbolId.C1 || this.symbolType == SymbolId.C2;
        }
    })
    public labelText: Label | null = null;

    @property({
        type: Sprite,
        visible() {
            return this.symbolType == SymbolId.C2;
        }
    })
    public subSprite: Sprite | null = null;

    @property({
        type: [SpriteFrame],
        visible() {
            return this.symbolType == SymbolId.C2;
        }
    })
    public respinNumFrames: Array<SpriteFrame> = [];

    @property({
        visible() {
            return this.symbolType == SymbolId.C2;
        }
    })
    public hasReSpinPos: Vec3 = new Vec3(0, 30, 0);

    @property({
        visible() {
            return this.symbolType == SymbolId.C2;
        }
    })
    public multiPos: Vec3 = new Vec3(0, 10, 0);

    @property({
        visible() {
            return this.symbolType == SymbolId.C2;
        }
    })
    public normalPos: Vec3 = new Vec3();

    @property({
        type: Font,
        visible() {
            return this.symbolType == SymbolId.C2;
        }
    })
    public goldFont: Font | null = null;

    @property({
        type: Font,
        visible() {
            return this.symbolType == SymbolId.C2;
        }
    })
    public multipleFont: Font | null = null;

    @property({
        type: Font,
        visible() {
            return this.symbolType == SymbolId.C1;
        }
    })
    public baseFont: Font | null = null;

    @property({
        type: Font,
        visible() {
            return this.symbolType == SymbolId.C1;
        }
    })
    public specialFont: Font | null = null;

    public lockType: LockType = LockType.NONE;

    public isSpecialFont: boolean = false;

    public multiple: number = 0;

    public credit: number = 0;

    public reSpinNum: number = 0;

    public symbolId: number = 0;

    public language: string = '';

    public isOmniChannel: boolean = false;
}
