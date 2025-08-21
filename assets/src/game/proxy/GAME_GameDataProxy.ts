import { Logger } from '../../core/utils/Logger';
import { StateMachineProxy } from '../../sgv3/proxy/StateMachineProxy';
import { GAME_CommonSetting } from '../vo/config/GAME_CommonSetting';
import { GAME_SceneSetting } from '../vo/config/GAME_SceneSetting';

/** LINE GAME 需要 import的元件 
import { LINE_GameDataProxy } from '../../sgv3line/proxy/LINE_GameDataProxy';
*/

/** WAY GAME 需要 import的元件 */
import { WAY_GameDataProxy } from '../../sgv3way/proxy/WAY_GameDataProxy';

export class GAME_GameDataProxy extends WAY_GameDataProxy {
    private _ballTotalCount: number = 0;
    private _ballTotalCredit: number = 0;
    public constructor() {
        super();
        this._sceneSetting = new GAME_SceneSetting();
        this._commonSetting = new GAME_CommonSetting();
    }

    public get gameState(): string {
        return this._gameData.gameState;
    }
    public set gameState(_val: string) {
        Logger.i('Change state ' + this._gameData.gameState + ' to ' + _val);
        this._gameData.gameState = _val;
    }

    /**
     * 階層滾分強迫滾滿，如果類似三倍金剛大獎直接滾滿
     */
    public get isBingWinForceComplete(): boolean {
        return this._commonSetting.isBigWinForceComplete;
    }

    /**
     * 確認reel可以spin
     */
    public checkReelCanSpin(): boolean {
        if (
            this.gameState == StateMachineProxy.GAME1_IDLE &&
            this.checkCreditEnough() &&
            this.networkProxy.isConnected()
        ) {
            return true;
        } else if (this.gameState == StateMachineProxy.GAME2_IDLE) {
            return true;
        } else if (this.gameState == StateMachineProxy.GAME4_IDLE) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * 確認 PLAY_CONFIRMED 有回應，方可spin
     */
    public checkPlayConfirmed(): boolean {
        if (this.networkProxy.requestToConfirmSpin()) return true;
        else return false;
    }

    /**
     * 記錄球的累計數量
     */
    public set ballTotalCount(count: number) {
        this._ballTotalCount = count;
    }

    public get ballTotalCount(): number {
        return this._ballTotalCount;
    }

    /**
     * 記錄球的累計分數
     */
    public set ballTotalCredit(credit: number) {
        this._ballTotalCredit = credit;
    }

    public get ballTotalCredit(): number {
        return this._ballTotalCredit;
    }
}
