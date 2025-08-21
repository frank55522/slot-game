import { _decorator, Enum, Node, Vec3 } from 'cc';
import { SceneManager } from '../../core/utils/SceneManager';
import { GlobalTimer } from '../../sgv3/util/GlobalTimer';
import { JackPotPerformControl } from '../../ta/jackpot-perform-control/JackPotPerformControl';
import { AudioManager } from '../../audio/AudioManager';
import { BallHitViewMediator } from '../mediator/BallHitViewMediator';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
import { GameUIOrientationSetting } from '../vo/GameUIOrientationSetting';
import BaseView from 'src/base/BaseView';
import { EmblemControl } from './EmblemControl';
import { GameSceneOption } from 'src/sgv3/vo/data/GameScene';

const { ccclass, property } = _decorator;

export enum EmblemLevel {
    Level_1 = 0,
    Level_2 = 1,
    Level_3 = 2,
    Level_4 = 3
}

@ccclass('TransformSetting')
export class TransformSetting {
    @property({})
    public isChangeScale: boolean = false;
    @property({})
    public isChangePosition: boolean = false;
    @property({
        visible() {
            return this.isChangePosition;
        }
    })
    public position: Vec3 = new Vec3();
    @property({
        visible() {
            return this.isChangeScale;
        }
    })
    public scale: Vec3 = new Vec3();
}

@ccclass('TransformSettingByLevel')
export class TransformSettingByLevel {
    @property({ type: Enum(EmblemLevel) })
    public level: EmblemLevel = EmblemLevel.Level_1;

    @property({ type: TransformSetting, visible: true })
    public setting: TransformSetting = new TransformSetting();
}

@ccclass('SceneTransformSetting')
export class SceneTransformSetting {
    @property({ type: Enum(GameSceneOption), visible: true })
    public _scene: GameSceneOption = GameSceneOption.Game_1;

    public get scene(): string {
        return GameSceneOption[this._scene];
    }

    @property({ type: TransformSettingByLevel, visible: true })
    public transformSetting: Array<TransformSettingByLevel> = [];
}

@ccclass('BallHitView')
export class BallHitView extends BaseView {
    public callBack: BallHitViewMediator;
    @property(JackPotPerformControl)
    private jackPotPerformControl: JackPotPerformControl;
    @property({ type: EmblemControl })
    public emblemControl: EmblemControl | null = null;
    @property({ type: Node })
    public emblemNode: Node | null = null;
    @property({ type: [SceneTransformSetting], visible: true })
    public emblemTransformSetting: Array<SceneTransformSetting> = [];

    public baseGameIdle() {
        this.jackPotPerformControl.baseIdle();
    }

    public fadeInBaseGameIdle() {
        this.jackPotPerformControl.fadeInBaseIdle();
    }

    public freeGameIdle() {
        this.jackPotPerformControl.freeIdle();
    }

    public ballHitShow(hitInfo) {
        AudioManager.Instance.stop(AudioClipsEnum.Base_C1Collect, true);
        AudioManager.Instance.play(AudioClipsEnum.Base_C1Collect);
        let ballCount = 0;
        for (let i = 0; i < hitInfo.ballScreenLabel.length; i++) {
            for (let j = 0; j < hitInfo.ballScreenLabel[i].length; j++) {
                if (hitInfo.ballScreenLabel[i][j] > 0) {
                    ballCount++;
                    this.jackPotPerformControl.BaseTrailPerform(Number(i * 3 + j));
                }
            }
        }
        GlobalTimer.getInstance().removeTimer('ballHitShow');
        GlobalTimer.getInstance()
            .registerTimer(
                'ballHitShow',
                0.9,
                () => {
                    GlobalTimer.getInstance().removeTimer('ballHitShow');
                    if (ballCount < 6) {
                        AudioManager.Instance.stop(AudioClipsEnum.Base_C1CollectHit, true);
                        AudioManager.Instance.play(AudioClipsEnum.Base_C1CollectHit);
                    } else {
                        AudioManager.Instance.play(AudioClipsEnum.Base_C1CollectHitAlarm);
                    }
                },
                this
            )
            .start();
    }

    //** 結算分數加總 表演*/
    public ballScoreSumShow() {
        this.jackPotPerformControl.dragonBallScoreSumShow();
    }

