import { SceneEvent } from '../../sgv3/util/Constant';
import { MockDisconnectionCommand } from '../command/MockDisconnectionCommand';
import { MockMaintenanceCommand } from '../command/MockMaintenanceCommand';
import { MockReelSymbolCommand } from '../command/MockReelSymbolCommand';
import { MockSpinScatterNowinCommand } from '../command/MockSpinScatterNowinCommand';
import { MockWinboardCommand } from '../command/MockWinboardCommand';
import { MockPrizePredictionCommand } from '../command/MockPrizePredictionCommand';
import { Component } from 'cc';
import { MockToContainerIconPosCommand } from '../command/MockToContainerIconPosCommand';
import { MockReconnectCommand } from '../command/MockReconnectCommand';
import { MockHitGrandCommand } from '../command/MockHitGrandCommand';
import { MockEmblemLevelCommand } from '../command/MockEmblemLevelCommand';
import { MockHideC1AndC2Command } from '../command/MockHideC1AndC2Command';
import { MockErrorTestCommand } from '../command/MockErrorTestCommand';
import { MockChangeTimeScaleCommand } from '../command/MockChangeTimeScaleCommand';

export class MockViewMediator extends puremvc.Mediator {
    private parentView: Component = null;

    public static readonly NAME: string = 'MockViewMediator';
    public static readonly CHANG_COORDINATE = 'onChangeWormHoleViewCoordinate';

    public constructor(viewComponent: Component) {
        super(MockViewMediator.NAME, viewComponent);
        this.parentView = viewComponent;
    }

    public listNotificationInterests(): Array<any> {
        return [SceneEvent.LOAD_BASE_COMPLETE, SceneEvent.BATCH_LOADING_COMPLETE];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        const self = this;
        switch (name) {
            case SceneEvent.LOAD_BASE_COMPLETE:
                self.loadBaseComplete();
                break;
            case SceneEvent.BATCH_LOADING_COMPLETE:
                // TODO: 如果有客製化需求再開啟調整
                // self.resetMockView();
                break;
        }
    }

    /** 完成Game1資源載入後處理 */
    protected loadBaseComplete() {
        const self = this;
        self.setDefaultBtn();

        // TODO: 如果有客製化需求再開啟調整
        // self.resetMockView();
    }

    /** 設定預設按鈕 */
    protected setDefaultBtn() {
        const caseList = {
            ErrorTest: MockErrorTestCommand.NAME,
            WinBoard: MockWinboardCommand.NAME,
            PrizePrediction: MockPrizePredictionCommand.NAME,
            Disconnection: MockDisconnectionCommand.NAME,
            Maintenance: MockMaintenanceCommand.NAME,
            Reconnect: MockReconnectCommand.NAME,
            ToContainerIconPos: MockToContainerIconPosCommand.NAME,
            HitGrand: MockHitGrandCommand.NAME,
            EmblemLevel: MockEmblemLevelCommand.NAME,
            HideC1AndC2: MockHideC1AndC2Command.NAME,
            "RunSpeed_x1~20": MockChangeTimeScaleCommand.NAME
        };
        const self = this;
        self.facade.registerCommand(MockErrorTestCommand.NAME, MockErrorTestCommand);
        self.facade.registerCommand(MockWinboardCommand.NAME, MockWinboardCommand);
        self.facade.registerCommand(MockPrizePredictionCommand.NAME, MockPrizePredictionCommand);
        self.facade.registerCommand(MockDisconnectionCommand.NAME, MockDisconnectionCommand);
        self.facade.registerCommand(MockMaintenanceCommand.NAME, MockMaintenanceCommand);
        self.facade.registerCommand(MockReconnectCommand.NAME,MockReconnectCommand);
        self.facade.registerCommand(MockToContainerIconPosCommand.NAME, MockToContainerIconPosCommand);
        self.facade.registerCommand(MockHitGrandCommand.NAME, MockHitGrandCommand);
        self.facade.registerCommand(MockEmblemLevelCommand.NAME, MockEmblemLevelCommand);
        self.facade.registerCommand(MockHideC1AndC2Command.NAME, MockHideC1AndC2Command);
        self.facade.registerCommand(MockChangeTimeScaleCommand.NAME, MockChangeTimeScaleCommand);
        self.sendNotification('onAddExtraCase', caseList);
    }

    private resetMockView() {
        this.resetPosition();
    }

    /** 提供客製化調整除錯工具位置用 */
    protected resetPosition() {
        let x: number, y: number, z: number;

        // z = this.parentView.numChildren - 1;
        // // 因為rootView 有做錨點位移所以要調整
        // let shiftX: number = -this.parentView.x;
        // let shiftY: number = -this.parentView.y;

        // //ORIENTATION_CONTROL
        // if (window.orientation == 0) {
        //     // 直式

        //     x = this.parentView.width * 0.5;
        //     y = 260;
        // } else {
        //     // 橫式
        //     x = this.parentView.width - 150;
        //     y = this.parentView.height - 200;
        // }

        // this.sendNotification(MockViewMediator.CHANG_COORDINATE, [x + shiftX, y + shiftY, z]);
        // }
    }
}
