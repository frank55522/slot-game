import { GameStateResult } from '../../vo/result/GameStateResult';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { NetworkProxy } from '../../../core/proxy/NetworkProxy';
import { GameScene } from '../../vo/data/GameScene';

export class SaveRecoveryDataCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'SaveRecoveryDataCommand';

    public execute(notification: puremvc.INotification): void {
        let jsonData: string;
        let customizeData = notification.getBody();

        switch (this.gameDataProxy.curStateResult.gameSceneName) {
            case GameScene.Game_1:
                jsonData = JSON.stringify({
                    gameSceneName: this.gameDataProxy.curStateResult.gameSceneName,
                    gameStateId: this.gameDataProxy.curStateResult.gameStateId
                });
                break;
            case GameScene.Game_2:
                jsonData = JSON.stringify({
                    gameSceneName: this.gameDataProxy.curStateResult.gameSceneName,
                    gameStateId: this.gameDataProxy.curStateResult.gameStateId,
                    lastRounds: this.gameDataProxy.curStateResult.roundResult.length
                });
                break;
            case GameScene.Game_3:
                jsonData = JSON.stringify({
                    gameSceneName: this.gameDataProxy.curStateResult.gameSceneName,
                    gameStateId: this.gameDataProxy.curStateResult.gameStateId,
                    symbolClickedList: customizeData
                });
                break;
            case GameScene.Game_4:
                jsonData = JSON.stringify({
                    gameSceneName: this.gameDataProxy.curStateResult.gameSceneName,
                    gameStateId: this.gameDataProxy.curStateResult.gameStateId,
                    lastRounds: this.gameDataProxy.curStateResult.roundResult.length
                });
                break;
        }

        if (jsonData != undefined) {
            this.networkProxy.sendRecoveryData(jsonData); //傳送 RecoveryData
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
