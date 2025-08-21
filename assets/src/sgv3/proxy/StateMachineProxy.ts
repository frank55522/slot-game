import { CoreStateMachineProxy } from '../../core/proxy/CoreStateMachineProxy';
import { GameScene } from '../vo/data/GameScene';
import { GameDataProxy } from './GameDataProxy';

export class StateMachineProxy extends CoreStateMachineProxy {
    //loading
    public static readonly LOADING: string = 'loading';
    public static readonly EV_LOADING: string = 'evLoading';

    // game1
    public static readonly GAME1_INIT: string = 'game1Init';
    public static readonly GAME1_EV_INIT: string = 'game1EvInit';

    public static readonly GAME1_IDLE: string = 'game1Idle';
    public static readonly GAME1_EV_IDLE: string = 'game1EvIdle';

    public static readonly GAME1_SPIN: string = 'game1Spin';
    public static readonly GAME1_EV_SPIN: string = 'game1EvSpin';

    public static readonly GAME1_ROLLCOMPLETE: string = 'game1Rollcomplete';
    public static readonly GAME1_EV_ROLLCOMPLETE: string = 'game1EvRollcomplete';

    public static readonly GAME1_HITSPECIAL: string = 'game1HitSpecial';
    public static readonly GAME1_EV_HITSPECIAL: string = 'game1EvHitSpecial';

    public static readonly GAME1_BEFORESHOW: string = 'game1BeforeShow';
    public static readonly GAME1_EV_BEFORESHOW: string = 'game1EvBeforeShow';

    public static readonly GAME1_SHOWWIN: string = 'game1Showwin';
    public static readonly GAME1_EV_SHOWWIN: string = 'game1EvShowwin';

    public static readonly GAME1_AFTERSHOW: string = 'game1AfterShow';
    public static readonly GAME1_EV_AFTERSHOW: string = 'game1EvAfterShow';

    public static readonly GAME1_END: string = 'game1End';
    public static readonly GAME1_EV_END: string = 'game1EvEnd';

    public static readonly GAME1_FEATURESELECTION: string = 'game1FeatureSelection';
    public static readonly GAME1_EV_FEATURESELECTION: string = 'game1EvFeatureSelection';

    // game2
    public static readonly GAME2_INIT: string = 'game2Init';
    public static readonly GAME2_EV_INIT: string = 'game2EvInit';

    public static readonly GAME2_TRANSITIONS: string = 'game2Transitions';
    public static readonly GAME2_EV_TRANSITIONS: string = 'game2EvTransitions';

    public static readonly GAME2_IDLE: string = 'game2Idle';
    public static readonly GAME2_EV_IDLE: string = 'game2EvIdle';

    public static readonly GAME2_SPIN: string = 'game2Spin';
    public static readonly GAME2_EV_SPIN: string = 'game2EvSpin';

    public static readonly GAME2_ROLLCOMPLETE: string = 'game2Rollcomplete';
    public static readonly GAME2_EV_ROLLCOMPLETE: string = 'game2EvRollcomplete';

    public static readonly GAME2_HITSPECIAL: string = 'game2HitSpecial';
    public static readonly GAME2_EV_HITSPECIAL: string = 'game2EvHitSpecial';

    public static readonly GAME2_BEFORESHOW: string = 'game2BeforeShow';
    public static readonly GAME2_EV_BEFORESHOW: string = 'game2EvBeforeShow';

    public static readonly GAME2_SHOWWIN: string = 'game2Showwin';
    public static readonly GAME2_EV_SHOWWIN: string = 'game2EvShowwin';

    public static readonly GAME2_AFTERSHOW: string = 'game2AfterShow';
    public static readonly GAME2_EV_AFTERSHOW: string = 'game2EvAfterShow';

    public static readonly GAME2_END: string = 'game2End';
    public static readonly GAME2_EV_END: string = 'game2EvEnd';

    // game3
    public static readonly GAME3_INIT: string = 'game3Init';
    public static readonly GAME3_EV_INIT: string = 'game3EvInit';

    public static readonly GAME3_IDLE: string = 'game3Idle';
    public static readonly GAME3_EV_IDLE: string = 'game3EvIdle';

