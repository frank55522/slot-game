import { StateMachineCommand } from '../../core/command/StateMachineCommand';
import { NetworkProxy } from '../../core/proxy/NetworkProxy';
import { StateMachineObject } from '../../core/proxy/CoreStateMachineProxy';
import { Logger } from '../../core/utils/Logger';
import { GameDataProxy } from '../proxy/GameDataProxy';
import { StateMachineProxy } from '../proxy/StateMachineProxy';
import { SpinResultProxyEvent, SceneEvent, ReelEvent, WinEvent } from '../util/Constant';
import { GameScene } from '../vo/data/GameScene';
import { GameStateId } from '../vo/data/GameStateId';
import { PendingEvent } from '../vo/event/PendingEvent';
import { ChangeGameSceneCommand } from './scene/ChangeGameSceneCommand';
import { ParseRoundWinResultCommand } from './spin/ParseRoundWinResultCommand';
import { ParseStateWinResultCommand } from './spin/ParseStateWinResultCommand';
import { FreeGameOneRoundResult } from '../vo/result/FreeGameOneRoundResult';
import { TopUpGameOneRoundResult } from '../vo/result/TopUpGameOneRoundResult';
import { TakeWinCommand } from './balance/TakeWinCommand';
import { SaveRecoveryDataCommand } from './recovery/SaveRecoveryDataCommand';

/**
 * 這邊處理spin後數學遊戲狀態資料
 */
