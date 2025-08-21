import { _decorator, Node, instantiate, NodePool, Prefab } from 'cc';
const { ccclass } = _decorator;

@ccclass('PoolManager')
export class PoolManager {
    dictPool: { [name: string]: NodePool } = {};
    // dictPrefab: { [name: string]: Prefab } = {};

    static _instance: PoolManager;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new PoolManager();
        return this._instance;
    }

    getNode(prefab: Prefab, parent: Node) {
        let name = prefab.data.name;
        // this.dictPrefab[name] = prefab;
        let node: Node = this.getPool(name).get() ?? instantiate(prefab);

        node.parent = parent;
        return node;
    }

    putNode(node: Node) {
        let name = node.name;
        this.getPool(name).put(node);
    }

    getPool (name: string) : NodePool {
        if (!this.dictPool.hasOwnProperty(name)) {
            this.dictPool[name] = new NodePool();
        }
        return this.dictPool[name];
    }

    clearPool(name: string) {
        if (this.dictPool.hasOwnProperty(name)) {
            let pool = this.dictPool[name];
            pool.clear();
        }
    }
}