    public static readonly GAME3_SHOWWIN: string = 'game3Showwin';
    public static readonly GAME3_EV_SHOWWIN: string = 'game3EvShowwin';

    public static readonly GAME3_END: string = 'game3End';
    public static readonly GAME3_EV_END: string = 'game3EvEnd';

    // game4
    public static readonly GAME4_INIT: string = 'game4Init';
    public static readonly GAME4_EV_INIT: string = 'game4EvInit';

    public static readonly GAME4_TRANSITIONS: string = 'game4Transitions';
    public static readonly GAME4_EV_TRANSITIONS: string = 'game4EvTransitions';

    public static readonly GAME4_IDLE: string = 'game4Idle';
    public static readonly GAME4_EV_IDLE: string = 'game4EvIdle';

    public static readonly GAME4_SPIN: string = 'game4Spin';
    public static readonly GAME4_EV_SPIN: string = 'game4EvSpin';

    public static readonly GAME4_ROLLCOMPLETE: string = 'game4Rollcomplete';
    public static readonly GAME4_EV_ROLLCOMPLETE: string = 'game4EvRollcomplete';

    public static readonly GAME4_BEFORESHOW: string = 'game4BeforeShow';
    public static readonly GAME4_EV_BEFORESHOW: string = 'game4EvBeforeShow';

    public static readonly GAME4_HITSPECIAL: string = 'game4HitSpecial';
    public static readonly GAME4_EV_HITSPECIAL: string = 'game4EvHitSpecial';

    public static readonly GAME4_SHOWWIN: string = 'game4Showwin';
    public static readonly GAME4_EV_SHOWWIN: string = 'game4EvShowwin';

    public static readonly GAME4_AFTERSHOW: string = 'game4AfterShow';
    public static readonly GAME4_EV_AFTERSHOW: string = 'game4EvAfterShow';

    public static readonly GAME4_END: string = 'game4End';
    public static readonly GAME4_EV_END: string = 'game4EvEnd';

