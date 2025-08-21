import { NetworkProxy } from '../../../core/proxy/NetworkProxy';
import { BGMClipsEnum } from '../../../game/vo/enum/SoundMap';
import { AudioManager } from '../../../audio/AudioManager';
import { ReelEffect_SymbolFeatureCommand } from '../../../game/command/reelEffect/ReelEffect_SymbolFeatureCommand';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WinEvent, ReelEvent } from '../../util/Constant';
import { GameScene } from '../../vo/data/GameScene';
import { GameStateId } from '../../vo/data/GameStateId';
import { GameOperation } from '../../vo/enum/GameOperation';
import { StateCommand } from './StateCommand';
import { UIEvent } from 'common-ui/proxy/UIEvent';
import { LastSymbolFeatureCommand } from 'src/game/command/LastSymbolFeatureCommand';
import { TakeWinCommand } from '../balance/TakeWinCommand';

export class Game1InitCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME1_EV_INIT;

    protected get preScene() {
        return this.gameDataProxy.preScene;
    }

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        this.gameDataProxy.curGameOperation = GameOperation[GameOperation.baseGame];

        //依照前一個場景，進行Game_1場景的表演處理
        switch (this.preScene) {
            case GameScene.Game_3:
                if (this.gameDataProxy.stateWinData.totalAmount() > 0 || this.gameDataProxy.hasFeatureSelection()) {
                    // 讓他可以重頭開始
                    this.gameDataProxy.rollingMoneyEnd = true;
                    this.gameDataProxy.curWinData = this.gameDataProxy.stateWinData.concat();
                    this.changeState(StateMachineProxy.GAME1_SHOWWIN);
                } else {
                    // 從game3出來 game1沒分數就不用showWin了 所以直接清除TempWon讓錶底加上miniGame的值
                    this.sendNotification(TakeWinCommand.NAME);
                    this.changeState(StateMachineProxy.GAME1_IDLE);
                }
                break;
            case GameScene.Game_2:
            case GameScene.Game_4:
                this.sendNotification(ReelEvent.ON_REELS_INIT); //Reel Init
                this.sendNotification(ReelEffect_SymbolFeatureCommand.NAME);
                if (this.gameDataProxy.stateWinData.totalAmount() > 0) {
                    // 讓他可以重頭開始
                    this.gameDataProxy.curWinData = this.gameDataProxy.stateWinData.concat();
                    this.sendNotification(ReelEvent.ON_REELS_RESTORE, this.gameDataProxy.spinEventData.baseGameResult);
                    this.changeState(StateMachineProxy.GAME1_SHOWWIN);
                } else {
                    // 避免在沒分數的情況，沒有 send settle play
                    this.changeState(StateMachineProxy.GAME1_END);
                }
                break;
            default: //Reel Init
                /** 判斷是否有 Recovery紀錄資料，需要進行處理 */
                if (
                    this.gameDataProxy.spinEventData != undefined &&
                    this.gameDataProxy.reStateResult?.gameStateId == GameStateId.WAIT_FOR_CLIENT
                ) {
                    if (this.gameDataProxy.stateWinData.totalAmount() > 0) {
                        this.gameDataProxy.curWinData = this.gameDataProxy.stateWinData.concat();
                        this.sendNotification(ReelEvent.SHOW_REELS_WIN, this.gameDataProxy.curWinData);
                    }
                    this.changeState(StateMachineProxy.GAME1_END);
                    return;
                } else {
                    this.sendNotification(UIEvent.UPDATE_PLAYER_WIN, 0); //清除Win欄位
                    this.changeState(StateMachineProxy.GAME1_IDLE);
                }
                this.sendNotification(ReelEvent.ON_REELS_INIT);
                // 恢復最後一把的盤面
                this.sendNotification(LastSymbolFeatureCommand.NAME);
                break;
        }
        if (this.webBridgeProxy.isClickToPlay) {
            //需按下PLAY按鈕才能播放BGM
            AudioManager.Instance.play(BGMClipsEnum.BGM_Base).loop(true).volume(0).fade(1, 1);
        }
        this.sendNotification(WinEvent.FORCE_WIN_DISPOSE);
    }

    protected _networkProxy: NetworkProxy;
    protected get networkProxy(): NetworkProxy {
        if (!this._networkProxy) {
            this._networkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._networkProxy;
    }
}
