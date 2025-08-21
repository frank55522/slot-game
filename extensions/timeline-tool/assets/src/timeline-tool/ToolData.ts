import { _decorator, Enum, sp, Animation, Color } from 'cc';
import { ParticleContentTool } from '../particle-tool/ParticleContentTool';

const { ccclass, property } = _decorator;

enum SpinesEnum {
    '<None>' = 0
}
enum AnimsEnum {
    '<None>' = 0
}

export enum TimelineType {
    Spine = 0,
    Animation,
    Time
}

export enum ParticleState {
    Play = 0,
    Stop
}

export enum TimelineMode {
    Normal,
    Tandem //串接Timeline模式
}

@ccclass('AnimationSetupData')
export class AnimationSetupData {
    @property({ type: Animation })
    public animation: Animation | null = null;
    @property({ type: Enum(AnimsEnum) })
    public _animationName: AnimsEnum = AnimsEnum['<None>'];
    @property({ type: Enum(AnimsEnum) })
    public get animationName() {
        return this._animationName;
    }
    public set animationName(value) {
        this._animationName = value;
        if (this.animation != null) {
            this.animationNameString = this.animation.clips[value]?.name ?? '';
        }
    }
    @property({ type: String, readonly: true })
    public animationNameString: string = '';
    @property({ type: Number })
    public delayTime: number = 0;
}
@ccclass('SpineSetupData')
export class SpineSetupData {
    @property({ type: sp.Skeleton })
    public spine: sp.Skeleton = null;
    @property({ type: Enum(SpinesEnum) })
    public _spineName: SpinesEnum = SpinesEnum['<None>'];
    @property({ type: Enum(SpinesEnum) })
    public get spineName() {
        return this._spineName;
    }
    public set spineName(index) {
        this._spineName = index;
        if (this.spine != null) {
            this.spineNameString =
                index > 0 ? Object.getOwnPropertyDescriptor(this.spine.skeletonData.getAnimsEnum(), index).value : '';
        }
    }
    @property({ type: String, readonly: true })
    public spineNameString: string = '';
    @property({ type: Number })
    public trackIndex: number = 0;
    @property({ type: Number })
    public timeScale: number = 1;
    @property({ type: Number })
    public delayTime: number = 0;
    @property({ type: Boolean })
    public isLoop: boolean = false;
    @property({ type: Boolean, tooltip: '播放前是否將圖像恢復初始狀態' })
    public isResetSlots: boolean = false;
    @property({ type: Boolean, tooltip: '播放前是否將骨架恢復初始狀態' })
    public isResetBones: boolean = false;
    @property({
        type: Boolean,
        tooltip: '動畫結束後是否關閉節點',
        visible() {
            return this.isLoop == false;
        }
    })
    public isEndClose: boolean = false;
    public trackEntry: any;
}

@ccclass('ParticleSetupData')
export class ParticleSetupData {
    @property({ type: ParticleContentTool })
    particle: ParticleContentTool;
    @property({ type: Number })
    delayTime: number = 0;
    @property({ type: Enum(ParticleState) })
    particleState: ParticleState = ParticleState.Play;
    @property({
        readonly: true,
        visible() {
            return this.particle;
        },
        type: Boolean
    })
    isParticleLoop: boolean;
    @property({
        readonly: true,
        visible() {
            return this.particle;
        },
        type: Color
    })
    initParticleColor: Color;
    @property({
        readonly: true,
        visible() {
            return this.particle;
        },
        type: Number
    })
    cycleTime: number;
    @property({
        readonly: true,
        visible() {
            return this.particle;
        },
        type: Number
    })
    clearParticleTime: number;
}

@ccclass('TimelineTimeSetupData')
export class TimelineTimeSetupData {
    @property({ type: Number })
    public toNextStateTime: number = 0;
    @property({ type: Boolean })
    public useSpine = false;
    @property({ type: Boolean })
    public useAnim = false;
    @property({ type: Boolean })
    public useParticle = false;
    @property({
        visible() {
            return this.useSpine;
        },
        type: SpineSetupData
    })
    public spineSetupData: SpineSetupData = new SpineSetupData();
    @property({
        visible() {
            return this.useAnim;
        },
        type: AnimationSetupData
    })
    public animSetupData: AnimationSetupData = new AnimationSetupData();
    @property({
        visible() {
            return this.useParticle;
        },
        type: [ParticleSetupData]
    })
    public particleData: ParticleSetupData[] = [];
}

@ccclass('TimelineAnimationSetupData')
export class TimelineAnimationSetupData extends AnimationSetupData {
    @property({ type: Boolean })
    public useSpine = false;
    @property({ type: Boolean })
    public useAnim = false;
    @property({ type: Boolean })
    public useParticle = false;
    @property({
        visible() {
            return this.useSpine;
        },
        type: SpineSetupData
    })
    public spineSetupData: SpineSetupData = new SpineSetupData();
    @property({
        visible() {
            return this.useAnim;
        },
        type: AnimationSetupData
    })
    public animSetupData: AnimationSetupData = new AnimationSetupData();
    @property({
        visible() {
            return this.useParticle;
        },
        type: [ParticleSetupData]
    })
    public particleData: ParticleSetupData[] = [];
}

@ccclass('TimelineSpineSetupData')
export class TimelineSpineSetupData extends SpineSetupData {
    @property({ type: Boolean })
    public useSpine = false;
    @property({ type: Boolean })
    public useAnim = false;
    @property({ type: Boolean })
    public useParticle = false;
    @property({
        visible() {
            return this.useSpine;
        },
        type: SpineSetupData
    })
    public spineSetupData: SpineSetupData = new SpineSetupData();
    @property({
        visible() {
            return this.useAnim;
        },
        type: AnimationSetupData
    })
    public animSetupData: AnimationSetupData = new AnimationSetupData();
    @property({
        visible() {
            return this.useParticle;
        },
        type: [ParticleSetupData]
    })
    public particleData: ParticleSetupData[] = [];
}

@ccclass('TimelineSetupData')
export class TimelineSetupData {
    @property({ type: Enum(TimelineType) })
    timelineType: TimelineType = TimelineType.Spine;
    @property({
        visible() {
            return this.timelineType === TimelineType.Animation;
        },
        type: TimelineAnimationSetupData
    })
    public timelineAnimation: TimelineAnimationSetupData = new TimelineAnimationSetupData();
    @property({
        visible() {
            return this.timelineType === TimelineType.Spine;
        },
        type: TimelineSpineSetupData
    })
    public timelineSpine: TimelineSpineSetupData = new TimelineSpineSetupData();
    @property({
        visible() {
            return this.timelineType === TimelineType.Time;
        },
        type: TimelineTimeSetupData
    })
    public timelineTime: TimelineTimeSetupData = new TimelineTimeSetupData();
}

@ccclass('Timeline')
export class Timeline {
    @property({ type: String })
    timelineName: string = '';
    @property({ type: [TimelineSetupData] })
    timelineData: TimelineSetupData[] = [];
    timelineDataIndex: number = 0;
    TimelineEndCallBack: Function = null;
}
