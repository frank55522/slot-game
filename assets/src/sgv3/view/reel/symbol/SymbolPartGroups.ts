import { _decorator, Component, Node, Enum, Vec3, Material } from 'cc';
import { TSMap } from '../../../../core/utils/TSMap';
import { SymbolPartType } from '../../../vo/enum/Reel';
import { SymbolPart } from './SymbolPart';
const { ccclass, property } = _decorator;

@ccclass('SymbolPartGroups')
export class SymbolPartGroups extends Component {
    @property({ type: Node, visible: true })
    private reelList: Node | null = null;
    @property({ type: [Enum(SymbolPartType)], visible: true })
    private handlePartsType: Array<SymbolPartType> = [];

    private _child: TSMap<SymbolPartType, Node> | null = null;

    private get child(): TSMap<SymbolPartType, Node> {
        if (this._child == null) {
            this._child = new TSMap<SymbolPartType, Node>();
        }
        return this._child;
    }

    public useSharedMaterial: Material | null;

    public getAndSort() {
        let partsPool = this.reelList.getComponentsInChildren(SymbolPart);
        this.useSharedMaterial = partsPool.length > 0 ? partsPool[0].renderable2D.sharedMaterial : null;

        let keys: Array<SymbolPartType> = this.child.keys();

        for (let i in keys) {
            partsPool.forEach((part) => {
                if (part.partType == keys[i]) {
                    part.node.setParent(this.child.get(keys[i]));
                }
            });
        }
    }

    public init() {
        if (this.node.children.length > 0) {
            return;
        }

        for (let i = 0; i < this.handlePartsType.length; i++) {
            let container = new Node();
            this.node.addChild(container);
            container.name = SymbolPartType[this.handlePartsType[i]];
            container!.setPosition(new Vec3());
            this.child.set(this.handlePartsType[i], container);
        }
    }
}
