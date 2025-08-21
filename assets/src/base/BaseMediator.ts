import { _decorator, Node, js } from 'cc';
const { ccclass } = _decorator;

@ccclass('BaseMediator')
export default abstract class BaseMediator<T> extends puremvc.Mediator {
    protected view : T;
    protected constructor(name?: string, view?: any) {
        super(name ? name : '', view);
        if (!name) this.mediatorName = js.getClassName(this);
        this.view = view;
    }

    public setViewComponent<T>(view: T) {
        super.setViewComponent(view);
        (view || this.viewComponent) && this.lazyEventListener?.();
    }

    public getViewComponent<T>(): T {
        return <T>super.getViewComponent();
    }

    protected abstract lazyEventListener(): void;
}
