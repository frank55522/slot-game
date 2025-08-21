import { _decorator, Component, Node } from 'cc';
import { CoreWebBridgeProxy } from '../../core/proxy/CoreWebBridgeProxy';
const { ccclass, property } = _decorator;

@ccclass('MockToContainerIconPosCommand')
export class MockToContainerIconPosCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockToContainerIconPosCommand';

    public execute(notification: puremvc.INotification): void {
        let winText = notification.getBody();
        let parseTxt: string[] = winText.split(',');
        let jpHallPosY: number = Number(parseTxt[0]);
        let jpHistoryPosY: number = Number(parseTxt[1]);
        let horizontalRotate: number = Number(parseTxt[2]);

        // 告知 Container 畫面轉向功能 [ Y1: Icon 的 Y軸、Y2: JPHistory 的 Y軸、Rotate: 畫面翻轉角度]
        const webBridgeProxy = this.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
        webBridgeProxy.getWebFunRequest(this, 'gameClientMsg', {
            event: 'customButtonPosition',
            value: {
                jpHall: {
                    y: jpHallPosY,
                    horizontalRotate: horizontalRotate
                }, 
                jpHistory: {
                    y: jpHistoryPosY,
                    horizontalRotate: horizontalRotate
                }
            }
        });
        
    }
}
