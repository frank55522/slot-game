import * as brand from './BrandData';

import { _decorator, Sprite, SpriteFrame, assetManager, Component } from 'cc';
const { ccclass, property, executeInEditMode, requireComponent, menu } = _decorator;

@ccclass('LocalizedBrandSprite')
@executeInEditMode
@requireComponent(Sprite)
@menu('brand/LocalizedBrandSprite')
export class LocalizedBrandSprite extends Component {
    @property({
        readonly: true,
        visible: true
    })
    private spriteUrl: string = '';
    private retryInterval: number = 500;

    private _sprite: Sprite = null;
    private get sprite() {
        if (!this._sprite) {
            this._sprite = this.getComponent(Sprite) ?? this.addComponent(Sprite);
        }
        return this._sprite;
    }

    public onLoad() {
        // @ts-ignore
        if (!CC_EDITOR) {
            if (!brand.ready) {
                // brand.init('en');
                return;
            }
            this.updateSprite();
        }
    }

    public onEnable() {
        // @ts-ignore
        if (CC_EDITOR) {
            this.addListener();
            if (this.sprite.spriteFrame) {
                this.cachePath(this.sprite);
            }
        }
    }

    async updateSprite() {
        // @ts-ignore
        if (CC_EDITOR) {
            this.removeListener();
            brand._brand;
            let uuid = await Editor.Message.request('asset-db', 'query-uuid', eval('`' + this.spriteUrl + '`'));
            await Editor.Message.request('scene', 'set-property', {
                uuid: this.node.uuid,
                path: `__comps__.1.spriteFrame`,
                dump: {
                    type: 'cc.SpriteFrame',
                    value: {
                        uuid: uuid
                    }
                }
            });
            this.addListener();
        } else {
            this.downloadBundle()
                .then((bundle) => this.loadSprite(bundle))
                .catch((err) => {
                    // 一段時間後retry
                    setTimeout(() => {
                        this.updateSprite();
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

    loadSprite(bundle) {
        return new Promise<void>((resolve, reject) => {
            // db://assets/art/brand/${brand._brand}/xxx/yyy.png@zzzzz
            // 1. 將多國語系前面刪除 xxx/yyy.png@zzzzz
            // 2. 將.png後移除 xxx/yyy
            // 3. 補上spriteFrame檔 xxx/yyy/spriteFrame
            let path = this.spriteUrl.split('${brand._brand}/')[1].split('.png')[0] + '/spriteFrame';
            bundle.load(path, SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    return reject(err);
                }
                this.sprite.spriteFrame = spriteFrame;
                resolve();
            });
        });
    }

    private async cachePath(comp: Sprite) {
        if (!comp || !comp.spriteFrame) return;
        this.spriteUrl = await Editor.Message.request('asset-db', 'query-url', comp.spriteFrame._uuid);
        this.processPath();
    }

    private processPath() {
        //db://assets/resources/brand/en/xxxxxx
        // console.log(this.spriteUrl);
        // const regex = 'brand/[a-z]+/\\w+';
        // this.spriteUrl = this.spriteUrl.slice(this.spriteUrl.search(regex));
        const splitArray = this.spriteUrl.split('/');
        this.spriteUrl = this.spriteUrl.replace(splitArray[splitArray.indexOf('brand') + 1], '${brand._brand}'); //.split('@')[0];
    }

    public onDisable() {
        // @ts-ignore
        if (CC_EDITOR) {
            this.removeListener();
        }
    }

    private addListener() {
        this.node.on(Sprite.EventType.SPRITE_FRAME_CHANGED, (comp: Sprite) => this.cachePath(comp), this);
    }

    private removeListener() {
        this.node.off(Sprite.EventType.SPRITE_FRAME_CHANGED, (comp: Sprite) => this.cachePath(comp));
    }

    clearRef() {
        this.sprite.spriteFrame = null;
    }
}
