import { Vec2, _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { StateMachineCommand } from '../../core/command/StateMachineCommand';
import { StateMachineObject } from '../../core/proxy/CoreStateMachineProxy';
import { MathUtil } from '../../core/utils/MathUtil';
import { ReelDataProxy } from '../../sgv3/proxy/ReelDataProxy';
import { StateMachineProxy } from '../../sgv3/proxy/StateMachineProxy';
import { DragonUpEvent, ViewMediatorEvent } from '../../sgv3/util/Constant';
import { GlobalTimer } from '../../sgv3/util/GlobalTimer';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { AudioManager } from '../../audio/AudioManager';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { PosTweenView } from '../view/dragon-up/PosTweenView';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
import { SymbolPartType } from 'src/sgv3/vo/enum/Reel';
import { BalanceUtil } from 'src/sgv3/util/BalanceUtil';
const { ccclass } = _decorator;

@ccclass('PosTweenViewMediator')
export class PosTweenViewMediator extends BaseMediator<PosTweenView> {
    public static readonly NAME: string = 'PosTweenViewMediator';

    private targertCollectSequence: Array<Vec2> | null = null;

    private baseCreditCollectSequence: Array<Vec2> | null = null;

    private curTargertSequenceIndex: number = 0;

    private curbaseSequenceIndex: number = 0;

    private curTargertCredit: number = 0;

    public constructor(name?: string, component?: any) {
        super(name, component);
    }

    protected lazyEventListener(): void {
        this.view.node.active = false;
    }

    public listNotificationInterests(): Array<any> {
        return [
            DragonUpEvent.ON_ALL_CREDIT_COLLECT_START,
            DragonUpEvent.ON_TARGERT_COLLECT_START,
            ViewMediatorEvent.COLLECT_CREDIT_BALL
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        if (this.gameDataProxy.curScene != GameScene.Game_4) return;
        switch (name) {
            case DragonUpEvent.ON_ALL_CREDIT_COLLECT_START:
                this.onAllCreditCollectStart(notification.getBody());
                break;
            case DragonUpEvent.ON_TARGERT_COLLECT_START:
                this.onTargertCollectStart();
                break;
            case ViewMediatorEvent.COLLECT_CREDIT_BALL:
                this.onCollectCreditBall(notification.getBody());
                break;
        }
    }
    /** 設定結尾收集表演 */
    private onCollectCreditBall(array: Array<any>) {
        let pos: Vec2 = array[0];
        this.view.onCollectCredit2Ball(this.reelDataProxy.getFovPos(pos.y * 5 + pos.x, 0));
    }

    /** 當把起始設定 處理參數Reset */
    private onAllCreditCollectStart(array: Array<Array<Vec2>>) {
        this.baseCreditCollectSequence = array[0];
        this.targertCollectSequence = array[1];
        this.curTargertSequenceIndex = 0;
        this.curbaseSequenceIndex = 0;
        this.curTargertCredit = 0;

        this.sendNotification(DragonUpEvent.ON_TARGERT_COLLECT_START);
    }

    /** 目標金球開始收集設定 若球上有倍數 先處理倍數表演 */
    private onTargertCollectStart() {
        if (this.reelDataProxy.symbolFeature[this.curTargertSequence.x][this.curTargertSequence.y].multiple > 0) {
            let targertPos = this.reelDataProxy.getFovPos(
                this.curTargertSequence.y * this.reelDataProxy.symbolFeature.length + this.curTargertSequence.x,
                0,
                SymbolPartType.LABEL
            );
            let hasRespin =
                this.reelDataProxy.symbolFeature[this.curTargertSequence.x][this.curTargertSequence.y].ReSpinNum > 0;
            //設定資料
            this.view.clonePrefab();
            this.view.curObject.setMultipleSetting(
                this.reelDataProxy.symbolFeature[this.curTargertSequence.x][this.curTargertSequence.y].multiple
            );
            this.view.scheduleOnce(() => {
                this.sendNotification(DragonUpEvent.ON_MULTIPLE_ACCUMULATE_START, this.curTargertSequence);
            }, 0.1);
            //累積倍數表演
            this.view.onMultipleAccumulate(targertPos, hasRespin, () => this.BoardMultipleRoll());
            AudioManager.Instance.play(AudioClipsEnum.DragonUp_PercentCollect01);
        } else {
            this.onBaseCreditCollectStart();
        }
    }

    private BoardMultipleRoll() {
        AudioManager.Instance.play(AudioClipsEnum.DragonUp_PercentHit);
        AudioManager.Instance.play(AudioClipsEnum.DragonUp_PercentSpin);
        this.view.BoardmultipleRoll(
            this.reelDataProxy.symbolFeature[this.curTargertSequence.x][this.curTargertSequence.y].multiple,
            () => this.onMultipleAccumulateEnd()
        );
    }

    /** 每顆金球上 倍數表演累積完成時 設定 */
    private onMultipleAccumulateEnd() {
        this.sendNotification(DragonUpEvent.ON_MULTIPLE_ACCUMULATE_END);
        this.onBaseCreditCollectStart();
    }

    /** 每顆 C1球要開始收集至金球上時 */
    private onBaseCreditCollectStart() {
        for (let i = 0; i < this.baseCreditCollectSequence.length; i++) {
            GlobalTimer.getInstance()
                .registerTimer(
                    'collectEffect' + i,
                    i * 0.3,
                    () => {
                        GlobalTimer.getInstance().removeTimer('collectEffect' + this.curbaseSequenceIndex);

                        let basePos = this.reelDataProxy.getFovPos(
                            this.curBaseSequence.y * this.reelDataProxy.symbolFeature.length + this.curBaseSequence.x,
                            0
                        );
                        let targertPos = this.reelDataProxy.getFovPos(
                            this.curTargertSequence.y * this.reelDataProxy.symbolFeature.length +
                                this.curTargertSequence.x,
                            0
                        );

                        //設定資料
                        this.view.cloneArrayPrefab();
                        this.view.arrayObject[this.curbaseSequenceIndex].setBaseCreditSetting(
                            this.reelDataProxy.symbolFeature[this.curBaseSequence.x][this.curBaseSequence.y].isSpecial,
                            this.reelDataProxy.symbolFeature[this.curBaseSequence.x][this.curBaseSequence.y].creditCent,
                            this.gameDataProxy.isOmniChannel()
                        );
                        //BaseCredit收集表演
                        this.view.onBaseCreditCollect(this.curbaseSequenceIndex, basePos, targertPos, (idx: number) =>
                            this.onBaseCreditCollectEnd(idx)
                        );

                        //飛行音效播放
                        AudioManager.Instance.play(AudioClipsEnum.DragonUp_C1Collect);
                        this.sendNotification(
                            DragonUpEvent.ON_BASE_CREDIT_COLLECT_START,
                            this.curBaseSequence.y * this.reelDataProxy.symbolFeature.length + this.curBaseSequence.x
                        );

                        this.curbaseSequenceIndex++;
                    },
                    this
                )
                .start();
        }
    }

    /** 每顆 C1球已經收集至金球上時  */
    private onBaseCreditCollectEnd(sequenceIndex: number) {
        let reelIndex = this.curTargertSequence.y * this.reelDataProxy.symbolFeature.length + this.curTargertSequence.x;
        this.curTargertCredit = MathUtil.add(
            this.curTargertCredit,
            this.reelDataProxy.symbolFeature[this.getCurBaseSequenceByIndex(sequenceIndex).x][
                this.getCurBaseSequenceByIndex(sequenceIndex).y
            ].creditCent
        );
        let creditDisplay = this.gameDataProxy.isOmniChannel()
            ? this.curTargertCredit.toString()
            : BalanceUtil.formatBalanceWithExpressingUnits(this.curTargertCredit);
        this.sendNotification(DragonUpEvent.ON_BASE_CREDIT_COLLECT_END, {
            reelIndex: reelIndex,
            credit: creditDisplay
        });

        if (sequenceIndex >= this.baseCreditCollectSequence.length - 1) {
            AudioManager.Instance.play(AudioClipsEnum.DragonUp_C1CollectHitEnd);
            this.onGetMultipleResult();
        } else {
            let curAudioBaseSequenceName = (sequenceIndex % 7) + 1; //打擊音效設定
            //打擊音效播放
            AudioManager.Instance.stop(this.getAudioBaseSequenceName(curAudioBaseSequenceName - 1), true);
            AudioManager.Instance.play(this.getAudioBaseSequenceName(curAudioBaseSequenceName));
        }
    }

    /** 每顆金球收集結束後 到倍數加成階段時  */
    private onGetMultipleResult() {
        let targertIndex =
            this.curTargertSequence.y * this.reelDataProxy.symbolFeature.length + this.curTargertSequence.x;
        let targertPos = this.reelDataProxy.getFovPos(
            this.curTargertSequence.y * this.reelDataProxy.symbolFeature.length + this.curTargertSequence.x,
            0,
            SymbolPartType.LABEL
        );

        this.sendNotification(DragonUpEvent.ON_GET_MULTIPLE_RESULT_START, targertIndex);

        if (this.isHasMultipleResult) {
            //設定資料
            this.view.clonePrefab();
            this.view.curObject.setMultipleSetting(this.view.multipleBoard.multiple);
            this.view.onGetMultipleResult(targertPos, () => this.onCheckTargertIndex(true));
            this.view.scheduleOnce(() => {
                AudioManager.Instance.play(AudioClipsEnum.DragonUp_PercentCollect02);
            }, 0.6);
        } else {
            this.onCheckTargertIndex(false);
        }
    }

    /** 當下金球流程表演完時 判定是否要進行下一顆金球表演 */
    private onCheckTargertIndex(hasMultiple: boolean) {
        if (hasMultiple) {
            let targertIndex =
                this.curTargertSequence.y * this.reelDataProxy.symbolFeature.length + this.curTargertSequence.x;
            let targertCreditResult =
                this.reelDataProxy.symbolFeature[this.curTargertSequence.x][this.curTargertSequence.y].creditCent;
            let creditDisplay = this.gameDataProxy.isOmniChannel()
                ? targertCreditResult.toString()
                : BalanceUtil.formatBalanceWithExpressingUnits(targertCreditResult);
            this.sendNotification(DragonUpEvent.ON_GET_MULTIPLE_RESULT_END, {
                reelIndex: targertIndex,
                credit: creditDisplay
            });

            AudioManager.Instance.play(AudioClipsEnum.DragonUp_PercentHit);
        }

        this.curTargertSequenceIndex++;
        this.curbaseSequenceIndex = 0;
        this.curTargertCredit = 0;
        let waitTime = hasMultiple ? 0.3 : 0.1;

        this.view.clearArray();
        GlobalTimer.getInstance().registerTimer('onNextTargertIndex', waitTime, this.onNextTargertIndex, this).start();
    }

    private onNextTargertIndex() {
        if (this.curTargertSequenceIndex >= this.targertCollectSequence.length) {
            this.baseCreditCollectSequence = [];
            this.targertCollectSequence = [];
            GlobalTimer.getInstance().registerTimer('onCollectEnd', 0.5, this.onAllCreditCollectEnd, this).start();
        } else {
            this.sendNotification(DragonUpEvent.ON_TARGERT_COLLECT_START, this.curTargertSequence);
        }
        GlobalTimer.getInstance().removeTimer('onNextTargertIndex');
    }

    private onAllCreditCollectEnd() {
        GlobalTimer.getInstance().removeTimer('onCollectEnd');
        this.sendNotification(DragonUpEvent.ON_ALL_CREDIT_COLLECT_END);
        this.sendNotification(StateMachineCommand.NAME, new StateMachineObject(StateMachineProxy.GAME4_AFTERSHOW));
    }

    // ======================== Get Set ========================

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

    protected getAudioBaseSequenceName(value: number): AudioClipsEnum {
        switch (value) {
            case 1:
                return AudioClipsEnum.DragonUp_C1CollectHit01;
            case 2:
                return AudioClipsEnum.DragonUp_C1CollectHit02;
            case 3:
                return AudioClipsEnum.DragonUp_C1CollectHit03;
            case 4:
                return AudioClipsEnum.DragonUp_C1CollectHit04;
            case 5:
                return AudioClipsEnum.DragonUp_C1CollectHit05;
            case 6:
                return AudioClipsEnum.DragonUp_C1CollectHit06;
            case 7:
                return AudioClipsEnum.DragonUp_C1CollectHit07;
            default:
                return AudioClipsEnum.DragonUp_C1CollectHit01;
        }
    }

    protected get curBaseSequence(): Vec2 {
        return this.baseCreditCollectSequence[this.curbaseSequenceIndex];
    }

    protected get curTargertSequence(): Vec2 {
        return this.targertCollectSequence[this.curTargertSequenceIndex];
    }

    protected getCurBaseSequenceByIndex(index): Vec2 {
        return this.baseCreditCollectSequence[index];
    }

    protected get isHasMultipleResult(): boolean {
        const ballInCash = this.gameDataProxy.convertCredit2Cash(
            this.gameDataProxy.spinEventData.baseGameResult.extendInfoForbaseGameResult.ballTotalCredit
        );
        let creditDisplay = this.gameDataProxy.isOmniChannel()
            ? this.gameDataProxy.getCreditByDenomMultiplier(ballInCash)
            : ballInCash;
        return (
            this.reelDataProxy.symbolFeature[this.curTargertSequence.x][this.curTargertSequence.y].creditCent !=
            creditDisplay
        );
    }
}
