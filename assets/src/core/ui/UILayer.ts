import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UILayer')
export class UILayer extends Component {
    public _uiLayer: Array<Node> | null = null;
    public get uiLayer(): Array<Node> {
        if (this._uiLayer == null) {
            this._uiLayer = this.getAllChildren(this.node);
        }
        return this._uiLayer;
    }

    public changeLayer(layer: number) {
        for (let i in this.uiLayer) {
            this.uiLayer[i].layer = layer;
        }
    }

    // 重抓所有的子節點
    public updateChildren() {
        this._uiLayer = this.getAllChildren(this.node);
    }

    private getAllChildren(obj: Node) {
        let data: Array<Node> = [];
        let child = obj.children;
        data.push(obj);
        for (let i in child) {
            data.push(child[i]);
            if (child[i].children.length > 0) {
                data = data.concat(this.getAllChildren(child[i]));
            }
        }
        return data;
    }
}
