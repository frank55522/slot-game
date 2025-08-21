import * as i18n from './LanguageData';

import { _decorator, Component, Label } from 'cc';
import { BaseLocalized } from './BaseLocalized';
const { ccclass, property, executeInEditMode, requireComponent, menu } = _decorator;

@ccclass('LocalizedLabel')
@executeInEditMode
@requireComponent(Label)
@menu('i18n/LocalizedLabel')
export class LocalizedLabel extends BaseLocalized {
    private _label: Label = null;
    private get label() {
        if (!this._label) {
            this._label = this.getComponent(Label);
        }
        return this._label;
    }

    @property({ visible: false })
    key: string = '';

    @property({ displayName: 'Key', visible: true })
    get _key() {
        return this.key;
    }
    set _key(str: string) {
        this.key = str;
        this.localize();
    }

    onLoad() {
        if (!i18n.ready) {
            // i18n.init('en');
            return;
        }
        this.localize();
    }

    localize() {
        this.label && (this.label.string = i18n.t(this.key));
    }
}
