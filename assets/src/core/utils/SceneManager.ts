import { _decorator, Component, game, view, ResolutionPolicy, Prefab, instantiate, Director } from 'cc';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';
import { Logger } from './Logger';

export let DEF_STAGE_WIDTH = undefined;
export let DEF_STAGE_HEIGHT = undefined;
// 直式背景出血最大解析度
export let DEF_MAX_HEIGHT = 2000;

const { ccclass, property } = _decorator;

export enum Orientation {
    HORIZONTAL = 'EV_ORIENTATION_HORIZONTAL',
    VERTICAL = 'EV_ORIENTATION_VERTICAL'
}

export enum ContainerJPButtonVertical {
    ICON = 50,
    HISTORY = 113
}
export enum ContainerJPButtonHorizontal {
    ICON = 50,
    HISTORY = 113
}

@ccclass('SceneManager')
export class SceneManager extends Component {
    public static EV_ORIENTATION_VERTICAL: string = 'EV_ORIENTATION_VERTICAL';
    public static EV_ORIENTATION_HORIZONTAL: string = 'EV_ORIENTATION_HORIZONTAL';
    private screenHeight: number;
    private screenWidth: number;
    private screenAngle: number;
    private isOrientationSuccess: boolean;
    private policy: ResolutionPolicy;
    private facadeModule: any;

    private static _orientation: Orientation = Orientation.VERTICAL;
    public static get Orientation() {
        return this._orientation;
    }

    private static set Orientation(orientation: Orientation) {
        this._orientation = orientation;
    }

    @property({ type: Prefab })
    public prefabMockTool: Prefab;

    public static instance: SceneManager = null;

    protected onLoad() {
        if (SceneManager.instance === null) {
            SceneManager.instance = this;
            game.addPersistRootNode(this.node);
        } else {
            this.destroy();
            return;
        }
        // 解析度自適應設定
        this.initializeResolutionPolicy();
        this.importFacadeModule().then(() => {
            this.onChangeScreen();
            /** Release 不能包含 mock */
            instantiate(this.prefabMockTool).setParent(this.node);
        });
    }

    private async importFacadeModule() {
        const self = this;
        self.facadeModule = await import('../AppFacade');
    }

    private initializeResolutionPolicy() {
        this.policy = new ResolutionPolicy(
            ResolutionPolicy.ContainerStrategy.PROPORTION_TO_FRAME,
            ResolutionPolicy.ContentStrategy.SHOW_ALL
        );
        this.screenHeight = 0;
        this.screenWidth = 0;
        this.screenAngle = 0;
        this.isOrientationSuccess = true;
        /** listen orientation event */
        window.onresize = () => this.onChangeScreen();

        DEF_STAGE_WIDTH = view.getDesignResolutionSize().width;
        DEF_STAGE_HEIGHT = view.getDesignResolutionSize().height;
    }
    /**
     * 判斷是否該轉向
     *
     * @param evt 畫面轉動時的事件
     */
    private onChangeScreen(evt: UIEvent = undefined): void {
        let isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i) != null;
        let isLandscape = window.innerWidth > window.innerHeight;
        const self = this;
        if (self.node) {
            let screenHeight = window.innerHeight;
            let screenWidth = window.innerWidth;
            if (isLandscape) {
                if (isMobile) {
                    screenWidth = window.innerHeight;
                    screenHeight = window.innerWidth;
                }
            }
            if (screenHeight != self.screenHeight || screenWidth != self.screenWidth || !self.isOrientationSuccess) {
                self.screenHeight = screenHeight;
                self.screenWidth = screenWidth;
                // 固定直式縮放比例
                this.onVerticalResize(evt);
            }
        } else {
            Logger.w('WebPlayer is not exist');
        }
    }

    /**
     * 設置直式比例的解析度 (專案預設需為直式)
     * 直式比例一般為 9:16
     * 為了背景出血，最多顯示 9:20
     * @param evt 畫面轉動時的事件
     */
    private onVerticalResize(evt: UIEvent = undefined): void {
        let ratio = this.screenHeight / this.screenWidth;
        let frameHeight = 0;
        let frameLongSide = DEF_STAGE_WIDTH > DEF_STAGE_HEIGHT ? DEF_STAGE_WIDTH : DEF_STAGE_HEIGHT;
        let frameShortSide = DEF_STAGE_WIDTH > DEF_STAGE_HEIGHT ? DEF_STAGE_HEIGHT : DEF_STAGE_WIDTH;
        if (ratio < 1.77) {
            frameHeight = frameLongSide;
        } else if (ratio < 2.22) {
            frameHeight = Math.round(ratio * frameShortSide);
        } else {
            frameHeight = DEF_MAX_HEIGHT;
        }

        if (screen.orientation != undefined) {
            if (this.screenAngle != screen.orientation.angle) {
                this.screenAngle = screen.orientation.angle;
                this.callContainerResize(this.screenAngle);
            }
        }

        view.setDesignResolutionSize(frameShortSide, frameHeight, this.policy);
        /**
         * 調整 Design Resolution Size 後，需要重新觸發 orientationchange
         * 使 Cocos3dGameContainer 尺寸重新計算
         * 避免自適應的畫面尺寸錯誤
         */
        window.dispatchEvent(new Event('orientationchange'));
    }

    private callContainerResize(screenAngle: number) {
        let jpHallPosY;
        let jpHistoryPosY;
        if (screenAngle == 90 || screenAngle == -90) {
            jpHallPosY = ContainerJPButtonHorizontal.ICON;
            jpHistoryPosY = ContainerJPButtonHorizontal.HISTORY;
        } else {
            jpHallPosY = ContainerJPButtonVertical.ICON;
            jpHistoryPosY = ContainerJPButtonVertical.HISTORY;
        }

        const webBridgeProxy = this.facadeModule.AppFacade.getInstance().retrieveProxy(
            CoreWebBridgeProxy.NAME
        ) as CoreWebBridgeProxy;
        webBridgeProxy.getWebFunRequest(this, 'gameClientMsg', {
            event: 'customButtonPosition',
            value: {
                jpHall: {
                    y: jpHallPosY,
                    horizontalRotate: screenAngle
                },
                jpHistory: {
                    y: jpHistoryPosY,
                    horizontalRotate: screenAngle
                }
            }
        });
    }
}
// 調整遊戲 Time scale
const getOrCreateTimeScalePolyfill = (() => {
    let polyfill: undefined | { multiplier: number };

    return () => {
        if (!polyfill) {
            const polyfill_ = { multiplier: 1.0 };
            const tick = Director.prototype.tick;
            Director.prototype.tick = function (dt: number, ...args) {
                tick.call(this, dt * polyfill_.multiplier, ...args);
            };
            polyfill = polyfill_;
        }
        return polyfill;
    };
})();

export function setEngineTimeScale(multiplier: number) {
    getOrCreateTimeScalePolyfill().multiplier = multiplier;
}
