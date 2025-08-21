import { tween, Tween, Vec3, _decorator, instantiate, Color } from 'cc';
import { UIViewStateBase, UIViewStateRegister } from '../../../../core/uiview/UIViewStateRegister';
import { Layer } from '../../../vo/enum/Layer';
import { ReelType, SymbolPerformType } from '../../../vo/enum/Reel';
import { UISymbol } from '../symbol/UISymbol';
import { SingleReelContentBase } from './SingleReelContentBase';
const { ccclass } = _decorator;

@ccclass('SingleReelStateRegisterBase')
export class SingleReelStateRegisterBase extends UIViewStateRegister {
    private _singleReelContent: SingleReelContentBase | null = null;

    private get singleReelContent() {
        if (this._singleReelContent == null) {
            this._singleReelContent = this.getComponent(SingleReelContentBase);
        }
        return this._singleReelContent;
    }

    protected onRegister() {
        this.registerState(new SingleReelDampState(this.singleReelContent));
        this.registerState(new SingleReelEmergencyStopState(this.singleReelContent));
        this.registerState(new SingleReelInitState(this.singleReelContent));
        this.registerState(new SingleReelRollAfterState(this.singleReelContent));
        this.registerState(new SingleReelRollStartState(this.singleReelContent));
        this.registerState(new SingleReelShowState(this.singleReelContent));
        this.registerState(new SingleReelSlowStopState(this.singleReelContent));
        this.registerState(new SingleReelStopState(this.singleReelContent));
    }
}

export class SingleReelDampState extends UIViewStateBase {
    //// Internal Member
    private singleReelContent: SingleReelContentBase | null = null;
    ////

    //// API
    public effectId: number = ReelType.DAMP;
    ////

    //// Hook
    constructor(content: SingleReelContentBase) {
        super();
        this.singleReelContent = content;
    }
    ////

    ////Internal Method
    protected onPlay() {
        for (let i = this.singleReelContent.fovStartIndex; i <= this.singleReelContent.fovEndIndex; i++) {
            if (this.singleReelContent.symbols[i].symbolContent.symbolData.isImprovedFOV) {
                this.singleReelContent.symbols[i].setOverlay(this.singleReelContent.overlaySymbolContainer);
                this.singleReelContent.symbols[i].setColor(Color.WHITE);
            }
        }
        for (let i = 0; i < this.singleReelContent.symbols.length; i++) {
            let mainTween = this.getSymbolTween(this.singleReelContent.symbols[i]);
            mainTween.start();
        }
    }

    protected getSymbolTween(obj: UISymbol | null = null): Tween<UISymbol> {
        let mainTween = tween(obj).to(
            this.singleReelContent.dampMotionData.duration,
            {
                symbolPos: new Vec3(0, obj.node.position.y - this.singleReelContent.dampMotionData.force, 0)
            },
            { easing: (dt) => this.singleReelContent.dampMotionData.tweenCurve.spline.evaluate(dt) }
        );
        mainTween.call(() => {
            this.onDampingEnd();
        });
        return mainTween;
    }

    protected onDampingEnd() {
        this.onEffectFinished();
    }
    ////
}

export class SingleReelEmergencyStopState extends UIViewStateBase {
    //// Internal Member
    private singleReelContent: SingleReelContentBase | null = null;
    ////

    //// API
    public effectId: number = ReelType.EMERGENCY_STOP;
    ////

    //// Hook
    constructor(content: SingleReelContentBase) {
        super();
        this.singleReelContent = content;
    }
    ////

    ////Internal Method
    protected onPlay() {
        this.singleReelContent.speed = this.singleReelContent!.rollMotionData.value;
        this.singleReelContent.stopMotionData = this.singleReelContent.ReelPasser.emergencyStopMotion;
        this.singleReelContent.dampMotionData = this.singleReelContent.ReelPasser.emergencyDampMotion;

        this.singleReelContent.tempTween = tween(this.singleReelContent)
            .to(
                this.singleReelContent!.stopMotionData.duration,
                { speed: this.singleReelContent!.stopMotionData.value },
                { easing: (dt) => this.singleReelContent.stopMotionData.tweenCurve.spline.evaluate(dt) }
            )
            .start();
        if (this.singleReelContent!.stopMotionData.pass < this.singleReelContent.symbols.length) {
            this.singleReelContent!.stopMotionData.pass = this.singleReelContent.symbols.length;
        }

        this.singleReelContent!.stripIndexer.rng = this.singleReelContent!.stripIndexer.normalize(
            this.singleReelContent!.stripIndexer.targetRng + this.singleReelContent!.stopMotionData.pass
        );
        this.singleReelContent!.passCounter = 0;
        this.singleReelContent!.onRollObjectCycled = () => this.onBaseRollCycled();
    }

