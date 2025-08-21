import { CoreGameData } from '../vo/CoreGameData';
import { PlayerData } from '../vo/PlayerData';

export class CoreGameDataProxy extends puremvc.Proxy {
    public static readonly NAME: string = 'GameDataProxy';

    /**
     * 遊戲資訊
     */
    protected gameData: CoreGameData;

    /**
     * 玩家資訊
     */
    protected playerData: PlayerData;

    public constructor(gameData: CoreGameData = new CoreGameData(), playerData: PlayerData = new PlayerData()) {
        super(CoreGameDataProxy.NAME);
        this.gameData = gameData;
        this.playerData = playerData;
    }

    public get bmd(): number {
        return this.playerData.bmd;
    }

    /**
     * @param value, balance value
     * @param false, 為乘過1000的數值
     */
    public setBmd(value: number, isBalance: boolean = false) {
        if (isBalance) {
            this.playerData.bmd = value * 1000;
        } else {
            this.playerData.bmd = value;
        }
    }

    public get extendNetworkData(): any {
        return this.playerData.extendNetworkData;
    }

    public set extendNetworkData(value: any) {
        this.playerData.extendNetworkData = value;
    }

    public get userId(): string {
        return this.playerData.userId;
    }

    public set userId(value: string) {
        this.playerData.userId = value;
    }

    public get currency(): string {
        return this.gameData.currency;
    }

    public set currency(value: string) {
        this.gameData.currency = value;
    }

    public get isCompletedBatchLoading(): boolean {
        return this.gameData.isCompletedBatchLoading;
    }

    public set isCompletedBatchLoading(value: boolean) {
        this.gameData.isCompletedBatchLoading = value;
    }

    public get gameState(): string {
        return this.gameData.state;
    }

    public set gameState(state: string) {
        this.gameData.state = state;
    }

    public get gameSeq(): string {
        return this.gameData.gameSeq;
    }

    public set gameSeq(seq: string) {
        this.gameData.gameSeq = seq;
    }

    public get tsBmd(): number {
        return this.playerData.tsBmd;
    }

    public set tsBmd(tsBmd: number) {
        this.playerData.tsBmd = tsBmd;
    }

    public get gameType(): string {
        return this.gameData.gameType;
    }

    public set gameType(gameType: string) {
        this.gameData.gameType = gameType;
    }

    public get machineType(): string {
        return this.gameData.machineType;
    }

    public set machineType(machineType: string) {
        this.gameData.machineType = machineType;
    }

    public get gameVer(): string {
        return this.gameData.gameVer;
    }

    public set gameVer(gameVer: string) {
        this.gameData.gameVer = gameVer;
    }

    public get language(): string {
        return this.gameData.language;
    }

    public set language(language: string) {
        this.gameData.language = String(language).toLowerCase();
    }

    public get dollarCurrency(): string {
        return this.gameData.dollarCurrency;
    }

    public set dollarCurrency(dollarCurrency: string) {
        this.gameData.dollarCurrency = dollarCurrency;
    }

    public get useDollarSign(): boolean {
        return this.gameData.useDollarSign;
    }

    public set useDollarSign(useDollarSign: boolean) {
        this.gameData.useDollarSign = useDollarSign;
    }

    public get dollarSign(): string {
        return this.gameData.dollarSign;
    }

    public set dollarSign(dollarSign: string) {
        this.gameData.dollarSign = dollarSign;
    }

    public get host(): string {
        return this.gameData.host;
    }

    public set host(host: string) {
        this.gameData.host = host;
    }

    public get isDemoGame(): boolean {
        return this.gameData.isDemoGame;
    }

    public set isDemoGame(isDemoGame: boolean) {
        this.gameData.isDemoGame = isDemoGame ? isDemoGame : this.gameData.isDemoGame;
    }

    public get hasGoHome(): boolean {
        return this.gameData.hasGoHome;
    }

    public set hasGoHome(hasGoHome: boolean) {
        this.gameData.hasGoHome = hasGoHome ? hasGoHome : this.gameData.hasGoHome;
    }

    public get hasPlayerReport(): boolean {
        return this.gameData.hasPlayerReport;
    }

    public set hasPlayerReport(hasPlayerReport: boolean) {
        this.gameData.hasPlayerReport = hasPlayerReport ? hasPlayerReport : this.gameData.hasPlayerReport;
    }

    public get isMaintaining(): boolean {
        return this.gameData.isMaintaining;
    }

    public set isMaintaining(isMaintaining: boolean) {
        this.gameData.isMaintaining = isMaintaining;
    }

    public get isReconnecting(): boolean {
        return this.gameData.isReconnecting;
    }

    public set isReconnecting(isReconnecting: boolean) {
        this.gameData.isReconnecting = isReconnecting;
    }

    public get resPath(): string {
        return this.gameData.resPath;
    }

    public set resPath(path: string) {
        this.gameData.resPath = path;
    }

    public get connectedTimeout(): number {
        return this.gameData.connectedTimeout;
    }

    public set connectedTimeout(connectedTimeout: number) {
        this.gameData.connectedTimeout = connectedTimeout ? connectedTimeout : this.gameData.connectedTimeout;
    }

    public get resLoadingTimeout(): number {
        return this.gameData.resLoadingTimeout;
    }

    public set resLoadingTimeout(resLoadingTimeout: number) {
        this.gameData.resLoadingTimeout = resLoadingTimeout ? resLoadingTimeout : this.gameData.resLoadingTimeout;
    }

    public get hasTestMode(): boolean {
        return this.gameData.hasTestMode;
    }

    public set hasTestMode(hasTestMode: boolean) {
        this.gameData.hasTestMode = hasTestMode ? hasTestMode : this.gameData.hasTestMode;
    }

    /** 取得版本資訊資料 */
    public get gameAndUiVer() {
        return this.gameData.gameAndUiVer;
    }
    public set gameAndUiVer(_val) {
        this.gameData.gameAndUiVer = _val;
    }

    /** 取得大廳連結 */
    public get lobbyUrl() {
        return this.gameData.lobbyUrl;
    }
    public set lobbyUrl(_val) {
        this.gameData.lobbyUrl = _val;
    }

    /** 取得SPIN鍵的Provider Logo連結 */
    public get spinLogoUrl() {
        return this.gameData.spinLogoUrl;
    }
    public set spinLogoUrl(_val) {
        this.gameData.spinLogoUrl = _val;
    }

    /** 取得Provider Logo連結 */
    public get providerLogoUrl() {
        return this.gameData.providerLogoUrl;
    }
    public set providerLogoUrl(_val) {
        this.gameData.providerLogoUrl = _val;
    }

    public get sessionId() {
        return this.gameData.sessionId;
    }
    public set sessionId(_val) {
        this.gameData.sessionId = _val;
    }

    public get deployEnv() {
        return this.gameData.deployEnv;
    }
    public set deployEnv(_val) {
        this.gameData.deployEnv = _val;
    }
}
