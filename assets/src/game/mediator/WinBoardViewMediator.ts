import { _decorator } from 'cc';
import { BaseWinBoardViewMediator } from '../../sgv3/mediator/base/BaseWinBoardViewMediator';
import { IWinBoardViewMediator, WinBoardView } from '../../sgv3/view/WinBoardView';
const { ccclass } = _decorator;

@ccclass('WinBoardViewMediator')
export class WinBoardViewMediator extends BaseWinBoardViewMediator<WinBoardView> implements IWinBoardViewMediator {
    public constructor(name?: string, component?: any) {
        super(component);
        this.view.buttonCallback = this;
        this.view.registerButton();
    }

    protected lazyEventListener(): void {
        this.loadingComplete();
    }

    /** 提供給外部可以設定自己客製化的winboardView */
    protected setWinboardView() {}

    /** spin down點下後判斷 */
    protected onSpinDown() {
        super.onSpinDown();
    }

    public onSkip() {
        window['onSpinBtnClick']();
    }
}
