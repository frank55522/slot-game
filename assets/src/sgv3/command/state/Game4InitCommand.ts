import { UIEvent } from 'common-ui/proxy/UIEvent';
import { Logger } from '../../../core/utils/Logger';
import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WinEvent, ViewMediatorEvent, ReelEvent, StateWinEvent } from '../../util/Constant';
import { LockType, SymbolId } from '../../vo/enum/Reel';
import { SymbolInfo } from '../../vo/info/SymbolInfo';
import { BaseGameResult } from '../../vo/result/BaseGameResult';
import { TopUpGameOneRoundResult } from '../../vo/result/TopUpGameOneRoundResult';
import { StateCommand } from './StateCommand';
import { ButtonName } from 'common-ui/proxy/UIEnums';
import { SpinButton } from 'common-ui/view/SpinButton';
import { SpecialFeatureResult } from 'src/sgv3/vo/result/SpecialFeatureResult';
import { SpecialHitInfo } from 'src/sgv3/vo/enum/SpecialHitInfo';

export class Game4InitCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME4_EV_INIT;

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        let cashAmount = 0;
        let baseOneRoundResult = this.gameDataProxy.spinEventData.baseGameResult as BaseGameResult;
        let topUpGameOneRoundResult = this.gameDataProxy.curRoundResult as TopUpGameOneRoundResult;

        this.sendNotification(ReelEvent.ON_REELS_INIT); //Reel ByGame資料 Init
        this.sendNotification(UIEvent.CHANGE_BUTTON_STATE, { name: ButtonName.SPIN, state: SpinButton.STATUS_IDLE });

        if (this.gameDataProxy.reStateResult) {
            this.sendNotification(ReelEvent.ON_REELS_RESTORE, this.gameDataProxy.curRoundResult); // Restore Reel ByGame資料
            this.showHoldSpinWin();
            this.sendNotification(ViewMediatorEvent.SHOW_FREE_SPIN_MSG); //顯示Free Spin次數的UI
            this.sendNotification(StateWinEvent.ON_GAME4_TRANSITIONS, false); //通知轉場
            this.changeState(StateMachineProxy.GAME4_IDLE);
            return;
        }

        if (this.gameDataProxy.curRoundResult) {
            cashAmount = this.gameDataProxy.convertCredit2Cash(baseOneRoundResult.baseGameTotalWin);

            // 剛進入FreeGame場景時，重置盤面(※中間回來的不用重置盤面)
            if (topUpGameOneRoundResult.roundInfo.roundNumber == 1) {
                if (this.isHitGrand()) this.gameDataProxy.checkJackpotPool();
                this.sendNotification(WinEvent.FORCE_WIN_DISPOSE);
                this.sendNotification(WinEvent.FORCE_UPDATE_WIN_LABEL, cashAmount);
            }
            this.showHoldSpinWin();
            this.sendNotification(ViewMediatorEvent.SHOW_FREE_SPIN_MSG); //顯示Free Spin次數的UI
            this.sendNotification(ViewMediatorEvent.SHOW_WON_SPIN_DATA, topUpGameOneRoundResult.roundInfo.totalRound);
        } else {
            Logger.w('非正常流程進入 ' + this.gameDataProxy.curScene);
        }
    }

    protected isHitGrand() {
        let isHitGrand = false;
        const hasBonus02 = (result: SpecialFeatureResult) =>
            result.specialHitInfo === SpecialHitInfo[SpecialHitInfo.bonusGame_02];
        const totalRound = this.gameDataProxy.spinEventData.topUpGameResult.totalRound;
        const lastRoundResult =
            this.gameDataProxy.spinEventData.topUpGameResult.topUpGameOneRoundResult[totalRound - 1];
        isHitGrand = lastRoundResult.specialFeatureResult.some(hasBonus02);
        return isHitGrand;
    }

    protected showHoldSpinWin() {
        let curResult = this.reelDataProxy.symbolFeature;
        let symbolInfos = new Array<SymbolInfo>();
        for (let x = 0; x < curResult.length; x++) {
            for (let y = 0; y < curResult[x].length; y++) {
                if (curResult[x][y].lockType == LockType.BASE_LOCK) {
                    let symbolInfo = new SymbolInfo();
                    symbolInfo.sid = SymbolId.C1;
                    symbolInfo.x = x;
                    symbolInfo.y = y;
                    symbolInfos.push(symbolInfo);
                } else if (curResult[x][y].lockType == LockType.OLD_LOCK) {
                    let symbolInfo = new SymbolInfo();
                    symbolInfo.sid = SymbolId.C2;
                    symbolInfo.x = x;
                    symbolInfo.y = y;
                    symbolInfos.push(symbolInfo);
                }
            }
        }
        this.sendNotification(ReelEvent.SHOW_HOLD_SPIN_WIN, symbolInfos);
    }

    // ======================== Get Set ========================
    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }
}
