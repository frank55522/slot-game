import { GameDataProxy } from '../../sgv3/proxy/GameDataProxy';
import { StateMachineProxy } from '../../sgv3/proxy/StateMachineProxy';
import { WinEvent } from '../../sgv3/util/Constant';

export class MockWinboardCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockWinboardCommand';

    public execute(notification: puremvc.INotification): void {
        let winText = notification.getBody();
        let parseTxt: string[] = winText.split('.');
        let boardType: string = parseTxt[0].toLowerCase();
        let winAmount: number = +parseTxt[1];
        if (isNaN(winAmount)) {
            alert('Error : 測試文字框輸入 "顯示類型.顯示金額...(下一段顯示金額)"(ex: "big.45.100.150") ');
            // this.clearTxtContent();
        } else {
            let tempState = this.gameDataProxy.gameState;
            this.gameDataProxy.gameState = StateMachineProxy.GAME1_SHOWWIN;
            this.gameDataProxy.gameState;
            switch (boardType) {
                case 'big':
                    this.sendNotification(WinEvent.FORCE_UPDATE_WIN_LABEL, 0);
                    this.sendNotification(WinEvent.RUN_WIN_LABEL_START, {
                        win: winAmount,
                        bigWinType: 'bigWin'
                    });
                    this.sendNotification(WinEvent.ON_HIT_WIN_BOARD, ['bigWin', parseTxt[1]]);
                    break;
                case 'mega':
                    this.sendNotification(WinEvent.FORCE_UPDATE_WIN_LABEL, 0);
                    this.sendNotification(WinEvent.RUN_WIN_LABEL_START, {
                        win: winAmount,
                        bigWinType: 'megaWin'
                    });
                    this.sendNotification(WinEvent.ON_HIT_WIN_BOARD, ['megaWin', parseTxt[1]]);
                    break;
                case 'super':
                    this.sendNotification(WinEvent.FORCE_UPDATE_WIN_LABEL, 0);
                    this.sendNotification(WinEvent.RUN_WIN_LABEL_START, {
                        win: winAmount,
                        bigWinType: 'superWin'
                    });
                    this.sendNotification(WinEvent.ON_HIT_WIN_BOARD, ['superWin', parseTxt[1]]);
                    break;
                case 'jumbo':
                    this.sendNotification(WinEvent.FORCE_UPDATE_WIN_LABEL, 0);
                    this.sendNotification(WinEvent.RUN_WIN_LABEL_START, {
                        win: winAmount,
                        bigWinType: 'jumboWin'
                    });
                    this.sendNotification(WinEvent.ON_HIT_WIN_BOARD, ['jumboWin', parseTxt[1]]);
                    break;
                case 'win':
                    this.sendNotification(WinEvent.FORCE_UPDATE_WIN_LABEL, 0);
                    this.sendNotification(WinEvent.RUN_WIN_LABEL_START, { win: winAmount, bigWinType: 'normal_1' });
                    break;
            }
            this.gameDataProxy.gameState = tempState;
        }
    }

    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
