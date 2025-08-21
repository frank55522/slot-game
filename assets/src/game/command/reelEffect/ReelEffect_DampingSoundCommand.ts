import { _decorator } from 'cc';
import { ReelDataProxy } from '../../../sgv3/proxy/ReelDataProxy';
import { GameScene } from '../../../sgv3/vo/data/GameScene';
import { LockType } from '../../../sgv3/vo/enum/Reel';
import { FreeGameOneRoundResult } from '../../../sgv3/vo/result/FreeGameOneRoundResult';
import { GAME_GameDataProxy } from '../../proxy/GAME_GameDataProxy';
import { AudioClipsEnum } from '../../vo/enum/SoundMap';

export class ReelEffect_DampingSoundCommand extends puremvc.SimpleCommand {
    private spinStopSequenceLength: number = 0;
    private hitNum: number = 0;

    public execute(notification: puremvc.INotification) {
        this.spinStopSequenceLength = this.gameDataProxy.getSceneDataByName(
            this.gameDataProxy.curScene
        ).reelSpinStopSequence.length;

        // if (this.reelDataProxy.reelStopSoundSequence == null) {
        //     this.reelDataProxy.reelStopSoundSequence = [];
        //     for (let i = 0; i < this.spinStopSequenceLength; i++) {
        //         let curSequence = Array<AudioClipsEnum>();
        //         this.reelDataProxy.reelStopSoundSequence.push(curSequence);
        //     }
        // }
        this.hitNum = 0;

        switch (this.gameDataProxy.curScene) {
            case GameScene.Game_1:
                this.handleGame1SoundSequence();
                break;
            case GameScene.Game_2:
                this.handleGame2SoundSequence();
                break;
            case GameScene.Game_4:
                this.handleGame4SoundSequence();
                break;
        }
    }

    protected handleGame1SoundSequence() {
        let c1Count = 0;
        for (let i = 0; i < this.spinStopSequenceLength; i++) {
            let curSequence = this.reelDataProxy.reelStopSoundSequence[i];
            let screenRow = this.reelDataProxy.symbolFeature[i].length;
            for (let j = 0; j < this.reelDataProxy.symbolFeature[i].length; j++) {
                if (this.reelDataProxy.symbolFeature[i][j].creditCent > 0) {
                    c1Count++;
                }
            }
            if (this.reelDataProxy.symbolFeature[i].some((feature) => feature.creditCent > 0)) {
                if (c1Count + (this.spinStopSequenceLength - 1 - i) * screenRow >= 6) {
                    let isSpecial = this.reelDataProxy.symbolFeature[i].some((feature) => feature.isSpecial);
                    let soundType = this.getHitC1SoundType(isSpecial);
                    curSequence.push(soundType);
                    this.hitNum++;
                }
            }
            curSequence = this.getHitCorrectness(curSequence, i, c1Count);
        }
        if (c1Count >= 6) {
            //處理最後一顆C1音效
            this.setLastHitSequenceSound();
        }
    }

    protected handleGame2SoundSequence() {
        let freeHitC1Count = 0;
        for (let i = 0; i < this.spinStopSequenceLength; i++) {
            let curSequence = this.reelDataProxy.reelStopSoundSequence[i];
            let scatterCount: number = 0;
            for (let j = 0; j < this.reelDataProxy.symbolFeature[i].length; j++) {
                if (this.reelDataProxy.symbolFeature[i][j].hasScatter) {
                    scatterCount++;
                }
            }
            if (freeHitC1Count > 0 && scatterCount >= 1) {
                curSequence.push(AudioClipsEnum.Free_C1Hit01);
            } else if (scatterCount >= 2) {
                freeHitC1Count++;
                curSequence.push(AudioClipsEnum.Free_C1Hit01);
            } else if (scatterCount >= 1) {
                freeHitC1Count++;
                curSequence.push(AudioClipsEnum.Free_C1Hit01);
            }
        }
        this.handleRespin();
    }

