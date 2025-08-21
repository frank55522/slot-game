import { Logger } from '../../core/utils/Logger';
import { TSMap } from '../../core/utils/TSMap';
import { RowData } from '../vo/RNGSheet';
import { _decorator, Node, EventTouch, EditBox, Label, Button, Sprite, Prefab, instantiate, SystemEvent } from 'cc';
import { ReelTestPasser, ReelTestPasserListener } from '../../sgv3/view/reel/ReelTestPasser';
import { ReelPasser } from '../../sgv3/vo/match/ReelMatchInfo';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

/**
 * TODO: comment:
 * - 若方法內頻繁使用this，使用const self來取代之
 * - callback方法，使用listener實作，方便一次實作callback功能（個人習慣）
 *
 * @author Vince vinceyang
 */
@ccclass('SlotView')
export class SlotView extends BaseView implements ReelTestPasserListener {
    public static readonly DEF_Y: number = 50;

    public static readonly BTN_DEF_X: number = 400;
    public static readonly BTN_DEF_Y: number = 50;

    private rngList: TSMap<string, string>;
    private eventList: TSMap<string, string>;
    private sheetBtnList: Array<Node>;

    private listener: SlotViewListener;
    private reelTestPasser: ReelTestPasser;

    private REFRESH_BTN_NAME = 'RefreshSheet';

    @property({ type: Node })
    public allBtnGP: Node;

    @property({ type: EditBox })
    public inputTxt: EditBox;

    @property({ type: Prefab })
    public buttonPrefab: Prefab;

    protected onLoad() {
        super.onLoad();

        const self = this;
        self.initScroll();
        self.hide(true);
    }

    public initView(l: SlotViewListener) {
        const self = this;

        self.listener = l;
        self.rngList = new TSMap<string, string>();
        self.eventList = new TSMap<string, string>();
        self.sheetBtnList = new Array<Node>();
        self.reelTestPasser = self.node.getComponentInChildren(ReelTestPasser);
        self.reelTestPasser.onInit(this);
    }

    protected initScroll() {
        const self = this;

        self.createButton(['Close', self.listener.onClickClose, self.listener], true);
        self.createButton(['SetRNG', self.listener.onClickSetRNG, self.listener], true);
        self.createButton(['SetMathRNG', self.listener.onClickSetMathRNG, self.listener], true);
        self.createButton([self.REFRESH_BTN_NAME, self.listener.onClickRefreshSheet, self.listener], true);
        self.createButton(['StaticData', self.listener.onClickStaticData, self.listener], true);
    }

    /** 清除內容 */
    protected clearTxtContent(): void {
        this.inputTxt.string = '';
    }

    public addRngCase(rowDataList: RowData[]): void {
        const self = this;

        const len = rowDataList?.length;
        for (let i = 1; i < len; i++) {
            const rowData = rowDataList[i];
            if (!rowData.values) continue;
            if (!rowData.values[0].formattedValue) return Logger.i('your sheet not set RNG_KEY item');
            if (!rowData.values[1].formattedValue) continue;

            const key = rowData.values[0].formattedValue;
            const rng = rowData.values[1].formattedValue;

            self.rngList.set(key, rng);

            const btnData: CreateButtonData = new CreateButtonData();
            btnData.text = key;
            btnData.caller = self;
            btnData.backgroundColor = '#32cd32';
            btnData.onClickCallback = () => self.onClickRNGCase(key);
            self.sheetBtnList.push(self.createButton(btnData));
        }
    }

    public addEventCase(rowDataList: RowData[]): void {
        const self = this;

        const len = rowDataList?.length;
        for (let i = 0; i < len; i++) {
            const rowData = rowDataList[i];

            if (!rowData.values[2].formattedValue) return Logger.i('your sheet not set EVENT_KEY item');
            if (!rowData.values[3].formattedValue) continue;

            const key = rowData.values[2].formattedValue;
            const value = rowData.values[3].formattedValue;
            self.eventList.set(key, value);

            const btnData: CreateButtonData = new CreateButtonData();
            btnData.text = key;
            btnData.caller = self;
            btnData.backgroundColor = '#00bfff';
            btnData.onClickCallback = () => self.onClickEventCase(key);
            self.sheetBtnList.push(self.createButton(btnData));
        }
    }

