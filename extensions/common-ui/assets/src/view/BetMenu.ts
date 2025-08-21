import { _decorator, UITransform, Label, Node, SpriteFrame, Size, Prefab, instantiate, SystemEvent } from 'cc';
import { SlideMenu } from './SlideMenu';
import { UIButton } from './UIButton';
import { BetMenuButton } from './BetMenuButton';
import { BalanceUtil } from 'src/sgv3/util/BalanceUtil';
const { ccclass, property } = _decorator;

@ccclass('BetMenu')
export class BetMenu extends SlideMenu {
    @property({ type: Label })
    public title: Label;
    @property({ type: UITransform })
    public content: UITransform;
    @property({ type: UIButton })
    public closeButton: UIButton;
    @property({ type: SpriteFrame })
    public buttonNormal: SpriteFrame;
    @property({ type: SpriteFrame })
    public buttonSelected: SpriteFrame;
    @property({ type: Size })
    public buttonSize: Size;
    @property({ type: Prefab })
    public menuButtonPrefab: Prefab;

    private _betMenu: UITransform | null = null;

    private _titleTransform: UITransform | null = null;

    public get transform() {
        if (this._betMenu == null) {
            this._betMenu = this.node.getComponent(UITransform);
        }
        return this._betMenu;
    }

    public get titleTransform() {
        if (this._titleTransform == null) {
            this._titleTransform = this.title.node.parent.getComponent(UITransform);
        }
        return this._titleTransform;
    }

    public addBetButton(i: number, countTxt: number, callback: Function): Node {
        const betButton = instantiate(this.menuButtonPrefab);
        const uiTransform = betButton.getComponent(UITransform);
        uiTransform.contentSize.set(this.buttonSize.width, this.buttonSize.height);
        const menuButton = betButton.addComponent(BetMenuButton);
        menuButton.setTotalBet(countTxt);
        const label = BalanceUtil.formatFlexibleDecimalBalance(countTxt);
        menuButton.setLabel(label);
        menuButton.index = i;
        betButton.on(
            SystemEvent.EventType.TOUCH_END,
            () => {
                callback(menuButton);
            },
            this
        );

        return betButton;
    }
}
