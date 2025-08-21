import * as i18n from './LanguageData';

import { _decorator, Vec3 } from 'cc';
import { BaseLocalized } from './BaseLocalized';
const { ccclass, property, executeInEditMode, menu } = _decorator;

@ccclass('LocalizedPositionInfo')
class LocalizedPositionInfo {
    @property
    language: string = '';
    @property
    position: Vec3 = new Vec3();
}

@ccclass('LocalizedPosition')
@executeInEditMode
@menu('i18n/LocalizedPosition')
export class LocalizedPosition extends BaseLocalized {
    @property({
        type: LocalizedPositionInfo,
        visible: false
    })
    positionList: Array<LocalizedPositionInfo> = [];
    @property({
        type: LocalizedPositionInfo,
        displayName: 'PositionList'
    })
    set g_positionList(value: Array<LocalizedPositionInfo>) {
        value.forEach((val) => {
            val.position = this.positionList.find((v) => v.language == val.language)?.position ?? new Vec3();
        });
        this.positionList = value;
    }

    get g_positionList() {
        return this.positionList;
    }

    get localizedPositionInfo() {
        return this.positionList.find((item) => item.language === i18n._language);
    }

    @property({ type: Vec3 })
    get nodePosition() {
        return this.node.position;
    }

    set nodePosition(pos: Vec3) {
        this.node.position = pos;
    }

    @property({})
    set save(bool: boolean) {
        if (bool) {
            if (this.localizedPositionInfo) {
                this.localizedPositionInfo.position = this.nodePosition.clone();
            } else if (i18n._language != '') {
                let newData = new LocalizedPositionInfo();
                newData.language = i18n._language;
                newData.position = this.nodePosition.clone();
                this.positionList = this.positionList.concat(newData);
            }
        }
    }

    get save() {
        return false;
    }

    onLoad() {
        if (!i18n.ready) {
            // i18n.init('en');
            return;
        }
        this.localize();
    }

    localize() {
        if (this.localizedPositionInfo) {
            this.node.position = this.localizedPositionInfo.position;
        }
    }
}
