import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { ReelEvent, WinEvent } from '../../util/Constant';
import { StateCommand } from './StateCommand';
import { GameScene } from '../../vo/data/GameScene';
import { GlobalTimer } from '../../util/GlobalTimer';
import { ScoringHandleCommand } from '../byGame/ScoringHandleCommand';

export class Game1ShowWinCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME1_EV_SHOWWIN;

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        // 從 Game3 回到 Game1 不需要再滾分，只需要輪播贏分 Symbol
        if (this.gameDataProxy.preScene === GameScene.Game_3) {
            // 沒有滾分，因此延遲切換下個狀態
            if (this.gameDataProxy.stateWinData.totalAmount() > 0) {
                this.sendNotification(ReelEvent.SHOW_REELS_WIN, this.gameDataProxy.curWinData);
            }
            GlobalTimer.getInstance()
                .registerTimer(
                    'showWinToAfterShow',
                    1.0,
                    () => {
                        GlobalTimer.getInstance().removeTimer('showWinToAfterShow');
                        this.changeState(StateMachineProxy.GAME1_AFTERSHOW);
                    },
                    this
                )
                .start();
        } else {
            this.showView();
        }
    }

    protected showView() {
        // 播放 Win 動畫
        this.sendNotification('PLAY_WIN_ANIMATION');
        
        // 輪播贏分 Symbol
        if (this.gameDataProxy.stateWinData.totalAmount() > 0) {
            if (this.gameDataProxy.afterFeatureGame) {
                this.sendNotification(ReelEvent.SHOW_REELS_WIN, this.gameDataProxy.curWinData);
                this.sendNotification(ScoringHandleCommand.NAME);
            } else {
                this.sendNotification(ReelEvent.SHOW_ALL_REELS_WIN, this.gameDataProxy.curWinData);
            }
        } else {
            this.sendNotification(ScoringHandleCommand.NAME);
        }
    }
}