    /**
     * 設定用當下狀態檢查接下來狀態是否正確，如果不正確就會報錯
     * @author luke
     */
    protected initStateMachineMap() {
        super.initStateMachineMap();

        this.stateMachineMap[StateMachineProxy.LOADING] = [
            StateMachineProxy.GAME1_INIT,
            StateMachineProxy.GAME2_INIT,
            StateMachineProxy.GAME3_INIT,
            StateMachineProxy.GAME4_INIT
        ];

        /** Game 1 */
        this.stateMachineMap[StateMachineProxy.GAME1_INIT] = [
            StateMachineProxy.GAME1_IDLE,
            StateMachineProxy.GAME1_SHOWWIN,
            StateMachineProxy.GAME1_END
        ];
        this.stateMachineMap[StateMachineProxy.GAME1_IDLE] = [StateMachineProxy.GAME1_SPIN];
        this.stateMachineMap[StateMachineProxy.GAME1_SPIN] = [StateMachineProxy.GAME1_ROLLCOMPLETE];
        this.stateMachineMap[StateMachineProxy.GAME1_ROLLCOMPLETE] = [
            StateMachineProxy.GAME1_BEFORESHOW,
            StateMachineProxy.GAME1_HITSPECIAL
        ];
        this.stateMachineMap[StateMachineProxy.GAME1_HITSPECIAL] = [
            StateMachineProxy.GAME1_BEFORESHOW,
            StateMachineProxy.GAME1_END
        ];
        this.stateMachineMap[StateMachineProxy.GAME1_BEFORESHOW] = [
            StateMachineProxy.GAME1_SHOWWIN,
            StateMachineProxy.GAME1_AFTERSHOW,
            StateMachineProxy.GAME1_END
        ];
        this.stateMachineMap[StateMachineProxy.GAME1_SHOWWIN] = [StateMachineProxy.GAME1_AFTERSHOW];
        this.stateMachineMap[StateMachineProxy.GAME1_AFTERSHOW] = [StateMachineProxy.GAME1_END];
        this.stateMachineMap[StateMachineProxy.GAME1_END] = [
            StateMachineProxy.GAME1_IDLE,
            StateMachineProxy.GAME1_INIT,
            StateMachineProxy.GAME2_INIT,
            StateMachineProxy.GAME3_INIT,
            StateMachineProxy.GAME4_INIT,
            StateMachineProxy.GAME1_FEATURESELECTION
        ];
        this.stateMachineMap[StateMachineProxy.GAME1_FEATURESELECTION] = [
            StateMachineProxy.GAME2_INIT,
            StateMachineProxy.GAME4_INIT
        ];

        /** Game 2 */
        this.stateMachineMap[StateMachineProxy.GAME2_INIT] = [
            StateMachineProxy.GAME2_TRANSITIONS,
            StateMachineProxy.GAME2_IDLE //Recovery流程，不需要進行轉場表演
        ];
        this.stateMachineMap[StateMachineProxy.GAME2_TRANSITIONS] = [StateMachineProxy.GAME2_IDLE];
        this.stateMachineMap[StateMachineProxy.GAME2_IDLE] = [StateMachineProxy.GAME2_SPIN];
        this.stateMachineMap[StateMachineProxy.GAME2_SPIN] = [StateMachineProxy.GAME2_ROLLCOMPLETE];
        this.stateMachineMap[StateMachineProxy.GAME2_ROLLCOMPLETE] = [
            StateMachineProxy.GAME2_BEFORESHOW,
            StateMachineProxy.GAME2_HITSPECIAL
        ];
        this.stateMachineMap[StateMachineProxy.GAME2_HITSPECIAL] = [
            StateMachineProxy.GAME2_BEFORESHOW,
            StateMachineProxy.GAME2_END
        ];
        this.stateMachineMap[StateMachineProxy.GAME2_BEFORESHOW] = [
            StateMachineProxy.GAME2_SHOWWIN,
            StateMachineProxy.GAME2_AFTERSHOW,
            StateMachineProxy.GAME2_END
        ];
        this.stateMachineMap[StateMachineProxy.GAME2_SHOWWIN] = [StateMachineProxy.GAME2_AFTERSHOW];
        this.stateMachineMap[StateMachineProxy.GAME2_AFTERSHOW] = [
            StateMachineProxy.GAME3_INIT,
            StateMachineProxy.GAME2_END
        ];
        this.stateMachineMap[StateMachineProxy.GAME2_END] = [
            StateMachineProxy.GAME2_IDLE,
            StateMachineProxy.GAME3_INIT,
            StateMachineProxy.GAME1_INIT
        ];

        /** Game 3 */
        this.stateMachineMap[StateMachineProxy.GAME3_INIT] = [StateMachineProxy.GAME3_IDLE];

        this.stateMachineMap[StateMachineProxy.GAME3_IDLE] = [StateMachineProxy.GAME3_SHOWWIN];

        this.stateMachineMap[StateMachineProxy.GAME3_SHOWWIN] = [StateMachineProxy.GAME3_END];
        this.stateMachineMap[StateMachineProxy.GAME3_END] = [StateMachineProxy.GAME2_END, StateMachineProxy.GAME1_INIT];

        /** Game 4 */
        this.stateMachineMap[StateMachineProxy.GAME4_INIT] = [
            StateMachineProxy.GAME4_TRANSITIONS,
            StateMachineProxy.GAME4_IDLE //Recovery流程，不需要進行轉場表演
        ];
        this.stateMachineMap[StateMachineProxy.GAME4_TRANSITIONS] = [StateMachineProxy.GAME4_IDLE];
        this.stateMachineMap[StateMachineProxy.GAME4_IDLE] = [StateMachineProxy.GAME4_SPIN];
        this.stateMachineMap[StateMachineProxy.GAME4_SPIN] = [StateMachineProxy.GAME4_ROLLCOMPLETE];
        this.stateMachineMap[StateMachineProxy.GAME4_ROLLCOMPLETE] = [
            StateMachineProxy.GAME4_BEFORESHOW,
            StateMachineProxy.GAME4_HITSPECIAL
        ];
        this.stateMachineMap[StateMachineProxy.GAME4_HITSPECIAL] = [
            StateMachineProxy.GAME4_BEFORESHOW,
            StateMachineProxy.GAME4_END
        ];
        this.stateMachineMap[StateMachineProxy.GAME4_BEFORESHOW] = [
            StateMachineProxy.GAME4_SHOWWIN,
            StateMachineProxy.GAME4_END
        ];
        this.stateMachineMap[StateMachineProxy.GAME4_SHOWWIN] = [StateMachineProxy.GAME4_AFTERSHOW];
        this.stateMachineMap[StateMachineProxy.GAME4_AFTERSHOW] = [StateMachineProxy.GAME4_END];
        this.stateMachineMap[StateMachineProxy.GAME4_END] = [
            StateMachineProxy.GAME4_IDLE,
            StateMachineProxy.GAME1_INIT
        ];
    }

