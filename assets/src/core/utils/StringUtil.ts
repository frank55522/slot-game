import { MathUtil } from './MathUtil';

/**
 * @author Vince vinceyang
 */
export class StringUtil {
    /**
     * 將分數轉為千分位的表示方法
     *
     * @param value 原始數值
     * @param decimalPlace 預設來自於MathUtil.decimalPlace
     */
    public static formatCash(value: number, decimalPlace: number = MathUtil.decimalPlace): string {
        const arr = value.toFixed(decimalPlace).split('.');
        const reg = /(\d{1,3})(?=(\d{3})+$)/gm;
        return arr[0].replace(reg, '$1,') + (arr.length == 2 ? '.' + arr[1] : '');
    }
    /**
     * 將分數轉為千分位的表示方法，不固定小數點位數
     *
     * @param value 原始數值
     * @param decimalPlace 預設來自於MathUtil.decimalPlace
     */
    public static formatFlexibleDecimalCash(value: number): string {
        const arr = value.toString().split('.');
        const reg = /(\d{1,3})(?=(\d{3})+$)/gm;
        return arr[0].replace(reg, '$1,') + (arr.length == 2 ? '.' + arr[1] : '');
    }
    /**
     * 格式化字串，以{0}, {1}, ...代換變數
     *
     * @param text 原始字串
     * @param args 將代入原始字串的參數
     *
     */
    public static format(text: string, ...args: string[]): string {
        const len = args.length;
        for (let i = 0; i < len; i++) {
            text = text.replace(new RegExp('\\{' + String(i) + '\\}', 'gm'), args[i]);
        }
        return text;
    }
}
