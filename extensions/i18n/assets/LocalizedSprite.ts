import * as i18n from './LanguageData';

import { _decorator, Sprite, SpriteFrame, assetManager, Component } from 'cc';
import { BaseLocalized } from './BaseLocalized';
const { ccclass, property, executeInEditMode, requireComponent, menu } = _decorator;

@ccclass('LocalizedSprite')
@executeInEditMode
@requireComponent(Sprite)
@menu('i18n/LocalizedSprite')
export class LocalizedSprite extends BaseLocalized {
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
            if (!i18n.ready) {
                // i18n.init('en');
                return;
            }
            this.localize();
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

    async localize() {
        // @ts-ignore
        if (CC_EDITOR) {
            this.removeListener();
            let url = eval('`' + this.spriteUrl + '`');
            let uuid = await Editor.Message.request('asset-db', 'query-uuid', url);
            if(!uuid) {
                const defaultPath = this.spriteUrl.replace('${i18n._language}', i18n._default);
                uuid = await Editor.Message.request('asset-db', 'query-uuid', defaultPath);
                console.warn(`${this.node.name} use default language ${i18n._default} instead of ${i18n._language}`);
            }
            await Editor.Message.request('scene', 'set-property', {
                uuid: this.node.uuid,
                path: `__comps__.${this.getComponents(Component).findIndex((val) => val == this.sprite)}.spriteFrame`,
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
                        this.localize();
                    }, this.retryInterval);
                });
        }
    }

    downloadBundle() {
        return new Promise((resolve, reject) => {
            if (assetManager.bundles.has(i18n._language)) {
                return resolve(assetManager.bundles.get(i18n._language));
            }
            assetManager.loadBundle(i18n._language, (err, bundle) => {
                if (err) {
                    return reject(err);
                }
                resolve(bundle);
            });
        });
    }

    loadSprite(bundle) {
        return new Promise<void>((resolve, reject) => {
            // db://assets/art/language/${i18n._language}/xxx/yyy.png@zzzzz
            // 1. 將多國語系前面刪除 xxx/yyy.png@zzzzz
            // 2. 將.png後移除 xxx/yyy
            // 3. 補上spriteFrame檔 xxx/yyy/spriteFrame
            let path = this.spriteUrl.split('${i18n._language}/')[1].replace(/\.\w+@\w+/, '') + '/spriteFrame';
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
        // 調整路徑處理方式，不在綁定在language下，但各語系仍需要在同個資料夾下且都打包bundle，且不支援複數bundle
        let done = false;
        JSON.stringify(window.languages, (key, value) => {
            if (done) {
                return undefined;
            } else {
                if (key != '' && window.languages[key]) {
                    const reg = new RegExp(`\/${key}\/`);
                    if (this.spriteUrl.match(reg)) {
                        this.spriteUrl = this.spriteUrl.replace(reg, '/${i18n._language}/');
                        done = true;
                    }
                }
                return value;
            }
        });
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
