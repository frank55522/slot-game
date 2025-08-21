import {
    _decorator,
    AssetManager,
    assetManager,
    Button,
    EventTouch,
    instantiate,
    JsonAsset,
    Label,
    Node,
    Prefab,
    SystemEvent,
    UIOpacity
} from 'cc';
import BaseView from 'src/base/BaseView';
import { DemoViewMediator } from '../mediator/DemoViewMediator';
import { WheelData } from 'src/sgv3/vo/data/WheelData';
const { ccclass, property } = _decorator;

@ccclass('DemoView')
export class DemoView extends BaseView {
    @property({ type: Button })
    public menuButton: Button;
    @property({ type: Node })
    public menuNode: Node;
    @property({ type: Prefab })
    public featureButtonPrefab: Prefab;
    public menuUIOpacity: UIOpacity;
    private jsonList: Array<JsonAsset> = [];
    public demoCallback: DemoViewMediator;
    public gameId: string;
    public clickBtnName: string = '';

    protected start(): void {
        this.menuButton.node.active = false;
        this.menuUIOpacity = this.menuNode.getComponent(UIOpacity);
        this.downloadBundle()
            .then((bundle: AssetManager.Bundle) => this.parseJson(bundle))
            .catch((err) => console.error(err));
    }

    private downloadBundle() {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle('demo', (err, bundle) => {
                if (err) {
                    return reject(err);
                }
                resolve(bundle);
            });
        });
    }

    private parseJson(bundle: AssetManager.Bundle) {
        let promiseList = [];
        let assetInfos = bundle.config.assetInfos;
        assetInfos.forEach((val, key) => {
            if (val['path'].includes(this.gameId)) promiseList.push(this.loadJson(val, bundle));
        });
        Promise.all(promiseList)
            .then((msg) => (this.jsonList = msg))
            .finally(() => {
                this.registerMenuButton();
                this.createFeatureButton();
                this.menuButton.node.active = true;
            });
    }

    private loadJson(val, bundle: AssetManager.Bundle) {
        return new Promise((resolve, reject) => {
            bundle.load<JsonAsset>(val['path'], (err, rawData) => {
                if (err) {
                    return reject(err);
                }
                resolve(rawData);
            });
        });
    }

    private registerMenuButton() {
        this.menuButton.node.on(SystemEvent.EventType.TOUCH_END, this.onClickMenuButton, this);
    }

    private createFeatureButton() {
        for (let config of this.jsonList) {
            if (config.name == 'Init') {
                let obj = JSON.parse(JSON.stringify(config));
                let groupingWheelDataMap: Map<string, WheelData> = new Map<string, WheelData>();
                let wheelDataMap: Map<string, WheelData> = new Map<string, WheelData>();
                for (let i in obj.json) {
                    if (obj.json[i].groupingWheelData) {
                        groupingWheelDataMap.set(i, obj.json[i].groupingWheelData.concat());
                        this.demoCallback.setGroupingWheelData(groupingWheelDataMap);
                    } else {
                        wheelDataMap.set(i, obj.json[i].wheelData.concat());
                        this.demoCallback.setWheelData(wheelDataMap);
                    }
                }
            } else if (!config.name.includes('select')) {
                let button = instantiate(this.featureButtonPrefab);
                button.name = config.name;
                button.getComponentInChildren(Label).string = button.name;
                button.on(SystemEvent.EventType.TOUCH_END, this.onClickFeature, this);
                this.menuNode.addChild(button);
            }
        }
    }

    private loadTaskJson(jsonName: string): void {
        let jsonObj = this.jsonList.find((Jsonobj) => jsonName === Jsonobj.name);
        if (!jsonObj) return;
        this.demoCallback.onClickFeature(jsonObj.json);
    }

    private onClickFeature(event: EventTouch): void {
        if (this.menuButton.interactable) {
            let btnName = (event.currentTarget as Node).name;
            this.clickBtnName = btnName;
            this.loadTaskJson(btnName);
            this.menuNode.active = false;
        }
    }

    private onClickMenuButton() {
        if (this.menuButton.interactable) {
            this.menuNode.active = !this.menuNode.active;
        }
    }

    public setButtonState(state: boolean) {
        this.menuButton.interactable = state;
        this.menuUIOpacity.opacity = state ? 225 : 80;
        this.menuNode.active = false;
    }

    public featureSelect(selectOperation: string): void {
        let jsonObj = this.jsonList.find(
            (json) => json.name.includes(this.clickBtnName) && json.name.includes(selectOperation)
        );
        if (!jsonObj) return;
        this.demoCallback.selectFeature(jsonObj.json);
    }
}
