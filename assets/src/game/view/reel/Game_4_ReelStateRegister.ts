
import { Color, _decorator } from 'cc';
import { SingleReelContent } from '../../../sgv3/view/reel/single-reel/SingleReelContent';
import { SingleReelDampState, SingleReelEmergencyStopState, SingleReelRollAfterState, SingleReelRollStartState, SingleReelSlowStopState, SingleReelStateRegisterBase, SingleReelStopState } from '../../../sgv3/view/reel/single-reel/SingleReelStateRegisterBase';
import { Layer } from '../../../sgv3/vo/enum/Layer';
import { LockType, SymbolId, SymbolPerformType } from '../../../sgv3/vo/enum/Reel';
import { Game_4_SymbolContent } from '../symbol/Game_4_SymbolContent';
const { ccclass } = _decorator;
 
@ccclass('Game_4_ReelStateRegister')
export class Game_4_ReelStateRegister extends SingleReelStateRegisterBase {

    private _content: SingleReelContent | null = null;

    private get content() {
        if (this._content == null) {
            this._content = this.getComponent(SingleReelContent);
        }
        return this._content;
    }

    onRegister(){
        super.onRegister();
        this.registerState(new Game_4_ReelDampState(this.content));
        this.registerState(new Game_4_EmergencyStopState(this.content));
        this.registerState(new Game_4_RollAfterState(this.content));
        this.registerState(new Game_4_RollStartState(this.content));
        this.registerState(new Game_4_StopState(this.content));
    }
}

@ccclass('Game_4_ReelDampState')
export class Game_4_ReelDampState extends SingleReelDampState {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super(content);
        this.content = content;
    }
    
    onPlay() {            
        //若還沒被lock fov配合Damping
        if(this.content.fovFeature[0].lockType == LockType.NONE 
            || this.content.fovFeature[0].lockType == LockType.NEW_LOCK){
            if(this.content.symbols[1].symbolContent.symbolData.isImprovedFOV){
                this.content.symbols[1].setOverlay(this.content.overlaySymbolContainer);
                this.content.symbols[1].setColor(Color.WHITE);
                this.content.symbols[1].play(SymbolPerformType.DAMPING);
            }

        }
        for(let i=0;i<this.content.symbols.length;i++){
            let mainTween = this.getSymbolTween(this.content.symbols[i]);
            mainTween.start();
        }
    }
    ////

    ////Internal Method
    protected onDampingEnd(){
        this.content.first.play(SymbolPerformType.HIDE);
        this.content.last.play(SymbolPerformType.HIDE);
        if(this.content.fovFeature[0].lockType == LockType.NEW_LOCK){
            this.content.onSingleReelDampingEnd(this.content.id);
            this.content.symbols[1].play(SymbolPerformType.HIDE);

            this.content.fovFeature[0].lockType = LockType.OLD_LOCK;
        }
        super.onDampingEnd();
    }
    ////
}

export class Game_4_EmergencyStopState extends SingleReelEmergencyStopState {
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
    protected onRollCycled(){
        let symbolContent = this.content.first.symbolContent as Game_4_SymbolContent;
        if(this.content.fovFeature[0].lockType == LockType.NONE 
            || this.content.fovFeature[0].lockType == LockType.NEW_LOCK){          
            symbolContent.ReSpinNum = this.content.getAddRound(symbolContent.fovIndex);
            if(this.content.first.symbolContent.symbolData.id == SymbolId.C2){   
                symbolContent.multiple = this.content.getMultiple(symbolContent.fovIndex);
            }
        }else{
            symbolContent.ReSpinNum = 0;
            symbolContent.multiple = 0;
        }
        super.onRollCycled();
    }
    ////
}

export class Game_4_RollAfterState extends SingleReelRollAfterState {
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
    protected onRollCycled(){
        let symbolContent = this.content.first.symbolContent as Game_4_SymbolContent;
        if(this.content.fovFeature[0].lockType == LockType.NONE 
            || this.content.fovFeature[0].lockType == LockType.NEW_LOCK){          
            symbolContent.ReSpinNum = this.content.getAddRound(symbolContent.fovIndex);
            if(this.content.first.symbolContent.symbolData.id == SymbolId.C2){   
                symbolContent.multiple = this.content.getMultiple(symbolContent.fovIndex);
            }
        }else{
            symbolContent.ReSpinNum = 0;
            symbolContent.multiple = 0;
        }
        super.onRollCycled();
    }
    ////
}

export class Game_4_RollStartState extends SingleReelRollStartState {
    //// Internal Member
    private content: SingleReelContent | null = null;
    ////

    //// Hook
    constructor(content: SingleReelContent) {
        super(content);
        this.content = content;
    }

    onPlay(){
        //針對是否 Lock 位置開啟滾輪或FOV物件
        if(this.content.fovFeature[0].lockType == LockType.NONE || this.content.fovFeature[0].lockType == LockType.NEW_LOCK || this.content.isHideC1AndC2){
            for(let i=0;i<this.content.symbols.length;i++){
                this.content.symbols[i].play(SymbolPerformType.SHOW);
            }
        }else{
            for(let i=0;i<this.content.symbols.length;i++){
                this.content.symbols[i].play(SymbolPerformType.HIDE);
            }
        }
        super.onPlay();
    }
    ////

    ////Internal Method
    protected onRollCycled(){
        let symbolContent = this.content.first.symbolContent as Game_4_SymbolContent;
        if(this.content.fovFeature[0].lockType == LockType.NONE 
            || this.content.fovFeature[0].lockType == LockType.NEW_LOCK){          
            symbolContent.ReSpinNum = this.content.getAddRound(symbolContent.fovIndex);
            if(this.content.first.symbolContent.symbolData.id == SymbolId.C2){   
                symbolContent.multiple = this.content.getMultiple(symbolContent.fovIndex);
            }
        }else{
            symbolContent.ReSpinNum = 0;
            symbolContent.multiple = 0;
        }
        super.onRollCycled();
    }
    ////
}

export class Game_4_StopState extends SingleReelStopState {
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
    protected onRollCycled(){
        let symbolContent = this.content.first.symbolContent as Game_4_SymbolContent;
        if(this.content.fovFeature[0].lockType == LockType.NONE 
            || this.content.fovFeature[0].lockType == LockType.NEW_LOCK){          
            symbolContent.ReSpinNum = this.content.getAddRound(symbolContent.fovIndex);
            if(this.content.first.symbolContent.symbolData.id == SymbolId.C2){   
                symbolContent.multiple = this.content.getMultiple(symbolContent.fovIndex);
            }
        }else{
            symbolContent.ReSpinNum = 0;
            symbolContent.multiple = 0;
        }
        super.onRollCycled();
    }
    ////
}