import { _decorator, Prefab, instantiate, Button, EditBox, SystemEvent, Label, Node, EventTouch, find } from 'cc';
import { MTCaseManager } from '../proxy/MTCaseManager';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('MTControllerView')
export class MTControllerView extends BaseView {
    private readonly BORDER_WIDTH = 20;
    private readonly BTN_WIDTH = 220;
    private readonly BTN_HEIGHT = 60;

    private listener: MTControllerViewListener;

    @property({ type: MTCaseManager })
    public mtCaseManager: MTCaseManager;

    @property({ type: Prefab })
    public mockButtonPrefab: Prefab;

    @property({ type: Node })
    public buttonLayout: Node;

    @property({ type: EditBox })
    public editorBox: EditBox;

    @property({ type: Label })
    public description: Label;

    protected onLoad() {
        super.onLoad();
        this.node.active = false;

        this.invokeMockStartCommand();
    }

    private async invokeMockStartCommand() {
        const self = this;
        const obj: any = await import('../../mocktool/command/SlotMockStartupCommand');
        const facade: any = await import('../../core/AppFacade');
        facade.AppFacade.getInstance().registerCommand(obj.SlotMockStartupCommand.NAME, obj.SlotMockStartupCommand);
        facade.AppFacade.getInstance().sendNotification(obj.SlotMockStartupCommand.NAME, self);
    }

    public initView(l: MTControllerViewListener) {
        this.listener = l;
    }

    public addCase(name: string): void {
        let button = instantiate(this.mockButtonPrefab).getComponent(Button);
        button.node.name = name;
        button.node.on(SystemEvent.EventType.TOUCH_END, this.onClickCase, this);
        let label = button.getComponentInChildren(Label);
        label.string = name;
        button.node.setParent(this.buttonLayout);
    }

    public setDescription(text: string): void {
        this.description.string = text;
    }

    public appendDescription(text: string): void {
        this.description.string += '\n' + text;
    }

    private onClickCase(event: EventTouch): void {
        let name = (event.currentTarget as Node).name;
        this.listener.onClickCase(name);
    }

    private onClickAdd(): void {
        let text = this.editorBox.string;
        this.editorBox.string = '';
        this.setDescription(text);
        this.listener.onClickAdd(text);
    }

    private onClickCancel(): void {
        this.listener.onClickCancel();
    }

    protected onDestroy() {
        super.onDestroy();
    }
}

/**
 * Callback when clicking the case button
 */
export interface MTControllerViewListener {
    /**
     * @param name the case name
     */
    onClickCase(name: string);

    /**
     * Add a new case
     *
     * @param data from editabletext
     */
    onClickAdd(data: string);

    /**
     * Cacnel the case
     */
    onClickCancel();
}
