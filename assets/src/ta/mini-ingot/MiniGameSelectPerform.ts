import { _decorator, Component, Prefab } from 'cc';
import { UILayout } from '../../core/ui/UILayout';
import { PoolManager } from '../../sgv3/PoolManager';
import { MiniIngot } from './MiniIngot';

const { ccclass, property } = _decorator;

@ccclass('MiniGameSelectPerform')
export class MiniGameSelectPerform extends Component {
    @property({ type: Prefab }) private MiniIngotPrefab: Prefab | null = null;

    @property({ type: UILayout }) private layoutUI: UILayout | null = null;

    @property({ type: Number }) private ingotNumber: number;

    private _MiniIngotPerform: Array<MiniIngot> = new Array<MiniIngot>();

    private get MiniIngotPerform(): MiniIngot[] {
        if (this._MiniIngotPerform.length == 0) {
            for (let i = 0; i < this.ingotNumber; i++) {
                this._MiniIngotPerform.push(
                    PoolManager.instance.getNode(this.MiniIngotPrefab, this.node).getComponent(MiniIngot)
                );
                this._MiniIngotPerform[i].node.name += i;
            }
            this.layoutUI.updateLayout();
        }
        return this._MiniIngotPerform;
    }

    //MiniGame元寶直接出現
    public OnIngotPerformShow() {
        for (let i = 0; i < this.ingotNumber; i++) {
            this.MiniIngotPerform[i].OnIngotShow();
        }
    }
    //MiniGame元寶出現
    public OnIngotPerformPlayShow() {
        for (let i = 0; i < this.ingotNumber; i++) {
            this.MiniIngotPerform[i].OnIngotPlayShow();
        }
    }
    //MiniGame選擇元寶
    public OnIngotPlaySelect(ID: number = 0, JackPotType: number = 0, LanguageType: number = 0, playAnim: boolean) {
        this.MiniIngotPerform[ID].OnIngotPlaySelect(JackPotType, LanguageType, playAnim);
    }
    //MiniGame元寶瞇牌
    public OnIconPlayPrepare(ID: number = 0) {
        this.MiniIngotPerform[ID].OnIconPlayPrepare();
    }
    //MiniGame元寶呈現結果
    public OnIconPlayWin(ID: number = 0) {
        this.MiniIngotPerform[ID].OnIconPlayWin();
    }
    //MiniGame圖示呈現未中獎的結果
    public OnIconPlayNoSelect(ID: number = 0) {
        this.MiniIngotPerform[ID].OnIconPlayNoSelect();
    }

    //MiniGame元寶呈現未中獎的結果
    public OnIngotPlayNoSelect(ID: number = 0) {
        this.MiniIngotPerform[ID].OnIngotPlayNoSelect();
    }

    //MiniGame元寶隱藏
    public OnIconHide() {
        for (let i = 0; i < this._MiniIngotPerform.length; i++) {
            this.MiniIngotPerform[i].OnIconHide();
            this._MiniIngotPerform[i].node.name = this.MiniIngotPrefab.data.name;
            PoolManager.instance.putNode(this.MiniIngotPerform[i].node);
        }
        this._MiniIngotPerform = [];
    }

    public getAllMiniIngot(): MiniIngot[] {
        return this.MiniIngotPerform;
    }
}
