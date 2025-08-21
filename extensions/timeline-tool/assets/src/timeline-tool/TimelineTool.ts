import { _decorator, Component, CCClass, Animation, sp } from 'cc';
import { EDITOR } from 'cc/env';
import {
    AnimationSetupData,
    ParticleSetupData,
    ParticleState,
    SpineSetupData,
    Timeline,
    TimelineType
} from './ToolData';

const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TimelineTool')
@executeInEditMode(true)
export class TimelineTool extends Component {
    @property({ type: [Timeline] })
    public arrayTimelineData: Timeline[] = [];
    private _isPlaying: boolean = false;
    public set isPlaying(value: boolean) {
        this._isPlaying = value;
    }
    public get isPlaying() {
        return this._isPlaying;
    }

    protected update() {
        if (EDITOR) {
            this.updateEditorEnum();
        }
    }

    /** Spine 主線 */
    private SetTimelineSpineData(spineSetupData: SpineSetupData, timelineName: string, callBack: Function) {
        this.handleSpineAnimation(spineSetupData, timelineName, callBack);
    }

    /** Animation 主線 */
    private SetTimelineAnimationData(animSetupData: AnimationSetupData, timelineName: string, callback: Function) {
        this.handleAnimation(animSetupData, timelineName, callback);
    }

    // 主線附加 Spine
    private SetAppendSpine(timelineData: any, timelineName: string) {
        if (timelineData.useSpine) {
            this.handleSpineAnimation(timelineData.spineSetupData, timelineName);
        }
    }

    // 主線附加 Animation
    private SetAppendAnimation(timelineData: any, timelineName: string) {
        if (timelineData.useAnim) {
            this.handleAnimation(timelineData.animSetupData, timelineName);
        }
    }

    // 主線附加 Particle
    private SetAppendParticle(timelineData: any) {
        if (timelineData.useParticle) {
            this.handleParticle(timelineData.particleData);
        }
    }

    private handleSpineAnimation(spineSetupData: SpineSetupData, timelineName: string, callBack?: Function) {
        const self = this;
        const spine = spineSetupData.spine;
        const spineAnimName = spineSetupData.spineNameString;
        if (spineAnimName == null || spineAnimName === '') {
            throw new Error(`The spine name of "${timelineName}" in ${this.node.name} is empty`);
        }

        function playSpine() {
            spine.node.active = true;
            spine.timeScale = spineSetupData.timeScale;
            self.resetSpineSlotsIfNeeded(spine, spineSetupData.isResetSlots);
            self.resetSpineBonesIfNeeded(spine, spineSetupData.isResetBones);
            let trackEntry = spine.setAnimation(spineSetupData.trackIndex, spineAnimName, spineSetupData.isLoop);
            spineSetupData.trackEntry = trackEntry;

            if (spineSetupData.isLoop === false) {
                spine.setTrackCompleteListener(trackEntry, () => {
                    spine.setTrackCompleteListener(trackEntry, () => {});
                    spine.clearTrack(spineSetupData.trackIndex);
                    spineSetupData.trackEntry = null;
                    callBack?.();
                    if (spineSetupData.isEndClose === true) {
                        spine.node.active = false;
                    }
                });
            }
        }
        // 延遲時間為0時，直接執行，避免scheduleOnce過一幀才執行
        if (spineSetupData.delayTime === 0) {
            playSpine();
        } else {
            this.scheduleOnce(playSpine, spineSetupData.delayTime);
        }
    }

    private handleAnimation(animSetupData: AnimationSetupData, timelineName: string, callback?: Function) {
        const animation = animSetupData.animation;
        const animationName = animSetupData.animationNameString;
        if (animationName == null || animationName === '') {
            throw new Error(`The animation name of "${timelineName}" in ${this.node.name} is empty`);
        }

        animation.on(
            Animation.EventType.FINISHED,
            () => {
                animation.off(Animation.EventType.FINISHED);
                callback?.();
            },
            this
        );

        function playAnim() {
            animation.play(animationName);
        }
        // 延遲時間為0時，直接執行，避免scheduleOnce過一幀才執行
        if (animSetupData.delayTime === 0) {
            playAnim();
        } else {
            this.scheduleOnce(playAnim, animSetupData.delayTime);
        }
    }

