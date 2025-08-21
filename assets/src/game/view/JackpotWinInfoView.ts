import { _decorator, Label } from 'cc';
import BaseView from 'src/base/BaseView';
import { BalanceUtil } from 'src/sgv3/util/BalanceUtil';
const { ccclass, property } = _decorator;

@ccclass('JackpotWinInfoView')
export class JackpotWinInfoView extends BaseView {
    @property({ type: Label })
    public jackpotWonMsgValue: Label;

    public curTotalJackpotWonValue: number = 0;

    protected onLoad(): void {
        super.onLoad();
        this.initJackpotWonMsgObject();
    }

    private initJackpotWonMsgObject() {
        this.closeJackpotWonMsg();
    }

    public closeJackpotWonMsg() {
        this.node.active = false;
        this.jackpotWonMsgValue.string = '';
        this.curTotalJackpotWonValue = 0;
    }

    public showJackpotWonMsg(jpWon: number) {
        this.node.active = true;
        this.addJackpotWonValue(jpWon);
        this.jackpotWonMsgValue.string = BalanceUtil.formatBalanceWithDollarSign(this.curTotalJackpotWonValue / 100);
    }

    private addJackpotWonValue(jpWon: number) {
        this.curTotalJackpotWonValue += jpWon;
    }
}
