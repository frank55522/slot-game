
import { _decorator, Label, Sprite, Font, SpriteFrame, Vec3, Prefab } from 'cc';
import { SymbolContentBase } from '../../../sgv3/view/reel/symbol/SymbolContentBase';
const { ccclass, property } = _decorator;
 
@ccclass('Game_4_SymbolContent')
export class Game_4_SymbolContent extends SymbolContentBase {
    @property({ type: Label, visible: true })
    public labelText: Label | null = null;
    @property({ type: Sprite, visible: true })
    public reSpinSprite: Sprite | null = null;
    @property({ type: Font, visible: true })
    public baseFont: Font | null = null;
    @property({ type: Font, visible: true })
    public specialFont: Font | null = null;
    @property({ type: Font, visible: true })
    public goldFont: Font | null = null;
    @property({ type: Font, visible: true })
    public multipleFont: Font | null = null;

    @property({ type: [SpriteFrame], visible: true })
    public reSpinSingleFrames: Array<SpriteFrame> = [];

    @property({ type: [SpriteFrame], visible: true })
    public reSpinFrames: Array<SpriteFrame> = [];

    @property({visible: true })
    public hasMultiplePos: Vec3 = new Vec3(0,30,0);

    @property({visible: true })
    public normalPos: Vec3 = new Vec3();

    @property({ type: Prefab, visible: true })
    public particlePrefab: Prefab | null = null;

    public multiple: number = 0;

    public credit: number = 0;

    public ReSpinNum: number = 0;

    public isSpecialFont: boolean = false;
}
