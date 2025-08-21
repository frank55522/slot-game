import * as i18n from './LanguageData';

import { Component, _decorator, assetManager, sp } from 'cc';
const { ccclass, property, executeInEditMode, menu } = _decorator;

@ccclass('LocalizedSkeleton')
@executeInEditMode
@menu('i18n/LocalizedSkeleton')
export class LocalizedSkeleton extends sp.Skeleton {
    @property({
        readonly: true,
        visible: true
    })
    private url: string = '';

    private changingSkeleton = false;

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
        super.onEnable();
        // @ts-ignore
        if (CC_EDITOR) {
            this.cachePath();
        }
    }

    protected _refreshInspector() {
        super._refreshInspector();
        this.cachePath();
    }

    async localize() {
        // @ts-ignore
        if (CC_EDITOR) {
            this.changingSkeleton = true;
            let url = eval('`' + this.url + '`');
            let uuid = await Editor.Message.request('asset-db', 'query-uuid', url);
            if(!uuid) {
                const defaultPath = this.url.replace('${i18n._language}', i18n._default);
                uuid = await Editor.Message.request('asset-db', 'query-uuid', defaultPath);
                console.warn(`${this.node.name} use default language ${i18n._default} instead of ${i18n._language}`);
            }
            await Editor.Message.request('scene', 'set-property', {
                uuid: this.node.uuid,
                path: `__comps__.${this.getComponents(Component).findIndex((val) => val == this)}.skeletonData`,
                dump: {
                    type: 'sp.SkeletonData',
                    value: {
                        uuid: uuid
                    }
                }
            });
            this.changingSkeleton = false;
        } else {
            this.downloadBundle()
                .then((bundle) => this.loadSkeleton(bundle))
                .catch((err) => console.error(err));
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

    loadSkeleton(bundle) {
        return new Promise<void>((resolve, reject) => {
            // db://assets/art/language/${i18n._language}/xxx/yyy.png@zzzzz
            // 1. 將i18n._language帶入 db://assets/art/language/en/xxx/yyy.png@zzzzz
            // 2. 將多國語系前面刪除 xxx/yyy.png@zzzzz
            // 3. 將.png後移除 xxx/yyy
            // 4. 補上spriteFrame檔 xxx/yyy/spriteFrame
            let path = this.url.split('${i18n._language}/')[1].split('.skel')[0];
            bundle.load(path, sp.SkeletonData, (err, skeletonData) => {
                if (err) {
                    return reject(err);
                }
                this.skeletonData = skeletonData;
                resolve();
            });
        });
    }

    private async cachePath() {
        if (this.changingSkeleton || !this.skeletonData) return;
        this.url = await Editor.Message.request('asset-db', 'query-url', this.skeletonData._uuid);
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
                    if (this.url.match(reg)) {
                        this.url = this.url.replace(reg, '/${i18n._language}/');
                        done = true;
                    }
                }
                return value;
            }
        });
    }

    clearRef() {
        this.skeletonData = null;
    }
}
