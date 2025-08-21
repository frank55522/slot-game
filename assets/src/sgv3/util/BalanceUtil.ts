import { MathUtil } from '../../core/utils/MathUtil';
import { StringUtil } from '../../core/utils/StringUtil';

export class BalanceUtil {
    private static _dollarSign: string = '';

    public static set dollarSign(dollarSign: string) {
        this._dollarSign = dollarSign;
    }

    public static get dollarSign() {
        return this.getDollarSignWithCurrency(this._dollarSign);
    }

    public static get dollarISO() {
        if (this._dollarSign != '') return this._dollarSign;
        else return '';
    }
    /**
     * 將cash無條件捨去後再轉換顯示給玩家的cash樣式
     *
     * @param cash 錢
     * @returns 格式化後的金錢樣式
     */
    public static formatBalance(cash: number): string {
        const value = MathUtil.floor(cash, MathUtil.decimalPlace);

        return StringUtil.formatCash(value, MathUtil.decimalPlace);
    }

    /**
     * 將cash無條件捨去後再轉換顯示給玩家的cash樣式，不固定小數點位數
     *
     * @param cash 錢
     * @returns 格式化後的金錢樣式
     */
    public static formatFlexibleDecimalBalance(cash: number): string {
        const value = MathUtil.floor(cash, MathUtil.decimalPlace);

        return StringUtil.formatFlexibleDecimalCash(value);
    }

    /**
     * 將cash無條件捨去後再轉換顯示給玩家的cash樣式，增加K及M的單位，並一律捨去單位的小數點
     *
     * @param cash 錢
     * @returns 格式化後的金錢樣式
     */
    public static formatBalanceWithExpressingUnits(cash: number): string {
        let formatValue: string = '';
        let expressingWord: string = '';
        let expressingUnit: number = 1;
        const kThreshold: number = 1000; // K (thousand) : 1000
        const mThreshold: number = 1000000; // M (million) : 1000000
        if (cash >= kThreshold) {
            expressingUnit = cash >= mThreshold ? mThreshold : kThreshold;
            expressingWord = cash >= mThreshold ? 'M' : 'K';
        }

        const convertValue: number = MathUtil.div(cash, expressingUnit);
        const integerValue: number = MathUtil.floor(convertValue, 0);
        const decimalPlacesValue: number = MathUtil.floor(
            MathUtil.sub(convertValue, integerValue),
            MathUtil.decimalPlace
        );
        if (decimalPlacesValue > 0) {
            let remainderString: string[] = decimalPlacesValue.toString().split('.');
            formatValue = StringUtil.formatCash(integerValue, 0) + '.' + remainderString[1];
        } else {
            formatValue = StringUtil.formatCash(integerValue, 0);
        }
        if (cash >= kThreshold) formatValue += expressingWord;

        return formatValue;
    }

    public static formatBalanceWithDollarSign(cash: number, hasDecimal: boolean = true): string {
        let dollarSign = this.dollarSign;
        const value = MathUtil.floor(cash, MathUtil.decimalPlace);

        return dollarSign + StringUtil.formatCash(value, hasDecimal ? MathUtil.decimalPlace : 0);
    }

    public static getDollarSignWithCurrency(currency: string): string {
        let dollarSignMapping = {
            THB: 'A',
            HKD: 'B',
            INR: 'C',
            IDR: 'D',
            VND: 'E',
            MYR: 'F',
            SGD: 'G',
            USD: '$',
            BDT: 'H',
            PKR: 'I',
            MMK: 'J',
            CNY: 'K',
            PHP: 'L',
            MXN: 'N',
            BRL: 'O'
        };
        return dollarSignMapping[currency] ? dollarSignMapping[currency] : '';
    }
}
