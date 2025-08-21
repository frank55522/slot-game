/**
 * @author Vince vinceyang
 */
export class MathUtil {
    /**
     * 作位數轉換時的預設小數點位數。預設為2
     *
     * @default 2
     */
    public static decimalPlace = 2;
    /**
     * @param min greater or equal
     * @param max less than or equal
     *
     * @returns result
     */
    public static randomBetween(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /**
     *  加法
     *
     * @param values 相加數
     *
     * @returns 相加結果
     */
    public static add(...values: number[]): number {
        let result = values[0];
        const len = values.length;
        for (let i = 1; i < len; i++) {
            const value = values[i];
            const v1Arr = result.toString().split('.');
            const v2Arr = value.toString().split('.');
            const d1 = v1Arr.length == 2 ? v1Arr[1].length : 0;
            const d2 = v2Arr.length == 2 ? v2Arr[1].length : 0;
            const maxLen = Math.max(d1, d2);
            const shiftDigit = Math.pow(10, maxLen);
            result = Number(((result * shiftDigit + value * shiftDigit) / shiftDigit).toFixed(maxLen));
        }
        return result;
    }
    /**
     * 減法
     *
     * @param values 相減數
     *
     * @returns 相減結果
     */
    public static sub(...values: number[]): number {
        let result = values[0];
        const len = values.length;
        for (let i = 1; i < len; i++) {
            let value = MathUtil.mul(values[i], -1);
            result = MathUtil.add(result, value);
        }
        return result;
    }
    /**
     * 乘法
     *
     * @param value 相乘數
     *
     * @returns 相乘結果
     */
    public static mul(...values: number[]): number {
        let result: number = values[0];
        const len = values.length;
        for (let i = 1; i < len; i++) {
            const value = values[i];
            const v1Arr = result.toString().split('.');
            const v2Arr = value.toString().split('.');
            const d1 = v1Arr.length == 2 ? v1Arr[1].length : 0;
            const d2 = v2Arr.length == 2 ? v2Arr[1].length : 0;
            const decimalLength = d1 + d2;
            const v1 = Number(String(result).replace(',', '').replace('.', ''));
            const v2 = Number(String(value).replace('.', ''));
            result = (v1 * v2) / Math.pow(10, decimalLength);
        }
        return result;
    }
    /**
     * 除法
     *
     * @param value 相除數
     *
     * @returns 相除結果
     */
    public static div(...values: number[]): number {
        let result = values[0];
        const len = values.length;
        for (let i = 1; i < values.length; i++) {
            const value = values[i];
            const v1Arr = result.toString().split('.');
            const v2Arr = value.toString().split('.');
            const d1 = v1Arr.length == 2 ? v1Arr[1].length : 0;
            const d2 = v2Arr.length == 2 ? v2Arr[1].length : 0;
            const decimalLength = d2 - d1;
            const v1 = Number(String(result).replace('.', ''));
            const v2 = Number(String(value).replace('.', ''));
            result = this.mul(v1 / v2, Math.pow(10, decimalLength));
        }
        return Number(result);
    }
    /**
     * 取得無條件捨去指定小數位數之後值的結果
     *
     * @param value 未處理數值
     */
    public static floor(value: number, digit: number = MathUtil.decimalPlace): number {
        let decimalPow = Math.pow(10, digit);
        let nDecimalPow = Math.pow(10, -digit);
        return MathUtil.mul(Math.floor(MathUtil.mul(value, decimalPow)), nDecimalPow);
    }
    /**
     * 取得無條件進位指定小數位數之後值的結果
     *
     * @param value 未處理數值
     */
    public static ceil(value: number, digit: number = MathUtil.decimalPlace): number {
        let decimalPow = Math.pow(10, digit);
        let nDecimalPow = Math.pow(10, -digit);
        return MathUtil.mul(Math.ceil(MathUtil.mul(value, decimalPow)), nDecimalPow);
    }
    /**
     * 取得四捨五入指定小數位數之後值的結果
     *
     * @param value 未處理數值
     */
    public static round(value: number, digit: number = MathUtil.decimalPlace): number {
        let decimalPow = Math.pow(10, digit);
        let nDecimalPow = Math.pow(10, -digit);
        return MathUtil.mul(Math.round(MathUtil.mul(value, decimalPow)), nDecimalPow);
    }
}
