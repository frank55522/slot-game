import { Game2EndCommand } from '../../../sgv3/command/state/Game2EndCommand';
import { FreeGameOneRoundResult } from '../../../sgv3/vo/result/FreeGameOneRoundResult';
import { WAY_GameDataProxy } from '../../proxy/WAY_GameDataProxy';

export class WAY_Game2EndCommand extends Game2EndCommand {
    /** 最後轉場回去要顯示在贏分線上處理 */
    protected endShowWinProcess() {
        let roundResult: FreeGameOneRoundResult = this.gameDataProxy.curRoundResult as FreeGameOneRoundResult;
        this.gameDataProxy.stateWinData.wayInfos[0].symbolWin = this.gameDataProxy.convertCredit2Cash(
            roundResult.displayLogicInfo.afterAccumulateWinWithBaseGameWin
        );
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: WAY_GameDataProxy;
    protected get gameDataProxy(): WAY_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(WAY_GameDataProxy.NAME) as WAY_GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
