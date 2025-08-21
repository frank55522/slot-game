import { CCFloat, CCInteger, CurveRange, math, SpriteFrame, _decorator } from 'cc';
import { Layer } from '../enum/Layer';
import { MotionType } from '../enum/Reel';
const { ccclass, property } = _decorator;
/**
 * Symbol資料設定
 */
@ccclass('SymbolData')
export class SymbolData {
    @property({ visible: true })
    private _name: string = '';
    @property({ type: CCInteger, visible: true })
    private _id: number = 0;
    @property({ type: CCInteger, visible: true })
    private _orderLayer: Layer = 0;
    @property({
        type: SpriteFrame,
        visible() {
            return !this.isUseLanguage;
        }
    })
    private _mainSpriteFrame: SpriteFrame | null = null;
    @property({ type: SpriteFrame, visible: true })
    private _bgSpriteFrame: SpriteFrame | null = null;
    @property({ visible: true })
    private _isImprovedFOV: Boolean = false;

    public get name() {
        return this._name;
    }
    public get id() {
        return this._id;
    }
    public get orderLayer() {
        return this._orderLayer;
    }
    public get mainSpriteFrame() {
        return this._mainSpriteFrame;
    }
    public get bgSpriteFrame() {
        return this._bgSpriteFrame;
    }
    public get isImprovedFOV() {
        return this._isImprovedFOV;
    }
}

/**
 * 滾輪上基本參數資料
 */
@ccclass('SingleReel')
export class SingleReel {
    @property({ type: CCInteger, visible: true })
    sign: number = 0;
    @property({ visible: true })
    private _reelSize: math.Size = new math.Size();
    @property({ type: CCFloat, visible: true })
    private _symbolHeight: number = 0;
    @property({ type: CCFloat, visible: true })
    private startPos: number = 0;
    @property({ type: CCFloat, visible: true })
    private endPos: number = 0;

    private _symbolCount: number = 0;

    public get symbolHeight() {
        return this._symbolHeight;
    }

    public get reelSize() {
        return this._reelSize;
    }

    public get startPosition() {
        return this.sign > 0 ? this.startPos : this.endPos;
    }

    public get endPosition() {
        return this.sign > 0 ? this.endPos : this.startPos;
    }

    public get firstIndex() {
        return this.sign > 0 ? 0 : this._symbolCount - 1;
    }

    public get lastIndex() {
        return this.sign > 0 ? this._symbolCount - 1 : 0;
    }

    public get symbolCount() {
        return this._symbolCount;
    }

    public SetSymbolPos(symbolCount: number) {
        this._symbolCount = symbolCount;
        this.startPos = (this.symbolHeight * (symbolCount - 1)) / 2;
        this.endPos = this.startPos - this.symbolHeight * symbolCount;
    }
}

/**
 * 滾輪上Strip參數設定處理
 */
@ccclass('StripIndexer')
export class StripIndexer {
    @property({ type: CCInteger })
    public fovLength: number = 0;

    reelIndex: number = -1;
    rng: number = 0;
    targetRng: number = 0;
    strip: Array<number> = [];

    private tempCheckRng: number[] = [];

    public get benchMark(): number {
        return this.fovLength + 1; // 從最下方Symbol 數上來
    }
    /**滾動一顆進行Rng運算 */
    public next() {
        this.rng = this.normalize(this.rng - 1);
    }

    public getRng(symbolIndex: number, symbolCount: number): number {
        let temp = this.rng + (symbolIndex - (symbolCount - this.benchMark));
        return this.normalize(temp);
    }

    public getAllRng(): number[] {
        if (this.tempCheckRng.length == 0) {
            this.tempCheckRng = new Array(this.fovLength + 2);
        }
        for (let i = 0; i < this.tempCheckRng.length; i++) {
            this.tempCheckRng[i] = this.strip[this.normalize(this.targetRng + i - 1)];
        }
        return this.tempCheckRng;
    }

    public normalize(index: number) {
        index = index % this.strip.length;
        if (index < 0) {
            index = this.strip.length + index;
        }
        return index;
    }
}

/**
 * 滾輪移動基本類型
 */
@ccclass('ReelMotionData')
export class ReelMotionData {
    @property({ type: CCInteger, visible: true })
    private _pass: number = 0;
    @property({ type: CCFloat, visible: true })
    private _duration: number = 0;
    @property({ type: CCFloat, visible: true })
    private _value: number = 0;
    @property({ type: CurveRange, visible: true })
    private _tweenCurve: CurveRange = new CurveRange();

