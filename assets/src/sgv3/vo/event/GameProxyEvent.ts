/**
 * 當event command解析完後，發佈給監聽者的事件
 *
 * @export
 * @class GameProxyEvent
 */
export class GameProxyEvent {
    public static RESPONSE_CONNECTION: string = 'RESPONSE_CONNECTION';
    public static RESPONSE_DISCONNECTION: string = 'RESPONSE_DISCONNECTION';
    public static RESPONSE_INIT: string = 'RESPONSE_INIT';
    public static RESPONSE_SPIN: string = 'RESPONSE_SPIN';
    public static RESPONSE_GAMBLE: string = 'RESPONSE_GAMBLE';
    public static RESPONSE_ERROR: string = 'RESPONSE_ERROR';
    public static RESPONSE_GAME_LOGIN_ERROR: string = 'RESPONSE_GAME_LOGIN_ERROR';
}
