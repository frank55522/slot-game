import { DEBUG } from 'cc/env';
import { BalanceUtil } from '../../sgv3/util/BalanceUtil';
import { SceneEvent } from '../../sgv3/util/Constant';
import { CoreGameDataProxy } from '../proxy/CoreGameDataProxy';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';
import { Logger } from '../utils/Logger';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
import * as brand from '../../../../extensions/brand/assets/BrandData';
import { ServiceProvider } from '../vo/NetworkType';
import { WebBridgeProxy } from '../../sgv3/proxy/WebBridgeProxy';
import { AudioManager } from 'src/audio/AudioManager';
import { BGMClipsEnum } from 'src/game/vo/enum/SoundMap';

export class SetupGameConfigCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'SetupGameConfigCommand';

    private servInfo: any;
    private userInfo: any;
    private gameData: any;
    private gameVer: any;
    private uiVersion: any;

    public execute(notification: puremvc.INotification): void {
        const self = this;
        if (DEBUG) {
            self.servInfo = self.getServInfo();
            self.userInfo = self.getUserInfo();
            self.gameData = self.getGameData();
            self.gameVer = self.getGameVer();
            self.uiVersion = self.getUIVersion();
            self.setupServInfo(self.servInfo);
            self.setupUserInfo(self.userInfo);
            self.setupGameData(self.gameData);
            self.setupGameVer(self.gameVer);
            self.setupUIVersion(self.uiVersion);
        } else {
            self.getServInfoRequest();
            self.getUserInfoRequest();
            self.getGameDataRequest();
            self.getGameVerRequest();
            self.getUIVersionRequest();
            self.getLogoUrlRequest();
            self.getProviderUrlRequest();
            self.getSpinLogoUrlRequest();
            self.getDeployEnvRequest();
            self.getClickToPlayRequest();
        }
    }

    public handleContainerMsg(e: MessageEvent) {
        const self = this;
        let data = JSON.parse(e.data).data;
        switch (JSON.parse(e.data).name) {
            case 'servInfo':
                self.servInfo = data;
                self.setupServInfo(self.servInfo);
                break;
            case 'userInfo':
                self.userInfo = data;
                self.setupUserInfo(self.userInfo);
                break;
            case 'gameData':
                self.gameData = data;
                self.setupGameData(self.gameData);
                break;
            case 'gameVer':
                self.gameVer = data;
                self.setupGameVer(self.gameVer);
                break;
            case 'getUIVersion':
                self.uiVersion = data;
                self.setupUIVersion(self.uiVersion);
                break;
            case 'getLogoUrl':
                let logoUrl = data;
                self.setupLogoUrl(logoUrl);
                break;
            case 'getProviderUrl':
                let providerUrl = data;
                self.setupProviderUrl(providerUrl);
                break;
            case 'getSpinLogoUrl':
                let spinLogoUrl = data;
                self.setupSpinLogoUrl(spinLogoUrl);
                break;
            case 'getDeployEnv':
                self.setupDeployEnv(data);
                break;
            case 'getClickToPlay':
                self.onClickToPlay(true);
                break;
        }
    }

    protected setupLogoUrl(url: any) {
        if (window['serviceProvider'] === ServiceProvider.OTHERS || url === undefined || url === null) {
            return;
        }
        this.sendNotification(SceneEvent.LOAD_LOGO_URL, url);
        this.gameDataProxy.providerLogoUrl = url;
    }

    protected setupProviderUrl(url: any) {
        if (window['serviceProvider'] === ServiceProvider.OTHERS || url === undefined || url === null) {
            return;
        }
        this.sendNotification(SceneEvent.LOAD_PROVIDER_URL, url);
    }

    protected setupSpinLogoUrl(url: any) {
        if (window['serviceProvider'] === ServiceProvider.OTHERS || url === undefined || url === null) {
            return;
        }
        this.gameDataProxy.spinLogoUrl = url;
    }

    protected setupServInfo(servInfo: any) {
        this.gameDataProxy.host = servInfo['gameHost'];
        Logger.enable = String(servInfo['enableInfoLog']) == 'true' ? true : false;
    }

    protected setupUserInfo(userInfo: any) {
        this.setupSupportedLanguage(userInfo['lang']);
        this.gameDataProxy.useDollarSign = userInfo['useDollarSign'];
        this.gameDataProxy.dollarSign = userInfo['currencySymbol'];
        this.gameDataProxy.dollarCurrency = userInfo['currencySystemName'];
        this.gameDataProxy.sessionId = userInfo['sessionId'];
        //BalanceUtil.dollarSign = gameDataProxy.useDollarSign ? gameDataProxy.dollarSign : '';
        BalanceUtil.dollarSign = this.gameDataProxy.dollarCurrency;
        this.sendNotification(SceneEvent.LOAD_USER_INFO_COMPLETE);
    }

    private setupSupportedLanguage(lang: string) {
        lang = String(lang).toLowerCase().slice(0, 2);
        i18n.initLanguage(lang);
        this.gameDataProxy.language = i18n.getSupportedLanguage(lang);
    }

    protected setupGameData(gameData: any) {
        i18n.init(this.gameData['mType']);
        this.setupBrandCommonUI(gameData['brandId']);
        this.gameDataProxy.isDemoGame = gameData['isDemo'];
        this.gameDataProxy.hasGoHome = gameData['isShowGoHome'];
        this.gameDataProxy.hasPlayerReport = gameData['isShowPlayerReport'];
        this.sendNotification(SceneEvent.LOAD_GAME_DATA_COMPLETE);
    }

    protected setupGameVer(gameVer: any) {
        this.gameDataProxy.gameVer = gameVer;
        this.gameDataProxy.resPath = `${this.gameDataProxy.host}${this.gameDataProxy.gameType}/${this.gameDataProxy.machineType}/${this.gameDataProxy.gameVer}/`;
    }

    protected setupUIVersion(uiVersion: any) {
        this.gameDataProxy.gameAndUiVer = `v${uiVersion.version} / v${uiVersion.gameVersion}`;
        this.gameDataProxy.gameVer = uiVersion.gameVersion;
        this.sendNotification(SceneEvent.LOAD_UI_VERSION_COMPLETE);
    }

    protected setupDeployEnv(env: any) {
        this.gameDataProxy.deployEnv = env;
    }

    protected setupBrandCommonUI(brandId: string) {
        let _brandID: string = Number(brandId) > 0 ? brandId : '1';
        brand.init(_brandID);
    }

    protected onClickToPlay(bool: boolean) {
        this.webBridgeProxy.isClickToPlay = bool;
        AudioManager.Instance.play(BGMClipsEnum.BGM_Base).loop(true).volume(0).fade(1, 1);
    }

    protected getWebBridgeProxy(): CoreWebBridgeProxy {
        return this.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
    }

    protected getGameData(): any {
        return this.getWebBridgeProxy().getWebObj('gameData');
    }

    protected getInitTicket(): any {
        return this.getWebBridgeProxy().getWebObj('initTicket');
    }

    protected getServInfo(): any {
        return this.getWebBridgeProxy().getWebObj('servInfo');
    }

    protected getUserInfo(): any {
        return this.getWebBridgeProxy().getWebObj('userInfo');
    }

    protected getGameVer(): any {
        return this.getWebBridgeProxy().getWebObj('gameVer');
    }

    protected getUIVersion(): any {
        return this.getWebBridgeProxy().getWebFun('getUIVersion');
    }

    protected getGameDataRequest() {
        this.getWebBridgeProxy().getWebObjRequest(this, 'gameData');
    }

    protected getInitTicketRequest() {
        this.getWebBridgeProxy().getWebObjRequest(this, 'initTicket');
    }

    protected getServInfoRequest() {
        this.getWebBridgeProxy().getWebObjRequest(this, 'servInfo');
    }

    protected getUserInfoRequest() {
        this.getWebBridgeProxy().getWebObjRequest(this, 'userInfo');
    }

    protected getGameVerRequest() {
        this.getWebBridgeProxy().getWebObjRequest(this, 'gameVer');
    }

    protected getLogoUrlRequest() {
        this.getWebBridgeProxy().getWebObjRequest(this, 'getLogoUrl');
    }

    protected getProviderUrlRequest() {
        this.webBridgeProxy.getWebObjRequest(this, 'getProviderUrl');
    }

    protected getSpinLogoUrlRequest() {
        this.getWebBridgeProxy().getWebObjRequest(this, 'getSpinLogoUrl');
    }

    protected getClickToPlayRequest() {
        this.webBridgeProxy.getWebObjRequest(this, 'getClickToPlay');
    }

    protected getUIVersionRequest(): any {
        return this.getWebBridgeProxy().getWebFunRequest(this, 'getUIVersion');
    }

    protected getDeployEnvRequest(): any {
        return this.webBridgeProxy.getWebFunRequest(this, 'getDeployEnv');
    }

    protected _gameDataProxy: CoreGameDataProxy;
    public get gameDataProxy(): CoreGameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
        }
        return this._gameDataProxy;
    }

    private _webBridgeProxy: WebBridgeProxy;
    public get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }

        return this._webBridgeProxy;
    }


}