    protected onStop() {
        this.singleReelContent.tempTween.stop();
        this.singleReelContent!.singleReelView!.rePosition();
        this.singleReelContent.onSymbolsResultCheck(this.singleReelContent.stripIndexer);
        this.singleReelContent.onSingleReelStop(this.singleReelContent.id);
        this.onEffectFinished();
    }

    protected onSkip() {
        this.singleReelContent.tempTween.stop();
        this.singleReelContent!.onRollObjectCycled = null;
        this.onEffectFinished();
    }

    public onBaseRollCycled() {
        this.singleReelContent.singleReelView.onBaseCycled(true);
        this.onRollCycled();

        if (this.singleReelContent!.passCounter >= this.singleReelContent!.stopMotionData.pass) {
            this.singleReelContent!.isRolling = false;
            this.stop();
        }
    }

    protected onRollCycled() {
        this.singleReelContent!.first.play(SymbolPerformType.ROLL_CYCLED);
    }
    ////
}

export class SingleReelInitState extends UIViewStateBase {
    //// Internal Member
    private singleReelContent: SingleReelContentBase | null = null;
    ////

    //// API
    public effectId: number = ReelType.INIT;
    ////

    //// Hook
    constructor(content: SingleReelContentBase) {
        super();
        this.singleReelContent = content;
    }
    ////

    ////Internal Method
    protected onPlay() {
        this.singleReelContent.uiTransform.setContentSize(this.singleReelContent.singleReeler.reelSize);
        for (let i = 0; i < this.singleReelContent!.symbols.length; i++) {
            if (this.singleReelContent!.symbols[i] != null) {
                //代表已經Init過,跳過生成步驟
                break;
            }
            let tempSymbol = instantiate(this.singleReelContent.symbolPrefab!);
            tempSymbol!.setParent(this.singleReelContent!.reelMask.node);
            tempSymbol!.setPosition(
                new Vec3(0, this.singleReelContent!.startPosition - this.singleReelContent!.symbolHeight * i, 0)
            );

            this.singleReelContent!.symbols[i] = tempSymbol!.getComponent(UISymbol)!;
            this.singleReelContent!.symbols[i].init();
            this.singleReelContent!.symbols[i].setSharedMaterial(this.singleReelContent!.useSharedMaterial);
        }

        let index = this.singleReelContent!.id / 5;
        index = Math.floor(index);
        switch (index) {
            case 0:
                this.singleReelContent.shaderColor = Color.YELLOW;
                break;
            case 1:
                this.singleReelContent.shaderColor = Color.RED;
                break;
            case 2:
                this.singleReelContent.shaderColor = Color.GREEN;
                break;
        }
        this.singleReelContent!.reelMask.color = this.singleReelContent!.shaderColor;
        this.singleReelContent.reelMask.size = this.singleReelContent.singleReeler.reelSize;
        for (let i = 0; i < this.singleReelContent!.symbols.length; i++) {
            this.singleReelContent!.symbols[i].setColor(this.singleReelContent!.shaderColor);
        }

        this.singleReelContent.fovStartIndex = 1;
        this.singleReelContent.fovEndIndex = this.singleReelContent.symbols.length - 2;

        this.singleReelContent!.startLinkPosition = new Vec3(
            0,
            this.singleReelContent!.last.node.position.y +
                this.singleReelContent!.symbolHeight *
                    this.singleReelContent!.sign *
                    (this.singleReelContent!.symbols.length - 1),
            0
        );
        this.onEffectFinished();
    }
    ////
}

export class SingleReelRollAfterState extends UIViewStateBase {
    //// Internal Member
    private singleReelContent: SingleReelContentBase | null = null;
    ////

    //// API
    public effectId: number = ReelType.ROLL_AFTER;
    ////

    //// Hook
    constructor(content: SingleReelContentBase) {
        super();
        this.singleReelContent = content;
    }
    ////

    ////Internal Method
    protected onPlay() {
        this.singleReelContent!.onRollObjectCycled = () => this.onBaseRollCycled();
        this.singleReelContent!.passCounter = 0;
    }

    protected onStop() {
        this.singleReelContent.isRolling = false;
        this.onEffectFinished();
    }

    protected onSkip() {
        this.singleReelContent.tempTween.stop();
        this.singleReelContent.speed = this.singleReelContent.ReelPasser.normalRollMotion.value;
        this.singleReelContent!.onRollObjectCycled = null;
        this.onEffectFinished(true);
    }

