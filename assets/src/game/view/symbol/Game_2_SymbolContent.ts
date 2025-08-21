import { _decorator, Node, Tween, Label, tween, Font, Prefab, Vec3 } from 'cc';
import { SymbolContentBase } from '../../../sgv3/view/reel/symbol/SymbolContentBase';
import { TimelineTool } from 'TimelineTool';
const { ccclass, property } = _decorator;

@ccclass('Game_2_SymbolContent')
export class Game_2_SymbolContent extends SymbolContentBase {
    @property({ type: Font, visible: true })
    public baseFont: Font | null = null;
    @property({ type: Font, visible: true })
    public specialFont: Font | null = null;
    @property({ type: TimelineTool, visible: true })
    public freeC1: TimelineTool | null = null;
    @property({})
    public C1TrailOffsetPos: Vec3 = new Vec3();
    @property({})
    public C1HitOffsetPos: Vec3 = new Vec3();

    public freeCredit: number = 0;

    public tween: Tween<Node> | null = null;

    public credit: number = 0;

    public isSpecialFont: boolean = false;
}
