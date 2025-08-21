/** 遊戲場景 */
export class GameScene {
    /** 預設場景 */
    public static readonly Init: string = 'Init';
    /** 載入場景 */
    public static readonly Loading: string = 'Loading';
    /** Game1 */
    public static readonly Game_1: string = 'Game_1';
    /** Game2 */
    public static readonly Game_2: string = 'Game_2';

    /** Game3(mini game) */
    public static readonly Game_3: string = 'Game_3';

    /** Game4(top up game) */
    public static readonly Game_4: string = 'Game_4';
}
export enum GameSceneOption {
    Init,
    Loading,
    Game_1,
    Game_2,
    Game_3,
    Game_4
}