    /**
     * 設定狀態跟事件對應
     * @author luke
     */
    protected initStateEventMap() {
        super.initStateEventMap();

        this.stateEventMap[StateMachineProxy.LOADING] = StateMachineProxy.EV_LOADING;

        /** Game 1 */
        this.stateEventMap[StateMachineProxy.GAME1_INIT] = StateMachineProxy.GAME1_EV_INIT;
        this.stateEventMap[StateMachineProxy.GAME1_IDLE] = StateMachineProxy.GAME1_EV_IDLE;
        this.stateEventMap[StateMachineProxy.GAME1_SPIN] = StateMachineProxy.GAME1_EV_SPIN;
        this.stateEventMap[StateMachineProxy.GAME1_ROLLCOMPLETE] = StateMachineProxy.GAME1_EV_ROLLCOMPLETE;
        this.stateEventMap[StateMachineProxy.GAME1_HITSPECIAL] = StateMachineProxy.GAME1_EV_HITSPECIAL;
        this.stateEventMap[StateMachineProxy.GAME1_BEFORESHOW] = StateMachineProxy.GAME1_EV_BEFORESHOW;
        this.stateEventMap[StateMachineProxy.GAME1_SHOWWIN] = StateMachineProxy.GAME1_EV_SHOWWIN;
        this.stateEventMap[StateMachineProxy.GAME1_AFTERSHOW] = StateMachineProxy.GAME1_EV_AFTERSHOW;
        this.stateEventMap[StateMachineProxy.GAME1_END] = StateMachineProxy.GAME1_EV_END;
        this.stateEventMap[StateMachineProxy.GAME1_FEATURESELECTION] = StateMachineProxy.GAME1_EV_FEATURESELECTION;

        /** Game 2 */
        this.stateEventMap[StateMachineProxy.GAME2_INIT] = StateMachineProxy.GAME2_EV_INIT;
        this.stateEventMap[StateMachineProxy.GAME2_TRANSITIONS] = StateMachineProxy.GAME2_EV_TRANSITIONS;
        this.stateEventMap[StateMachineProxy.GAME2_IDLE] = StateMachineProxy.GAME2_EV_IDLE;
        this.stateEventMap[StateMachineProxy.GAME2_SPIN] = StateMachineProxy.GAME2_EV_SPIN;
        this.stateEventMap[StateMachineProxy.GAME2_ROLLCOMPLETE] = StateMachineProxy.GAME2_EV_ROLLCOMPLETE;
        this.stateEventMap[StateMachineProxy.GAME2_HITSPECIAL] = StateMachineProxy.GAME2_EV_HITSPECIAL;
        this.stateEventMap[StateMachineProxy.GAME2_BEFORESHOW] = StateMachineProxy.GAME2_EV_BEFORESHOW;
        this.stateEventMap[StateMachineProxy.GAME2_SHOWWIN] = StateMachineProxy.GAME2_EV_SHOWWIN;
        this.stateEventMap[StateMachineProxy.GAME2_AFTERSHOW] = StateMachineProxy.GAME2_EV_AFTERSHOW;
        this.stateEventMap[StateMachineProxy.GAME2_END] = StateMachineProxy.GAME2_EV_END;

        /** Game 3 */
        this.stateEventMap[StateMachineProxy.GAME3_INIT] = StateMachineProxy.GAME3_EV_INIT;
        this.stateEventMap[StateMachineProxy.GAME3_IDLE] = StateMachineProxy.GAME3_EV_IDLE;
        this.stateEventMap[StateMachineProxy.GAME3_SHOWWIN] = StateMachineProxy.GAME3_EV_SHOWWIN;
        this.stateEventMap[StateMachineProxy.GAME3_END] = StateMachineProxy.GAME3_EV_END;

        /** Game 4 */
        this.stateEventMap[StateMachineProxy.GAME4_INIT] = StateMachineProxy.GAME4_EV_INIT;
        this.stateEventMap[StateMachineProxy.GAME4_TRANSITIONS] = StateMachineProxy.GAME4_EV_TRANSITIONS;
        this.stateEventMap[StateMachineProxy.GAME4_IDLE] = StateMachineProxy.GAME4_EV_IDLE;
        this.stateEventMap[StateMachineProxy.GAME4_SPIN] = StateMachineProxy.GAME4_EV_SPIN;
        this.stateEventMap[StateMachineProxy.GAME4_ROLLCOMPLETE] = StateMachineProxy.GAME4_EV_ROLLCOMPLETE;
        this.stateEventMap[StateMachineProxy.GAME4_HITSPECIAL] = StateMachineProxy.GAME4_EV_HITSPECIAL;
        this.stateEventMap[StateMachineProxy.GAME4_BEFORESHOW] = StateMachineProxy.GAME4_EV_BEFORESHOW;
        this.stateEventMap[StateMachineProxy.GAME4_SHOWWIN] = StateMachineProxy.GAME4_EV_SHOWWIN;
        this.stateEventMap[StateMachineProxy.GAME4_AFTERSHOW] = StateMachineProxy.GAME4_EV_AFTERSHOW;
        this.stateEventMap[StateMachineProxy.GAME4_END] = StateMachineProxy.GAME4_EV_END;
    }

