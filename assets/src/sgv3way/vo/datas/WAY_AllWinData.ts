import { MathUtil } from '../../../core/utils/MathUtil';
import { TSMap } from '../../../core/utils/TSMap';
import { AllWinData } from '../../../sgv3/vo/data/AllWinData';
import { SymbolInfo } from '../../../sgv3/vo/info/SymbolInfo';
import { WAY_WinInfo } from '../WAY_WinInfo';

export class WAY_AllWinData extends AllWinData {
    public wayInfos: WAY_WinInfo[];

    /** 清除內容 */
    public dispose(): void {
        this.wayInfos = [];
        this.specialInfos = [];
        this.animationInfos = new TSMap<string, SymbolInfo>();
        this._totalAmount = 0;
    }

    /** 複製內容 */
    public concat(): WAY_AllWinData {
        let _allWinData = new WAY_AllWinData();
        _allWinData.specialInfos = this.specialInfos.concat();
        _allWinData.animationInfos = this.animationInfos;
        _allWinData.wayInfos = this.wayInfos.concat();
        return _allWinData;
    }

    /** 總贏分金額 */
    public totalAmount(): number {
        this._totalAmount = 0;
        this.accuLineWin();
        // 不需要再重複計算 special 贏分已包含在wayInfo
        // this.calSpecialScreenWin();
        return this._totalAmount;
    }

    protected accuLineWin() {
        let i: number = 0;
        while (i < this.wayInfos.length) {
            this._totalAmount = MathUtil.add(this._totalAmount, this.wayInfos[i].symbolWin);
            i++;
        }
    }

    /**
     * 計算特殊贏分
     * @author
     */
    protected calSpecialScreenWin(): void {
        let i: number = 0;
        while (i < this.specialInfos.length) {
            this._totalAmount = MathUtil.add(this._totalAmount, this.specialInfos[i].specialScreenWin);
            i++;
        }
    }
}
