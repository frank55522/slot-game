import { RefactoringGameData } from '../../core/utils/RefactoringGameData';
import { Logger } from '../../core/utils/Logger';
import { GameDataProxy } from '../proxy/GameDataProxy';
import { GameProxyEvent } from '../vo/event/GameProxyEvent';
import { InitEvent } from '../vo/event/InitEvent';
import { NetworkProxy } from '../../core/proxy/NetworkProxy';
import { RecoveryData } from '../vo/data/RecoveryData';
import { AfterReconnectionCommand } from './connect/AfterReconnectionCommand';
import { BalanceUtil } from '../util/BalanceUtil';
import { MathUtil } from 'src/core/utils/MathUtil';

/**
 * 遊戲初始化的parser
 */
export class InitEventCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'h5.initResponse';

    public execute(notification: puremvc.INotification): void {
        let json = notification.getBody();

        Logger.i(JSON.stringify(json));

        let initEventData: InitEvent = json as InitEvent;
        this.gameDataProxy.initEventData = initEventData;
        this.gameDataProxy.initEventData.gameStateSettings =
            RefactoringGameData.RefactoringGameStateSetting(initEventData);
        if (!this.gameDataProxy.isOmniChannel()) {
            BalanceUtil.dollarSign = '';
        } else {
            this.convertDenomMultiplier();
        }
        //取得本機 儲存的押注組合
        this.gameDataProxy.loadUserSetting();

        /** 檢查 Recovery 資料，並且還原回對應的Proxy */
        if (initEventData.gameSeqNo != undefined && initEventData.spinResult != undefined) {
            this.gameDataProxy.spinSequenceNumber = initEventData.gameSeqNo;
            this.gameDataProxy.spinEventData = initEventData.spinResult;
            this.gameDataProxy.spinEventData.gameStateResult = RefactoringGameData.RefactoringGameResult(
                initEventData.spinResult
            );

            if (initEventData.recoveryData == undefined || initEventData.recoveryData == '') {
                // BaseGame沒有save的Data資料.
                // 前端這邊自己new RecoveryData.
                this.gameDataProxy.reStateResult = new RecoveryData();
            } else {
                // 取得Server傳送的save的Data資料5
                let recoveryData = JSON.parse(initEventData.recoveryData);
                this.gameDataProxy.reStateResult = recoveryData;
                //this.networkProxy.resetSettlePlayState();
                //this.networkProxy.sendSettlePlay(this.gameDataProxy._tempWonCredit);
            }

            Logger.i('recovery data: receive complete');
        } else {
            Logger.i('recovery data: not received');
        }

        this.endInit();
    }

    /** init 結束通知 */
    protected endInit() {
        if (this.gameDataProxy.isReconnecting) {
            this.sendNotification(AfterReconnectionCommand.NAME);
        } else {
            this.sendNotification(GameProxyEvent.RESPONSE_INIT);
        }
    }

    protected convertDenomMultiplier() {
        const denom = this.gameDataProxy.initEventData.denoms[0];
        let denomMultiplier = this.gameDataProxy.initEventData.denomMultiplier;
        for (let i = 0; i < denomMultiplier.length; i++) {
            denomMultiplier[i] = MathUtil.mul(denomMultiplier[i], denom, 0.001);
        }
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _networkProxy: NetworkProxy;
    protected get networkProxy(): NetworkProxy {
        if (!this._networkProxy) {
            this._networkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._networkProxy;
    }
}