export class CheckGameFlowCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'CheckGameFlowCommand';

    public execute(notification: puremvc.INotification): void {
        if (this.gameDataProxy.spinEventData) {
            if (this.gameDataProxy.spinEventData.gameStateResult.length > 0) {
                // 取得即將表演的遊戲類型資料
                if (
                    this.gameDataProxy.curStateResult == null ||
                    this.gameDataProxy.curStateResult.roundCount == 0 ||
                    this.gameDataProxy.curStateResult.roundResult.length == 0
                ) {
                    this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift();
                    Logger.i(
                        '[CheckGameFlowCommand] 取得遊戲類型 - gameStateId' +
                            this.gameDataProxy.curStateResult.gameStateId
                    );
                }

                // 依遊戲類型設定表演
                let gameStateId = this.gameDataProxy.curStateResult.gameStateId;
                switch (gameStateId) {
                    case GameStateId.INIT:
                        this.initialGameState();
                        break;
                    case GameStateId.END:
                        this.endGameState();
                        break;
                    case GameStateId.WAIT_FOR_CLIENT:
                        this.waitForClientSelectGameState();
                        break;
                    default:
                        this.resetHitPattern();
                        this.otherGameState();
                        break;
                }
            } else {
                Logger.i('無任何表演資訊');
            }
        } else {
            Logger.w('spinEventData is null.');
        }
    }

    /** 重置HitPattern */
    protected resetHitPattern() {
        this.gameDataProxy.curHitPattern = this.gameDataProxy.getInitShowPatternById(
            this.gameDataProxy.curStateResult.gameSceneName
        );
    }

    /**
     * GS_001
     * 遊戲初始狀態不做任何表演，CMD_PARSE_STATE_WIN_RESULT
     * 提前準備好當遇到兩個場景以上要表演的資料結構時，
     * 待每個遊戲類型都表演完後，回到初始場景要表演的贏線資料.
     * (Base > Free > Base 要表演的 scatter 資料)
     */
    protected initialGameState() {
        this.sendNotification(ParseStateWinResultCommand.NAME);
        // 當前狀態是 Feature selection，表示收到選擇後的結果
        if (this.gameDataProxy.gameState == StateMachineProxy.GAME1_FEATURESELECTION) {
            // 跳過前面的資料，直接取得 Feature selection 後的結果
            while (this.gameDataProxy.spinEventData.gameStateResult.length > 0) {
                let gameStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift();
                if (gameStateResult.gameStateId == GameStateId.WAIT_FOR_CLIENT) {
                    break;
                }
            }
        }
        this.sendNotification(CheckGameFlowCommand.NAME);
    }

    /**
     * GS_002
     */
    protected endGameState() {
        if (this.gameDataProxy.preScene != GameScene.Init && this.gameDataProxy.curScene != GameScene.Game_1) {
            this.gameDataProxy.curRoundResult = null;
            // 結束遊戲狀態須回到預設的 GameScene.Game_1
            if (this.gameDataProxy.curScene == GameScene.Game_3) {
                if (this.gameDataProxy.preScene == GameScene.Game_2) {
                    this.sendNotification(ChangeGameSceneCommand.NAME, GameScene.Game_2);
                } else {
                    this.sendNotification(ChangeGameSceneCommand.NAME, GameScene.Game_1);
                }
            } else {
                this.sendNotification(ChangeGameSceneCommand.NAME, GameScene.Game_1);
            }
        } else {
            this.sendNotification(StateMachineCommand.NAME, new StateMachineObject(StateMachineProxy.GAME1_IDLE));
            this.sendNotification(TakeWinCommand.NAME);
        }
    }

    /**
     * 等待玩家選擇遊戲
     */
    protected waitForClientSelectGameState() {
        if (this.gameDataProxy.gameState != StateMachineProxy.GAME1_FEATURESELECTION) {
            this.sendNotification(WinEvent.FORCE_WIN_DISPOSE);
            //傳送Recovery紀錄資料
            this.sendNotification(SaveRecoveryDataCommand.NAME, null);
            this.sendNotification(
                StateMachineCommand.NAME,
                new StateMachineObject(StateMachineProxy.GAME1_FEATURESELECTION)
            );
        }
    }

    /** 其他遊戲狀態 */
    protected otherGameState() {
        //傳送Recovery紀錄資料
        this.sendNotification(SaveRecoveryDataCommand.NAME, null);

        let SceneName: string = this.gameDataProxy.curStateResult.gameSceneName; // 取得場景名稱
        let SceneNo: number = +SceneName.split('_')[1]; // 取得場景編號
        if (SceneName != GameScene.Game_3) {
            this.gameDataProxy.curRoundResult =
                this.gameDataProxy.curStateResult.roundResult.length > 0
                    ? this.gameDataProxy.curStateResult.roundResult.shift()
                    : null;
        }
        this.checkJackpotPool();
        if (this.gameDataProxy.curScene == SceneName) {
            Logger.i('[CheckGameFlowCommand] 同場景 ' + this.gameDataProxy.curScene);
            Logger.i(
                '[CheckGameFlowCommand] 取 RoundResult 後(剩餘:' +
                    this.gameDataProxy.curStateResult.roundResult.length +
                    ')，直接 Spin 表演.'
            );
            this.sendNotification(SpinResultProxyEvent.RESPONSE_SPIN, this.getRoundInfo());
        } else {
            Logger.i('[CheckGameFlowCommand] 切換場景至 : ' + SceneName);
            if (this.gameDataProxy.isCompletedBatchLoading) {
                this.sendNotification(ChangeGameSceneCommand.NAME, SceneName);
            } else {
                Logger.i('[CheckGameFlowCommand] 等待場景素材載入中...');
                let pendInfo: PendingEvent = new PendingEvent();
                pendInfo.triggerScene = SceneNo;
                pendInfo.triggerEvent = ChangeGameSceneCommand.NAME;
                pendInfo.eventParam = SceneName;
                this.sendNotification(SceneEvent.PENDING_EVENT_AND_SHOW_LOADING, pendInfo);
            }
            if (SceneName == GameScene.Game_3) return;
            if (SceneName == GameScene.Game_4) {
                /**
                 * TODO: parse dragon up result
                 */
                return;
            }
        }
        this.sendNotification(ParseRoundWinResultCommand.NAME);
    }

    private checkJackpotPool() {
        if (this.gameDataProxy.isHitMiniGame() || this.gameDataProxy.isHitGrand()) {
            this.gameDataProxy.checkJackpotPool();
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

    protected getRoundInfo(): Array<number> {
        let roundInfo = Array<number>();
        switch (this.gameDataProxy.curScene) {
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
}
