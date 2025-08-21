import { DEBUG } from 'cc/env';

/**
 * 提供debug、info、warning、Kibana的訊息型態
 *
 * @author Vince vinceyang
 */
export class Logger {
    /**
     * 開啟info、warn的訊息
     *
     * @default false
     */
    public static enable: boolean = true;
    /**
     * Kibana訊息的基本參數，經由Logger.init()初始化
     *
     * @default undefined
     */
    public static kibanaLogBase: CoreKibanaLog;
    /**
     * 格式化Debug訊息
     *
     * @default undefined
     * @param msg string
     * @param obj iLogger
     * @returns message
     */
    public static formatDebug: Function;
    /**
     * 格式化Infomation訊息
     *
     * @default undefined
     * @param msg string
     * @param obj iLogger
     * @returns message
     */
    public static formatInfo: Function;
    /**
     * 格式化Warning訊息
     *
     * @default undefined
     * @param msg string
     * @param obj iLogger
     * @returns message
     */
    public static formatWarn: Function;
    /**
     * 格式化Error訊息
     *
     * @default undefined
     * @param msg string
     * @param obj iLogger
     * @returns message
     */
    public static formatError: Function;
    /**
     * 使用Kibana前所需的初始化
     *
     * @param logType 提供Kibana分類訊息種類
     * @param gameType
     * @param machineType
     */
    public static init(logType: string, gameType: string, machineType: string): void {
        if (!Logger.kibanaLogBase) {
            Logger.kibanaLogBase = new CoreKibanaLog();
        }
        Logger.kibanaLogBase.logType = logType;
        Logger.kibanaLogBase.logId = new Date().getTime();
        Logger.kibanaLogBase.gameType = gameType;
        Logger.kibanaLogBase.machineType = machineType;
        Logger.kibanaLogBase.host = window.location.host;
        Logger.kibanaLogBase.isMobile = window['isMobile'];
        Logger.kibanaLogBase.userAgent = navigator.userAgent;
    }
    private static formatMessage(msg: string, obj: iLogger, fun: Function): string {
        if (obj) {
            if (fun) {
                return fun(msg, obj);
            } else {
                return '[' + obj.constructor['name'] + '] ' + msg;
            }
        } else {
            return msg;
        }
    }
    /**
     * 顯示debug訊息，開發模式下顯示，可藉由iLogger定義是否要顯示此次log
     *
     * @param msg debug log
     * @param obj
     */
    public static d(msg: string, obj?: iLogger): void {
        if (!DEBUG || (obj && !obj.hasLog)) return;
        console.log(Logger.formatMessage(msg, obj, Logger.formatDebug));
    }
    /**
     * Logger().enable為true時，顯示info訊息
     *
     * @param msg info log
     * @param obj TBD
     */
    public static i(msg: string, obj?: iLogger): void {
        if (!Logger.enable) return;
        console.log(Logger.formatMessage(msg, obj, Logger.formatInfo));
    }
    /**
     * Logger().enable為true時，顯示warn訊息
     *
     * @param msg warn log
     * @param obj TBD
     */
    public static w(msg: string, obj?: iLogger): void {
        if (!Logger.enable) return;
        console.warn(Logger.formatMessage(msg, obj, Logger.formatWarn));
    }
    /**
     * 顯示error訊息，任何情況下都會被顯示
     *
     * @param msg error log
     */
    public static e(msg: string, obj?: iLogger): void {
        msg = Logger.formatMessage(msg, obj, Logger.formatError);
        console.error(msg);
        if (Logger._e) {
            Logger._e(msg);
        }
    }
    /**
     * 客製在Error log觸發時額外的動作
     *
     * @param msg error log
     */
    private static _e(msg: string): void {}
    /**
     * 將訊息推送到訊息系統，需先執行Logger.init()才會被開啟
     *
     * @param msg Kibana log
     */
    public static kibana(msg: CoreKibanaLog): void {
        if (!Logger.kibanaLogBase) {
            throw Error('Please invoke Logger.init() first');
        }
        const log = Logger.kibanaLogBase;
        msg.logType = log.logType;
        msg.logId = log.logId;
        msg.gameType = log.gameType;
        msg.machineType = log.machineType;
        msg.host = log.host;
        msg.isMobile = log.isMobile;
        msg.userAgent = log.userAgent;
        if (window['callBackLog'] && window['callBackLog']['h5Log']) {
            window['callBackLog']['h5Log'](JSON.stringify(msg));
        } else {
            throw Error('Kibana protocoal can not find');
        }
    }
}
/**
 * 基本的KibanaLog類別，可透過繼承增加log內容
 */
export class CoreKibanaLog {
    /**
     * Log的類別，用以分辨不同遊戲
     *
     * @default undefined
     */
    logType: string;
    /**
     * Log編號，預設為timestamp
     *
     * @default -1
     */
    logId: number = -1;
    /**
     * 遊戲種類
     *
     * @default undefined
     */
    gameType: string;
    /**
     * 遊戲編號
     *
     * @default undefined
     */
    machineType: string;
    /**
     * 服務器位址
     *
     * @default undefined
     */
    host: string;
    /**
     * 裝置種類
     *
     * @default true 為移動式裝置
     */
    isMobile: boolean;
    /**
     * 瀏覽器種類
     *
     * @default undefined
     */
    userAgent: string;
}
/**
 * 使用log方法時，提供Logger額外的參數
 */
export interface iLogger {
    /**
     * 在DEBUG模式下，控制log是否要顯示
     *
     * Ex.
     *
     *	export class ClassA implements iLogger
     *	{
     *		public hasLog: boolean = true;
     *	}
     *
     * @param hasLog true 顯示log
     */
    hasLog: boolean;
}