    /**
     * 檢查目前狀態是否可進去維護，預設為立即觸發維護
     *
     * @param state 欲檢查的狀態
     *
     * @returns true為進行維護
     */
    public checkMaintenanceState(state: string): boolean {
        return (
            (state == StateMachineProxy.GAME1_IDLE && !this.gameDataProxy.onHitJackpot) ||
            (state == StateMachineProxy.GAME1_FEATURESELECTION && !this.gameDataProxy.hasSelectionResponse)
        );
    }

    /**
     * 檢查目前狀態是否可進行斷線，預設為 undefined
     *
     * 回傳true與false為是否直接斷線，
     * 若無覆寫此方法時，一律以undefined定義不使用此功能
     *
     * @param state 欲檢查的狀態
     *
     * @returns true為立即斷線
     */
    public checkDisconnectedState(state: string): boolean {
        return (
            this.gameDataProxy.curScene == GameScene.Init ||
            this.gameDataProxy.gameState == StateMachineProxy.LOADING ||
            this.checkStateDisconnect()
        );
    }

    /**
     * 確認是否可以發出斷線通知
     * @author LUKE
     */
    public checkIdleRemind(): boolean {
        return this.gameDataProxy.isIdleReminding && this.checkStateDisconnect();
    }

    /** 狀態斷線 */
    protected checkStateDisconnect(): boolean {
        //如果this.gameDataProxy.spinEventData 為null 遇到!!就會變false
        return (
            (this.gameDataProxy.gameState == StateMachineProxy.GAME1_IDLE && !this.gameDataProxy.onHitJackpot) ||
            (this.gameDataProxy.gameState == StateMachineProxy.GAME1_SPIN && !this.gameDataProxy.spinEventData) ||
            (this.gameDataProxy.gameState == StateMachineProxy.GAME1_FEATURESELECTION &&
                !this.gameDataProxy.hasSelectionResponse)
        );
    }

    /** 維護中且滾分完畢後並且為Game1Showwin */
    public checkMaintenanceGame1Showwin() {
        return (
            this.gameDataProxy.isMaintaining &&
            this.gameDataProxy.runWinComplete &&
            this.gameDataProxy.gameState == StateMachineProxy.GAME1_SHOWWIN
        );
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
