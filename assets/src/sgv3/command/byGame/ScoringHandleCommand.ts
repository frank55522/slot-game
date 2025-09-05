import { _decorator } from 'cc';
import { ScoringClipsEnum, BGMClipsEnum } from '../../../game/vo/enum/SoundMap';
import { AudioManager } from '../../../audio/AudioManager';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { WinEvent } from '../../util/Constant';
import { GlobalTimer } from '../../util/GlobalTimer';
import { GameScene } from '../../vo/data/GameScene';
import { WinBoardState } from '../../vo/enum/WinBoardState';
import { WinType } from '../../vo/enum/WinType';
import { FreeGameOneRoundResult } from '../../vo/result/FreeGameOneRoundResult';
const { ccclass } = _decorator;

@ccclass('ScoringHandleCommand')
export class ScoringHandleCommand extends puremvc.SimpleCommand {
    public static NAME: string = 'ScoringHandleCommand';
    protected timerKey: string = 'scoringTimer';
    protected timerKey_Sound: string = 'scoringSoundTimer';
    protected winTypeDelayScoringTime: number = 0.5;

    // 記錄該把總贏分
    protected finalWinAmount: number = 0;
    protected finalWinBoardAmount: number = 0;
    protected finalWinType: WinType = WinType.none;
    protected finalScoringTime: number = 0;

    public execute(notification: puremvc.INotification): void {
        if (this.gameDataProxy.scrollingWinLabel == false) {
            this.gameDataProxy.scrollingWinLabel = true;
            this.gameDataProxy.runWinComplete = false;
            this.gameDataProxy.scrollingEndPlayed = false;
            this.handleScoring();
        }
    }

    private handleScoring() {
        let startAmount: number = 0;
        let targetAmount: number;
        let winBoardTargetAmount: number;
        let winType: WinType = WinType.none;
        let scoringTime: number;

        if (this.gameDataProxy.curScene == GameScene.Game_2) {
            let freeGameResult = this.gameDataProxy.curRoundResult as FreeGameOneRoundResult;
            if (!!freeGameResult.displayLogicInfo) {
                startAmount = this.gameDataProxy.convertCredit2Cash(
                    freeGameResult.displayLogicInfo.beforeAccumulateWinWithBaseGameWin
                );
                targetAmount = this.gameDataProxy.convertCredit2Cash(
                    freeGameResult.displayLogicInfo.afterAccumulateWinWithBaseGameWin
                );
                winType = this.gameDataProxy.curRoundResult.displayInfo.winType;
                scoringTime = this.gameDataProxy.curRoundResult.displayInfo.scoringTime;
                winBoardTargetAmount = this.gameDataProxy.convertCredit2Cash(
                    (this.gameDataProxy.curRoundResult as FreeGameOneRoundResult).waysGameResult.playerWin
                );
            }
        } else if (this.gameDataProxy.afterFeatureGame) {
            targetAmount = this.gameDataProxy.totalWinAmount;
            winType = this.gameDataProxy.totalWinType;
            scoringTime = this.gameDataProxy.totalScoringTime;
            winBoardTargetAmount = targetAmount;
        } else {
            targetAmount = this.gameDataProxy.convertCredit2Cash(
                this.gameDataProxy.curRoundResult.waysGameResult.playerWin
            );
            winType = this.gameDataProxy.curRoundResult.displayInfo.winType;
            scoringTime = this.gameDataProxy.curRoundResult.displayInfo.scoringTime;
            winBoardTargetAmount = targetAmount;
        }
        this.finalWinAmount = targetAmount;
        this.finalWinBoardAmount = winBoardTargetAmount;
        this.finalWinType = winType;
        this.finalScoringTime = scoringTime;
        // 得分音樂

        let delayTime = winType >= WinType.bigWin ? this.winTypeDelayScoringTime : 0;
        GlobalTimer.getInstance()
            .registerTimer(
                this.timerKey_Sound,
                delayTime,
                () => {
                    // 滾分開始前淡出BGM
                    this.fadeBGMForScoring(0, 0.5);
                    this.playScoring(this.finalWinType);
                    this.playScoringVocal(this.finalWinType);
                    this.setScoringData(startAmount, targetAmount, winBoardTargetAmount);
                },
                this
            )
            .start();
    }

    protected setScoringData(startAmount: number, targetAmount: number, winBoardTargetAmount: number) {
        this.scoringNormal(startAmount, targetAmount, winBoardTargetAmount, this.finalScoringTime);
    }

    /**
     * 大獎沒有升階表演
     * @param startAmount BBW 滾分初使值
     * @param targetAmount BBW 滾分目標值
     * @param winBoardTargetAmount Win Board 滾分目標值
     * @param scoringTime 滾分時間
     */
    protected scoringNormal(
        startAmount: number,
        targetAmount: number,
        winBoardTargetAmount: number,
        scoringTime: number
    ) {
        this.sendNotification(WinEvent.RUN_WIN_LABEL_START, {
            startAmount: startAmount,
            targetAmount: targetAmount,
            winBoardStartAmount: 0,
            winBoardTargetAmount: winBoardTargetAmount,
            scoringTime: scoringTime,
            winType: this.finalWinType,
            runCompleteCallback: this.runComplete.bind(this)
        });
    }

    // 表演結束
    protected runComplete(isForceComplete: boolean) {
        this.playScoringEnd(isForceComplete);
        // 滾分結束後恢復BGM
        this.fadeBGMForScoring(1, 1.0);
        this.sendNotification(WinEvent.RUN_WIN_LABEL_COMPLETE, {
            targetAmount: this.finalWinAmount,
            winBoardTargetAmount: this.finalWinBoardAmount,
            winType: this.finalWinType
        });
    }

