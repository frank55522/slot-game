import { _decorator, Component, Node, Prefab, CCInteger } from 'cc';
import { TSMap } from '../../../../core/utils/TSMap';
import { SymbolFX } from '../../../../game/view/symbol/SymbolFX';
import { PoolManager } from '../../../PoolManager';
import { AppFacade } from 'src/core/AppFacade';
import { GAME_GameDataProxy } from 'src/game/proxy/GAME_GameDataProxy';
const { ccclass, property } = _decorator;

@ccclass('AnimPrefab')
export class AnimPrefab {
    @property({ type: CCInteger, visible: true })
    private _id: number = 0;

    @property({ type: Prefab, visible: true })
    private _anim: Prefab | null = null;

    public get id() {
        return this._id;
    }
    public get prefab() {
        return this._anim;
    }
}

@ccclass('ReelsEffectAnimManager')
export class ReelsEffectAnimManager extends Component {
    @property(AnimPrefab)
    private symbolEffectPrefab: Array<AnimPrefab> = new Array();

    private _pool: TSMap<number,SymbolFX> | null = null;

        public get pool(){
        if(this._pool == null){
            this._pool = new TSMap<number,SymbolFX>();
        }
        return this._pool;
    }

    public get isPlaying(): boolean{
        let anims : Array<SymbolFX> = this.pool.values();
        for(let i=0;i<anims.length;i++){
            if(anims[i].isPlaying){
                return true;
            }
        }
        return false;
    }

    protected _gameDataProxy: GAME_GameDataProxy;
    protected get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = AppFacade.getInstance().retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }
    protected isOmniChannel: boolean = false;

    onLoad() {
        this.isOmniChannel = this.gameDataProxy.isOmniChannel();
    }

    public getAnim(symbolId: number,poolKey: number): Node {
        let anim: Node;
        anim = PoolManager.instance.getNode(this.getPrefab(symbolId), this.node);
        let symbolFX = anim.getComponent(SymbolFX);
        symbolFX.isOmniChannel = this.isOmniChannel;
        this.pool.set(poolKey, symbolFX);
        anim.active = false;
        return anim;
    }

    public putAnim(key: number) {
        let anim =  this.pool.get(key);
        anim.skip();
        PoolManager.instance.putNode(anim.node);
        this.pool.delete(key);
    }

    public putAllAnims() {
        this.pool.forEach(anim => {
            anim.skip();
            PoolManager.instance.putNode(anim.node);
        });
        this.pool.clear();
    }

    public sortAllAnim(){
        this.node.children.sort(this.positionYCompare);
        this.node.children.sort(this.positionXCompare);
    }

    private getPrefab(symbolId: number): Prefab{
        for(let i in this.symbolEffectPrefab){
            if(this.symbolEffectPrefab[i].id == symbolId){
                return this.symbolEffectPrefab[i].prefab;
            }
        }
        return null;
    }

    private positionYCompare(s1: Node, s2: Node){
        if (s1.position.y < s2.position.y) {
            return 1;
        } else if (s1.position.y > s2.position.y) {
            return -1;
        }
        return 0;
    }

    private positionXCompare(s1: Node, s2: Node){
        if (s1.position.x < s2.position.x) {
            return -1;
        } else if (s1.position.x > s2.position.x) {
            return 1;
        }
        return 0;
    }
}
