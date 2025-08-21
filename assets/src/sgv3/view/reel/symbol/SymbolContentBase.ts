import { _decorator, Component, Sprite,Node, Tween, CCFloat } from 'cc';
import { TSMap } from '../../../../core/utils/TSMap';
import { SymbolPartType } from '../../../vo/enum/Reel';
import { SymbolData } from '../../../vo/match/ReelMatchInfo';
import { SymbolPart } from './SymbolPart';
const { ccclass, property } = _decorator;

@ccclass('SymbolContentBase')
export class SymbolContentBase extends Component {
    //// Internal Member
    @property({ type: Sprite, visible: true })
    private _backgroundSprite: Sprite | null = null;
    @property({ type: Sprite, visible: true })
    private _mainSprite: Sprite | null = null;

    @property({ type: CCFloat, visible: true })
    private _duration: number = 0;

    private _symbolData: SymbolData | null = null;

    private _parts: TSMap<SymbolPartType, SymbolPart> | null = null;
    ////

    //// property
    public fovIndex: number = -1;

    public get duration(){
        return this._duration;
    }

    public get parts() {
        return this._parts!;
    }

    public set parts(value:  TSMap<SymbolPartType, SymbolPart>) {
        this._parts = value;
    }

    public get symbolData() {
        return this._symbolData!;
    }

    public get backgroundSprite() {
        return this._backgroundSprite!;
    }

    public get mainSprite() {
        return this._mainSprite!;
    }

    public set symbolData(value: SymbolData) {
        this._symbolData = value;
        this.mainSprite!.spriteFrame = this.symbolData.mainSpriteFrame;
        if(this.backgroundSprite == null){return;}
        this.backgroundSprite.enabled = (this.symbolData.bgSpriteFrame != null);
        this.backgroundSprite.spriteFrame =(this.backgroundSprite.enabled) ? this.symbolData.bgSpriteFrame: null;
    }

    public tween: Tween<Node> | null = null;
    ////

    //// API
    ////

    ////Internal Method
    ////
}