    protected handleGame4SoundSequence() {
        for (let i = 0; i < this.spinStopSequenceLength; i++) {
            let curSequence = this.reelDataProxy.reelStopSoundSequence[i];
            for (let j = 0; j < this.reelDataProxy.symbolFeature[i].length; j++) {
                if (this.reelDataProxy.symbolFeature[i][j].ReSpinNum > 0) {
                    curSequence.push(AudioClipsEnum.DragonUp_RetriggerHit);
                }
                //設定C2滾停音效 同把兩顆以上 需做處理
                if (this.reelDataProxy.symbolFeature[i][j].lockType == LockType.NEW_LOCK && this.hitNum == 0) {
                    curSequence.push(AudioClipsEnum.DragonUp_C2Hit01);
                    this.hitNum++;
                } else if (this.reelDataProxy.symbolFeature[i][j].lockType == LockType.NEW_LOCK) {
                    curSequence.push(AudioClipsEnum.DragonUp_C2Hit02);
                }
            }
        }
    }

    protected getHitCorrectness(
        curSequence: Array<AudioClipsEnum>,
        curSequenceIndex: number,
        ballCount: number
    ): Array<AudioClipsEnum> {
        /**
         * check Hit Sound Correctness
         * 1. 若觸發BonusGame 則不須確認
         * 2. 第四序列 音效 若有累積至三顆以上 將回傳設定陣列值
         * 3. 最後序列 音效 若有累積至六顆以上 將回傳設定陣列值
         * 不在上述條件,返回原本陣列
         */
        if (ballCount >= 6 || curSequenceIndex < 3) {
            return curSequence;
        }
        if (curSequenceIndex == 3) {
            return ballCount >= 3 ? curSequence : [AudioClipsEnum.SpinStop];
        }
        if (curSequenceIndex == 4) {
            return ballCount >= 6 ? curSequence : [AudioClipsEnum.SpinStop];
        }
        return curSequence;
    }

    protected setLastHitSequenceSound() {
        for (let i = this.spinStopSequenceLength - 1; i >= 0; i--) {
            for (let j = 0; j < this.reelDataProxy.symbolFeature[i].length; j++) {
                if (this.reelDataProxy.symbolFeature[i][j].creditCent > 0) {
                    this.reelDataProxy.reelStopSoundSequence[i][1] = this.reelDataProxy.symbolFeature[i][j].isSpecial
                        ? AudioClipsEnum.Base_C1Hit888Last
                        : AudioClipsEnum.Base_C1HitLast;
                    return;
                }
            }
        }
    }

    protected getHitC1SoundType(isSpecial: boolean): AudioClipsEnum {
        switch (this.hitNum) {
            case 0:
                return isSpecial ? AudioClipsEnum.Base_C1Hit8881 : AudioClipsEnum.Base_C1Hit01;
            case 1:
                return isSpecial ? AudioClipsEnum.Base_C1Hit8882 : AudioClipsEnum.Base_C1Hit02;
            case 2:
                return isSpecial ? AudioClipsEnum.Base_C1Hit8883 : AudioClipsEnum.Base_C1Hit03;
            case 3:
                return isSpecial ? AudioClipsEnum.Base_C1Hit8884 : AudioClipsEnum.Base_C1Hit04;
            case 4:
                return isSpecial ? AudioClipsEnum.Base_C1Hit888Last : AudioClipsEnum.Base_C1HitLast;
        }
    }

    private handleRespin() {
        if (
            (this.gameDataProxy.curRoundResult as FreeGameOneRoundResult).extendInfoForFreeGameResult.isRespinFeature ==
            false
        ) {
            const reel1StackWW = this.gameDataProxy.curRoundResult.screenSymbol[0].filter((id) => id == 0).length == 3;
            if (reel1StackWW) {
                this.reelDataProxy.reelStopSoundSequence[0].push(AudioClipsEnum.Free_WStack01);
                const reel5StackWW =
                    this.gameDataProxy.curRoundResult.screenSymbol[4].filter((id) => id == 0).length == 3;
                if (reel5StackWW) {
                    this.reelDataProxy.reelStopSoundSequence[4].push(AudioClipsEnum.Free_WStack02);
                }
            }
        }
    }

    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }

    protected _gameDataProxy: GAME_GameDataProxy;
    protected get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