    private handleParticle(particleData: ParticleSetupData[]) {
        for (let j = 0; j < particleData.length; j++) {
            switch (particleData[j].particleState) {
                case ParticleState.Play:
                    particleData[j].particle.ParticleClear();
                    particleData[j].particle.ParticlePlay(particleData[j].delayTime);
                    break;
                case ParticleState.Stop:
                    particleData[j].particle.ParticleStop();
                    break;
            }
        }
    }

    private resetSpineSlotsIfNeeded(spine: sp.Skeleton, isResetSlots: boolean) {
        if (isResetSlots) {
            spine.setSlotsToSetupPose();
        }
    }

    private resetSpineBonesIfNeeded(spine: sp.Skeleton, isResetBones: boolean) {
        if (isResetBones) {
            spine.setBonesToSetupPose();
        }
    }

    private checkTimelineIndex(timelineIndex: number, timelineDataIndex: number) {
        if (this.isPlaying === false) return;
        const timelineName = this.arrayTimelineData[timelineIndex].timelineName;
        let timelineData;
        switch (this.arrayTimelineData[timelineIndex].timelineData[timelineDataIndex].timelineType) {
            case TimelineType.Spine:
                timelineData = this.arrayTimelineData[timelineIndex].timelineData[timelineDataIndex].timelineSpine;
                this.SetTimelineSpineData(timelineData, timelineName, this.checkTimelineEnd.bind(this, timelineIndex));
                break;
            case TimelineType.Animation:
                timelineData = this.arrayTimelineData[timelineIndex].timelineData[timelineDataIndex].timelineAnimation;
                this.SetTimelineAnimationData(
                    timelineData,
                    timelineName,
                    this.checkTimelineEnd.bind(this, timelineIndex)
                );
                break;
            case TimelineType.Time:
                timelineData = this.arrayTimelineData[timelineIndex].timelineData[timelineDataIndex].timelineTime;
                this.scheduleOnce(() => {
                    this.checkTimelineEnd(timelineIndex);
                }, timelineData.toNextStateTime);
                break;
            default:
                break;
        }
        this.SetAppendSpine(timelineData, timelineName);
        this.SetAppendAnimation(timelineData, timelineName);
        this.SetAppendParticle(timelineData);
    }

    private checkTimelineEnd(timelineIndex: number) {
        this.arrayTimelineData[timelineIndex].timelineDataIndex++;
        if (
            this.arrayTimelineData[timelineIndex].timelineDataIndex <
            this.arrayTimelineData[timelineIndex].timelineData.length
        ) {
            this.checkTimelineIndex(timelineIndex, this.arrayTimelineData[timelineIndex].timelineDataIndex);
        } else {
            this.timelineEnd(timelineIndex);
        }
    }

    private timelineEnd(timelineIndex: number) {
        let callBack = this.arrayTimelineData[timelineIndex].TimelineEndCallBack;
        this.initState(timelineIndex);
        this.isPlaying = false;
        callBack?.();
    }

    private initState(timelineIndex: number) {
        this.arrayTimelineData[timelineIndex].timelineDataIndex = 0;
        this.arrayTimelineData[timelineIndex].TimelineEndCallBack = null;
        for (let i = 0; i < this.arrayTimelineData[timelineIndex].timelineData.length; i++) {
            switch (this.arrayTimelineData[timelineIndex].timelineData[i].timelineType) {
                case TimelineType.Spine:
                    const spineSetupData = this.arrayTimelineData[timelineIndex].timelineData[i].timelineSpine;
                    if (spineSetupData.trackEntry != null) {
                        spineSetupData.spine.setTrackCompleteListener(spineSetupData.trackEntry, () => {});
                    }
                    break;
                case TimelineType.Animation:
                    this.arrayTimelineData[timelineIndex].timelineData[i].timelineAnimation.animation.off(
                        Animation.EventType.FINISHED
                    );
                    break;
                default:
                    break;
            }
        }
    }

