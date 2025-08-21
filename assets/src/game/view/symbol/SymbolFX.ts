import { _decorator } from 'cc';
import { UIViewBase } from '../../../core/uiview/UIViewBase';
import { SymbolPosData } from '../../../sgv3/proxy/ReelDataProxy';
import { SymbolFXContent } from './SymbolFXContent';
const { ccclass, property } = _decorator;

@ccclass('SymbolFX')
export class SymbolFX extends UIViewBase {
    private _symbolContent: SymbolFXContent | null = null;

    private get symbolcontent() {
        if (this._symbolContent == null) {
            this._symbolContent = this.getComponent(SymbolFXContent);
        }
        return this._symbolContent;
    }

    public setInfo(id: number, symbolData: SymbolPosData) {
        this.symbolcontent.lockType = symbolData.lockType;
        this.symbolcontent.credit = symbolData.creditCent;
        this.symbolcontent.reSpinNum = symbolData.ReSpinNum;
        this.symbolcontent.multiple = symbolData.multiple;
        this.symbolcontent.isSpecialFont = symbolData.isSpecial;
        this.symbolcontent.language = symbolData.language;
        this.symbolcontent.symbolId = id;
    }

    public setLabelText(info: string) {
        if (!this.symbolcontent.labelText) {
            return;
        }
        this.symbolcontent.labelText.string = String(info);
    }

    public subHide() {
        if (this.symbolcontent.subSprite) {
            this.symbolcontent.subSprite.enabled = false;
        }
    }

    public set isOmniChannel(isOmniChannel: boolean) {
        this.symbolcontent.isOmniChannel = isOmniChannel;
    }

    public get isOmniChannel() {
        return this.symbolcontent.isOmniChannel;
    }
}
