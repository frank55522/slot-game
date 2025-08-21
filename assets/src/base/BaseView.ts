import { _decorator, js } from 'cc';
import { LayerManager } from  '../core/utils/LayerManager';
import AppNode from '../core/AppNode';
import BaseUI from './BaseUI';
const { ccclass, property } = _decorator;

@ccclass('BaseView')
export default abstract class BaseView extends BaseUI {
    @property({})
    private renderOrder: number = -1;
    private viewMsg: any = {};

    /**
     * 該組件第一次啟用時，可指定對應的 Mediator 類別和自定義註冊的名稱。
     * 當 mediatorClassName 和 mediatorName 沒有定義時，會自行組裝對應的類別名稱，並且以該類別名稱作為註冊 Mediator 的名稱。
     * @param mediatorClassName Mediator 對應的類別名稱
     * @param mediatorName Mediator 的註冊名稱
     */
    protected onLoad(mediatorClassName?: string, mediatorName?: string) {
        const className = js.getClassName(this);
        const MediatorClassName = mediatorClassName ? mediatorClassName : `${className}Mediator`;
        this.initMediator(MediatorClassName, mediatorName);
        if (this.renderOrder >= 0) {
            LayerManager.setLayer(this, this.renderOrder);
        }
    }

    public initData(data?: any, mediatorName?: string, ...params: any): void {
        super.initData(data, params);
        mediatorName && this.initMediator(mediatorName);
    }

    public initMediator(className: string, mediatorName?: string) {
        this.viewMsg.mediatorName = mediatorName ? mediatorName : className;
        let cls = js.getClassByName(className);
        AppNode.registerMediator(new cls(mediatorName, this) as puremvc.IMediator, this);
    }

    protected onDestroy() {
        super.onDestroy();
        if (this.viewMsg.mediatorName) {
            let mediator = AppNode.removeMediator(this.viewMsg.mediatorName);
            mediator && mediator.setViewComponent(null);
        }
    }

    public getRenderOrder(): number {
        return this.renderOrder;
    }
}
