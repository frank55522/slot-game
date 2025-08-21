import { Logger } from '../../core/utils/Logger';
import { WinBoardData } from '../vo/data/WinBoardData';
import { GameDataProxy } from './GameDataProxy';

/**
 * 這隻負責滾分相關業務，之後可以思考把邏輯改給Command
 * 暫時先丟到這邊
 */
export class CreditDataProxy extends puremvc.Proxy {
    public static NAME: string = 'CreditDataProxy';
    public constructor() {
        super(CreditDataProxy.NAME);
    }

    /** 取得大獎資料
     * @param totalAmount 總分
     * @param bigWinType 滾分階層
     */
    // public getGradeWinData(totalAmount: number, bigWinType: BigWinType, time: number): WinBoardData {
    //     //取得中獎狀態與相關賠率
    //     const betAmount: number = this.gameDataProxy.curTotalBet;
    //     //建立相關參數
    //     const startAmount: number = 0;

    //     let amount: number = totalAmount;
    //     let winRankType: number;
    //     //處理大獎面板相關資料
    //     switch (bigWinType) {
    //         case BigWinType.bigWin:
    //             winRankType = BigWinType.bigWin;
    //             break;
    //         case BigWinType.megaWin:
    //             winRankType = BigWinType.megaWin;
    //             break;
    //         case BigWinType.superWin:
    //             winRankType = BigWinType.superWin;
    //             break;
    //         case BigWinType.jumboWin:
    //             winRankType = BigWinType.jumboWin;
    //             break;
    //         default:
    //             Logger.i('winRankType no match');
    //             break;
    //     }

    //     return this.createWinBoardData(amount, time, winRankType);
    // }

    /**
     * 製作 winboard 顯示用data
     * @param  {number} _totalAmount
     * @param  {number} _time
     * @param  {number} _winBoardType
     * @returns WinBoardData
     */
    protected createWinBoardData(_totalAmount: number, _time: number, _winBoardType: number): WinBoardData {
        let winBoardData: WinBoardData = new WinBoardData();
        winBoardData._type = _winBoardType;
        winBoardData._startAmount = 0;
        winBoardData._totalAmount = _totalAmount;
        winBoardData._runningTime = _time;
        return winBoardData;
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
