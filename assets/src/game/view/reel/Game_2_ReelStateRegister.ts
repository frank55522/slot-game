import { _decorator } from 'cc';
import { UIViewStateBase } from '../../../core/uiview/UIViewStateRegister';
import { SingleReelContent } from '../../../sgv3/view/reel/single-reel/SingleReelContent';
import {
    SingleReelDampState,
    SingleReelEmergencyStopState,
    SingleReelRollAfterState,
    SingleReelRollStartState,
    SingleReelSlowStopState,
    SingleReelStateRegisterBase,
    SingleReelStopState
} from '../../../sgv3/view/reel/single-reel/SingleReelStateRegisterBase';
import { ReelType, SymbolPerformType } from '../../../sgv3/vo/enum/Reel';
import { Game_2_SymbolContent } from '../symbol/Game_2_SymbolContent';
const { ccclass } = _decorator;

@ccclass('Game_2_ReelStateRegister')
export class Game_2_ReelStateRegister extends SingleReelStateRegisterBase {
    private _content: SingleReelContent | null = null;

    private get content() {
        if (this._content == null) {
            this._content = this.getComponent(SingleReelContent);
        }
        return this._content;
    }

    onRegister() {
        super.onRegister();
        this.registerState(new Game_2_DampState(this.content));
        this.registerState(new Game_2_EmergencyStopState(this.content));
        this.registerState(new Game_2_RollAfterState(this.content));
        this.registerState(new Game_2_RollStartState(this.content));
        this.registerState(new Game_2_SlowStopState(this.content));
        this.registerState(new Game_2_StopState(this.content));
        this.registerState(new Game_2_BlackShowState(this.content));
    }
}

// ByGame 針對respin 壓暗
export class Game_2_BlackShowState extends UIViewStateBase {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// API
    public effectId: number = ReelType.BLACK_SHOW;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super();
        this.content = content;
    }
    ////

    ////Internal Method
    protected onPlay() {
        for (let i = this.content.fovStartIndex; i <= this.content.fovEndIndex; i++) {
            if (
                this.content.isBlackSymbol &&
                !this.content.isRespinBlackId(this.content.symbols[i].symbolContent.symbolData.id)
            ) {
                this.content.symbols[i].setOverlay(this.content.overlaySymbolContainer);
            } else {
                this.content.symbols[i].restoreParent();
            }
        }

        this.content.isBlackSymbol = false;
        this.content.respinSymbolId = [];
        this.onEffectFinished();
    }
}

export class Game_2_DampState extends SingleReelDampState {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super(content);
        this.content = content;
    }

    onPlay() {
        if (this.content.isTriggerFeatureReSpin) {
            this.onEffectFinished();
            return;
        } else {
            super.onPlay();
        }

        for (let i = 0; i < this.content!.symbols!.length; i++) {
            let symbolContent = this.content!.symbols[i].symbolContent as Game_2_SymbolContent;
            if (
                (symbolContent.freeC1.node.active || !this.content.isRespinBlackId(symbolContent.symbolData.id)) &&
                symbolContent.fovIndex >= 0
            ) {
                this.content!.symbols[i].play(SymbolPerformType.DAMPING);
                this.content!.symbols[i].setOverlay(this.content.overlaySymbolContainer);
            } else {
                this.content.symbols[i].restoreParent();
                symbolContent.freeC1.node.active = false;
            }
        }
    }
    ////
}

export class Game_2_EmergencyStopState extends SingleReelEmergencyStopState {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super(content);
        this.content = content;
    }

    onStop() {
        super.onStop();
    }
    ////

    ////Internal Method
    protected onRollCycled() {
        let symbolContent = this.content.first.symbolContent as Game_2_SymbolContent;
        let credit = this.content.getFreeCredit(symbolContent.fovIndex);
        symbolContent.freeCredit = credit;
        super.onRollCycled();
        if (!this.content.isRespinBlackId(symbolContent.symbolData.id)) {
            this.content.first.setOverlay(this.content.overlaySymbolContainer);
        } else {
            this.content.first.restoreParent();
        }
    }
    ////
}

export class Game_2_RollAfterState extends SingleReelRollAfterState {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super(content);
        this.content = content;
    }
    ////

    ////Internal Method
    protected onRollCycled() {
        let symbolContent = this.content.first.symbolContent as Game_2_SymbolContent;
        let credit = this.content.getFreeCredit(symbolContent.fovIndex);
        symbolContent.freeCredit = credit;
        super.onRollCycled();
    }
    ////
}

export class Game_2_RollStartState extends SingleReelRollStartState {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super(content);
        this.content = content;
    }
    ////

    ////Internal Method
    protected onRollCycled() {
        let symbolContent = this.content.first.symbolContent as Game_2_SymbolContent;
        let credit = this.content.getFreeCredit(symbolContent.fovIndex);
        symbolContent.freeCredit = credit;
        super.onRollCycled();
    }
    ////
}

export class Game_2_SlowStopState extends SingleReelSlowStopState {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super(content);
        this.content = content;
    }

    onStop() {
        super.onStop();
        this.content.isBlackSymbol = false;
        this.content.respinSymbolId = [];
    }
    ////

    //// API
    protected onRollCycled() {
        let symbolContent = this.content.first.symbolContent as Game_2_SymbolContent;
        let credit = this.content.getFreeCredit(symbolContent.fovIndex);
        symbolContent.freeCredit = credit;
        super.onRollCycled();
        if (!this.content.isRespinBlackId(symbolContent.symbolData.id)) {
            this.content.first.setOverlay(this.content.overlaySymbolContainer);
        } else {
            this.content.first.restoreParent();
        }
    }
    ////
}

export class Game_2_StopState extends SingleReelStopState {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super(content);
        this.content = content;
    }
    ////

    ////Internal Method
    protected onRollCycled() {
        let symbolContent = this.content.first.symbolContent as Game_2_SymbolContent;
        let credit = this.content.getFreeCredit(symbolContent.fovIndex);
        symbolContent.freeCredit = credit;
        super.onRollCycled();
    }
    ////
}
