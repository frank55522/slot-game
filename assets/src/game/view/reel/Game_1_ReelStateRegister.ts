import { _decorator } from 'cc';
import { SingleReelContent } from '../../../sgv3/view/reel/single-reel/SingleReelContent';
import {
    SingleReelDampState,
    SingleReelEmergencyStopState,
    SingleReelRollAfterState,
    SingleReelRollStartState,
    SingleReelShowState,
    SingleReelSlowStopState,
    SingleReelStateRegisterBase,
    SingleReelStopState
} from '../../../sgv3/view/reel/single-reel/SingleReelStateRegisterBase';
import { SymbolContent } from '../../../sgv3/view/reel/symbol/SymbolContent';
import { ReelType, SymbolId, SymbolPerformType } from '../../../sgv3/vo/enum/Reel';
import { Game_1_SymbolContent } from '../symbol/Game_1_SymbolContent';
const { ccclass } = _decorator;

@ccclass('Game_1_ReelStateRegister')
export class Game_1_ReelStateRegister extends SingleReelStateRegisterBase {
    private _content: SingleReelContent | null = null;

    private get content() {
        if (this._content == null) {
            this._content = this.getComponent(SingleReelContent);
        }
        return this._content;
    }

    onRegister() {
        super.onRegister();
        this.registerState(new Game_1_EmergencyStopState(this.content));
        this.registerState(new Game_1_ReelShowState(this.content));
        this.registerState(new Game_1_RollAfterState(this.content));
        this.registerState(new Game_1_RollStartState(this.content));
        this.registerState(new Game_1_SlowStopState(this.content));
        this.registerState(new Game_1_StopState(this.content));
        this.registerState(new Game_1_DampState(this.content));
    }
}

export class Game_1_DampState extends SingleReelDampState {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super(content);
        this.content = content;
    }

    onPlay() {
        super.onPlay();
        for (let i = this.content.fovStartIndex; i <= this.content.fovEndIndex; i++) {
            if (this.content.symbols[i].symbolContent.symbolData.id == SymbolId.C1) {
                this.content.symbols[i].play(SymbolPerformType.DAMPING);
            }
        }
    }
    ////
}

export class Game_1_ReelShowState extends SingleReelShowState {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super(content);
        this.content = content;
    }

    onPlay() {
        for (let i = 0; i < this.content.fovFeature.length; i++) {
            let symbolIndex = this.content.getSymbolIndex(i);
            this.content.symbols[symbolIndex].symbolContent.fovIndex = i;
            let content = this.content.symbols[symbolIndex].symbolContent as Game_1_SymbolContent;
            content.credit = this.content.fovFeature[i].creditCent;
            content.creditDisplay = this.content.fovFeature[i].creditDisplay;
            content.isSpecialFont = this.content.fovFeature[i].isSpecial;
            this.content.symbols[symbolIndex].play(SymbolPerformType.SHOW);
        }
        super.onPlay();
    }
    ////

    ////Internal Method
    ////
}

export class Game_1_EmergencyStopState extends SingleReelEmergencyStopState {
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
        if (this.content.first.symbolContent.symbolData.id == SymbolId.C1) {
            let symbolContent = this.content.first.symbolContent as SymbolContent;
            symbolContent.credit = this.content.getCredit(symbolContent.fovIndex);
            symbolContent.creditDisplay = this.content.getCreditDisplay(symbolContent.fovIndex, symbolContent.credit);
            symbolContent.isSpecialFont = this.content.isSpecialBall(symbolContent.credit);
        }
        super.onRollCycled();
    }
    ////
}

export class Game_1_RollAfterState extends SingleReelRollAfterState {
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
        if (this.content.first.symbolContent.symbolData.id == SymbolId.C1) {
            let symbolContent = this.content.first.symbolContent as SymbolContent;
            symbolContent.credit = this.content.getCredit(symbolContent.fovIndex);
            symbolContent.creditDisplay = this.content.getCreditDisplay(symbolContent.fovIndex, symbolContent.credit);
            symbolContent.isSpecialFont = this.content.isSpecialBall(symbolContent.credit);
        }
        super.onRollCycled();
    }
    ////
}

export class Game_1_RollStartState extends SingleReelRollStartState {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super(content);
        this.content = content;
    }

    onPlay() {
        let firstContent = this.content.first.symbolContent as Game_1_SymbolContent;
        if (firstContent.symbolData.id == SymbolId.C1 && firstContent.credit == 0) {
            firstContent.credit = this.content.getCredit(-1);
            firstContent.creditDisplay = this.content.getCreditDisplay(-1, firstContent.credit);
            firstContent.isSpecialFont = this.content.isSpecialBall(firstContent.credit);
        }
        this.content.first.play(SymbolPerformType.SHOW);
        super.onPlay();
    }
    ////

    ////Internal Method
    protected onRollCycled() {
        if (this.content.first.symbolContent.symbolData.id == SymbolId.C1) {
            let symbolContent = this.content.first.symbolContent as SymbolContent;
            symbolContent.credit = this.content.getCredit(symbolContent.fovIndex);
            symbolContent.creditDisplay = this.content.getCreditDisplay(symbolContent.fovIndex, symbolContent.credit);
            symbolContent.isSpecialFont = this.content.isSpecialBall(symbolContent.credit);
        }
        super.onRollCycled();
    }
    ////
}

export class Game_1_SlowStopState extends SingleReelSlowStopState {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super(content);
        this.content = content;
    }
    ////

    //// API
    public effectId: number = ReelType.SLOW_STOP;
    ////
    protected onRollCycled() {
        if (this.content.first.symbolContent.symbolData.id == SymbolId.C1) {
            let symbolContent = this.content.first.symbolContent as SymbolContent;
            symbolContent.credit = this.content.getCredit(symbolContent.fovIndex);
            symbolContent.creditDisplay = this.content.getCreditDisplay(symbolContent.fovIndex, symbolContent.credit);
            symbolContent.isSpecialFont = this.content.isSpecialBall(symbolContent.credit);
        }
        super.onRollCycled();
    }
    ////
}

export class Game_1_StopState extends SingleReelStopState {
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
        if (this.content.first.symbolContent.symbolData.id == SymbolId.C1) {
            let symbolContent = this.content.first.symbolContent as SymbolContent;
            symbolContent.credit = this.content.getCredit(symbolContent.fovIndex);
            symbolContent.creditDisplay = this.content.getCreditDisplay(symbolContent.fovIndex, symbolContent.credit);
            symbolContent.isSpecialFont = this.content.isSpecialBall(symbolContent.credit);
        }
        super.onRollCycled();
    }
    ////
}
