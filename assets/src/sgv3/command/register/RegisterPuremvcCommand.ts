import { AccountStatusCommand } from '../../../core/command/AccountStatusCommand';
import { AccountStatusMultipleLoginCommand } from '../../../core/command/AccountStatusMultipleLoginCommand';
import { NetworkProxy } from '../../../core/proxy/NetworkProxy';
import { CreditDataProxy } from '../../proxy/CreditDataProxy';
import { JackpotPoolProxy } from '../../proxy/JackpotPoolProxy';
import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';
import { AutoPlayClickOptionCommand } from '../autoplay/AutoPlayClickOptionCommand';
import { AutoPlayOnIdleProcessCommand } from '../autoplay/AutoPlayOnIdleProcessCommand';
import { AutoPlayOnSpinProcessCommand } from '../autoplay/AutoPlayOnSpinProcessCommand';
import { BalanceChangedCommand } from '../balance/BalanceChangedCommand';
import { TakeWinCommand } from '../balance/TakeWinCommand';
import { CheckGameFlowCommand } from '../CheckGameFlowCommand';
import { IdelRemindCommand } from '../connect/IdelRemindCommand';
import { MaintainGame1ShowwinCommand } from '../connect/MaintainGame1ShowwinCommand';
import { SGMaintenanceCommand } from '../connect/SGMaintenanceCommand';
import { InitEventCommand } from '../InitEventCommand';
import { CheckScreenSymbolCommand } from '../nomatch/CheckScreenSymbolCommand';
import { ChangeGameSceneCommand } from '../scene/ChangeGameSceneCommand';
import { NormalPlayCommand } from '../spin/NormalPlayCommand';
import { SpinResponseCommand } from '../spin/SpinResponseCommand';
import { CheckStateFailCommand } from '../statemachine/CheckStateFailCommand';
import { ChangeSceneViewCommand } from '../viewMediator/ChangeSceneViewCommand';
import { PrizePredictionCompleteCommand } from '../reeleffect/PrizePredictionCompleteCommand';
import { CheckShowWinComplete } from '../CheckShowWinComplete';
import { WinBoardRunCompleteCommand } from '../winboard/WinBoardRunCompleteCommand';
import { ChangeWinBoardStateCommand } from '../winboard/ChangeWinBoardStateCommand';
import { Game1AfterShowCommand } from '../state/Game1AfterShowCommand';
import { AudioMediator } from '../../../audio/AudioMediator';
import { SettlePlayResponseCommand } from '../../../core/command/SettlePlayResponseCommand';
import { SaveDataResponseCommand } from '../../../core/command/SaveDataResponseCommand';
import { CheckRecoveryFlowCommand } from '../recovery/CheckRecoveryFlowCommand';
import { ClearRecoveryDataCommand } from '../recovery/ClearRecoveryDataCommand';
import { SaveRecoveryDataCommand } from '../recovery/SaveRecoveryDataCommand';
import { ByGameHandleCommand } from '../spin/ByGameHandleCommand';
import { MultipleCalculateCommand } from '../byGame/MultipleCalculateCommand';
import { ScoringHandleCommand } from '../byGame/ScoringHandleCommand';
import { OpenHelpCommand } from '../help/OpenHelpCommand';
import { CloseHelpCommand } from '../help/CloseHelpCommand';
import { CheckNormalButtonStateCommand } from 'src/game/command/CheckNormalButtonStateCommand';

