import { _decorator, Component, Prefab, Node } from 'cc';
import { TimelineTool } from 'TimelineTool';
import { ScoreCollectHandler } from '../../game/view/ScoreCollectHandler';
import { AudioClipsEnum, BGMClipsEnum } from '../../game/vo/enum/SoundMap';
import { PoolManager } from '../../sgv3/PoolManager';
import { SpineTailPerform } from '../spine-trail-perform/SpineTailPerform';
import { AudioManager } from '../../audio/AudioManager';
import { GlobalTimer } from 'src/sgv3/util/GlobalTimer';

const { ccclass, property } = _decorator;

@ccclass('JackPotPerformControl')
export class JackPotPerformControl extends Component {
    @property({ type: SpineTailPerform })
    private DragonSpineTrailPerform: SpineTailPerform | null = null;

    @property({ type: TimelineTool })
    private JackpotAvatar: TimelineTool | null = null;

    @property({ type: Prefab, visible: true })
    public scorePrefab: Prefab | null = null;

    @property({ type: Node, visible: true })
    public effectTarget: Node | null = null;

    private TopCountNum: ScoreCollectHandler | null = null;
    private ballHitList: Array<number> = [];
    //BaseGame打擊
    public BaseTrailPerform(spineDragonTrailAnimatID: number) {
        this.DragonSpineTrailPerform?.UpdateAnimationObjectID(spineDragonTrailAnimatID);
        this.DragonSpineTrailPerform?.SpineTrailEffect();
        let ballHitId = this.ballHitList.length == 0 ? 0 : this.ballHitList[this.ballHitList.length - 1] + 1;
        this.ballHitList.push(ballHitId);
        GlobalTimer.getInstance()
            .registerTimer(
                'ballHit' + ballHitId,
                0.9,
                () => {
                    GlobalTimer.getInstance().removeTimer('ballHit' + ballHitId);
                    this.OnDragonBallHit();
                    this.ballHitList.shift();
                },
                this
            )
            .start();
    }

    public FreeTrailPerform(spineDragonTrailAnimatID: number) {
        this.DragonSpineTrailPerform?.UpdateAnimationObjectID(spineDragonTrailAnimatID);
        this.DragonSpineTrailPerform?.SpineFreeTrailEffect();
    }

    private OnDragonBallHit() {
        this.JackpotAvatar?.play('Base_Hit_FX', undefined, false);
    }

    public OnFreeGameBallHit() {
        this.JackpotAvatar?.play('Free_Hit_FX');
    }

    public OnHoldAndWinBallHit() {
        this.JackpotAvatar?.play('HW_Hit_FX');
    }

    //JackPotHit
    public JackPotHit(cb: any | null = null) {
        this.JackpotAvatar?.play('Mini_Transition');
        this.scheduleOnce(() => {
            this.JackpotAvatar.clearSpineTrack('Base_Hit_FX');
        }, 0.3);
        this.scheduleOnce(() => {
            AudioManager.Instance.play(BGMClipsEnum.BGM_Mini).loop(true);
            AudioManager.Instance.play(AudioClipsEnum.Mini_DragonBallExplosion);
        }, 5.7);

        this.scheduleOnce(() => {
            () => cb();
            this.MiniEntryTrail();
        }, 6);
    }

    private MiniEntryTrail() {
        for (let index = 0; index < 12; index++) {
            this.DragonSpineTrailPerform?.SpineMiniEffect(index);
        }
    }

    public OnScoreCollect(score: string, playType: number) {
        if (this.TopCountNum == null) {
            this.TopCountNum = PoolManager.instance
                .getNode(this.scorePrefab, this.effectTarget)
                .getComponent(ScoreCollectHandler);
        }
        this.TopCountNum.node.active = true;
        this.TopCountNum.onScoreCollect(score, playType);
    }

    public showBallCountInfo(count: string) {
        if (this.TopCountNum == null) {
            this.TopCountNum = PoolManager.instance
                .getNode(this.scorePrefab, this.effectTarget)
                .getComponent(ScoreCollectHandler);
        }
        this.TopCountNum.node.active = true;
        this.TopCountNum.ballCountUpdate(count);
    }

    public hideBallCountInfo() {
        if (this.TopCountNum != null) {
            this.TopCountNum.ballCountHide();
            this.TopCountNum.allFXClear();
            PoolManager.instance.putNode(this.TopCountNum.node);
            this.TopCountNum = null;
        }
    }

    public baseIdle() {
        this.JackpotAvatar?.play('Idle_NoBoard');
    }

    public fadeInBaseIdle() {
        this.JackpotAvatar?.play('Idle_NoBoard');
    }

    public freeIdle() {
        this.JackpotAvatar?.play('Idle_Free');
    }

    public fallImmediately() {
        this.JackpotAvatar.node.active = false;
    }

    //** 結算分數加總 表演*/
    public dragonBallScoreSumShow() {
        if (this.TopCountNum != null) {
            this.TopCountNum.node.active = true;
            this.TopCountNum.onScoreSum();
        }

        if (this.TopCountNum != null) {
            this.scheduleOnce(() => {
                this.TopCountNum.allFXClear();
                PoolManager.instance.putNode(this.TopCountNum.node);
                this.TopCountNum = null;
            }, 3);
        }
    }
}
