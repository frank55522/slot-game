
import { _decorator, Component, Enum, Node, Renderable2D, Vec3 } from 'cc';
import { SymbolPartType } from '../../../vo/enum/Reel';
const { ccclass, property } = _decorator;
 
@ccclass('SymbolPart')
export class SymbolPart extends Component {
    @property({ type: Enum(SymbolPartType), visible: true })
    public partType: SymbolPartType  = SymbolPartType.MAIN;
    @property({visible: true})
    public offsetPos: Vec3 = new Vec3();
    public defaultParent: Node | null = null;

    private _renderable2D: Renderable2D | null = null;

    public get renderable2D(){
        if(this._renderable2D == null){
            this._renderable2D = this.getComponent(Renderable2D);
        }
        return this._renderable2D;
    }

    public setPartPos(value: Vec3){
        this.node.worldPosition = Vec3.set(
            this.node.worldPosition
            ,value.x + this.offsetPos.x
            ,value.y + this.offsetPos.y
            ,value.z + this.offsetPos.z);
    }
}