    private onBaseRollCycled() {
        this.singleReelContent.singleReelView.onBaseCycled(false);
        this.onRollCycled();
        if (this.singleReelContent!.passCounter >= this.singleReelContent!.rollMotionData.pass) {
            this.onEffectFinished();
        }
    }

    protected onRollCycled() {
        this.singleReelContent!.first.play(SymbolPerformType.ROLL_CYCLED);
    }
    ////
}

export class SingleReelRollStartState extends UIViewStateBase {
    //// Internal Member
    private singleReelContent: SingleReelContentBase | null = null;

    ////

    //// API
    public effectId: number = ReelType.ROLL_START;
    ////

    //// Hook
    constructor(content: SingleReelContentBase) {
        super();
        this.singleReelContent = content;
    }
    ////

    ////Internal Method
    protected onPlay() {
        for (let i = this.singleReelContent.fovStartIndex; i <= this.singleReelContent.fovEndIndex; i++) {
            let symbol = this.singleReelContent.symbols[i];
            symbol.restoreParent();
            symbol.setColor(this.singleReelContent.shaderColor);
        }

        this.singleReelContent.speed = this.singleReelContent.ReelPasser.startSpeed;
        this.singleReelContent.rollMotionData = this.singleReelContent.ReelPasser.normalRollMotion;

        this.singleReelContent.tempTween = tween(this.singleReelContent)
            .to(
                this.singleReelContent.rollMotionData.duration,
                { speed: this.singleReelContent.rollMotionData.value },
                { easing: (dt) => this.singleReelContent.rollMotionData.tweenCurve.spline.evaluate(dt) }
            )
            .start();

        this.singleReelContent!.onRollObjectCycled = () => this.onBaseRollCycled();
        this.singleReelContent.isRolling = true;
        this.onEffectFinished();
    }

    protected onStop() {
        this.singleReelContent.tempTween.stop();
        this.singleReelContent.isRolling = false;
        this.onEffectFinished();
    }

    protected onSkip() {
        this.singleReelContent.tempTween.stop();
        this.onEffectFinished();
    }

    private onBaseRollCycled() {
        this.singleReelContent.singleReelView.onBaseCycled(false);
        this.onRollCycled();
    }

    protected onRollCycled() {
        this.singleReelContent!.first.play(SymbolPerformType.ROLL_CYCLED);
    }
    ////
}

export class SingleReelShowState extends UIViewStateBase {
    //// Internal Member
    private singleReelContent: SingleReelContentBase | null = null;
    ////

    //// API
    public effectId: number = ReelType.SHOW;
    ////

    //// Hook
    constructor(content: SingleReelContentBase) {
        super();
        this.singleReelContent = content;
    }
    ////

    ////Internal Method
    protected onPlay() {
        this.singleReelContent.stripIndexer.rng = this.singleReelContent.stripIndexer.targetRng;

        for (let i = 0; i < this.singleReelContent.symbols.length; i++) {
            this.singleReelContent.symbols[i].symbolContent!.symbolData = this.singleReelContent.getCurSymbolData(i);
            this.singleReelContent.symbols[i].play(SymbolPerformType.SHOW);
        }

        for (let i = this.singleReelContent.fovStartIndex; i <= this.singleReelContent.fovEndIndex; i++) {
            if (this.singleReelContent.symbols[i].symbolContent.symbolData.isImprovedFOV) {
                this.singleReelContent.symbols[i].setOverlay(this.singleReelContent.overlaySymbolContainer);
                this.singleReelContent.symbols[i].setColor(Color.WHITE);
            }
        }

        this.singleReelContent.singleReelView!.symbolsCompare();
        this.singleReelContent.singleReelView!.rePosition();
        this.onEffectFinished();
    }
    ////
}

export class SingleReelSlowStopState extends UIViewStateBase {
    //// Internal Member
    private singleReelContent: SingleReelContentBase | null = null;
    ////

    //// API
    public effectId: number = ReelType.SLOW_STOP;
    ////

    //// Hook
    constructor(content: SingleReelContentBase) {
        super();
        this.singleReelContent = content;
    }
    ////

