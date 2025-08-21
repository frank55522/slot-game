import { Button, Component, EventKeyboard, EventTouch, KeyCode, Label, Node, _decorator } from 'cc';
import { NetworkProxy } from '../../core/proxy/NetworkProxy';
import { Logger } from '../../core/utils/Logger';
import { TSMap } from '../../core/utils/TSMap';
import { RNGSheetProxy } from '../proxy/RNGSheetProxy';
import { RNGSheet } from '../vo/RNGSheet';
import { SlotViewListener, SlotView } from '../view/SlotView';
import BaseMediator from '../../base/BaseMediator';
import { WormHoleViewMediator } from './WormHoleViewMediator';
import { GameDataProxy } from '../../sgv3/proxy/GameDataProxy';
import { ReelPasser } from '../../sgv3/vo/match/ReelMatchInfo';
import { ReelEvent } from '../../sgv3/util/Constant';
import { KeyboardProxy } from 'src/core/proxy/KeyboardProxy';
const { ccclass } = _decorator;

/**
 * Slot測試面版
 */
@ccclass('SlotViewMediator')
export class SlotViewMediator extends BaseMediator<SlotView> implements SlotViewListener {
    public static readonly EV_ON_SPIN_DOWN: string = 'onSpinDown';

    public static readonly PWD: string = 'mock!QAZ';

    public static readonly RNG_TYPE_RNG: string = 'rng';
    public static readonly RNG_TYPE_MATH: string = 'math';

    public static readonly EV_ADD_EXTRA_CASE = 'onAddExtraCase';

    public static readonly EV_ORIENTATION_HORIZONTAL: string = 'EV_ORIENTATION_HORIZONTAL';
    public static readonly EV_ORIENTATION_VERTICAL: string = 'EV_ORIENTATION_VERTICAL';

    private slotView: SlotView;

    private extraCaseMap: TSMap<string, string>;

    private hasRNGSheet: boolean;

    public constructor(name?: string, component?: any) {
        super(name, component);

        const self = this;

        self.extraCaseMap = new TSMap<string, string>();
        SlotViewMediator.NAME = self.mediatorName;
    }

    public onRegister(): void {
        Logger.i('SlotViewMediator initial done');
    }

    protected lazyEventListener(): void {
        this.slotView = this.viewComponent;
        this.slotView.initView(this);
    }

