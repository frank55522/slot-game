import { Tween, tween, _decorator, Node, Vec3 } from 'cc';
import { UIViewStateBase, UIViewStateRegister } from '../../../core/uiview/UIViewStateRegister';
import { BalanceUtil } from '../../../sgv3/util/BalanceUtil';
import { LockType, SymbolId, SymbolPerformType } from '../../../sgv3/vo/enum/Reel';
import { SymbolFXContent } from './SymbolFXContent';
const { ccclass } = _decorator;

@ccclass('SymbolFXStateRegister')
export class SymbolFXStateRegister extends UIViewStateRegister {
    private _content: SymbolFXContent | null = null;

    private get content() {
        if (this._content == null) {
            this._content = this.getComponent(SymbolFXContent);
        }
        return this._content;
    }

    onRegister() {
        switch (this.content.symbolType) {
            case SymbolId.WILD:
                this.registerState(new SymbolFXShowState(this.content));
                break;
            case SymbolId.SUB:
                this.registerState(new SymbolFXReSpinState(this.content));
                break;
            case SymbolId.C1:
                this.registerState(new SymbolFXShowState(this.content));
                this.registerState(new SymbolFXBaseCreditUpdateState(this.content));
                this.registerState(new SymbolFXBeforeCollectState(this.content));
                break;
            case SymbolId.C2:
                this.registerState(new SymbolFXShowState(this.content));
                this.registerState(new SymbolFXGetTargertCreditResultState(this.content));
                this.registerState(new SymbolFXTargertCreditUpdateState(this.content));
                break;
        }
    }
}

export class SymbolFXShowState extends UIViewStateBase {
    //// Internal Member
    private content: SymbolFXContent | null = null;

    private tempTween: Tween<Node> | null = null;
    ////

    //// Hook
    public effectId: number = SymbolPerformType.SHOW;

    constructor(content: SymbolFXContent) {
        super();
        this.content = content;
    }

    onPlay() {
        if (this.content.animation == null) {
            this.onEffectFinished();
            return;
        }
        let animationIndex = 0;
        if (this.content.labelText) {
            switch (this.content.symbolId) {
                case SymbolId.C1:
                    this.content.labelText.font = this.content.isSpecialFont
                        ? this.content.specialFont
                        : this.content.baseFont;
                    this.content.labelText.string = this.content.isOmniChannel
                        ? String(this.content.credit)
                        : String(BalanceUtil.formatBalanceWithExpressingUnits(this.content.credit));
                    break;
                case SymbolId.C2:
                    this.content.labelText.string = String();
                    this.content.labelText.font =
                        this.content.lockType == LockType.OLD_LOCK ? this.content.goldFont : this.content.multipleFont;

                    this.content.subSprite.spriteFrame = this.content.respinNumFrames[this.content.reSpinNum - 1];
                    this.content.subSprite.enabled =
                        this.content.lockType == LockType.NEW_LOCK && this.content.reSpinNum > 0;

                    if (this.content.lockType == LockType.NEW_LOCK) {
                        this.content.labelText.string =
                            this.content.multiple > 0 ? String(this.content.multiple + '%') : String();
                        this.content.labelText.node.position =
                            this.content.reSpinNum > 0 ? this.content.hasReSpinPos : this.content.multiPos;
                    } else {
                        this.content.labelText.string = String(BalanceUtil.formatBalance(this.content.credit));
                        this.content.labelText.node.position = this.content.normalPos;
                    }
                    break;
            }
        }
        if (this.content.symbolId === SymbolId.WILD) {
            if (this.content.language === 'zh') {
                animationIndex = 0;
                this.content.animation.play('PlayWin_CN');
            }else {
                animationIndex = 1;
                this.content.animation.play('PlayWin_EN');
            }
        }else{
            this.content.animation.play('PlayWin');
        }
        //TO DO: Perform Time CallBack;
        this.tempTween = tween(this.content.node)
            .delay(2)
            .call(() => {
                this.onEffectFinished();
            })
            .start();
    }

    onSkip() {
        this.tempTween.stop();
        this.onEffectFinished();
    }
}

export class SymbolFXReSpinState extends UIViewStateBase {
    //// Internal Member
    private content: SymbolFXContent | null = null;
    ////

