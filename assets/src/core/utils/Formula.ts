import { Logger } from './Logger';
export class Formula {
    public static loggerClassContent<T>(target: any, name: string = '') {
        const objectKeys = Object.keys(target) as Array<keyof T>;
        let logString = '';
        for (let key of objectKeys) {
            logString += '[' + key + ']: ' + target[key] + '\n';
        }
        Logger.d('Name: ' + name + '\n' + logString);
    }

    /** 隨機從0到endValue(包含endValue)取一數字
     * endValue: 亂數結尾值(需為正整數)
     */
    public static getRndInt(endValue: number) {
        let rnd = Math.floor(Math.random() * (endValue - 0.001));
        return rnd;
    }

    /**
     * 小數點第6位做四捨五入避免精度問題
     */
    public static getMoneyResolveFloat(source: number) {
        return Math.round(source * 1000000) / 1000000;
    }
}
