import { _decorator, Component, instantiate, Layout, Prefab, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SettingMenu')
export class SettingMenu extends Layout {

    protected onLoad() {
        super.onLoad?.();
    }

    protected _childrenChanged() {
        super._childrenChanged();
        this.handleLine();
    }

    private handleLine() {
        const children = this.node.children;
        for (let index = 0; index < children.length; index+=2) {
            this.node.children[index + 1].active = this.node.children[index].active;
        }
    }
}
