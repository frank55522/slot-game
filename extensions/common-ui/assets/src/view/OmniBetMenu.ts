import { _decorator, UITransform, Label, Node, instantiate, SystemEvent, Prefab, Size, Layout } from 'cc';
import { UIButton } from './UIButton';
import { BetMenu } from './BetMenu';
import { BetMenuButton } from './BetMenuButton';
import { BalanceUtil } from 'src/sgv3/util/BalanceUtil';
import { DenomMenuButton } from './DenomMenuButton';
const { ccclass, property } = _decorator;

@ccclass('OmniBetMenu')
export class OmniBetMenu extends BetMenu {
    @property({ type: UITransform })
    public denomContent: UITransform;
    @property({ type: Prefab })
    public denomButtonPrefab: Prefab;
    @property({ type: UITransform })
    public multiplierContent: UITransform;
    @property({ type: UIButton })
    public confirmButton: UIButton;
    @property({ type: Label })
    public totalBetDisplay: Label;
    @property({ type: Layout })
    public totalBetLayout: Layout;

    private _denomLayout: Layout;
    public get denomLayout(): Layout {
        if (!this._denomLayout) {
            this._denomLayout = this.denomContent.getComponent(Layout);
        }
        return this._denomLayout;
    }

    private _denomContentTransform: UITransform;
    public get denomContentTransform(): UITransform {
        if (!this._denomContentTransform) {
            this._denomContentTransform = this.denomContent.getComponent(UITransform);
        }
        return this._denomContentTransform;
    }

    private _denomButtonSize: Size;
    public get denomButtonSize(): Size {
        if (!this._denomButtonSize) {
            this._denomButtonSize = this.denomButtonPrefab.data.getComponent(UITransform).contentSize;
        }
        return this._denomButtonSize;
    }

    private _totalBetTransform: UITransform;
    public get totalBetTransform(): UITransform {
        if (!this._totalBetTransform) {
            this._totalBetTransform = this.totalBetLayout.getComponent(UITransform);
        }
        return this._totalBetTransform;
    }

    public addMultiplierButton(i: number, countTxt: number, callback: Function): Node {
        const betButton = super.addBetButton(i, countTxt, callback);
        const label = '*' + BalanceUtil.formatFlexibleDecimalBalance(countTxt);
        const menuButton = betButton.getComponent(BetMenuButton);
        menuButton.setLabel(label);

        return betButton;
    }

    public addDenomButton(i: number, countTxt: number, callback: Function): Node {
        const denomButton = instantiate(this.denomButtonPrefab);
        const uiTransform = denomButton.getComponent(UITransform);
        denomButton.addComponent(DenomMenuButton);
        uiTransform.contentSize.set(this.buttonSize.width, this.buttonSize.height);
        const menuButton = denomButton.getComponent(DenomMenuButton);
        menuButton.setValue(countTxt);
        const label = BalanceUtil.dollarSign + countTxt;
        menuButton.setLabel(label);
        menuButton.index = i;
        denomButton.on(
            SystemEvent.EventType.TOUCH_END,
            () => {
                callback(menuButton);
            },
            this
        );

        return denomButton;
    }

    public setTotalBetDisplay(totalBet: string) {
        this.totalBetDisplay.string = totalBet;
        this.totalBetDisplay.updateRenderData(true);
        this.totalBetLayout.updateLayout(true);
        this.checkTotalBetWidth();
    }

    private checkTotalBetWidth() {
        const width = this.totalBetTransform.contentSize.width;
        if (width > this.transform.width) {
            const ratio = this.transform.width / width;
            this.totalBetTransform.node.setScale(ratio, ratio);
        }
    }
}
