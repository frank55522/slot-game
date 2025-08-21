import { Logger } from '../../../core/utils/Logger';
import { MsgCode } from '../../constants/MsgCode';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';
import { ReelEvent } from '../../util/Constant';
import { SymbolErrorLog } from '../../vo/log/SymbolErrorLog';
import { StripIndexer } from '../../vo/match/ReelMatchInfo';

export class CheckScreenSymbolCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'CheckScreenSymbolCommand';

    public execute(notification: puremvc.INotification): void {
        const stopInfo = notification.getBody() as StripIndexer;
        const self = this;

        if (self.checkSymbolReelsError(stopInfo)) {
            // 這邊檢查錯誤如果錯誤就直接狂滾
            self.handlerError(stopInfo);
            self.sendNotification(ReelEvent.ON_SINGLE_REEL_STOP_ERROR, stopInfo.reelIndex);
        }
    }

    /**
     * 處理錯誤訊息
     * @param info 停輪資訊
     * */
    public handlerError(info: StripIndexer): void {
        const self = this;
        (self.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy).sendMsgCode(MsgCode.ERR_SYMBOL_NOTMATCH);
        const reelDataProxy = self.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        const logData = new SymbolErrorLog();
        logData.errorCode = MsgCode.ERR_SYMBOL_NOTMATCH;
        logData.autoPlayMode = self.gameDataProxy.onAutoPlay;
        logData.turboMode = reelDataProxy.isQuickSpin;
        logData.reelIndex = info.reelIndex;
        logData.reelRng = info.targetRng;
        logData.strip = info.strip;

        Logger.init('[slot_screenSymbolError]', self.gameDataProxy.gameType, self.gameDataProxy.machineType);
        Logger.kibana(logData);
    }

    public adjustSuplementArrays(matchArray: number[][], suplementSize: number): number[][] {
        for (let index = 0; index < suplementSize; index++) {
            matchArray.push([]);
        }
        return matchArray;
    }

    /**
     * 該功能會檢查滾停是否正確
     * ※比對Rng正確性
     * */
    public checkSymbolReelsError(info: StripIndexer): boolean {
        const self = this;
        let result = false;
        if (!self.gameDataProxy.curRoundResult) return false;
        if (
            info.targetRng < 0 ||
            info.targetRng >= info.strip.length ||
            self.gameDataProxy.getCurrentReelSymbolIDIndexByID(info.strip[info.targetRng]) < 0
        ) {
            return true;
        }

        return result;
    }

    /**
     * 比較id跟frameid是否一致
     * */
    public compareArray(stripIds: number[], symbolIds: number[]): any {
        let index = 0;
        let result = true;
        for (index = 0; index < stripIds.length; index++) {
            if (stripIds[index] != symbolIds[index]) {
                result = false;
                break;
            }
        }
        return result;
    }

    /**
     * ※ut
     * 處理陣列去頭去尾
     * 無法處理 則會回傳原本陣列
     * @param target 待處理陣列
     * @param shift 處理數量
     * */
    public truncateBothEnds(target: number[], shift: number = 1): number[] {
        if (shift > 0 && target.length > 1 && target.length >= Math.pow(shift, 2)) {
            return target.slice(shift, target.length - shift);
        } else {
            return target;
        }
    }

    /**
     * ※ut
     * 移動陣列數值
     * @param input 目標陣列
     * @param shift 位移量
     * */
    public shiftArrayValue(input: any[], shift: number = -1): number[] {
        if (shift != 0 && input.length > 0) {
            return input.map((x) => x + shift);
        } else {
            return input;
        }
    }

    /**
     * ※ ut
     * 判斷target之前需要補多少空白
     * @param targetIndex 檢查的index
     * @param matchArray 對應的reel array
     * */
    public getInitArrayQuantity(targetIndex: number, matchArray: number[][]): number {
        let result = -1;
        if (matchArray.length == 0) {
            result = targetIndex + 1;
        } else {
            const checkSum = targetIndex + 1 - matchArray.length;
            result = checkSum > 0 ? checkSum : 0;
        }
        return result;
    }

    /**
     * ※ ut
     * 判斷inputArray之後需要補多少空白陣列
     * @param targetIndex 檢查的index
     * @param matchArray 對應的reel array
     * */
    public getSupplementArrayQuantity(total: number, inputArray: number[][]): number {
        if (total != 0) {
            const data = total - inputArray.length;
            return data < 0 ? 0 : data;
        }
        return 0;
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
