import { _decorator, Component, Node, game } from 'cc';
import { DEBUG } from 'cc/env';
import { AppFacade } from '../core/AppFacade';
import { Logger } from './utils/Logger';

const { ccclass, property } = _decorator;

@ccclass('AppNode')
export default class AppNode extends Component {
    public static registerProxy(proxy: puremvc.IProxy): void {
        AppFacade.getInstance().registerProxy(proxy);
    }

    public static retrieveProxy(name: string, data?: any): puremvc.IProxy {
        let proxy = AppFacade.getInstance().retrieveProxy(name);
        data && proxy.setData(data);
        return proxy;
    }

    public static removeProxy(name: string): puremvc.IProxy {
        return AppFacade.getInstance().removeProxy(name);
    }

    public static registerMediator(mediator: puremvc.IMediator, component?: any): void {
        let name = mediator.getMediatorName();
        if (AppFacade.getInstance().hasMediator(name)) {
            Logger.e('Mediator ${mediator.getMediatorName()} register already');
        }
        Logger.i('register ' + JSON.stringify(name));
        AppFacade.getInstance().registerMediator(mediator);
        component && mediator && mediator.setViewComponent(component);
    }

    public static retrieveMediator(name: string, component?: Node): puremvc.IMediator {
        if (!AppFacade.getInstance().hasMediator(name)) {
            Logger.e('Mediator ${name} has not register');
        }
        let mediator = AppFacade.getInstance().retrieveMediator(name);
        component && mediator && mediator.setViewComponent(component);
        return mediator;
    }

    public static removeMediator(name: string): puremvc.IMediator {
        if (!AppFacade.getInstance().hasMediator(name)) {
            Logger.e('Mediator ${name} has not register');
        }
        Logger.i('cancel register' + JSON.stringify(name));
        return AppFacade.getInstance().removeMediator(name);
    }

    public static sendNotification(name: string, body?: any, type?: string): void {
        AppFacade.getInstance().sendNotification(name, body, type);
    }

    protected onLoad() {
        const self = this;
        game.addPersistRootNode(self.node);
        Logger.i('puremvc start up');
        AppFacade.getInstance().startup(self);
    }
}