    /**
     * Free Game / Dragon Up 收集分數球的表演
     * @param index             球在輪帶上的索引
     * @param score             顯示在龍珠的分數
     * @param playType          打擊動畫的編號
     * @param trailDelayTime    發射拖尾的延遲時間
     * @param sequenceId        收集球的順序 (Dragon Up用)
     */
    public performTrailOnBall(
        index: number,
        score: string,
        playType: number,
        trailDelayTime: number,
        sequenceId?: number
    ) {
        GlobalTimer.getInstance()
            .registerTimer(
                'performTrail' + index,
                trailDelayTime,
                () => {
                    GlobalTimer.getInstance().removeTimer('performTrail' + index);
                    this.jackPotPerformControl.FreeTrailPerform(index);
                    if (playType == 1) {
                        AudioManager.Instance.play(AudioClipsEnum.Free_C1Collect);
                    } else {
                        AudioManager.Instance.stop(AudioClipsEnum.DragonUp_C2Collect, true);
                        AudioManager.Instance.play(AudioClipsEnum.DragonUp_C2Collect);
                    }
                },
                this
            )
            .start();
        GlobalTimer.getInstance()
            .registerTimer(
                'setBallCredit' + index,
                trailDelayTime + 0.4,
                () => {
                    GlobalTimer.getInstance().removeTimer('setBallCredit' + index);
                    this.setBallCredit(score, playType);
                    if (playType == 1) {
                        AudioManager.Instance.play(AudioClipsEnum.Free_C1CollectHit);
                        this.setFreeGameBallHit();
                    } else {
                        let soundName: string = AudioClipsEnum.DragonUp_C2CollectHit01;
                        soundName = soundName.slice(0, soundName.length - 2);
                        if (sequenceId > 0) {
                            soundName += this.prefixInteger(sequenceId, 2);
                        } else {
                            soundName += 'Last';
                        }
                        AudioManager.Instance.play(soundName);
                        this.setHoldAndWinBallHit();
                    }
                },
                this
            )
            .start();
    }

    public setFreeGameBallHit() {
        this.jackPotPerformControl.OnFreeGameBallHit();
    }

    public setHoldAndWinBallHit() {
        this.jackPotPerformControl.OnHoldAndWinBallHit();
    }

    public setBallCredit(score: string, playType: number) {
        this.jackPotPerformControl.OnScoreCollect(score, playType);
    }

    public hideBallCredit() {
        this.jackPotPerformControl.OnScoreCollect('', 3);
    }

    public showBallCountInfo(count: string) {
        this.jackPotPerformControl.showBallCountInfo(count);
    }

    public hideBallCountInfo() {
        this.jackPotPerformControl.hideBallCountInfo();
    }

    // Base game 轉 Mini game
    public miniGameTransition() {
        AudioManager.Instance.play(AudioClipsEnum.JP_Slogan);
        this.jackPotPerformControl.JackPotHit();
        GlobalTimer.getInstance().removeTimer('ballTransition');
        GlobalTimer.getInstance()
            .registerTimer(
                'ballTransition',
                7,
                () => {
                    GlobalTimer.getInstance().removeTimer('ballTransition');
                    this.callBack.finishBallTransition();
                },
                this
            )
            .start();
    }

    public miniGameRecovery() {
        this.jackPotPerformControl.fallImmediately();
    }

    public initEmblemLevel(level: number[]) {
        this.emblemControl?.initialLevel(0, level[0]);
    }

    public updateEmblemLevel(level: number[]) {
        this.emblemControl?.updateLevel(0, level[0]);
    }

    // 數字左邊補零
    private prefixInteger(num: number, length: number): any {
        return (Array(length).join('0') + num).slice(-length);
    }

    // 直橫式轉換

    private _uiOrientation: Array<GameUIOrientationSetting> | null = null;

    private get uiOrientation() {
        if (this._uiOrientation == null) {
            this._uiOrientation = this.getComponentsInChildren(GameUIOrientationSetting);
        }
        return this._uiOrientation;
    }

    public changeOrientation(orientation: string, scene: string) {
        let isHorizontal = orientation == SceneManager.EV_ORIENTATION_HORIZONTAL;
        for (let i = 0; i < this.uiOrientation.length; i++) {
            this.uiOrientation[i].changeOrientation(isHorizontal, scene);
        }
    }

    public changeScene(curScene: string) {
        let curLevel = this.emblemControl.getLevel() - 1;
        let emblemSetting = this.emblemTransformSetting.find((setting) => setting.scene == curScene);
        if (emblemSetting) {
            let settingByLevel = emblemSetting.transformSetting.find((setting) => setting.level == curLevel);
            if (settingByLevel) {
                let setting = settingByLevel.setting;
                if (setting.isChangePosition) {
                    this.emblemNode.setPosition(setting.position);
                }
                if (setting.isChangeScale) {
                    this.emblemNode.setScale(setting.scale);
                }
            }
        }
    }
}
