import { GameDataProxy } from '../../proxy/GameDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { SpinResultProxyEvent } from '../../util/Constant';
import { GameScene } from '../../vo/data/GameScene';
import { FreeGameOneRoundResult } from '../../vo/result/FreeGameOneRoundResult';
import { TopUpGameOneRoundResult } from '../../vo/result/TopUpGameOneRoundResult';
import { CheckGameFlowCommand } from '../CheckGameFlowCommand';

export abstract class NormalPlayCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'NormalPlayCommand';

    public execute(notification: puremvc.INotification) {
        let isNormalPlayEnable = this.checkNormalPlay();
        if (isNormalPlayEnable) {
            if (this.gameDataProxy.preScene != this.gameDataProxy.curScene) {
                // 轉場後的第一把已取得新的 RoundResult(以便表演轉場後的面板資訊例如 wonSpin)，直接讓輪帶滾動.
                this.gameDataProxy.preScene = this.gameDataProxy.curScene;
                this.sendNotification(SpinResultProxyEvent.RESPONSE_SPIN,this.getRoundInfo()); //這隻發出後會設定新的spinEventData
            } else {
                // 取得新的 RoundResult 值.
                this.sendNotification(CheckGameFlowCommand.NAME);
            }
        }
    }

    /**
     * 這隻給game2以上做一般spin用
     */
    protected checkNormalPlay(): boolean {
        return (
            this.gameDataProxy.gameState == StateMachineProxy.GAME2_IDLE ||
            this.gameDataProxy.gameState == StateMachineProxy.GAME2_SPIN ||
            this.gameDataProxy.gameState == StateMachineProxy.GAME2_SHOWWIN ||
            this.gameDataProxy.gameState == StateMachineProxy.GAME4_IDLE ||
            this.gameDataProxy.gameState == StateMachineProxy.GAME4_SPIN ||
            this.gameDataProxy.gameState == StateMachineProxy.GAME4_SHOWWIN 
        );
    }

    protected getRoundInfo(): Array<number>{
        let roundInfo = Array<number>();
        switch(this.gameDataProxy.curScene){
            case GameScene.Game_2:
                let freeResult = this.gameDataProxy.curRoundResult as FreeGameOneRoundResult;
                roundInfo.push(freeResult.roundInfo.roundNumber);
                roundInfo.push(freeResult.roundInfo.totalRound);
                break;
            case GameScene.Game_4:
                let topUpResult = this.gameDataProxy.curRoundResult as TopUpGameOneRoundResult;
                roundInfo.push(topUpResult.roundInfo.roundNumber);
                roundInfo.push(topUpResult.roundInfo.totalRound);
                break;
        }
        return roundInfo;
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