export abstract class RegisterPuremvcCommand extends puremvc.SimpleCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);

        this.registerProxy();

        this.registerCommand();

        this.registerMediator(notification);
    }

    /**
     * 註冊proxy
     */
    protected registerProxy(): void {
        this.facade.registerProxy(new NetworkProxy());
        this.facade.registerProxy(new WebBridgeProxy());
        this.facade.registerProxy(new ReelDataProxy());
        this.facade.registerProxy(new CreditDataProxy());
        this.facade.registerProxy(new JackpotPoolProxy());
    }

    /**
     * 註冊command
     */
    protected registerCommand(): void {
        this.facade.registerCommand(AccountStatusCommand.NAME, AccountStatusCommand);
        this.facade.registerCommand(AccountStatusMultipleLoginCommand.NAME, AccountStatusMultipleLoginCommand);
        this.facade.registerCommand(InitEventCommand.NAME, InitEventCommand);
        this.facade.registerCommand(SpinResponseCommand.NAME, SpinResponseCommand);
        this.facade.registerCommand(ByGameHandleCommand.NAME, ByGameHandleCommand);

        this.facade.registerCommand(PrizePredictionCompleteCommand.NAME, PrizePredictionCompleteCommand);
        // autoplay
        this.facade.registerCommand(AutoPlayOnIdleProcessCommand.NAME, AutoPlayOnIdleProcessCommand);
        this.facade.registerCommand(AutoPlayOnSpinProcessCommand.NAME, AutoPlayOnSpinProcessCommand);
        this.facade.registerCommand(AutoPlayClickOptionCommand.NAME, AutoPlayClickOptionCommand);

        // spin Request
        this.facade.registerCommand(NormalPlayCommand.NAME, NormalPlayCommand);

        this.facade.registerCommand(TakeWinCommand.NAME, TakeWinCommand);

        // winboard
        this.facade.registerCommand(ChangeWinBoardStateCommand.NAME, ChangeWinBoardStateCommand);

        // scene
        this.facade.registerCommand(ChangeGameSceneCommand.NAME, ChangeGameSceneCommand);

        // 閒置斷線
        this.facade.registerCommand(IdelRemindCommand.NAME, IdelRemindCommand);

        // 場景轉換器
        this.facade.registerCommand(ChangeSceneViewCommand.NAME, ChangeSceneViewCommand);

        // 場景資料確認
        this.facade.registerCommand(CheckGameFlowCommand.NAME, CheckGameFlowCommand);

        this.facade.registerCommand(Game1AfterShowCommand.NAME, Game1AfterShowCommand);

        // 收到changebalance後處理
        this.facade.registerCommand(BalanceChangedCommand.NAME, BalanceChangedCommand);
        // 轉換狀態錯誤處理
        this.facade.registerCommand(CheckStateFailCommand.NAME, CheckStateFailCommand);
        // 維護時處理
        this.facade.registerCommand(MaintainGame1ShowwinCommand.NAME, MaintainGame1ShowwinCommand);
        // 因應斷線重連線覆寫狀態Command
        this.facade.registerCommand(SGMaintenanceCommand.NAME, SGMaintenanceCommand);
        // // 滾分結束後處理
        this.facade.registerCommand(WinBoardRunCompleteCommand.NAME, WinBoardRunCompleteCommand);

        // 檢查停輪Symbol 是否正確
        this.facade.registerCommand(CheckScreenSymbolCommand.NAME, CheckScreenSymbolCommand);
        this.facade.registerCommand(CheckShowWinComplete.NAME, CheckShowWinComplete);

        // 流程檢查(遊戲紀錄點、結帳紀錄)
        this.facade.registerCommand(SaveRecoveryDataCommand.NAME, SaveRecoveryDataCommand);
        this.facade.registerCommand(CheckRecoveryFlowCommand.NAME, CheckRecoveryFlowCommand);
        this.facade.registerCommand(ClearRecoveryDataCommand.NAME, ClearRecoveryDataCommand);
        this.facade.registerCommand(SaveDataResponseCommand.NAME, SaveDataResponseCommand);
        this.facade.registerCommand(SettlePlayResponseCommand.NAME, SettlePlayResponseCommand);

        //計算贏分倍率進Proxy
        this.facade.registerCommand(MultipleCalculateCommand.NAME, MultipleCalculateCommand);
        // 滾分處理
        this.facade.registerCommand(ScoringHandleCommand.NAME, ScoringHandleCommand);
        // Help
        this.facade.registerCommand(OpenHelpCommand.NAME, OpenHelpCommand);
        this.facade.registerCommand(CloseHelpCommand.NAME, CloseHelpCommand);
        this.facade.registerCommand(CheckNormalButtonStateCommand.NAME, CheckNormalButtonStateCommand);
    }

    /**
     * 註冊mediator
     * 參數 notification 讓實作者自行決定要不要取出
     *  */
    protected registerMediator(notification: puremvc.INotification): void {
        this.facade.registerMediator(new AudioMediator());
        // this.facade.registerMediator(new LoadingViewMediator(notification.getBody()));
    }
}
