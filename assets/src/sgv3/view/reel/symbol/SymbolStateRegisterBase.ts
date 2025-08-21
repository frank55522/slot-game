import { tween, _decorator } from 'cc';
import { UIViewStateBase, UIViewStateRegister } from '../../../../core/uiview/UIViewStateRegister';
import { SymbolPerformType } from '../../../vo/enum/Reel';
import { SymbolContentBase } from './SymbolContentBase';
const { ccclass } = _decorator;

@ccclass('SymbolStateRegisterBase')
export class SymbolStateRegisterBase extends UIViewStateRegister {
    private _symbolContent: SymbolContentBase | null = null;

    private get symbolContent() {
        if (this._symbolContent == null) {
            this._symbolContent = this.getComponent(SymbolContentBase);
        }
        return this._symbolContent;
    }

    protected onRegister() {
        this.registerState(new SymbolHideState(this.symbolContent));
        this.registerState(new SymbolAllWinState(this.symbolContent));
        this.registerState(new SymbolLoopWinState(this.symbolContent));
        this.registerState(new SymbolRollCycledState());
        this.registerState(new SymbolShowState(this.symbolContent));
    }
}

export class SymbolHideState extends UIViewStateBase {
    //// Internal Member
    private symbolContent: SymbolContentBase | null = null;
    ////

    //// API
    public effectId: number = SymbolPerformType.HIDE;
    ////

    //// Hook
    constructor(content: SymbolContentBase) {
        super();
        this.symbolContent = content;
    }

    onPlay() {
        if (this.symbolContent.backgroundSprite != null) {
            this.symbolContent.backgroundSprite.enabled = false;
        }
        this.symbolContent.mainSprite.enabled = false;
        this.onEffectFinished();
    }
    ////
}

export class SymbolAllWinState extends UIViewStateBase {
    //// Internal Member
    private symbolContent: SymbolContentBase | null = null;

    //// API
    public effectId: number = SymbolPerformType.SHOW_ALL_WIN;
    ////

    //// Hook
    constructor(content: SymbolContentBase) {
        super();
        this.symbolContent = content;
    }

    onPlay() {
        if (this.symbolContent.tween == null) {
            this.symbolContent.tween = tween(this.symbolContent.mainSprite.node)
                .call(() => {
                    this.symbolContent.mainSprite.enabled = false;
                    this.symbolContent.backgroundSprite.enabled = false;
                })
                .delay(this.symbolContent.duration)
                .call(() => {
                    this.symbolContent.mainSprite.enabled = true;
                    this.symbolContent.backgroundSprite.enabled = true;
                })
                .delay(this.symbolContent.duration)
                .call(() => {
                    this.symbolContent.mainSprite.enabled = true;
                    this.symbolContent.backgroundSprite.enabled = true;
                    this.onEffectFinished();
                    this.symbolContent.tween = null;
                })
                .union();
        }
        this.symbolContent.tween.start();
    }

    onStop() {
        this.symbolContent.tween.stop();
        this.symbolContent.tween = null;
        this.onEffectFinished(true);
    }

    onSkip() {
        this.symbolContent.tween.stop();
        this.symbolContent.mainSprite.enabled = true;
        this.symbolContent.backgroundSprite.enabled = true;
        this.symbolContent.tween = null;
        this.onEffectFinished(true);
    }
    ////
}

export class SymbolLoopWinState extends UIViewStateBase {
    //// Internal Member
    private symbolContent: SymbolContentBase | null = null;

    private REPEAT_TIME: number = 2;
    ////

    //// API
    public effectId: number = SymbolPerformType.SHOW_LOOP_WIN;
    ////

    //// Hook
    constructor(content: SymbolContentBase) {
        super();
        this.symbolContent = content;
    }

    onPlay() {
        if (this.symbolContent.tween == null) {
            this.symbolContent.tween = tween(this.symbolContent.mainSprite.node);
            for (let i = 0; i < this.REPEAT_TIME; i++) {
                let tempTween = tween(this.symbolContent.mainSprite.node)
                    .call(() => {
                        this.symbolContent.mainSprite.enabled = false;
                    })
                    .delay(this.symbolContent.duration)
                    .call(() => {
                        this.symbolContent.mainSprite.enabled = true;
                    })
                    .delay(this.symbolContent.duration);
                this.symbolContent.tween.then(tempTween);
            }
            this.symbolContent.tween
                .call(() => {
                    this.symbolContent.mainSprite.enabled = true;
                    this.onEffectFinished();
                    this.symbolContent.tween = null;
                })
                .union();
        }
        this.symbolContent.tween.start();
    }

    onStop() {
        this.symbolContent.tween.stop();
        this.symbolContent.tween = null;
        this.onEffectFinished(true);
    }

    onSkip() {
        this.symbolContent.tween.stop();
        this.symbolContent.mainSprite.enabled = true;
        this.symbolContent.tween = null;
        this.onEffectFinished(true);
    }
    ////
}

export class SymbolRollCycledState extends UIViewStateBase {
    //// API
    public effectId: number = SymbolPerformType.ROLL_CYCLED;
    ////
}

export class SymbolShowState extends UIViewStateBase {
    //// Internal Member
    private symbolContent: SymbolContentBase | null = null;
    ////

    //// API
    public effectId: number = SymbolPerformType.SHOW;
    ////

    //// Hook
    constructor(content: SymbolContentBase) {
        super();
        this.symbolContent = content;
    }

    onPlay() {
        if (this.symbolContent.backgroundSprite != null) {
            this.symbolContent.backgroundSprite.enabled = true;
        }
        if (this.symbolContent.mainSprite != null) {
            this.symbolContent.mainSprite.enabled = true;
        }
        this.onEffectFinished();
    }
    ////
}
