import { director } from 'cc';
import { LocalizedBrandSprite } from './LocalizedBrandSprite';
import { LocalizedBrandFnt } from './LocalizedBrandFnt';

export let _brand = 'brand-1';

export let ready: boolean = false;

/**
 * 初始化
 * @param brand
 */
export function init(brand: string) {
    ready = true;
    _brand = 'brand-' + brand;
    updateSceneRenderers();
}

/**
 * 翻译数据
 * @param key
 */
export function t(key: string) {
    const win: any = window;

    if (!win.brand) {
        return key;
    }
    const searcher = key.split('.');

    let data = win.brand[_brand];
    for (let i = 0; i < searcher.length; i++) {
        data = data[searcher[i]];
        if (!data) {
            return '';
        }
    }
    return data || '';
}

export function updateSceneRenderers() {
    // very costly iterations
    const rootNodes = director.getScene()!.children;
    // walk all nodes with localize skeleton and update

    const spriteObjects = director.getScene().getComponentsInChildren(LocalizedBrandSprite);
    for (let i = 0; i < spriteObjects.length; ++i) {
        spriteObjects[i].updateSprite();
    }

    const labelObjects = director.getScene().getComponentsInChildren(LocalizedBrandFnt);
    for (let i = 0; i < labelObjects.length; ++i) {
        labelObjects[i].updateFnt();
    }
}

// 供插件查询当前语言使用
const win = window as any;
win._brandData = {
    get brand() {
        return _brand;
    },
    init(brand: string) {
        init(brand);
    },
    updateSceneRenderers() {
        updateSceneRenderers();
    }
};
