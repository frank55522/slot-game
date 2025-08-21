import { _decorator, Component, Node, Vec3 } from 'cc';
import { SymbolPartType } from '../../../vo/enum/Reel';
const { ccclass, property } = _decorator;

@ccclass('OverlaySymbolContainer')
export class OverlaySymbolContainer extends Component {
    private _child: Map<SymbolPartType, Node> | null = null;

    private get child(): Map<SymbolPartType, Node> {
        if (this._child == null) {
            this._child = new Map<SymbolPartType, Node>();
        }
        return this._child;
    }

    public getPartParent(partType: SymbolPartType): Node {
        let partParent = this.child.get(partType);
        if (partParent == null) {
            partParent = this.createPartParent(partType);
        }
        return partParent;
    }

    private createPartParent(partType: SymbolPartType): Node {
        let partParent = new Node();
        this.node.addChild(partParent);
        partParent.name = SymbolPartType[partType];
        partParent!.setPosition(new Vec3());
        this.child.set(partType, partParent);
        return partParent;
    }
}