    public playScoring(winType: WinType) {
        if (winType >= WinType.bigWin) {
            switch (winType) {
                case WinType.bigWin:
                    AudioManager.Instance.play(ScoringClipsEnum.Scoring_Win01);
                    break;
                case WinType.megaWin:
                    AudioManager.Instance.play(ScoringClipsEnum.Scoring_Win02);
                    break;
                case WinType.superWin:
                    AudioManager.Instance.play(ScoringClipsEnum.Scoring_Win03);
                    break;
                case WinType.jumboWin:
                    AudioManager.Instance.play(ScoringClipsEnum.Scoring_Win04);
                    break;
            }
        } else {
            if (winType != WinType.none) {
                if (this.gameDataProxy.curScene == GameScene.Game_2) {
                    AudioManager.Instance.stop(ScoringClipsEnum.Scoring_FreeEnd, true);
                    AudioManager.Instance.stop(ScoringClipsEnum.Scoring_Free, true);
                    AudioManager.Instance.play(ScoringClipsEnum.Scoring_Free).loop(true);
                } else {
                    AudioManager.Instance.stop(ScoringClipsEnum.Scoring_BaseEnd, true);
                    AudioManager.Instance.stop(ScoringClipsEnum.Scoring_Base, true);
                    if (winType < WinType.section_2) {
                        AudioManager.Instance.play(ScoringClipsEnum.Scoring_BaseEnd);
                    } else {
                        AudioManager.Instance.play(ScoringClipsEnum.Scoring_Base).loop(true);
                    }
                }
            }
        }
    }

    private playScoringVocal(winType: WinType) {
        if (winType >= WinType.bigWin) {
            let audioSplit = '';
            switch (winType) {
                case WinType.bigWin:
                    audioSplit = ScoringClipsEnum.ScoringWin01_zh;
                    break;
                case WinType.megaWin:
                    audioSplit = ScoringClipsEnum.ScoringWin02_zh;
                    break;
                case WinType.superWin:
                    audioSplit = ScoringClipsEnum.ScoringWin03_zh;
                    break;
                case WinType.jumboWin:
                    audioSplit = ScoringClipsEnum.ScoringWin04_zh;
                    break;
            }
            let audioName = audioSplit.split('_')[0] + '_' + this.gameDataProxy.language;
            AudioManager.Instance.play(audioName);
        }
    }

    private playScoringEnd(isForceComplete: boolean) {
        let winType = this.finalWinType;
        GlobalTimer.getInstance().stop(this.timerKey);
        GlobalTimer.getInstance().stop(this.timerKey_Sound);
        GlobalTimer.getInstance().removeTimer(this.timerKey);
        GlobalTimer.getInstance().removeTimer(this.timerKey_Sound);
        if (this.gameDataProxy.winBoardState == WinBoardState.SHOW) {
            if (isForceComplete) {
                switch (winType) {
                    case WinType.bigWin:
                        AudioManager.Instance.stop(ScoringClipsEnum.Scoring_Win01).fade(0, 0.5);
                        break;
                    case WinType.megaWin:
                        AudioManager.Instance.stop(ScoringClipsEnum.Scoring_Win02).fade(0, 0.5);
                        break;
                    case WinType.superWin:
                        AudioManager.Instance.stop(ScoringClipsEnum.Scoring_Win03).fade(0, 0.5);
                        break;
                    case WinType.jumboWin:
                        AudioManager.Instance.stop(ScoringClipsEnum.Scoring_Win04).fade(0, 0.5);
                        break;
                }
            } else {
                switch (winType) {
                    case WinType.bigWin:
                        AudioManager.Instance.stop(ScoringClipsEnum.Scoring_Win01).fade(0, 1.0);
                        break;
                    case WinType.megaWin:
                        AudioManager.Instance.stop(ScoringClipsEnum.Scoring_Win02).fade(0, 1.0);
                        break;
                    case WinType.superWin:
                        AudioManager.Instance.stop(ScoringClipsEnum.Scoring_Win03).fade(0, 1.0);
                        break;
                    case WinType.jumboWin:
                        AudioManager.Instance.stop(ScoringClipsEnum.Scoring_Win04).fade(0, 1.0);
                        break;
                }
            }
        } else {
            if (this.gameDataProxy.curScene == GameScene.Game_2) {
                AudioManager.Instance.stop(ScoringClipsEnum.Scoring_Free, true);
            } else {
                AudioManager.Instance.stop(ScoringClipsEnum.Scoring_Base, true);
            }
            if (this.gameDataProxy.winBoardState == WinBoardState.HIDE) {
                if (this.gameDataProxy.scrollingEndPlayed == false) {
                    this.gameDataProxy.scrollingEndPlayed = true;
                    if (this.gameDataProxy.curScene == GameScene.Game_2) {
                        AudioManager.Instance.play(ScoringClipsEnum.Scoring_FreeEnd);
                    } else {
                        if (winType >= WinType.section_2) {
                            AudioManager.Instance.play(ScoringClipsEnum.Scoring_BaseEnd);
                        }
                    }
                }
            }
        }
    }

    // ======================== Get Set ========================
    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }
    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    /**
     * 根據遊戲場景淡入淡出BGM
     * @param volume 目標音量 (0-1)
     * @param duration 淡入淡出時間
     */
    private fadeBGMForScoring(volume: number, duration: number) {
        switch (this.gameDataProxy.curScene) {
            case GameScene.Game_1:
                AudioManager.Instance.fade(BGMClipsEnum.BGM_Base, volume, duration);
                break;
            case GameScene.Game_2:
                AudioManager.Instance.fade(BGMClipsEnum.BGM_FreeGame, volume, duration);
                break;
        }
    }
}
