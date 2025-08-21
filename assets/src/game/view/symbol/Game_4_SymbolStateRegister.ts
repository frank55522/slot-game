
import { tween, Vec3, _decorator } from 'cc';
import { UIViewStateBase } from '../../../core/uiview/UIViewStateRegister';
import { PoolManager } from '../../../sgv3/PoolManager';
import { BalanceUtil } from '../../../sgv3/util/BalanceUtil';
import { SymbolPart } from '../../../sgv3/view/reel/symbol/SymbolPart';
import { SymbolHideState, SymbolRollCycledState, SymbolShowState, SymbolStateRegisterBase } from '../../../sgv3/view/reel/symbol/SymbolStateRegisterBase';
import { SymbolId, SymbolPartType, SymbolPerformType } from '../../../sgv3/vo/enum/Reel';
import { ParticleContentTool } from 'ParticleContentTool';
import { Game_4_SymbolContent } from './Game_4_SymbolContent';
const { ccclass } = _decorator;
 
@ccclass('Game_4_SymbolStateRegister')
export class Game_4_SymbolStateRegister extends SymbolStateRegisterBase {
    private _content: Game_4_SymbolContent | null = null;

    private get content() {
        if (this._content == null) {
            this._content = this.getComponent(Game_4_SymbolContent);
        }
        return this._content;
    }

    onRegister(){
        super.onRegister();
        this.registerState(new Game_4_SymbolHideState(this.content));
        this.registerState(new Game_4_RollCycledState(this.content));
        this.registerState(new Game_4_SymbolShowState(this.content));

        this.registerState(new Game_4_SymbolDampingState(this.content));
    }
}

export class Game_4_SymbolHideState extends SymbolHideState {
    //// Internal Member
    private content: Game_4_SymbolContent | null = null;
    ////

    //// Hook
    constructor(content: Game_4_SymbolContent) {
        super(content);
        this.content = content;
    }

    onPlay() {
        super.onPlay();
        this.content.labelText.enabled = false;
        this.content.reSpinSprite.enabled = false;
    }
    ////
}

export class Game_4_RollCycledState extends SymbolRollCycledState {
    //// Internal Member
    private content: Game_4_SymbolContent | null = null;
    ////

    //// Hook
    constructor(content: Game_4_SymbolContent) {
        super();
        this.content = content;
    }

    onPlay() {
        this.content.labelText.enabled = (this.content.multiple>0 && this.content.symbolData.id == SymbolId.C2);
        this.content.reSpinSprite.enabled = (this.content.ReSpinNum>0);
  
        if(this.content.labelText.enabled){
            let labelText: SymbolPart = this.content.parts.get(SymbolPartType.LABEL);
            labelText.offsetPos = (this.content.reSpinSprite.enabled) ?
            this.content.hasMultiplePos : this.content.normalPos;
            this.content.labelText.font = this.content.multipleFont;
            this.content.labelText.string = String(this.content.multiple+"%");
        }else{
            this.content.labelText.string = String();
        }
  
        if(this.content.reSpinSprite.enabled){
          this.content.reSpinSprite.spriteFrame 
          = (this.content.symbolData.id == SymbolId.C2) 
          ? this.content.reSpinFrames[this.content.ReSpinNum-1] 
          : this.content.reSpinSingleFrames[this.content.ReSpinNum-1] 
        }
       
        this.onEffectFinished();
    }
}

export class Game_4_SymbolShowState extends SymbolShowState {
    //// Internal Member
    private content: Game_4_SymbolContent | null = null;
    ////

    //// Hook
    constructor(content: Game_4_SymbolContent) {
        super(content);
        this.content = content;
    }

    onPlay() {
        super.onPlay();      
        this.content.labelText.enabled = (this.content.credit > 0);
        this.content.labelText.string = String();

        switch(this.content.symbolData.id){
          case SymbolId.C1:
            this.content.labelText.font = 
            (this.content.isSpecialFont) 
            ? this.content.specialFont : this.content.baseFont;
            break;
          case SymbolId.C2:
            this.content.labelText.font = this.content.goldFont;
            break;
        }
    
        if(this.content.labelText.enabled){
            this.content.labelText.string 
            = (this.content.credit > 0) ?
            BalanceUtil.formatBalanceWithExpressingUnits(this.content.credit): String();
        }
         
    }
}

export class Game_4_SymbolDampingState extends UIViewStateBase {
    //// Internal Member
    private content: Game_4_SymbolContent | null = null;
    ////

    //// Hook
    public effectId: number = SymbolPerformType.DAMPING;

    constructor(content: Game_4_SymbolContent) {
        super();
        this.content = content;
    }

    onPlay() {
        this.content.mainSprite.enabled = (this.content.symbolData.id == SymbolId.C2)
        this.content.labelText.enabled = (this.content.symbolData.id == SymbolId.C2 
        && this.content.multiple > 0);
        let main: SymbolPart = this.content.parts.get(SymbolPartType.MAIN);

        tween(main.node).to(0.13, {
            scale: new Vec3(1.1,1.1,1)
        })
        .to(0.14, {
             scale: new Vec3(1,1,1)
        }).union().start();

        let particle: ParticleContentTool = 
        PoolManager.instance.getNode(this.content.particlePrefab
            , main.node).getComponent(ParticleContentTool);
       
        particle.ParticlePlay();
        this.content.scheduleOnce(()=>{
            particle.ParticleClear();
            particle.ParticleStop();
            PoolManager.instance.putNode(particle.node);
        },2);
        
        this.content.reSpinSprite.enabled = (this.content.ReSpinNum>0);
      
        if(this.content.labelText.enabled){
            this.content.labelText.font = this.content.multipleFont;
            this.content.labelText.string = String(this.content.multiple + "%");
            this.content.labelText.node.position 
            = (this.content.reSpinSprite.enabled) 
            ? this.content.hasMultiplePos : this.content.normalPos;
        }else{
            this.content.labelText.string = String();
        }
      
        if(this.content.reSpinSprite.enabled){
            this.content.reSpinSprite.spriteFrame 
            = (this.content.symbolData.id == SymbolId.C2) 
            ? this.content.reSpinFrames[this.content.ReSpinNum-1] 
            : this.content.reSpinSingleFrames[this.content.ReSpinNum-1] 
        }
           
        this.onEffectFinished();
    }
}