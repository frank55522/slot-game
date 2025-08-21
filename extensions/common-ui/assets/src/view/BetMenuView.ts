import { _decorator } from 'cc';
import BaseView from 'src/base/BaseView';
import { BetMenu } from './BetMenu';
import { BetMenuButton } from './BetMenuButton';
const { ccclass, property } = _decorator;

@ccclass('BetMenuView')
export class BetMenuView extends BaseView {
    @property({ type: BetMenu })
    public betMenu: BetMenu;

    public betMenuButtons: Array<BetMenuButton> = new Array<BetMenuButton>();

    public createBetMenu(_options: number[], _onClickCallback: Function): void {
        let i: number = 0;
        while (i < _options.length) {
            const betButton = this.betMenu.addBetButton(i, _options[i], _onClickCallback);
            this.betMenu.content.node.addChild(betButton);
            const menuButton = betButton.getComponent(BetMenuButton);
            menuButton.setStateSprite(this.betMenu.buttonNormal, this.betMenu.buttonSelected);
            this.betMenuButtons.push(menuButton);
            i++;
        }
    }
    
    public showBetMenu() {
        this.betMenu.show();
    }

    public hideBetMenu() {
        this.betMenu.hide();
    }
}
