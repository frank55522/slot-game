import { TakeWinCommand } from '../../command/balance/TakeWinCommand';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';
import { GameStateProxyEvent, ScreenEvent, WebGameState, WinEvent } from '../../util/Constant';
import { WinBoardView } from '../../view/WinBoardView';
import { GameSceneData } from '../../vo/config/GameSceneData';
import { WinBoardState } from '../../vo/enum/WinBoardState';
import { SceneManager } from '../../../core/utils/SceneManager';
import BaseMediator from '../../../base/BaseMediator';
import { GlobalTimer } from '../../util/GlobalTimer';
import { AudioManager } from '../../../audio/AudioManager';
import { BGMClipsEnum } from '../../../game/vo/enum/SoundMap';
import { Logger } from '../../../core/utils/Logger';
import { WinType } from '../../vo/enum/WinType';
import { WinBoardRunCompleteCommand } from '../../command/winboard/WinBoardRunCompleteCommand';
import { GameScene } from '../../vo/data/GameScene';
import { UIEvent } from 'common-ui/proxy/UIEvent';

export abstract class BaseWinBoardViewMediator<T extends WinBoardView> extends BaseMediator<T> {
    public static NAME: string = 'WinBoardViewMediator';

    // SceneData
    protected mySceneName: string = '';
    protected mySceneData: GameSceneData;

    protected canSkipWinboardTimerName = 'canSkipWinboard';
    protected waitSecondsForShowTimerName = 'waitSecondsForShow';
    protected waitForWinboardCompleteTimerName = 'waitForWinboardComplete';

    public constructor(component?: any) {
        super(BaseWinBoardViewMediator.NAME, component);
        Logger.i('[WinBoardViewMediator] constructor()');
    }

    public listNotificationInterests(): Array<any> {
        return [
            GameStateProxyEvent.ON_SCENE_CHANGED,
            ScreenEvent.ON_SPIN_DOWN,
            WinEvent.FORCE_UPDATE_WIN_LABEL,
            WinEvent.RUN_WIN_LABEL_START,
            WinEvent.RUN_WIN_LABEL_COMPLETE,
            WinEvent.FORCE_WIN_LABEL_COMPLETE,
            WinEvent.HIDE_BOARD_REQUEST,
            WinEvent.ON_HIT_WIN_BOARD,
            WinEvent.FORCE_WIN_DISPOSE,
            WinEvent.SHOW_WIN_BOARD,
            TakeWinCommand.NAME,
            SceneManager.EV_ORIENTATION_VERTICAL,
            SceneManager.EV_ORIENTATION_HORIZONTAL
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case GameStateProxyEvent.ON_SCENE_CHANGED: // 取得每個場景一般滾分的倍率表
                this.onSceneChange();
                break;
            case ScreenEvent.ON_SPIN_DOWN:
                this.onSpinDown();
                break;
            case WinEvent.FORCE_UPDATE_WIN_LABEL: // 強制更新滾分起點
                this.forceUpdateBBWLabel(notification.getBody());
                break;
            case WinEvent.RUN_WIN_LABEL_START: // 開始滾分
                this.runWinLabels(notification.getBody());
                break;
            case WinEvent.RUN_WIN_LABEL_COMPLETE:
                this.runWinLabelsComplete(notification.getBody());
                break;
            //FreeGame結束後回BaseGame結算
            // case WinEvent.SHOW_WIN_BOARD:
            //     this.runWinBoard(+notification.getBody().win);
            //     break;
            // case WinEvent.ON_HIT_WIN_BOARD: // 測試分級贏分面板
            //     this.runWinBoard(+notification.getBody()[1]);
            //     break;
            case WinEvent.FORCE_WIN_LABEL_COMPLETE: // 強制完成滾分
                this.forceBBWLabelComplete();
                break;
            case WinEvent.HIDE_BOARD_REQUEST: // 詢問是否可以關閉面板
                //this.hideBoard();
                break;
            case WinEvent.FORCE_WIN_DISPOSE:
            case TakeWinCommand.NAME:
                //this.view?.cleanTimer();
                break;
        }
    }

    protected forceUpdateBBWLabel(cashAmount: number) {
        this.updateBBWLabel(cashAmount);
    }

    /**
     * loading complete完成後處理
     */
    protected loadingComplete() {
        this.view.isFormatBalance = !this.gameDataProxy.isOmniChannel();
    }

    /**
     * 水平方向改變
     */
    protected onOrientationHorizontal() {
        if (!!this.view) this.view?.onOrientationHorizontal();
    }

    /**
     * 垂直方向改變
     */
    protected onOrientationVertical() {
        if (!!this.view) this.view?.onOrientationVertical();
    }

    /**
     * 場景資料改變
     */
    protected onSceneChange() {
        this.mySceneName = this.gameDataProxy.curScene;
        this.mySceneData = this.gameDataProxy.getSceneDataByName(this.mySceneName);
    }

    /** 點擊SpinDown後處理 */
    protected onSpinDown() {
        if (this.gameDataProxy.scrollingWinLabel && this.gameDataProxy.scrollingWinLabelCanSkip) {
            this.sendNotification(WinEvent.FORCE_WIN_LABEL_COMPLETE);
        }
    }

