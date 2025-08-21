import { Node } from 'cc';
import { UIButton } from '../view/UIButton';
import { UIEvent } from './UIEvent';
import { Logger } from 'Logger';

export class UIProxy extends puremvc.Proxy {
    public static readonly NAME: string = 'UIProxy';

    private _buttons: Map<string, UIButton>;
    public get buttons() {
        if (this._buttons == null) {
            this._buttons = new Map<string, UIButton>();
        }
        return this._buttons;
    }

    private _uiNodes: Map<string, Node>;
    public get uiNodes() {
        if (this._uiNodes == null) {
            this._uiNodes = new Map<string, Node>();
        }
        return this._uiNodes;
    }

    protected _isQuickSpin: boolean = false;
    public set isQuickSpin(state: boolean) {
        this._isQuickSpin = state;
        this.sendNotification(UIEvent.SET_QUICK_SPIN_STATUS, state);
    }
    public get isQuickSpin(): boolean {
        return this._isQuickSpin;
    }

    public isAutoPlaying: boolean = false;

    public constructor() {
        super(UIProxy.NAME);
    }

    public registerButton(name: string, button: UIButton) {
        if (this.buttons.has(name) == false) {
            this.buttons.set(name, button);
        } else {
            Logger.w(name + ' register already');
        }
    }

    public unregisterButton(name: string) {
        if (this.buttons.has(name)) {
            this.buttons.delete(name);
        } else {
            this.warnButtonNotExist(name);
        }
    }

    public setButtonState(name: string, state: any) {
        if (this.buttons.has(name)) {
            let button = this.buttons.get(name);
            button.setState(state);
        } else {
            this.warnButtonNotExist(name);
        }
    }

    public getButtonState(name: string): any {
        let state: any = null;
        if (this.buttons.has(name)) {
            let button = this.buttons.get(name);
            state = button.getState();
        } else {
            this.warnButtonNotExist(name);
        }
        return state;
    }

    public toggleButton(name: string, enabled: boolean) {
        if (this.buttons.has(name)) {
            let button = this.buttons.get(name);
            button.node.active = enabled;
        } else {
            this.warnButtonNotExist(name);
        }
    }

    private warnButtonNotExist(name: string) {
        Logger.w(name + ' button is not exist');
    }

    public registerUINode(name: string, node: Node) {
        if (this.uiNodes.has(name) == false) {
            this.uiNodes.set(name, node);
        } else {
            Logger.w(name + ' register already');
        }
    }

    public unregisterUINode(name: string) {
        if (this.uiNodes.has(name)) {
            this.uiNodes.delete(name);
        } else {
            this.warnNodeNotExist(name);
        }
    }

    public getUINode(name: string) {
        let node: Node = null;
        if (this.uiNodes.has(name)) {
            node = this.uiNodes.get(name);
        } else {
            this.warnNodeNotExist(name);
        }
        return node;
    }

    private warnNodeNotExist(name: string) {
        Logger.w(name + ' node is not exist');
    }
}