    ////Internal Method
    protected onPlay() {
        this.singleReelContent.stopMotionData = this.singleReelContent.ReelPasser.slowStopMotion;
        this.singleReelContent.dampMotionData = this.singleReelContent.ReelPasser.slowDampMotion;

        this.singleReelContent.tempTween = tween(this.singleReelContent)
            .to(
                this.singleReelContent!.stopMotionData.duration,
                { speed: this.singleReelContent!.stopMotionData.value },
                { easing: (dt) => this.singleReelContent!.stopMotionData.tweenCurve.spline.evaluate(dt) }
            )
            .start();

        if (this.singleReelContent!.stopMotionData.pass < this.singleReelContent.symbols.length) {
            this.singleReelContent!.stopMotionData.pass = this.singleReelContent.symbols.length;
        }

        this.singleReelContent!.stripIndexer.rng = this.singleReelContent!.stripIndexer.normalize(
            this.singleReelContent!.stripIndexer.targetRng + this.singleReelContent!.stopMotionData.pass
        );
        this.singleReelContent!.passCounter = 0;
        this.singleReelContent!.onRollObjectCycled = () => this.onBaseRollCycled();
    }

    protected onStop() {
        this.singleReelContent.tempTween.stop();
        this.singleReelContent.speed = this.singleReelContent!.stopMotionData.value;
        this.singleReelContent!.singleReelView!.rePosition();
        this.singleReelContent.onSymbolsResultCheck(this.singleReelContent.stripIndexer);
        this.singleReelContent.onSingleReelStop(this.singleReelContent.id);
        this.onEffectFinished();
    }

    protected onSkip() {
        this.singleReelContent.tempTween.stop();
        this.singleReelContent.speed = this.singleReelContent!.stopMotionData.value;
        this.singleReelContent!.onRollObjectCycled = null;
        this.onEffectFinished(true);
    }

    public onBaseRollCycled() {
        this.singleReelContent.singleReelView.onBaseCycled(true);
        this.onRollCycled();
        if (this.singleReelContent!.passCounter >= this.singleReelContent!.stopMotionData.pass) {
            this.singleReelContent!.isRolling = false;
            this.stop();
        }
    }

    protected onRollCycled() {
        this.singleReelContent!.first.play(SymbolPerformType.ROLL_CYCLED);
    }
    ////
}

export class SingleReelStopState extends UIViewStateBase {
    //// Internal Member
    private singleReelContent: SingleReelContentBase | null = null;
    ////

    //// API
    public effectId: number = ReelType.STOP;
    ////

    //// Hook
    constructor(content: SingleReelContentBase) {
        super();
        this.singleReelContent = content;
    }
    ////

    ////Internal Method
    protected onPlay() {
        this.singleReelContent.stopMotionData = this.singleReelContent.ReelPasser.normalStopMotion;

        this.singleReelContent.dampMotionData = this.singleReelContent.ReelPasser.normalDampMotions;

        this.singleReelContent.tempTween = tween(this.singleReelContent)
            .to(
                this.singleReelContent!.stopMotionData.duration,
                { speed: this.singleReelContent!.stopMotionData.value },
                { easing: (dt) => this.singleReelContent!.stopMotionData.tweenCurve.spline.evaluate(dt) }
            )
            .start();

        if (this.singleReelContent!.stopMotionData.pass < this.singleReelContent.symbols.length) {
            this.singleReelContent!.stopMotionData.pass = this.singleReelContent.symbols.length;
        }

        this.singleReelContent!.stripIndexer.rng = this.singleReelContent!.stripIndexer.normalize(
            this.singleReelContent!.stripIndexer.targetRng + this.singleReelContent!.stopMotionData.pass
        );
        this.singleReelContent!.passCounter = 0;
        this.singleReelContent!.onRollObjectCycled = () => this.onBaseRollCycled();
    }

    protected onStop() {
        this.singleReelContent.tempTween.stop();
        this.singleReelContent.speed = this.singleReelContent!.stopMotionData.value;
        this.singleReelContent.singleReelView!.rePosition();
        this.singleReelContent.onSymbolsResultCheck(this.singleReelContent.stripIndexer);
        this.singleReelContent.onSingleReelStop(this.singleReelContent.id);
        this.onEffectFinished();
    }

    protected onSkip() {
        this.singleReelContent.tempTween.stop();
        this.singleReelContent.speed = this.singleReelContent!.stopMotionData.value;
        this.singleReelContent!.onRollObjectCycled = null;
        this.onEffectFinished(true);
    }

    public onBaseRollCycled() {
        this.singleReelContent.singleReelView.onBaseCycled(true);
        this.onRollCycled();
        if (this.singleReelContent!.passCounter >= this.singleReelContent!.stopMotionData.pass) {
            this.singleReelContent!.isRolling = false;
            this.stop();
        }
    }

    protected onRollCycled() {
        this.singleReelContent!.first.play(SymbolPerformType.ROLL_CYCLED);
    }
    ////
}
