/**
 * 提供前端訊息視窗使用
 */
export class CoreMsgCode {
    /**
     * SmartFox觸發斷線
     *
     * @static
     * @default 1
     */
    public static readonly ERR_SFS_DISCONNECT: number = 1;
    /**
     * 之前是區分Server維護或是Game維護,現在統一用219 觸發,301暫不使用
     *
     * @static
     * @default 301
     */
    public static readonly ERR_SFS_MAINTENANCE: number = 301;
    /**
     * SmartFox連線逾時
     *
     * @static
     * @default 209
     */
    public static readonly ERR_SFS_CONNECT_TIMEOUT: number = 209;
    /**
     * 當餘額不足時由Server觸發，出現確認視窗
     *
     * @static
     * @default 2
     */
    public static readonly ERR_BALANCE_NOT_ENOUGH: number = 2;
    /**
     * 當餘額不足時由Server觸發，出現ReLoad視窗
     *
     * @static
     * @default 3
     */
    public static readonly ERR_BALANCE_NOT_ENOUGH_AND_RELOAD: number = 3;
    /**
     * TODO:魚機、棋牌與slot的不知代碼有10301與9999，應可統一
     *
     * 當發生不明原因時觸發
     *
     * @static
     * @default 10301
     */
    public static readonly ERR_FAILED_NETWORK: number = 10301;
    /**
     * 遊戲資源載入失敗
     *
     * @static
     * @default 208
     */
    public static readonly ERR_LOAD_RESOURCE: number = 220;
    /**
     * 遊戲資源載入逾時
     *
     * @static
     * @default 207
     */
    public static readonly ERR_TIMEOUT_RES: number = 207;
    /**
     * 遊戲初始化資料失敗
     *
     * @static
     * @default 210
     */
    public static readonly ERR_INIT_REQUEST: number = 210;
    /**
     * 遊戲前置資源載入失敗
     *
     * @static
     * @default 211
     */
    public static readonly ERR_FAILED_PRELOAD: number = 211;
    /**
     * Egret default.res.json載入失敗
     *
     * @static
     * @default 212
     */
    public static readonly ERR_LOAD_RES_JSON: number = 212;
    /**
     * Egret default.thm.json載入失敗
     *
     * @static
     * @default 213
     */
    public static readonly ERR_LOAD_THM_JSON: number = 213;
    /**
     * 正常狀態
     *
     * @static
     * @default 101
     */
    public static readonly ACCOUNT_STATUS_NORMAL: number = 101;
    /**
     * 帳號重覆登入
     *
     * @static
     * @default 102
     */
    public static readonly ACCOUNT_STATUS_MULTIPLE_LOGIN: number = 102;
    /**
     * 帳號停用，無法進入遊戲
     *
     * @static
     * @default 103
     */
    public static readonly ACCOUNT_STATUS_SUSPEND: number = 103;
    /**
     * 鎖帳號，無法登入平台
     *
     * @static
     * @default 104
     */
    public static readonly ACCOUNT_STATUS_LOCKED: number = 104;
    /**
     * 遊戲帳號狀態, 由Server來的訊息碼 + 101
     *
     * @static
     * @default mapping table for account status
     */
    public static readonly ACCOUNT_STATUS: {
        [key: number]: number;
    } = {
        0: CoreMsgCode.ACCOUNT_STATUS_NORMAL,
        1: CoreMsgCode.ACCOUNT_STATUS_MULTIPLE_LOGIN,
        2: CoreMsgCode.ACCOUNT_STATUS_SUSPEND,
        3: CoreMsgCode.ACCOUNT_STATUS_LOCKED
    };
    /**
     * ticketSid is null and gameType (or machineType) is missing
     *
     * @static
     * @default 200
     */
    public static readonly GAME_LOGIN_FAILED_PARAMS: number = 200;
    /**
     * sessionID[3] is empty
     *
     * @static
     * @default 201
     */
    public static readonly GAME_LOGIN_FAILED_DATA: number = 201;
    /**
     * session over time
     *
     * @static
     * @default 202
     */
    public static readonly GAME_LOGIN_TIMEOUT_TICKET: number = 202;
    /**
     * cannot find user in DB
     *
     * @static
     * @default 203
     */
    public static readonly GAME_LOGIN_USER_NOT_FOUND: number = 203;
    /**
     * the user is locked
     *
     * @static
     * @default 204
     */
    public static readonly GAME_LOGIN_USER_LOCKED: number = 204;
    /**
     * the user is suspended
     *
     * @static
     * @default 205
     */
    public static readonly GAME_LOGIN_USER_SUSPENDED: number = 205;
    /**
     * user's web session id and ticket's web session id do not match
     *
     * @static
     * @default 206
     */
    public static readonly GAME_LOGIN_FAILED_USER_ID: number = 206;
    /**
     * user has an unsettled transaction
     *
     * @static
     * @default 216
     */
    public static readonly RUNTIME_MACHINE_COUNT_OVER_LIMIT: number = 216;
    /**
     * game setting not found
     *
     * @static
     * @default 217
     */
    public static readonly GAME_LOGIN_FAILED_GAME_SETTING_NOT_FOUND: number = 217;
    /**
     * game setting format error
     *
     * @static
     * @default 218
     */
    public static readonly GAME_LOGIN_FAILED_GAME_SETTING_FORMAT_ERROR: number = 218;
    /**
     * game maintain
     *
     * @static
     * @default 219
     */
    public static readonly GAME_LOGIN_FAILED_GAME_MAINTAIN: number = 219;
    /**
     * jackpot server not ready
     *
     * @static
     * @default 220
     */
    public static readonly JACKPOT_SERVER_NOT_READY: number = 220;
    /**
     * jackpot group id not correct
     *
     * @static
     * @default 221
     */
    public static readonly JACKPOT_GROUP_ID_NOT_CORRECT: number = 221;
    /**
     * unsettle game
     *
     * @static
     * @default 222
     */
    public static readonly UNSETTLE_GAME: number = 222;
    /**
     * unsettle game machine type error
     *
     * @static
     * @default 223
     */
    public static readonly UNSETTLE_GAME_MACHINE_TYPE_ERROR: number = 223;
    /**
     * cancel bet not complete
     *
     * @static
     * @default 224
     */
    public static readonly CANCEL_BET_NOT_COMPLETE: number = 224;
    /**
     * cancel bet not complete
     *
     * @static
     * @default 225
     */
    public static readonly RECOVERY_DATA_EXPIRE: number = 225;
    /**
     * Some undefined error happened when doing gameLogin
     *
     * @static
     * @default 1199
     */
    public static readonly GAME_LOGIN_UNKNOWN: number = 1199;
    /**
     * 遊戲登入狀態，由Server來的訊息碼 + 200
     *
     * @static
     * @default mapping table for game login
     */
    public static readonly GAME_LOGIN: {
        [key: number]: number;
    } = {
        0: CoreMsgCode.GAME_LOGIN_FAILED_PARAMS,
        1: CoreMsgCode.GAME_LOGIN_FAILED_DATA,
        2: CoreMsgCode.GAME_LOGIN_TIMEOUT_TICKET,
        3: CoreMsgCode.GAME_LOGIN_USER_NOT_FOUND,
        4: CoreMsgCode.GAME_LOGIN_USER_LOCKED,
        5: CoreMsgCode.GAME_LOGIN_USER_SUSPENDED,
        6: CoreMsgCode.GAME_LOGIN_FAILED_USER_ID,
        16: CoreMsgCode.RUNTIME_MACHINE_COUNT_OVER_LIMIT,
        17: CoreMsgCode.GAME_LOGIN_FAILED_GAME_SETTING_NOT_FOUND,
        18: CoreMsgCode.GAME_LOGIN_FAILED_GAME_SETTING_FORMAT_ERROR,
        19: CoreMsgCode.GAME_LOGIN_FAILED_GAME_MAINTAIN,
        20: CoreMsgCode.JACKPOT_SERVER_NOT_READY,
        21: CoreMsgCode.JACKPOT_GROUP_ID_NOT_CORRECT,
        22: CoreMsgCode.UNSETTLE_GAME,
        23: CoreMsgCode.UNSETTLE_GAME_MACHINE_TYPE_ERROR,
        24: CoreMsgCode.CANCEL_BET_NOT_COMPLETE,
        25: CoreMsgCode.RECOVERY_DATA_EXPIRE,
        9999: CoreMsgCode.GAME_LOGIN_UNKNOWN
    };
    /**
     * Normally, when two spins are 15 mins away,
     * the game server will kick out the client.
     * When user is under a free-game mode, the
     * tolerance will extend to 60 mins (except a lucky-draw).
     *
     * @static
     * @default 100
     */
    public static readonly IDLE_REMIND: number = 100;
}
