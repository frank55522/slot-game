import { Vec3, _decorator } from 'cc';
import { UIViewStateBase } from '../../../core/uiview/UIViewStateRegister';
import { SymbolPart } from '../../../sgv3/view/reel/symbol/SymbolPart';
import {
    SymbolRollCycledState,
    SymbolShowState,
    SymbolStateRegisterBase
} from '../../../sgv3/view/reel/symbol/SymbolStateRegisterBase';
import { SymbolPartType, SymbolPerformType } from '../../../sgv3/vo/enum/Reel';
import { AudioManager } from '../../../audio/AudioManager';
import { AudioClipsEnum } from '../../vo/enum/SoundMap';
import { Game_2_SymbolContent } from './Game_2_SymbolContent';
const { ccclass } = _decorator;

@ccclass('Game_2_SymbolStateRegister')
export class Game_2_SymbolStateRegister extends SymbolStateRegisterBase {
    private _content: Game_2_SymbolContent | null = null;

    private get content() {
        if (this._content == null) {
            this._content = this.getComponent(Game_2_SymbolContent);
        }
        return this._content;
    }

    onRegister() {
        super.onRegister();
        this.registerState(new Game_2_RollCycledState(this.content));
        this.registerState(new Game_2_SymbolShowState(this.content));
        this.registerState(new Game_2_SymbolDampingState(this.content));
    }
}

export class Game_2_SymbolShowState extends SymbolShowState {
    //// Internal Member
    private content: Game_2_SymbolContent | null = null;
    ////

    //// Hook
    constructor(content: Game_2_SymbolContent) {
        super(content);
        this.content = content;
    }

    onPlay() {
        if (this.content.backgroundSprite != null) {
            this.content.backgroundSprite.enabled = true;
        }
        this.content.mainSprite.enabled = true;

        this.onEffectFinished();
    }
}

export class Game_2_RollCycledState extends SymbolRollCycledState {
    //// Internal Member
    private content: Game_2_SymbolContent | null = null;
    ////

    //// Hook
    constructor(content: Game_2_SymbolContent) {
        super();
        this.content = content;
    }

    onPlay() {
        if (this.content.freeCredit > 0) {
            this.content.freeCredit = 0;
            let sub: SymbolPart = this.content.parts.get(SymbolPartType.SUB);
            sub.offsetPos = new Vec3(
                this.content.C1TrailOffsetPos.x * this.content.node.worldScale.x,
                this.content.C1TrailOffsetPos.y * this.content.node.worldScale.y,
                1
            );
            sub.setPartPos(this.content.node.worldPosition);
            this.content.freeC1.node.active = true;
            this.content.freeC1.play('Rolling');
            AudioManager.Instance.play(AudioClipsEnum.Free_C1FireThrough);
        } else {
            this.content.freeC1.node.active = false;
        }

        this.onEffectFinished();
    }
}

export class Game_2_SymbolDampingState extends UIViewStateBase {
    //// Internal Member
    private content: Game_2_SymbolContent | null = null;
    ////

    //// Hook
    public effectId: number = SymbolPerformType.DAMPING;

    constructor(content: Game_2_SymbolContent) {
        super();
        this.content = content;
    }

    onPlay() {
        if (this.content.freeC1.node.active) {
            let sub: SymbolPart = this.content.parts.get(SymbolPartType.SUB);
            sub.offsetPos = new Vec3(
                this.content.C1HitOffsetPos.x * this.content.node.worldScale.x,
                this.content.C1HitOffsetPos.y * this.content.node.worldScale.y,
                1
            );
            sub.setPartPos(this.content.node.worldPosition);
            this.content.freeC1.play('Damp');
        }
        this.onEffectFinished();
    }
}
