import { _decorator, Component, Vec3, Prefab, Tween, UITransform, Material, math, Color, CurveRange } from 'cc';
import {
    ReelForceData,
    ReelMotionData,
    ReelPasser,
    SingleReel as SingleReeler,
    StripIndexer,
    SymbolData
} from '../../../vo/match/ReelMatchInfo';
import { ReelMask } from '../reel-mask/ReelMask';
import { UISymbol } from '../symbol/UISymbol';
import { SymbolDataPlist } from '../SymbolDataPlist';
import { SingleReelView } from './SingleReelView';
import { OverlaySymbolContainer } from '../symbol/OverlaySymbolContainer';

const { ccclass, property } = _decorator;

@ccclass('SingleReelContentBase')
export class SingleReelContentBase extends Component {
    //// Internal Member
    @property({ type: SingleReeler, visible: true })
    private _singleReeler: SingleReeler = new SingleReeler();
    @property({ type: ReelPasser, visible: true })
    private reelPasser: ReelPasser = new ReelPasser();
    @property({ type: StripIndexer, visible: true })
    private _stripIndexer: StripIndexer = new StripIndexer();
    @property({ type: [UISymbol], visible: true })
    private _symbols: Array<UISymbol> = [];
    @property({ type: ReelMask, visible: true })
    private _reelMask: ReelMask | null = null;
    @property({ type: Prefab, visible: true })
    private _symbolPrefab: Prefab | null = null;
    @property({ type: Material, visible: true })
    private _useSharedMaterial: Material | null;

    private _singleReelView: SingleReelView | null = null;

    private _symbolDataPlist: SymbolDataPlist | null = null;

    private _transform: UITransform | null = null;

    private _ishorizontalMode: boolean = false;

    private _shaderColor: Color = Color.WHITE;
    ////

    //// property
    public id: number = -1;

    public fovStartIndex: number = -1;

    public fovEndIndex: number = -1;

    public isHideC1AndC2: boolean = false;

    public set ishorizontalMode(value: boolean) {
        this._ishorizontalMode = value;
    }

    public get ishorizontalMode() {
        return this._ishorizontalMode;
    }

    public get useSharedMaterial() {
        return this._useSharedMaterial;
    }

    public get uiTransform() {
        if (this._transform == null) {
            this._transform = this.getComponent(UITransform);
        }
        return this._transform;
    }

    public get symbolDataPlist() {
        if (this._symbolDataPlist == null) {
            this._symbolDataPlist = this.getComponent(SymbolDataPlist);
        }
        return this._symbolDataPlist;
    }

    public get singleReelView() {
        if (this._singleReelView == null) {
            this._singleReelView = this.getComponent(SingleReelView);
        }
        return this._singleReelView;
    }

    public get singleReeler() {
        return this._singleReeler;
    }

    public get symbolPrefab() {
        return this._symbolPrefab;
    }

    public get isOutOfEndPosition() {
        return this.speed > 0
            ? this.last.node.position.y <= this.endPosition
            : this.last.node.position.y >= this.endPosition;
    }

    public get reelMask() {
        return this._reelMask;
    }

    public get stripIndexer() {
        if (this._stripIndexer.reelIndex < 0) {
            this._stripIndexer.reelIndex = this.id;
        }
        return this._stripIndexer;
    }

    public get ReelPasser() {
        return this.reelPasser;
    }

    public set ReelPasser(velue: ReelPasser) {
        this.reelPasser = velue;
    }

    public get symbols() {
        return this._symbols;
    }

    public get symbolHeight() {
        return this._singleReeler.symbolHeight;
    }

    public get sign() {
        return this._singleReeler.sign;
    }

    public get firstIndex() {
        return this._singleReeler.firstIndex;
    }

    public get lastIndex() {
        return this._singleReeler.lastIndex;
    }

    public get first() {
        return this.symbols[this.firstIndex];
    }

    public get last() {
        return this.symbols[this.lastIndex];
    }

    public get startPosition(): number {
        if (this._singleReeler.startPosition == 0) {
            this._singleReeler.SetSymbolPos(this.symbols.length);
        }
        return this._singleReeler.startPosition;
    }

    public get endPosition(): number {
        if (this._singleReeler.startPosition == 0) {
            this._singleReeler.SetSymbolPos(this.symbols.length);
        }
        return this._singleReeler.endPosition;
    }

    public get shaderColor(): math.Color {
        return this._shaderColor;
    }

    public set shaderColor(value: math.Color) {
        this._shaderColor = value;
    }

    public speed: number = 0;

    public passCounter: number = 0;

    public isRolling: boolean = false;

    public startLinkPosition: Vec3 = new Vec3();

    public rollMotionData: ReelMotionData | null = null;

    public stopMotionData: ReelMotionData | null = null;

    public dampMotionData: ReelForceData | null = null;

    public tempTween: Tween<SingleReelContentBase> | null = null;

    public overlaySymbolContainer: OverlaySymbolContainer | null = null;
    ////

    ////Event
    public onRollObjectCycled: Function | null = null;

    public onSingleReelStop: Function | null = null;

    public onSymbolsResultCheck: Function | null = null;

    public onSingleReelDampingEnd: Function | null = null;
    ////

    ////API
    /**由滾動Symbol Index 取得 對應當前SymbolData */
    public getCurSymbolData(symbolIndex: number): SymbolData {
        return this.symbolDataPlist!.getDataById(
            this.stripIndexer.strip[this.stripIndexer.getRng(symbolIndex, this.symbols.length)]
        );
    }
    /**由 FOV Index 取得 對應當前SymbolData */
    public getTargetSymbolData(fovIndex: number): SymbolData {
        return this.symbolDataPlist!.getDataById(
            this.stripIndexer.strip[this.stripIndexer.normalize(this.stripIndexer.targetRng + fovIndex)]
        );
    }
    /**由 FOV Index 取得對應 滾動SymbolIndex */
    public getSymbolIndex(fovIndex: number): number {
        return this._singleReeler.symbolCount - this.stripIndexer.benchMark + fovIndex;
    }
    /**由 Pass 顆數 推算取得對應 滾動FOVIndex 若不在FOV內,則回傳-1 */
    public getFOVIndex(targertPass: number): number {
        return targertPass - this.passCounter > this.stripIndexer.fovLength || targertPass - this.passCounter <= 0
            ? -1
            : targertPass - this.passCounter - 1;
    }
    ////

    //// Hook
    ////

    ////Internal Method
    ////
}
