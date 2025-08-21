import { NetworkProxy } from '../../../core/proxy/NetworkProxy';
import { ChangeGameSceneCommand } from '../scene/ChangeGameSceneCommand';
import { GameScene } from '../../vo/data/GameScene';
import { Logger } from '../../../core/utils/Logger';
import { GameStateId } from '../../vo/data/GameStateId';
import { ParseStateWinResultCommand } from '../spin/ParseStateWinResultCommand';
import { ParseRoundWinResultCommand } from '../spin/ParseRoundWinResultCommand';
import { ReelEvent, ViewMediatorEvent } from '../../util/Constant';
import { FreeGameOneRoundResult } from '../../vo/result/FreeGameOneRoundResult';
import { TopUpGameOneRoundResult } from '../../vo/result/TopUpGameOneRoundResult';
import { GAME_GameDataProxy } from '../../../game/proxy/GAME_GameDataProxy';
import { MathUtil } from '../../../core/utils/MathUtil';
import { ClearRecoveryDataCommand } from './ClearRecoveryDataCommand';
import { TakeWinCommand } from '../balance/TakeWinCommand';
import { SpinResult } from '../../vo/result/SpinResult';
import { BonusGameOneRoundResult } from '../../vo/result/BonusGameOneRoundResult';
import { SpecialHitInfo } from '../../vo/enum/SpecialHitInfo';
import { ByGameHandleCommand } from '../spin/ByGameHandleCommand';
export class CheckRecoveryFlowCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'CheckRecoveryCommand';
    private win: number = 0; //普通贏分(BaseGame + FreeGame)
    private jpWin: number = 0; //jackpot贏分

    public execute(notification: puremvc.INotification): void {
        /** 判斷 是否要處理Recovery */
        if (this.handlingRecoveryData()) {
            //依照 Recovery Data，接續表演場景
            let sceneName =
                this.gameDataProxy.reStateResult.gameSceneName != undefined
                    ? this.gameDataProxy.reStateResult.gameSceneName
                    : GameScene.Game_1;

            this.sendNotification(ChangeGameSceneCommand.NAME, sceneName);
        } else {
            //沒有 Recovery Data，直接轉場 Game_1
            this.sendNotification(ChangeGameSceneCommand.NAME, GameScene.Game_1);
        }
    }

    /** 處理 Recovery資料 */
    protected handlingRecoveryData(): boolean {
        //判斷 Recovery是否有資料
        if (this.gameDataProxy.reStateResult == null) {
            Logger.d('[Recovery Data Error] reStateResult(表演紀錄資料) is NULL !!');
            return false;
        }
        if (this.gameDataProxy.spinEventData == null) {
            Logger.d('[Recovery Data Error] spinEventData(數學資料) is NULL !!');
            return false;
        }
        if (this.gameDataProxy.spinEventData.gameStateResult == null) {
            Logger.d('[Recovery Data Error] gameStateResult(數學表演資料) is NULL !!');
            return false;
        }

        // By Game Data Handle
        this.sendNotification(ByGameHandleCommand.NAME);

        //設定 GameStateEnd ID
        let curGameState = this.gameDataProxy.spinEventData.gameStateResult;
        GameStateId.END = curGameState[curGameState.length - 1].gameStateId;

        //設定 Balance
        this.setRecoveryBalance(this.gameDataProxy.initEventData.recoveryBalance, this.gameDataProxy.spinEventData);
        this.sendNotification(ReelEvent.ON_REELS_INIT); //Reel Init
        //設定 表演階段資料, 依照不同的遊戲場景取值
        switch (this.gameDataProxy.reStateResult.gameSceneName) {
            case GameScene.Game_1:
                this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift(); //Init狀態資料
                this.sendNotification(ParseStateWinResultCommand.NAME); //解析 Game1贏分盤面資料
                this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift(); //Game1狀態資料
                this.gameDataProxy.curRoundResult = this.gameDataProxy.curStateResult.roundResult[0];
                this.gameDataProxy.curScene = this.gameDataProxy.curStateResult.gameSceneName;
                this.sendNotification(ReelEvent.ON_REELS_RESTORE, this.gameDataProxy.curRoundResult); // 回復 Game1 盤面
                this.win = this.gameDataProxy.curStateResult.stateWin; //Game1 贏分資料

                if (this.gameDataProxy.curStateResult.gameStateId != this.gameDataProxy.reStateResult.gameStateId) {
                    //Base Game Hit Grand贏分
                    if (this.gameDataProxy.isHitGrand()) {
                        this.jpWin += this.getHitGrandCash();
                    }
                    //解析StateResult是否為，Recovery回覆的StateResult
                    while (
                        this.gameDataProxy.spinEventData.gameStateResult[0].gameStateId !=
                        this.gameDataProxy.reStateResult.gameStateId
                    ) {
                        this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift();
                        this.gameDataProxy.curScene = this.gameDataProxy.curStateResult.gameSceneName;
                        if (this.gameDataProxy.curScene == GameScene.Game_3) {
                            this.jpWin += this.gameDataProxy.curStateResult.stateWin;
                        }
                    }
                }

                if (this.jpWin != 0) {
                    this.sendNotification(ViewMediatorEvent.JACKPOT_WON_SHOW, this.jpWin);
                }
                this.gameDataProxy.playerTotalWin = this.gameDataProxy.convertCredit2Cash(this.win);
                //Feature selection
                if (this.gameDataProxy.reStateResult.gameStateId == GameStateId.WAIT_FOR_CLIENT) {
                    this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift(); //Feature selection狀態資料
                    this.gameDataProxy.curScene = this.gameDataProxy.curStateResult.gameSceneName;
                }
                return true;

            case GameScene.Game_2:
                this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift(); //Init狀態資料
                this.sendNotification(ParseStateWinResultCommand.NAME); //解析 Game1贏分盤面資料
                this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift(); //Game1狀態資料
                this.gameDataProxy.curScene = this.gameDataProxy.curStateResult.gameSceneName;
                this.gameDataProxy.curRoundResult = this.gameDataProxy.curStateResult.roundResult.shift();
                this.sendNotification(ReelEvent.ON_REELS_RESTORE, this.gameDataProxy.curRoundResult); // 回復 Game1 盤面
                this.win = this.gameDataProxy.curStateResult.stateWin; //Game1 贏分資料
                //Base Game Hit Grand贏分
                if (this.gameDataProxy.isHitGrand()) {
                    this.jpWin += this.getHitGrandCash();
                }

                //解析StateResult是否為，Recovery回覆的StateResult
                while (
                    this.gameDataProxy.spinEventData.gameStateResult[0].gameStateId !=
                    this.gameDataProxy.reStateResult.gameStateId
                ) {
                    //FreeGame 狀態資料
                    this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift();
                    this.gameDataProxy.curScene = this.gameDataProxy.curStateResult.gameSceneName;
                    //判斷是否為FreeGame
                    if (this.gameDataProxy.curScene == GameScene.Game_3) {
                        this.jpWin += this.gameDataProxy.curStateResult.stateWin;
                        continue;
                    }
                    //不是Recovery的遊戲狀態，所以全部取得
                    this.setFreeGameWin(0);
                }
                //Recovery紀錄的FreeGame狀態資料
                this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift();
                this.gameDataProxy.curScene = this.gameDataProxy.curStateResult.gameSceneName;
                this.setFreeGameWin(this.gameDataProxy.reStateResult.lastRounds); //取得紀錄前的 Round的累計贏分資料

                //設定表演資料
                this.gameDataProxy.curRoundResult = this.gameDataProxy.curStateResult.roundResult[0];
                this.gameDataProxy.curGameOperation = (
                    this.gameDataProxy.curRoundResult as FreeGameOneRoundResult
                ).specialHitInfo;
                this.sendNotification(ParseRoundWinResultCommand.NAME); //設定FreeGame 表演牌面

                if (this.jpWin != 0) {
                    this.sendNotification(ViewMediatorEvent.JACKPOT_WON_SHOW, this.jpWin);
                }
                this.gameDataProxy.playerTotalWin = this.gameDataProxy.convertCredit2Cash(this.win);
                return true;

            case GameScene.Game_3:
                this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift(); //Init狀態資料
                this.sendNotification(ParseStateWinResultCommand.NAME); //解析 Game1贏分盤面資料
                this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift(); //Game1狀態資料
                this.gameDataProxy.curScene = this.gameDataProxy.curStateResult.gameSceneName;
                this.win = this.gameDataProxy.curStateResult.stateWin; //Game1 贏分資料

                //判斷是否為 Mini Game狀態
                if (this.gameDataProxy.spinEventData.gameStateResult[0].gameSceneName == GameScene.Game_3) {
                    //解析Game1 Round盤面資料
                    this.gameDataProxy.curRoundResult = this.gameDataProxy.curStateResult.roundResult.shift();
                    this.sendNotification(ReelEvent.ON_REELS_RESTORE, this.gameDataProxy.curRoundResult); // 回復 Game1 盤面
                    this.sendNotification(ParseRoundWinResultCommand.NAME);
                } else {
                    //解析Game2 Round盤面資料
                    while (
                        this.gameDataProxy.spinEventData.gameStateResult[0].gameStateId !=
                        this.gameDataProxy.reStateResult.gameStateId
                    ) {
                        this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift(); //取得 Game2狀態資料
                        this.gameDataProxy.curScene = this.gameDataProxy.curStateResult.gameSceneName;
                        //判斷是否為FreeGame
                        if (this.gameDataProxy.curScene == GameScene.Game_3) {
                            this.jpWin += this.gameDataProxy.curStateResult.stateWin;
                            continue;
                        }
                        //不是Recovery的遊戲狀態，所以全部取得
                        this.setFreeGameWin(0);
                    }

                    this.sendNotification(ParseRoundWinResultCommand.NAME); //設定FreeGame 表演牌面
                }

                //取得進入Mini Game的遊戲狀態
                this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift();
                //this.gameDataProxy.curRoundResult = null; //Mini Game沒有Round次資料.
                if (this.jpWin != 0) {
                    this.sendNotification(ViewMediatorEvent.JACKPOT_WON_SHOW, this.jpWin);
                }
                this.gameDataProxy.playerTotalWin = this.gameDataProxy.convertCredit2Cash(this.win);

                return true;
            case GameScene.Game_4:
                this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift(); //Init狀態資料
                this.sendNotification(ParseStateWinResultCommand.NAME); //解析 Game1贏分盤面資料
                this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift(); //Game1狀態資料
                this.gameDataProxy.curScene = this.gameDataProxy.curStateResult.gameSceneName;
                this.gameDataProxy.curRoundResult = this.gameDataProxy.curStateResult.roundResult.shift();
                this.sendNotification(ReelEvent.ON_REELS_RESTORE, this.gameDataProxy.curRoundResult); // 回復 Game1 盤面
                this.win = this.gameDataProxy.curStateResult.stateWin; //Game1 贏分資料

                //解析StateResult是否為，Recovery回覆的StateResult
                while (
                    this.gameDataProxy.spinEventData.gameStateResult[0].gameStateId !=
                    this.gameDataProxy.reStateResult.gameStateId
                ) {
                    //FreeGame 狀態資料
                    this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift();
                    this.gameDataProxy.curScene = this.gameDataProxy.curStateResult.gameSceneName;
                    //判斷是否為FreeGame
                    if (this.gameDataProxy.curScene == GameScene.Game_3) {
                        this.jpWin += this.gameDataProxy.curStateResult.stateWin;
                        continue;
                    }
                    //不是Recovery的遊戲狀態，所以全部取得
                    this.setTopUpBallCount(0);
                }
                //Recovery紀錄的FreeGame狀態資料
                this.gameDataProxy.curStateResult = this.gameDataProxy.spinEventData.gameStateResult.shift();
                this.gameDataProxy.curScene = this.gameDataProxy.curStateResult.gameSceneName;
                this.setTopUpBallCount(this.gameDataProxy.reStateResult.lastRounds); //取得紀錄前的 Round的累計球數

                //設定表演資料
                this.gameDataProxy.curRoundResult = this.gameDataProxy.curStateResult.roundResult[0];
                this.sendNotification(ParseRoundWinResultCommand.NAME); //設定FreeGame 表演牌面

                if (this.jpWin != 0) {
                    this.sendNotification(ViewMediatorEvent.JACKPOT_WON_SHOW, this.jpWin);
                }
                this.gameDataProxy.playerTotalWin = this.gameDataProxy.convertCredit2Cash(this.win);
                return true;
        }

        Logger.d('[Recovery Data Error] reStateResult與gameStateResult的資料不相符合!?');
        return false;
    }

    private setRecoveryBalance(reBalance: number, spinData: SpinResult): void {
        //BaseGame + FreeGame的贏分
        let spinWin = spinData.playerTotalWin;

        //Jackpot贏分
        let jpWin = 0;
        if (spinData.bonusGameResult != null) {
            jpWin = spinData.bonusGameResult.bonusGameTotalWin * 0.01;
        }
        //還原Balance與贏分參數
        this.gameDataProxy.tempWonCredit = this.gameDataProxy.convertCredit2Cash(spinWin) + jpWin;
        this.gameDataProxy.setBmd(reBalance);
    }

    private setFreeGameWin(roundResult: number = 0) {
        const self = this;
        while (this.gameDataProxy.curStateResult.roundResult.length > roundResult) {
            this.gameDataProxy.curRoundResult = this.gameDataProxy.curStateResult.roundResult.shift();
            let freeGame = this.gameDataProxy.curRoundResult as FreeGameOneRoundResult;
            this.win += freeGame.playerWin;
            freeGame.extendInfoForFreeGameResult.sideCreditBallScreenLabel.forEach((row) => {
                row.forEach((value) => {
                    if (value > 0) {
                        self.gameDataProxy.ballTotalCredit = MathUtil.add(
                            self.gameDataProxy.ballTotalCredit,
                            self.gameDataProxy.convertCredit2Cash(value)
                        );
                    }
                });
            });
        }
    }

    private setTopUpBallCount(roundResult: number = 0) {
        const self = this;
        while (this.gameDataProxy.curStateResult.roundResult.length > roundResult) {
            this.gameDataProxy.curRoundResult = this.gameDataProxy.curStateResult.roundResult.shift();
            let topUpGame = this.gameDataProxy.curRoundResult as TopUpGameOneRoundResult;
            topUpGame.extendInfoForTopUpGameResult.goldCreditBallScreenLabel.forEach((row) => {
                self.gameDataProxy.ballTotalCount += row.filter((value) => value > 0).length;
            });
        }
    }

    private getHitGrandCash(): number {
        let grandCash = 0;
        const getGrand = (oneRoundResult: BonusGameOneRoundResult) =>
            oneRoundResult.specialHitInfo == SpecialHitInfo[SpecialHitInfo.bonusGame_02];
        grandCash =
            this.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult.find(
                getGrand
            ).oneRoundJPTotalWin;
        // 移除已經表演過的bonus資料
        const removeResult = (result: BonusGameOneRoundResult) =>
            result.specialHitInfo != SpecialHitInfo[SpecialHitInfo.bonusGame_02];
        this.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult =
            this.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult.filter(removeResult);

        return grandCash;
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GAME_GameDataProxy;
    protected get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
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