    //包含BBW以及winboard滾分
    protected runWinLabels(data: {
        startAmount: number;
        targetAmount: number;
        winBoardStartAmount: number;
        winBoardTargetAmount: number;
        scoringTime: number;
        winType: WinType;
        runCompleteCallback?: Function;
    }) {
        this.runBBWLabel(data.startAmount, data.targetAmount, data.scoringTime, data.runCompleteCallback);
        this.gameDataProxy.scrollingWinLabelCanSkip = true;
        //達到winboard倍率
        if (data.winType >= WinType.bigWin) {
            this.runWinboardLabel(data.winBoardStartAmount, data.winBoardTargetAmount, data.winType, data.scoringTime);
        }
    }

    /**
     * BBW滾分，包含winboard滾分
     */
    protected runBBWLabel(
        startAmount: number,
        targetAmount: number,
        scoringTime: number,
        completeCallback: Function
    ): void {
        this.view?.runBBWLabel(
            startAmount,
            targetAmount,
            scoringTime,
            () => this.updateBBWLabel(this.view?.curAmount),
            completeCallback
        );
    }

    protected runWinboardLabel(startAmount: number, winAmount: number, winType: WinType, scoringTime: number) {
        this.startShowWinboard(winType, scoringTime);
        if (this.gameDataProxy.isOmniChannel()) {
            startAmount = this.gameDataProxy.getCreditByDenomMultiplier(startAmount);
            winAmount = this.gameDataProxy.getCreditByDenomMultiplier(winAmount);
        }
        this.view?.runWinboardLabel(startAmount, winAmount, scoringTime);
    }

    protected updateBBWLabel(amount: number) {
        this.sendNotification(UIEvent.UPDATE_PLAYER_WIN, amount);
    }

    protected runWinLabelsComplete(data: { targetAmount: number; winBoardTargetAmount: number; winType: WinType }) {
        this.gameDataProxy.scrollingWinLabel = false;
        this.BBWLabelComplete(data.targetAmount);
        if (data.winType >= WinType.bigWin) {
            if (this.gameDataProxy.isOmniChannel()) {
                data.winBoardTargetAmount = this.gameDataProxy.getCreditByDenomMultiplier(data.winBoardTargetAmount);
            }
            this.winboardLabelComplete(data.winType, data.winBoardTargetAmount);
        }
    }

    /** BBW滾分結束Callback */
    public BBWLabelComplete(targetAmount: number): void {
        this.updateBBWLabel(targetAmount);
        if (this.gameDataProxy.winBoardState == WinBoardState.HIDE) {
            this.sendNotification(WinBoardRunCompleteCommand.NAME);
        }

        this.webBridgeProxy.sendGameState(WebBridgeProxy.curScene, WinEvent.RUN_WIN_LABEL_COMPLETE);
    }

    /**winboard滾分結束-恢復BGM音量 停delay秒後才收掉animation*/
    public winboardLabelComplete(winType: WinType, targetAmount: number, delay: number = 2) {
        this.view?.updateWinboardText(targetAmount);
        this.fadeBGM(1, 0.3);
        this.view?.stopWinboard();
        GlobalTimer.getInstance().removeTimer(this.waitSecondsForShowTimerName);
        GlobalTimer.getInstance()
            .registerTimer(
                this.waitSecondsForShowTimerName,
                delay,
                () => {
                    this.sendNotification(WinBoardRunCompleteCommand.NAME);
                    if (this.gameDataProxy.winBoardState != WinBoardState.HIDE) {
                        this.webBridgeProxy.sendGameState(WebBridgeProxy.curScene, WebGameState.WINBOARD_HIDE);
                    }
                    this.gameDataProxy.winBoardState = WinBoardState.HIDE;
                    GlobalTimer.getInstance().removeTimer(this.waitSecondsForShowTimerName);
                },
                this
            )
            .start();
    }

    /**
     * 強迫分數滾停
     */
    protected forceBBWLabelComplete() {
        if (this.gameDataProxy.scrollingWinLabel && this.gameDataProxy.runWinComplete == false) {
            this.view?.stopWinTextTween();
            this.view?.forceBBWLabelComplete();
        }
    }

    public fadeBGM(volume: number, duration: number = 1) {
        switch (this.gameDataProxy.curScene) {
            case GameScene.Game_1:
                AudioManager.Instance.fade(BGMClipsEnum.BGM_Base, volume, duration);
                break;
            case GameScene.Game_2:
                AudioManager.Instance.fade(BGMClipsEnum.BGM_FreeGame, volume, duration);
                break;
        }
    }

    public startShowWinboard(winType: WinType, scoringTime: number) {
        this.showWinboardAnimation(winType);
        this.gameDataProxy.winBoardState = WinBoardState.SHOW;
        this.fadeBGM(0, 0.3);
    }

    public showWinboardAnimation(winType: WinType) {
        let language = this.gameDataProxy.language;
        switch (this.gameDataProxy.language) {
            case 'en':
            case 'zh':
                language = this.gameDataProxy.language;
            default:
                language = 'en';
                break;
        }
        if (winType >= WinType.bigWin) {
            this.view?.startWinboard(winType, language);
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

    protected _webBridgeProxy: WebBridgeProxy;
    protected get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }
}