    private changeStateInit() {
        for (let index = 0; index < this.arrayTimelineData.length; index++) {
            this.initState(index);
        }
    }

    public changeState(name: string, cb: Function = () => {}) {
        this.unscheduleAllCallbacks();
        this.changeStateInit();
    }
    //--------------------------API---------------------------
    public init() {
        this.unscheduleAllCallbacks();
        for (let index = 0; index < this.arrayTimelineData.length; index++) {
            this.arrayTimelineData[index].timelineDataIndex = 0;
            this.arrayTimelineData[index].TimelineEndCallBack = null;
            for (let i = 0; i < this.arrayTimelineData[index].timelineData.length; i++) {
                switch (this.arrayTimelineData[index].timelineData[i].timelineType) {
                    case TimelineType.Spine:
                        const timelineSpine = this.arrayTimelineData[index].timelineData[i].timelineSpine;
                        if (timelineSpine.trackEntry != null) {
                            timelineSpine.spine.setTrackCompleteListener(timelineSpine.trackEntry, () => {});
                            timelineSpine.trackEntry = null;
                        }
                        timelineSpine.spine?.clearTracks();
                        this.clearAppendOfTimeline(timelineSpine);
                        break;
                    case TimelineType.Animation:
                        const timelineAnimation = this.arrayTimelineData[index].timelineData[i].timelineAnimation;
                        timelineAnimation.animation.off(Animation.EventType.FINISHED);
                        timelineAnimation.animation?.stop();
                        this.clearAppendOfTimeline(timelineAnimation);
                        break;
                    case TimelineType.Time:
                        const timelineTime = this.arrayTimelineData[index].timelineData[i].timelineTime;
                        this.clearAppendOfTimeline(timelineTime);
                        break;
                    default:
                        break;
                }
            }
        }
        this.isPlaying = false;
    }

    private clearAppendOfTimeline(timelineData: any) {
        if (timelineData.useSpine) {
            timelineData.spineSetupData.spine?.clearTracks();
            timelineData.spineSetupData.trackEntry = null;
            timelineData.spineSetupData.spine.node.active = false;
        }
        if (timelineData.useAnim) {
            timelineData.animSetupData.animation?.stop();
        }
        if (timelineData.useParticle) {
            for (let j = 0; j < timelineData.particleData.length; j++) {
                timelineData.particleData[j].particle?.ParticleClear();
                timelineData.particleData[j].particle?.unscheduleAllCallbacks();
            }
        }
    }

