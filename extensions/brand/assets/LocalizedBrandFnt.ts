import * as brand from "./BrandData";

import { _decorator, Sprite, SpriteFrame, assetManager, Component, Label, Font } from "cc";
const { ccclass, property, executeInEditMode, requireComponent, menu } = _decorator;

@ccclass("LocalizedBrandFnt")
@executeInEditMode
@requireComponent(Label)
@menu("brand/LocalizedBrandFnt")
export class LocalizedBrandFnt extends Component {
    @property({
        readonly: true,
        visible: true,
    })
    private fntUrl: string = "";
    private retryInterval: number = 500;

    private _label: Label = null;
    private get label() {
        if (!this._label) {
            this._label = this.getComponent(Label) ?? this.addComponent(Label);
        }
        return this._label;
    }

    public onLoad() {
        // @ts-ignore
        if (!CC_EDITOR) {
            if (!brand.ready) {
                // brand.init('en');
                return;
            }
            this.updateFnt();
        }
    }

    public onEnable() {
        // @ts-ignore
        if (CC_EDITOR) {
            this.cachePath(this.label);
        }
    }

    async updateFnt() {
        // @ts-ignore
        if (CC_EDITOR) {
            brand._brand;
            let uuid = await Editor.Message.request("asset-db", "query-uuid", eval("`" + this.fntUrl + "`"));
            await Editor.Message.request("scene", "set-property", {
                uuid: this.node.uuid,
                path: `__comps__.1.fnt`,
                dump: {
                    type: "cc.font",
                    value: {
                        uuid: uuid,
                    },
                },
            });
        } else {
            this.downloadBundle()
                .then((bundle) => this.loadFont(bundle))
                .catch((err) => {
                    // 一段時間後retry
                    setTimeout(() => {
                        this.updateFnt();
                    }, this.retryInterval);
                });
        }
    }

    downloadBundle() {
        return new Promise((resolve, reject) => {
            if (assetManager.bundles.has(brand._brand)) {
                return resolve(assetManager.bundles.get(brand._brand));
            }
            assetManager.loadBundle(brand._brand, (err, bundle) => {
                if (err) {
                    return reject(err);
                }
                resolve(bundle);
            });
        });
    }

    loadFont(bundle) {
        return new Promise<void>((resolve, reject) => {
            let path = this.fntUrl.split("${brand._brand}/")[1].split(".fnt")[0];
            bundle.load(path, Font, (err, font) => {
                if (err) {
                    return reject(err);
                }
                this.label.useSystemFont = false;
                this.label.font = font;
                resolve();
            });
        });
    }

    private async cachePath(comp: Label) {
        if (!comp || !comp.font) return;
        this.fntUrl = await Editor.Message.request("asset-db", "query-url", comp.font._uuid);
        this.processPath();
    }

    private processPath() {
        const splitArray = this.fntUrl.split("/");
        this.fntUrl = this.fntUrl.replace(splitArray[splitArray.indexOf("brand") + 1], "${brand._brand}"); //.split('@')[0];
    }

    clearRef() {
        this.label.font = null;
    }
}