    //// Hook
    public effectId: number = SymbolPerformType.SHOW_RESPIN;

    constructor(content: SymbolFXContent) {
        super();
        this.content = content;
    }

    onPlay() {
        if (this.content.animation == null) {
            this.onEffectFinished();
            return;
        }
        let animString = this.content.credit > 0 ? ('PercentAndAddSpin' + this.content.reSpinNum) : ('AddSpin' + this.content.reSpinNum);
        this.content.animation.play(animString, () => this.onEffectFinished());
    }
}

export class SymbolFXBaseCreditUpdateState extends UIViewStateBase {
    //// Internal Member
    private content: SymbolFXContent | null = null;
    ////

    //// API
    public effectId: number = SymbolPerformType.SHOW_BASE_CREDIT_COLLECT;

    constructor(content: SymbolFXContent) {
        super();
        this.content = content;
    }
    ////

    //// Hook
    onPlay() {
        if (this.content.animation) {
            this.content.animation.play('BeginEffect', () => this.playWin());
        }
    }

    playWin() {
        this.content.animation.play('PlayWin');
        this.onEffectFinished();
    }
}

export class SymbolFXTargertCreditUpdateState extends UIViewStateBase {
    //// Internal Member
    private content: SymbolFXContent | null = null;
    ////

    //// API
    public effectId: number = SymbolPerformType.SHOW_TARGERT_CREDIT_COLLECT;

    constructor(content: SymbolFXContent) {
        super();
        this.content = content;
    }
    ////

    //// Hook
    onPlay() {
        if (this.content.animation) {
            this.content.animation.play('PlayCollect');
        }
        this.content.labelText.string = String();
        this.content.labelText.enabled = this.content.credit > 0;
        this.content.labelText.node.setPosition(new Vec3());

        switch (this.content.symbolId) {
            case SymbolId.C1:
                this.content.labelText.font = this.content.isSpecialFont
                    ? this.content.specialFont
                    : this.content.baseFont;
                break;
            case SymbolId.C2:
                this.content.labelText.font = this.content.goldFont;
                this.content.labelText.node.setPosition(this.content.normalPos);
                break;
        }
        this.onEffectFinished();
    }
    ////
}

export class SymbolFXGetTargertCreditResultState extends UIViewStateBase {
    //// Internal Member
    private content: SymbolFXContent | null = null;
    ////

    //// API
    public effectId: number = SymbolPerformType.SHOW_TARGERT_CREDIT_RESULT;

    constructor(content: SymbolFXContent) {
        super();
        this.content = content;
    }
    ////

    //// Hook
    onPlay() {
        this.content.labelText.string = String();
        if (this.content.animation) {
            this.content.animation.play('PlayLastCollect');
        }
        this.onEffectFinished();
    }
}

export class SymbolFXBeforeCollectState extends UIViewStateBase {
    //// Internal Member
    private content: SymbolFXContent | null = null;
    private tempTween: Tween<Node> | null = null;
    ////

    //// API
    public effectId: number = SymbolPerformType.BEFORE_COLLECT;

    constructor(content: SymbolFXContent) {
        super();
        this.content = content;
    }
    ////

    //// Hook
    onPlay() {
        // 設定分數球標籤文字
        if (this.content.labelText) {
            this.content.labelText.font = this.content.isSpecialFont
                ? this.content.specialFont
                : this.content.baseFont;
            this.content.labelText.string = this.content.isOmniChannel
                ? String(this.content.credit)
                : String(BalanceUtil.formatBalanceWithExpressingUnits(this.content.credit));
        }

        // 播放縮放動畫表演
        const originalScale = this.content.node.scale.clone();
        const targetScale = new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z);
        
        this.tempTween = tween(this.content.node)
            .to(0.3, { scale: targetScale })
            .to(0.3, { scale: originalScale })
            .to(0.3, { scale: targetScale })
            .to(0.3, { scale: originalScale })
            .call(() => {
                this.onEffectFinished();
            })
            .start();
    }

    onSkip() {
        if (this.tempTween) {
            this.tempTween.stop();
        }
        this.onEffectFinished();
    }
}
