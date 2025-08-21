import { TSMap } from '../../../core/utils/TSMap';
import { SpecialWinInfo } from '../info/SpecialWinInfo';
import { SymbolInfo } from '../info/SymbolInfo';

export abstract class AllWinData {
    public specialInfos: SpecialWinInfo[];
    public animationInfos: TSMap<string, SymbolInfo>;
    protected _totalAmount: number = 0;

    public abstract totalAmount();
    public abstract concat(): AllWinData;
    public abstract dispose();
}
