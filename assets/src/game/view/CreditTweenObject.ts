import { _decorator, Component, Node, Label, Font, CCFloat, TweenEasing, CCInteger } from 'cc';
import { BalanceUtil } from '../../sgv3/util/BalanceUtil';
const { ccclass, property } = _decorator;

@ccclass('CreditTweenObject')
export class CreditTweenObject extends Component {
    @property({ type: Label, visible: true })
    public labelText: Label | null = null;
    @property({ type: Font, visible: true })
    public baseFont: Font | null = null;
    @property({ type: Font, visible: true })
    public specialFont: Font | null = null;

    @property({ type: CCFloat, visible: true })
    public delayTime: number = 0;
    @property({ type: CCInteger, visible: true })
    public ptCount: number = 0;
    @property({ type: CCFloat, visible: true })
    public timeInterval: number = 0;

    public setBaseCreditSetting(isSpecial: boolean, credit: number, isOmniChannel: boolean) {
        this.labelText.font = isSpecial ? this.specialFont : this.baseFont;
        this.labelText.string = isOmniChannel ? String(credit) : BalanceUtil.formatBalanceWithExpressingUnits(credit);
    }
}
