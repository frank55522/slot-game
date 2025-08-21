/**
 * @author Vince vinceyang
 */
export class CoreGameData {
    /**
     * 幣別
     *
     * @default undefined
     */
    public currency: string;
    /**
     * 資源是否全部載完
     *
     * @default false
     */
    public isCompletedBatchLoading: boolean = false;
    /**
     * 遊戲狀態，記錄遊戲在狀態機中的狀態
     *
     * @default undefined
     */
    public state: string;
    /**
     * 遊戲局號
     *
     * @default undefined
     */
    public gameSeq: string;
    /**
     * 遊戲類別代碼
     *
     * @default undefined
     */
    public gameType: string;
    /**
     * 遊戲代碼
     *
     * @default undefined
     */
    public machineType: string;
    /**
     * 遊戲版號
     *
     * @default undefined
     */
    public gameVer: string;
    /**
     * 遊戲語系
     *
     * @default undefined
     */
    public language: string;
    /**
     * 幣別ISO碼
     *
     * @default undefined
     */
    public dollarCurrency: string;
    /**
     * 使用幣別符號
     *
     * @default false
     */
    public useDollarSign: boolean = false;
    /**
     * 幣別符號
     *
     * @default undefined
     */
    public dollarSign: string;
    /**
     * 遊戲連線的伺服器位址
     *
     * @default undefined
     */
    public host: string;
    /**
     * 遊戲是否會Demo模式
     *
     * @default false
     */
    public isDemoGame: boolean = false;
    /**
     * 遊戲是否要顯示回到大廳的選項
     *
     * @default false
     */
    public hasGoHome: boolean = false;
    /**
     * 遊戲是否要顯示報告選項
     *
     * @default false
     */
    public hasPlayerReport: boolean = false;
    /**
     * 遊戲是否進入維護狀態
     *
     * @default false
     */
    public isMaintaining: boolean = false;
    /**
     * 遊戲是否進入自動重連狀態
     *
     * @default false
     */
    public isReconnecting: boolean = false;
    /**
     * 資源的URL前綴
     *
     * @default undefined
     */
    public resPath: string;
    /**
     * 與SmartFox連線逾時時間
     *
     * @default 10000 ms
     */
    public connectedTimeout: number = 10000;
    /**
     * 資源載入的逾時時間，preload與loading各有自己的逾時，批次不包含在內
     *
     * @default 40000
     */
    public resLoadingTimeout: number = 40000;
    /**
     * 遊戲是否開啟測試用模式
     *
     * @default false
     */
    public hasTestMode = false;

    /** container and game version */
    public gameAndUiVer: string;

    /** lobby url */
    public lobbyUrl: string;

    /** ProviderLogo url for SpinBtn */
    public spinLogoUrl: string;

    /** ProviderLogo url */
    public providerLogoUrl: string;

    public sessionId: string;

    /** 部屬環境 */
    public deployEnv: string;
}
