import { Asset } from 'cc';
import { Texture2D } from 'cc';
import { AssetManager } from 'cc';
import { assetManager } from 'cc';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Node } from 'cc';
import { Logger } from './Logger';
const { ccclass } = _decorator;

/**
 * @description 資源管理器
 */
@ccclass('ResManager')
export class ResManager {
    static _instance: ResManager;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new ResManager();
        return this._instance;
    }

    private _nodeAssetMaps = new Map<Node, Map<Asset, boolean>>();
    private loadingTimeMap: Map<string, number> = new Map<string, number>();

    initDownloadSetting() {
        assetManager.downloader.maxConcurrency = 1000; //最大同時下載數量
        assetManager.downloader.maxRequestsPerFrame = 1000; //每幀最大請求數量
    }

    /**
     * 紀錄該Node底下引用的資源，使其引用計數+1 (子Node若有引用同個資源，不會疊加)
     * 請在start()時呼叫
     * @param node 要紀錄的節點
     * @param addRef 是否要增加引用計數 (有些是被掛在Scene上預設會+1，因此紀錄時可傳不+1)
     */
    recordAssetByNode(node: Node, addRef = true, map?: Map<Asset, boolean>) {
        if (!map) {
            this._nodeAssetMaps.set(node, new Map<Asset, boolean>());
            map = this._nodeAssetMaps.get(node);
        }
        //紀錄Sprite使用的SprtieFrame
        if (node.getComponent(Sprite)?.spriteFrame) {
            this.addAssetRef(node.getComponent(Sprite).spriteFrame, addRef, map);
        }
        //遞迴紀錄子節點
        for (const child of node.children || []) {
            this.recordAssetByNode(child, addRef, map);
        }
    }

    /**
     * 嘗試釋放該Node底下引用的資源，使其引用計數-1
     * 請在onDestroy()時呼叫
     * @param node 要釋放的根節點
     */
    releaseNodeAsset(node: Node) {
        if (!this._nodeAssetMaps.has(node)) {
            return;
        }
        this._nodeAssetMaps.get(node).forEach((value, asset) => {
            if (asset instanceof SpriteFrame) {
                this.decRefSpriteFrame(asset as SpriteFrame);
            } else {
                asset.decRef(true);
            }
            // Logger.i(`🟥 releaseNodeAsset [${node.name}]: ${asset.name} | ${asset.refCount}`);
        });
        this._nodeAssetMaps.get(node).clear();
        this._nodeAssetMaps.delete(node);
    }

    /**
     * 加載 Bundle
     * @param bundleName bundle名稱
     */
    loadBundle(bundleName: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            let existBundle = assetManager.getBundle(bundleName);
            if (existBundle) return resolve(existBundle);
            assetManager.loadBundle(bundleName, (error, bundle) => {
                if (error) {
                    return reject(error);
                }
                resolve(bundle);
            });
        });
    }

    /**
     * 加載指定Bundle的某資料夾下的"所有特定資源" (e.g. Prefab, ImageAsset...)
     * @param bundleName bundle名稱
     * @param dir 資料夾相對路徑，如果Asset在Bundle資料夾下，則傳空字串即可
     * @param type Asset類型 (e.g. Prefab, ImageAsset...)
     * @example loadAssetDir('preload', '', Prefab);
     *
     */
    loadAssetDir<T extends Asset>(bundleName: string, dir = '', type: new () => T): Promise<T[]> {
        return new Promise((resolve, reject) => {
            const existBundle = assetManager.getBundle(bundleName);
            if (!existBundle) {
                // 如果資源包不存在，主動加載資源包
                this.loadBundle(bundleName)
                    .then((bundle) => {
                        this.setLoadingStartTime(`${bundleName}/${dir}`);
                        bundle.loadDir(dir, type, (error, assets) => {
                            if (error) {
                                return reject(error);
                            }
                            this.logTotalLoadingTime(`${bundleName}/${dir}`);
                            resolve(assets);
                        });
                    })
                    .catch((error) => {
                        Logger.w(`Failed to load bundle: ${bundleName}`);
                        reject(error);
                    });
                return;
            }

            // 如果資源包已經存在，直接加載
            this.setLoadingStartTime(`${bundleName}/${dir}`);
            existBundle.loadDir(dir, type, (error, assets) => {
                if (error) {
                    return reject(error);
                }
                this.logTotalLoadingTime(`${bundleName}/${dir}`);
                resolve(assets);
            });
        });
    }

    /**
     * 加載指定Bundle的某個資源
     * @param bundleName bundle名稱
     * @param path Asset相對路徑 (不用副檔名)
     * @param type Asset類型 (e.g. Prefab, ImageAsset...)
     * @example loadAsset('extend', 'Extend', Prefab);
     */
    loadAsset<T extends Asset>(bundleName: string, path: string, type: new () => T): Promise<T> {
        return new Promise((resolve, reject) => {
            const existBundle = assetManager.getBundle(bundleName);
            if (!existBundle) {
                // 如果資源包不存在，主動加載資源包
                this.loadBundle(bundleName)
                    .then((bundle) => {
                        this.setLoadingStartTime(`${bundleName}/${path}`);
                        bundle.load(path, type, (error, asset) => {
                            if (error) {
                                return reject(error);
                            }
                            this.logTotalLoadingTime(`${bundleName}/${path}`);
                            resolve(asset);
                        });
                    })
                    .catch((error) => {
                        Logger.w(`Failed to load bundle: ${bundleName}`);
                        reject(error);
                    });
                return;
            }

            // 如果資源包已經存在，直接加載
            this.setLoadingStartTime(`${bundleName}/${path}`);
            existBundle.load(path, type, (error, asset) => {
                if (error) {
                    return reject(error);
                }
                this.logTotalLoadingTime(`${bundleName}/${path}`);
                resolve(asset);
            });
        });
    }

    /**
     * 從指定Bundle取得某個資源
     * @param bundleName bundle名稱
     * @param path Asset相對路徑 (不用副檔名)
     * @returns
     */
    getAsset(bundleName: string, path: string): Asset {
        let existBundle = assetManager.getBundle(bundleName);
        if (!existBundle) {
            Logger.e(`Bundle ${bundleName} not found`);
            return null;
        }
        return existBundle.get(path);
    }

    /**
     * 取得Bundle相對路徑下的所有資源
     * @param bundleName bundle名稱
     * @param dir 資料夾相對路徑，如果Asset在Bundle資料夾下，則傳空字串即可
     * @returns
     */
    getAssetDir(bundleName: string, dir: string = ''): Asset[] {
        let existBundle = assetManager.getBundle(bundleName);
        if (!existBundle) {
            Logger.e(`Bundle ${bundleName} not found`);
            return null;
        }
        const assetsInfo = existBundle.getDirWithPath(dir);
        const assets: Asset[] = [];
        assetsInfo.forEach((info) => {
            const asset = existBundle.get(info.path);
            if (asset) {
                assets.push(asset);
            }
        });

        return assets;
    }

    setLoadingStartTime(tag: string) {
        this.loadingTimeMap.set(tag, Date.now());
    }

    getLoadingStartTime(tag: string) {
        return this.loadingTimeMap.get(tag) ?? 0;
    }

    getTotalLoadingTime(tag: string) {
        return Date.now() - (this.loadingTimeMap.get(tag) ?? 0);
    }

    logTotalLoadingTime(tag: string, icon = '📦') {
        const loadingTime = this.getTotalLoadingTime(tag);
        Logger.i(`${icon} Total loading time for [${tag}]: ${loadingTime}ms (${loadingTime / 1000}s)`);
    }

    private addAssetRef(asset: Asset, addRef = true, map: Map<Asset, boolean>) {
        if (map.get(asset)) {
            return;
        }
        map.set(asset, true);
        if (addRef) {
            asset.addRef();
        }
        // Logger.i(`🟩 setNodeAsset ${asset.name} | ${asset.refCount}`);
    }

    private decRefSpriteFrame(spf: SpriteFrame) {
        if (!spf?.isValid) {
            return;
        }
        let texture: Texture2D = null;
        if (spf.packable) {
            texture = spf.original?._texture as Texture2D;
        }
        if (!texture) {
            texture = spf.texture as Texture2D;
        }
        spf.decRef(true);
    }
}
