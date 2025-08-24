import { StateMachineProxy } from '../../sgv3/proxy/StateMachineProxy';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { CountdownDisplayMediator } from '../mediator/CountdownDisplayMediator';
import { WinLineDisplayMediator } from '../mediator/WinLineDisplayMediator';
import { GAME_InitEventCommand } from './GAME_InitEventCommand';
import { GAME_ReelEffectCommand } from './reelEffect/GAME_ReelEffectCommand';

/** LINE GAME 需要 import的元件 */
// import { LINE_RegisterPuremvcCommand } from '../../sgv3line/command/LINE_RegisterPuremvcCommand';
// import { LINE_SpinRequestCommand } from '../../sgv3line/command/LINE_SpinRequestCommand';

/** WAY GAME 需要 import的元件 */
import { WAY_RegisterPuremvcCommand } from '../../sgv3way/command/WAY_RegisterPuremvcCommand';
import { WAY_SpinRequestCommand } from '../../sgv3way/command/WAY_SpinRequestCommand';
import { GAME_ParseStateWinResultCommand } from './GAME_ParseStateWinResultCommand';
import { GAME_4_CreditCollectResultCommand } from './dragon-up/GAME_4_CreditCollectResultCommand';
import { ReelEffect_SymbolFeatureCommand } from './reelEffect/ReelEffect_SymbolFeatureCommand';
import { LastSymbolFeatureCommand } from './LastSymbolFeatureCommand';

export class GAME_RegisterPuremvcCommand extends WAY_RegisterPuremvcCommand {
    /**
     * 註冊proxy
     */
    protected registerProxy(): void {
        this.facade.registerProxy(new GAME_GameDataProxy());
        this.facade.registerProxy(new StateMachineProxy());

        super.registerProxy();
    }

    /**
     * 註冊command
     */
    protected registerCommand(): void {
        super.registerCommand();
        // 資料處理
        this.facade.registerCommand(GAME_ParseStateWinResultCommand.NAME, GAME_ParseStateWinResultCommand);
        // init
        this.facade.registerCommand(GAME_InitEventCommand.NAME, GAME_InitEventCommand);
        // spin Request
        this.facade.registerCommand(WAY_SpinRequestCommand.NAME, WAY_SpinRequestCommand);

        // ReelEvent
        this.facade.registerCommand(GAME_ReelEffectCommand.NAME, GAME_ReelEffectCommand);

        // Dragon up
        this.facade.registerCommand(GAME_4_CreditCollectResultCommand.NAME, GAME_4_CreditCollectResultCommand);

        // Reel 表演資料處理
        this.facade.registerCommand(ReelEffect_SymbolFeatureCommand.NAME, ReelEffect_SymbolFeatureCommand);
        // Reel 最後的表演資料
        this.facade.registerCommand(LastSymbolFeatureCommand.NAME, LastSymbolFeatureCommand);
    }

    /**
     * 註冊mediator
     * 參數 notification 讓實作者自行決定要不要取出
     *  */
    protected registerMediator(notification: puremvc.INotification): void {
        super.registerMediator(notification);
        
        // 註冊中獎連線顯示 Mediator（題目一）
        this.facade.registerMediator(new WinLineDisplayMediator());
        
        // 註冊倒數顯示 Mediator（題目四）
        this.facade.registerMediator(new CountdownDisplayMediator());
    }
}
