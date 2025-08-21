import { _decorator, Node, Prefab } from 'cc';
import BaseView from 'src/base/BaseView';
import { OmniBetMenu } from './OmniBetMenu';
import { BetMenuButton } from './BetMenuButton';
import { DenomMenuButton } from './DenomMenuButton';
const { ccclass, property } = _decorator;

@ccclass('OmniBetMenuView')
export class OmniBetMenuView extends BaseView {
    @property({ type: OmniBetMenu })
    public betMenu: OmniBetMenu;
    @property({ type: Prefab })
    public denomDisplayPrefab: Prefab;

    public featureBetMenuButtons: Array<BetMenuButton> = new Array<BetMenuButton>();
    public multiplierMenuButtons: Array<BetMenuButton> = new Array<BetMenuButton>();
    public denomMenuButtons: Array<DenomMenuButton> = new Array<DenomMenuButton>();

    public init(): void {
        this.node.active = false;
    }

    public createFeatureBetMenu(_options: number[], _onClickCallback: Function): void {
        let i: number = 0;
        while (i < _options.length) {
            const betButton = this.betMenu.addBetButton(i, _options[i], _onClickCallback);
            this.betMenu.content.node.addChild(betButton);
            const menuButton = betButton.getComponent(BetMenuButton);
            menuButton.setStateSprite(this.betMenu.buttonNormal, this.betMenu.buttonSelected);
            this.featureBetMenuButtons.push(menuButton);
            i++;
        }
    }

    public createBetMultiplierMenu(_options: number[], _onClickCallback: Function) {
        let i: number = 0;
        while (i < _options.length) {
            const button = this.betMenu.addMultiplierButton(i, _options[i], _onClickCallback);
            this.betMenu.multiplierContent.node.addChild(button);
            const menuButton = button.getComponent(BetMenuButton);
            menuButton.setStateSprite(this.betMenu.buttonNormal, this.betMenu.buttonSelected);
            this.multiplierMenuButtons.push(menuButton);
            i++;
        }
    }

    public createDenomMenu(_options: number[], _onClickCallback: Function) {
        let i: number = 0;
        while (i < _options.length) {
            const denomButton = this.betMenu.addDenomButton(i, _options[i], _onClickCallback);
            this.betMenu.denomContent.node.addChild(denomButton);
            const menuButton = denomButton.getComponent(DenomMenuButton);
            this.denomMenuButtons.push(menuButton);
            i++;
        }
        let width =
            this.betMenu.denomButtonSize.width * _options.length +
            this.betMenu.denomLayout.spacingX * (_options.length - 1);
        this.betMenu.denomContentTransform.contentSize.set(width);
    }

    public setTotalBetDisplayInBetMenu(bet: number, multiplier: number, denom: string, totalBet: string) {
        const display = bet + ' * ' + multiplier + ' * ' + denom + ' = ' + totalBet;
        this.betMenu.setTotalBetDisplay(display);
    }

    public showBetMenu() {
        this.betMenu.show();
    }

    public hideBetMenu() {
        this.betMenu.hide();
    }

    public injectFeatureBetView(viewNode: Node, index: number) {
        this.node.insertChild(viewNode, index);
        this.betMenu.refreshOpacityList();
    }
}
