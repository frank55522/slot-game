import { _decorator, Component } from 'cc';
import { SymbolData } from '../../vo/match/ReelMatchInfo';
const { ccclass, property } = _decorator;

@ccclass('SymbolDataPlist')
export class SymbolDataPlist extends Component {
    //// Internal Member
    @property({ type: [SymbolData], visible: true })
    private list: Array<SymbolData> = [];
    private pool: { [key: string]: SymbolData } = {};

    ////

    //// property
    ////

    ////API
    public getDataById(id: number) {
        return this.pool[id];
    }

    public getDataByIndex(index: number) {
        return this.list[index];
    }
    ////

    //// Hook
    onLoad() {
        for (let i = 0; i < this.list.length; i++) {
            this.pool[this.list[i].id] = this.list[i];
        }
    }

    ////

    ////Internal Method
    ////
}
