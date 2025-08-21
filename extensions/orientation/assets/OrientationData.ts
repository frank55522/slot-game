import { director } from 'cc';

export let _orientation = 'horizontal';

export let ready: boolean = false;

/**
 * 初始化
 * @param orientation 
 */
export function init(orientation: string) {
    ready = true;
    _orientation = orientation;
}

/**
 * 翻译数据
 * @param key 
 */
export function t(key: string) {
    const win: any = window;
    
    if (!win.orientation) {
        return key;
    }
    const searcher = key.split('.');
    
    let data = win.orientation[_orientation];
    for (let i = 0; i < searcher.length; i++) {
        data = data[searcher[i]];
        if (!data) {
            return '';
        }
    }
    return data || '';
}

export async function updateResolution() { // very costly iterations
    await Editor.Profile.setProject('project', 'general.designResolution.width', win.orientation[_orientation].designResolution.width);
    await Editor.Profile.setProject('project', 'general.designResolution.height', win.orientation[_orientation].designResolution.height);
    const isHorizontal = _orientation == 'horizontal';
    director.getScene().children.forEach(child=>child.getComponentsInChildren('UIOrientation').forEach(target=>target.changeOrientation(isHorizontal)));
    director.getScene().children.forEach(child=>child.getComponentsInChildren('GameUIOrientationSetting').forEach(target=>target.changeOrientation(isHorizontal, 'Game_1')));
    // const rootNodes = director.getScene()!.children;
    // // walk all nodes with localize label and update
    // const allLocalizedLabels: any[] = [];
    // for (let i = 0; i < rootNodes.length; ++i) {
    //     let labels = rootNodes[i].getComponentsInChildren('LocalizedLabel');
    //     Array.prototype.push.apply(allLocalizedLabels, labels);
    // }
    // for (let i = 0; i < allLocalizedLabels.length; ++i) {
    //     let label = allLocalizedLabels[i];
    //     if(!label.node.active)continue;
    //     label.updateLabel();
    // }
    // // walk all nodes with localize sprite and update
    // const allLocalizedSprites: any[] = [];
    // for (let i = 0; i < rootNodes.length; ++i) {
    //     let sprites = rootNodes[i].getComponentsInChildren('LocalizedSprite');
    //     Array.prototype.push.apply(allLocalizedSprites, sprites);
    // }
    // for (let i = 0; i < allLocalizedSprites.length; ++i) {
    //     let sprite = allLocalizedSprites[i];
    //     if(!sprite.node.active)continue;
    //     sprite.updateSprite();
    // }
}

// 供插件查询当前语言使用
const win = window as any;
win._orientation = {
    get orientation() {
        return _orientation;
    },
    init(orientation: string) {
        init(orientation);
    },
    updateResolution() {
        updateResolution();
    },
};