    public setTimeScale(name: string, timeScale: number) {
        for (let i = 0; i < this.arrayTimelineData.length; i++) {
            if (name === this.arrayTimelineData[i].timelineName) {
                for (let j in this.arrayTimelineData[i].timelineData) {
                    switch (this.arrayTimelineData[i].timelineData[j].timelineType) {
                        case TimelineType.Spine:
                            const spineData = this.arrayTimelineData[i].timelineData[j].timelineSpine;
                            spineData.timeScale = timeScale;
                            this.setTimeScaleBySetup(spineData, timeScale);
                            break;
                        case TimelineType.Animation:
                            const animData = this.arrayTimelineData[i].timelineData[j].timelineAnimation;
                            var animationName = animData.animationNameString;
                            animData.animation.getState(animationName).speed = timeScale;
                            this.setTimeScaleBySetup(animData, timeScale);
                            break;
                        case TimelineType.Time:
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }

    private setTimeScaleBySetup(data, timeScale: number) {
        if (data.animSetupData.animation != null) {
            data.animSetupData.animation.getState(data.animSetupData.animationNameString).speed = timeScale;
        }
        if (data.spineSetupData.spine != null) {
            data.spineSetupData.timeScale = timeScale;
        }
    }

    /**
     * 播放Timeline
     * @param name Timeline名稱
     * @param cb Timeline結束後的callback
     * @param isClearDelayAndListener 是否清除前一個Timeline的延遲時間和監聽器
     */
    public play(name: string, cb?: Function, isClearDelayAndListener: boolean = true) {
        if (isClearDelayAndListener) {
            this.changeState(name, cb);
        }
        this.isPlaying = true;
        for (let i = 0; i < this.arrayTimelineData.length; i++) {
            if (name === this.arrayTimelineData[i].timelineName) {
                this.arrayTimelineData[i].TimelineEndCallBack = cb;
                this.checkTimelineIndex(i, this.arrayTimelineData[i].timelineDataIndex);
            }
        }
    }

    public stop() {
        this.init();
    }

    /**
     * 清除Spine的Track
     * @param name Timeline名稱
     */
    public clearSpineTrack(name: string) {
        for (let i = 0; i < this.arrayTimelineData.length; i++) {
            if (name === this.arrayTimelineData[i].timelineName) {
                this.arrayTimelineData[i].timelineData.forEach((data) => {
                    if (data.timelineType === TimelineType.Spine) {
                        data.timelineSpine.spine.clearTrack(data.timelineSpine.trackIndex);
                        data.timelineSpine.trackEntry = null;
                    }
                });
            }
        }
    }

    //-----------------Editor上面即時更換Enum的內容---------------------------
    updateEditorEnum() {
        for (let index = 0; index < this.arrayTimelineData.length; index++) {
            for (let i = 0; i < this.arrayTimelineData[index].timelineData.length; i++) {
                // 主線的Spine設定檔
                const timelineSpine = this.arrayTimelineData[index].timelineData[i].timelineSpine;
                if (timelineSpine.spine !== null) {
                    this.refreshEnumForSpineName(timelineSpine.spine.skeletonData.getAnimsEnum(), timelineSpine);
                } else {
                    this.refreshEnumForSpineName({ '<None>': 0 }, timelineSpine);
                }
                this.checkSpineName(timelineSpine);
                // Spine分支的Spine & Animation & Particle設定檔
                this.updateAppendOfTimeline(timelineSpine);

                // 主線的Animation設定檔
                const timelineAnimation = this.arrayTimelineData[index].timelineData[i].timelineAnimation;
                if (timelineAnimation.animation !== null) {
                    var AnimEnum: object = {};
                    for (let j = 0; j < timelineAnimation.animation.clips.length; j++) {
                        var name: string = timelineAnimation.animation.clips[j]?.name ?? '';
                        AnimEnum = Object.assign(AnimEnum, { [name]: j });
                    }
                    this.refreshEnumForAnimationName(AnimEnum, timelineAnimation);
                } else {
                    this.refreshEnumForAnimationName({ '<None>': 0 }, timelineAnimation);
                }
                this.checkAnimationName(timelineAnimation);
                // Animation分支的Spine & Animation & Particle設定檔
                this.updateAppendOfTimeline(timelineAnimation);

                // 主線的TimelineTime的Spine & Animation & Particle設定
                const timelineTime = this.arrayTimelineData[index].timelineData[i].timelineTime;
                this.updateAppendOfTimeline(timelineTime);
            }
        }
    }

    private updateAppendOfTimeline(timelineData: any) {
        const spineSetupData = timelineData.spineSetupData;
        if (spineSetupData.spine !== null) {
            this.refreshEnumForSpineName(spineSetupData.spine.skeletonData.getAnimsEnum(), spineSetupData);
        } else {
            this.refreshEnumForSpineName({ '<None>': 0 }, spineSetupData);
        }
        this.checkSpineName(spineSetupData);

        const animSetupData = timelineData.animSetupData;
        if (animSetupData.animation !== null) {
            var AnimEnum: object = {};
            for (let j = 0; j < animSetupData.animation.clips.length; j++) {
                var name: string = animSetupData.animation.clips[j]?.name ?? '';
                AnimEnum = Object.assign(AnimEnum, { [name]: j });
            }
            this.refreshEnumForAnimationName(AnimEnum, animSetupData);
        } else {
            this.refreshEnumForAnimationName({ '<None>': 0 }, animSetupData);
        }
        this.checkAnimationName(animSetupData);

        const particleData = timelineData.particleData;
        for (let j = 0; j < particleData.length; j++) {
            if (particleData[j].particle !== null) {
                particleData[j].isParticleLoop = particleData[j].particle.IsLoop;
                particleData[j].initParticleColor = particleData[j].particle.InitColor;
                particleData[j].cycleTime = particleData[j].particle.LoopOverTime;
                particleData[j].clearParticleTime = particleData[j].particle.ClearObjectTime;
            }
        }
    }

    // 檢查SpineName是否有對應到Enum的值
    private checkSpineName(timelineSpine: SpineSetupData) {
        if (timelineSpine.spine !== null) {
            const enumValue = this.getSpineAnimName(timelineSpine.spine, timelineSpine.spineName);
            if (timelineSpine.spineNameString !== enumValue) {
                const enumKeys = Object.keys(timelineSpine.spine.skeletonData.getAnimsEnum());
                let isMatch = false;
                for (let i = 0; i < enumKeys.length; i++) {
                    if (enumKeys[i] == timelineSpine.spineNameString) {
                        timelineSpine.spineName = i;
                        isMatch = true;
                        break;
                    }
                }
                if (!isMatch) {
                    timelineSpine.spineName = 0;
                }
            }
        } else {
            timelineSpine.spineName = 0;
            timelineSpine.spineNameString = '';
        }
    }

    private getSpineAnimName(spine: sp.Skeleton, animIndex: number): string {
        let animName = '';
        try {
            animName = Object.getOwnPropertyDescriptor(spine.skeletonData.getAnimsEnum(), animIndex).value;
        } catch (error) {
            console.warn('getSpineAnimName error:', error);
        }
        return animName;
    }

    // 檢查AnimationName是否有對應到Enum的值
    private checkAnimationName(timelineAnimation: AnimationSetupData) {
        if (timelineAnimation.animation !== null) {
            const animationName = this.getAnimationName(timelineAnimation.animation, timelineAnimation.animationName);
            if (timelineAnimation.animationNameString !== animationName) {
                const clips = timelineAnimation.animation.clips;
                let isMatch = false;
                for (let i = 0; i < clips.length; i++) {
                    if (clips[i]?.name == timelineAnimation.animationNameString) {
                        timelineAnimation.animationName = i;
                        isMatch = true;
                        break;
                    }
                }
                if (!isMatch) {
                    timelineAnimation.animationName = null;
                }
            }
        } else {
            timelineAnimation.animationName = 0;
            timelineAnimation.animationNameString = '';
        }
    }

    private getAnimationName(animation: Animation, animIndex: number): string {
        let animName = '';
        try {
            animName = animation.clips[animIndex]?.name ?? '';
        } catch (error) {
            console.warn('getAnimationName error:', error);
        }
        return animName;
    }

    //-----------------更換Enum內容的Function---------------------------
    private refreshEnumForSpineName(value: {}, myself: any) {
        this.refreshEnum(value, myself, 'spineName');
    }

    private refreshEnumForAnimationName(value: {}, myself: any) {
        this.refreshEnum(value, myself, 'animationName');
    }

    private refreshEnum(value: {}, myself: any, attributeName: string) {
        const arr = [];
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                arr.push({ name: key, value: value[key] });
            }
        }
        CCClass.Attr.setClassAttr(myself, attributeName, 'enumList', arr);
    }
}