    public listNotificationInterests(): Array<any> {
        return [
            RNGSheetProxy.EV_DATA,
            WormHoleViewMediator.EV_DOUBlE_CLICK,
            SlotViewMediator.EV_ADD_EXTRA_CASE,
            SlotViewMediator.EV_ORIENTATION_HORIZONTAL,
            SlotViewMediator.EV_ORIENTATION_VERTICAL
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        const self = this;

        switch (notification.getName()) {
            case RNGSheetProxy.EV_DATA:
                self.hasRNGSheet = true;
                self.onReceiveRNGSheetData(notification.getBody());
                break;
            case WormHoleViewMediator.EV_DOUBlE_CLICK:
                self.slotView.hide(false);
                self.connectRNGSheet(self.gameDataProxy.machineType);
                break;
            case SlotViewMediator.EV_ADD_EXTRA_CASE:
                self.onAddExtraCase(notification.getBody());
                break;
            case SlotViewMediator.EV_ORIENTATION_HORIZONTAL:
                self.onHorizontalOrientation();
                break;
            case SlotViewMediator.EV_ORIENTATION_VERTICAL:
                self.onVerticalOrientation();
                break;
        }
    }

    private onAddExtraCase(obj: any): void {
        const self = this;

        const keyList = new Array<string>();
        for (let key in obj) {
            self.extraCaseMap.set(key, obj[key]);
            keyList.push(key);
        }

        self.slotView.addExtraCase(keyList);
    }

    private onReceiveRNGSheetData(data: RNGSheet): void {
        const self = this;
        self.slotView.addRngCase(data.sheets[0].data[0].rowData);
        self.slotView.addEventCase(data.sheets[0].data[0].rowData);
        self.slotView.openRefreshSheetBtn();
    }

    private setRNG(pwd: string, type: string, rng: string): void {
        const self = this;

        if (!pwd || pwd != SlotViewMediator.PWD) {
            window.close();
            return;
        }

        self.slotView.hide(true);
        let rngArrayNumber: Array<number> = null;
        if (type === SlotViewMediator.RNG_TYPE_MATH) {
            Logger.i('[DebugViewMediator] 設定 Math RNG : ' + rng);
            let RNG = rng.split(',');
            if (RNG[RNG.length - 1] == '' || RNG[RNG.length - 1] == ' ') {
                RNG.pop();
            }
            rngArrayNumber = this.aryString2Number(RNG);
        } else if (type === SlotViewMediator.RNG_TYPE_RNG) {
            Logger.i('[DebugViewMediator] 設定 RNG : ' + rng);
            let RNG = rng.split(',');
            rngArrayNumber = this.script(RNG);
        } else {
            Logger.w('Failed RNG type: ' + type);
        }

        self.slotView.hide(true);

        const netProxy = self.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        if (netProxy && netProxy.isConnected()) {
            netProxy.sendRngRequest(rngArrayNumber);
        } else {
            Logger.w('Can not find the SmartFox service when sending RNG');
        }
    }

    public aryString2Number(_rng: Array<string>): Array<number> {
        let tempAry: Array<number> = [];
        while (_rng.length != 0) {
            tempAry.push(Number(_rng.shift()));
        }
        return tempAry;
    }

    public script(_rng: Array<string>): Array<number> {
        const _forMathData: Array<number> = new Array<number>();
        let _tempScript: string = '';
        let _tempStrAry: Array<String> = new Array<string>();

        let _key: string = '';
        for (_key in _rng) {
            _tempScript = this.reverseStr(_rng[_key]) + ' ' + _tempScript;
        }
        _tempStrAry = _tempScript.split(' ');
        _tempStrAry.length = _tempStrAry.length - 1;
        for (_key in _tempStrAry) {
            _forMathData.push(Number(_tempStrAry[_key]));
        }

        return _forMathData;
    }

    public reverseStr(_tmpStr: string): string {
        const _aryStr: Array<string> = _tmpStr.split(' ');
        let _returnStr: string = '';
        let _index;
        for (_index in _aryStr) {
            _returnStr = _aryStr[_index] + ' ' + _returnStr;
        }
        return _returnStr + '0 0';
    }

    protected close(): void {
        const self = this;

        self.slotView.hide(true);

        const whMediator = self.facade.retrieveMediator(WormHoleViewMediator.NAME) as WormHoleViewMediator;
        whMediator.reset();
    }

    public onClickClose(): void {
        const self = this;

        self.close();
    }

    public onClickRNGCase(rng: string): void {
        const self = this;
        /**
        		 * paserRng
        		 * ex:
                   一般Rng:
                     <case1>5 5 5 5 5,0 0 0
                     <case2>5 5 5 5 5
                   mathRng:
                     <case1>15966, 12186, 4175, 3295, 11993, 26630, 11055
                     <case2>6,6,6,0,0
        		 */
        let parserRng = rng;
        parserRng = parserRng.replace(new RegExp(', ', 'g'), '');
        const rngType = parserRng.search(' ') > -1 ? SlotViewMediator.RNG_TYPE_RNG : SlotViewMediator.RNG_TYPE_MATH;

        self.setRNG(SlotViewMediator.PWD, rngType, rng);
        self.sendNotification(SlotViewMediator.EV_ON_SPIN_DOWN);

        self.close();
    }

    public onClickEventCase(eventType): void {
        const self = this;

        self.sendNotification(eventType, self.slotView.getInputText());
        Logger.i(
            '[INFO] send custom event. 回傳的event: ' + eventType + ' 回傳的body: ' + self.slotView.getInputText()
        );

        self.close();
    }

    public onClickSetRNG(): void {
        const self = this;

        self.setRNG(SlotViewMediator.PWD, SlotViewMediator.RNG_TYPE_RNG, self.slotView.getInputText());
        self.close();
    }

    public onClickSetMathRNG(): void {
        const self = this;

        self.setRNG(SlotViewMediator.PWD, SlotViewMediator.RNG_TYPE_MATH, self.slotView.getInputText());
        self.close();
    }

    public onClickRefreshSheet(e: EventTouch): void {
        const self = this;

        let btn = e.target as Button;
        btn.interactable = false;

        self.slotView.removeAllSheetCase();
        const rngProxy = self.facade.retrieveProxy(RNGSheetProxy.NAME) as RNGSheetProxy;
        rngProxy.reconnect();
    }

    public onClickExtraCase(e: EventTouch): void {
        const self = this;
        const key = (e.target as Node).getComponentInChildren(Label).string;
        const evt = self.extraCaseMap.get(key);
        self.close();
        self.sendNotification(evt, self.slotView.getInputText());
    }
    public onApplyReelPasser(sceneName: string, reelPasser: ReelPasser): void {
        const self = this;
        self.sendNotification(ReelEvent.ON_REELS_RESET, { sceneName: sceneName, reelPasser: reelPasser });
    }

    public onClickStaticData(e: EventTouch): void {
        this.sendNotification(KeyboardProxy.EV_KEY_DOWN, new EventKeyboard(KeyCode.KEY_X, true));
    }

    protected onHorizontalOrientation() {
        const self = this;

        const adjustX = -700;
        const adjustY = 350;
        const adjustZ = 0;

        self.sendNotification(WormHoleViewMediator.EV_CHANG_COORDINATE, [adjustX, adjustY, adjustZ]);
    }

    protected onVerticalOrientation() {
        const self = this;

        const adjustX = 0;
        const adjustY = 260;
        const adjustZ = 0;

        self.sendNotification(WormHoleViewMediator.EV_CHANG_COORDINATE, [adjustX, adjustY, adjustZ]);
    }

    private targetView() {
        return (
            this.facade.retrieveMediator(WormHoleViewMediator.NAME) as WormHoleViewMediator
        ).getViewComponent() as Component;
    }

    // 取得 RNG Sheet
    protected connectRNGSheet(machineType: string) {
        const self = this;
        if (self.hasRNGSheet == true) return;
        const rngProxy = self.facade.retrieveProxy(RNGSheetProxy.NAME) as RNGSheetProxy;
        rngProxy?.connect(machineType);
    }

    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