    public addExtraCase(btnNameList: Array<string>): void {
        const self = this;

        const len = btnNameList.length;
        for (let i = 0; i < len; i++) {
            const btnName = btnNameList[i];

            const btnData: CreateButtonData = new CreateButtonData();
            btnData.text = btnName;
            btnData.caller = self.listener;
            btnData.onClickCallback = self.listener.onClickExtraCase;
            btnData.btnLayer = 3;
            self.createButton(btnData);
        }
    }

    private getRefreshSheetBtn(): Button {
        return this.allBtnGP.getChildByName(this.REFRESH_BTN_NAME).getComponent(Button);
    }

    public openRefreshSheetBtn() {
        const self = this;
        let btn = self.getRefreshSheetBtn();
        btn.interactable = true;
    }

    public applyReelPasser(sceneName: string, reelPasser: ReelPasser) {
        const self = this;
        self.listener.onApplyReelPasser(sceneName, reelPasser);
    }
    protected onClickEventCase(key: string): void {
        const self = this;

        const event = this.eventList.get(key);
        self.listener.onClickEventCase(event);
    }

    public onClickRNGCase(key: string): void {
        const self = this;

        const rng = self.rngList.get(key);
        self.listener.onClickRNGCase(rng);
    }

    protected createButton(btnData: any, changeNodeName: boolean = false): Node {
        //多載功能
        let data: CreateButtonData = new CreateButtonData();
        if (Array.isArray(btnData)) {
            data.text = btnData[0];
            data.onClickCallback = btnData[1];
            data.caller = btnData[2];
        } else {
            data = btnData as CreateButtonData;
        }

        const self = this;
        const newButtonNode: Node = instantiate(this.buttonPrefab);
        const sprite: Sprite = newButtonNode.getComponent(Sprite);
        const label: Label = newButtonNode.getComponentInChildren(Label);

        if (changeNodeName == true) newButtonNode.name = data.text;
        sprite.color.fromHEX(data.backgroundColor || '#ffc900');
        label.string = data.text;
        label.color.fromHEX(data.textColor || '#000000');
        data.btnLayer = data.btnLayer || self.allBtnGP.children.length - 1;

        newButtonNode.setParent(self.allBtnGP);
        newButtonNode.on(SystemEvent.EventType.TOUCH_END, data.onClickCallback, data.caller);

        return newButtonNode;
    }

    public removeAllSheetCase(): void {
        if (this.sheetBtnList.length < 1) return;

        let len = this.sheetBtnList.length;
        for (let i = 0; i < len; ++i) {
            this.allBtnGP.removeChild(this.sheetBtnList[i]);
            this.sheetBtnList[i].destroy();
        }
        this.sheetBtnList = [];
        this.rngList.clear();
        this.eventList.clear();
    }

    public hide(enable: boolean): void {
        this.node.active = !enable;
        if (this.node.active) this.refreshAllButton();
    }

    // 重新塞按鈕到 Scroll view，避免轉場景後，Scroll view 的 Mask 失效
    public refreshAllButton() {
        let tempArray = new Array<Node>();
        for (let btn of this.allBtnGP.children) {
            tempArray.push(btn);
        }
        this.allBtnGP.removeAllChildren();

        for (let btn of tempArray) {
            this.allBtnGP.addChild(btn);
        }
    }

    public getInputText(): string {
        return this.inputTxt.string;
    }
}

export interface SlotViewListener {
    onClickClose(): void;
    onClickRNGCase(rng: string): void;
    onClickEventCase(eventType: string): void;
    onClickSetRNG(): void;
    onClickSetMathRNG(): void;
    onClickRefreshSheet(e: EventTouch): void;
    onClickExtraCase(e: EventTouch): void;
    onApplyReelPasser(sceneName: string, reelPasser: ReelPasser): void;
    onClickStaticData(e: EventTouch): void;
}

export class CreateButtonData {
    text: string;
    onClickCallback: Function;
    caller: any;
    btnContainer?: Node;
    textColor?: string;
    backgroundColor?: string;
    btnLayer?: number;
}