    public get pass() {
        return this._pass;
    }
    public set pass(value: number) {
        this._pass = value;
    }

    public get duration() {
        return this._duration;
    }
    public set duration(value: number) {
        this._duration = value;
    }

    public get value() {
        return this._value;
    }
    public set value(value: number) {
        this._value = value;
    }

    public get tweenCurve() {
        return this._tweenCurve;
    }
    public set tweenCurve(value: CurveRange) {
        this._tweenCurve = value;
    }
}

/**
 * 滾輪移動基本類型
 */
@ccclass('ReelForceData')
export class ReelForceData {
    @property({ type: CCFloat, visible: true })
    private _duration: number = 0;
    @property({ type: CCFloat, visible: true })
    private _force: number = 0;
    @property({ type: CurveRange, visible: true })
    private _tweenCurve: CurveRange = new CurveRange();

    public get duration() {
        return this._duration;
    }
    public set duration(value: number) {
        this._duration = value;
    }

    public get force() {
        return this._force;
    }
    public set force(value: number) {
        this._force = value;
    }

    public get tweenCurve() {
        return this._tweenCurve;
    }
    public set tweenCurve(value: CurveRange) {
        this._tweenCurve = value;
    }
}

/**
 * 滾輪滾動表演相關設定參數
 */
@ccclass('ReelPasser')
export class ReelPasser {
    @property({ type: CCFloat, visible: true })
    private _speedBase: number = 0;

    @property({ type: CCFloat, visible: true })
    private _startSpeed: number = 0;

    @property({ group: { name: MotionType.NORMAL }, type: ReelMotionData, visible: true })
    private _normalRollMotion: ReelMotionData = new ReelMotionData();

    @property({ group: { name: MotionType.NORMAL }, type: ReelMotionData, visible: true })
    private _normalStopMotion: ReelMotionData = new ReelMotionData();

    @property({ group: { name: MotionType.NORMAL }, type: ReelForceData, visible: true })
    private _normalDampMotion: ReelForceData = new ReelForceData();

    @property({ group: { name: MotionType.QUICK }, type: ReelMotionData, visible: true })
    private _quickRollMotion: ReelMotionData = new ReelMotionData();

    @property({ group: { name: MotionType.QUICK }, type: ReelMotionData, visible: true })
    private _quickStopMotion: ReelMotionData = new ReelMotionData();

    @property({ group: { name: MotionType.QUICK }, type: ReelForceData, visible: true })
    private _quickDampMotion: ReelForceData = new ReelForceData();

    @property({ group: { name: MotionType.EMERGENCY }, type: ReelMotionData, visible: true })
    private _emergencyStopMotion: ReelMotionData = new ReelMotionData();

    @property({ group: { name: MotionType.EMERGENCY }, type: ReelForceData, visible: true })
    private _emergencyDampMotion: ReelForceData = new ReelForceData();

    @property({ group: { name: MotionType.SLOW }, type: ReelMotionData, visible: true })
    private _slowStopMotion: ReelMotionData = new ReelMotionData();

    @property({ group: { name: MotionType.SLOW }, type: ReelForceData, visible: true })
    private _slowDampMotion: ReelForceData = new ReelForceData();

    public get speedBase() {
        return this._speedBase;
    }
    public set speedBase(value: number) {
        this._speedBase = value;
    }
    public get startSpeed() {
        return this._startSpeed;
    }
    public set startSpeed(value: number) {
        this._startSpeed = value;
    }
    /** 正常滾停相關參數 */
    public get normalRollMotion() {
        return this._normalRollMotion;
    }
    public get normalStopMotion() {
        return this._normalStopMotion;
    }
    public get normalDampMotions() {
        return this._normalDampMotion;
    }
    /** 快速模式相關參數 */
    public get quickRollMotion() {
        return this._quickRollMotion;
    }
    public get quickStopMotion() {
        return this._quickStopMotion;
    }
    public get quickDampMotion() {
        return this._quickDampMotion;
    }
    /** 即停相關參數 */
    public get emergencyStopMotion() {
        return this._emergencyStopMotion;
    }
    public get emergencyDampMotion() {
        return this._emergencyDampMotion;
    }
    /** 瞇牌相關參數 */
    public get slowStopMotion() {
        return this._slowStopMotion;
    }
    public get slowDampMotion() {
        return this._slowDampMotion;
    }
}
