import { _decorator, Component, Node, resources, JsonAsset } from 'cc';
import { DEBUG } from 'cc/env';
import { SceneManager } from './SceneManager';
const { ccclass, property } = _decorator;

@ccclass('LayerManager')
export class LayerManager extends Component {
    private static _root: Node;
    private static get root(): Node {
        if (!this._root) {
            this._root = SceneManager.instance.node;
        }
        return this._root;
    }
    private static layerOrder: string[] = [];

    private static layerTable = new Map();

    private static loadLayerOrder() {
        resources.load<JsonAsset>('layer-order', (err, rawData) => {
            if (err) {
                console.log(err);
                return;
            }
            rawData.json.forEach((element) => this.layerOrder.push(Math.log2(element.value).toString()));
            this.sortNode();
        });
    }

    private static sortNode() {
        for (let i = this.layerOrder.length - 1; i >= 0; i--) {
            this.root.getChildByName(this.layerOrder[i])?.setSiblingIndex(0);
        }
    }

    static setLayer(comp: Component, order: number = 0) {
        if (this.layerTable.get(comp.node.name) == order) return;
        let targetParent = this.root;
        let views = Array.from(this.layerTable.values());
        if (views.includes(order) && DEBUG) {
            const layerViewMapArray = Array.from(this.layerTable.entries());
            const sameOrderView = layerViewMapArray.find((element) => element[1] == order)[0];
            console.warn(`${comp.node.name} and ${sameOrderView} has same order at ${order} !`);
        }
        this.layerTable.set(comp.node.name, order);
        views = Array.from(this.layerTable.values());
        views.sort((a, b) => {
            return a - b;
        });
        targetParent.insertChild(comp.node, views.indexOf(order));
    }

    // get Parent Node
    // if not exist, create one and insert to root with order
    private static getParent(name: string) {
        let node = this.root.getChildByName(name);
        if (!node) {
            node = new Node(name);
            const children = this.root.children;
            const layerOrder = this.layerOrder;
            const targetIndex = layerOrder.indexOf(name);
            let siblingIndex = 0;
            // 如果物件在最後一個，直接將物件排列在最下面
            // 如果物件在最前面，直接將他排在最上面
            // 如果都不是，先過濾出比自己後面的物件，在搜尋場上如果有的話就穿插該位置，會把原本比自己高的往下擠（先畫）
            if (targetIndex == layerOrder.length - 1) {
                siblingIndex = children.length;
            } else if (targetIndex == 0) {
                siblingIndex = 0;
            } else {
                const checkList = layerOrder.filter((element, index) => index > targetIndex);
                siblingIndex = children.findIndex((value) => checkList.includes(value.name));
            }
            this.root.addChild(node);
            node.setSiblingIndex(siblingIndex);
        }
        return node;
    }
}
