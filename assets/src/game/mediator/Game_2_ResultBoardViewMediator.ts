import { _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { SceneManager } from '../../core/utils/SceneManager';
import { StateWinEvent } from '../../sgv3/util/Constant';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { Game_2_ResultBoardView } from '../view/Game_2_ResultBoardView';
import { BalanceUtil } from 'src/sgv3/util/BalanceUtil';
import { MathUtil } from 'src/core/utils/MathUtil';

const { ccclass } = _decorator;

@ccclass('Game_2_ResultBoardViewMediator')
export class Game_2_ResultBoardViewMediator extends BaseMediator<Game_2_ResultBoardView> {
    public static readonly NAME: string = 'Game_2_ResultBoardViewMediator';

    public constructor(name?: string, component?: any) {
        super(name, component);
    }

    protected lazyEventListener(): void {
        this.view.resultBoard.node.active = false;
    }

    public listNotificationInterests(): Array<any> {
        return [
            StateWinEvent.SHOW_LAST_CREDIT_BOARD,
            SceneManager.EV_ORIENTATION_VERTICAL,
            SceneManager.EV_ORIENTATION_HORIZONTAL
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        let self = this;
        if (self.gameDataProxy.curScene == GameScene.Game_3) return;
        switch (name) {
            case StateWinEvent.SHOW_LAST_CREDIT_BOARD:
                self.showWinBoard(notification.getBody());
                break;
        }
    }

    private showWinBoard(score: number) {
        let self = this;
        let curScene = self.gameDataProxy.curScene;
        const scoreDisplay = self.gameDataProxy.isOmniChannel()
            ? MathUtil.floor(this.gameDataProxy.getCreditByDenomMultiplier(score), 0).toString()
            : BalanceUtil.formatBalance(score);
        self.view.showWinBoard(scoreDisplay, curScene);
    }

    private _gameDataProxy: GAME_GameDataProxy;
    private get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
