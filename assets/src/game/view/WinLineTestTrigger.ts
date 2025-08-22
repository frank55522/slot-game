import { _decorator, Component } from 'cc';
import { WinLineDisplayMediator } from '../mediator/WinLineDisplayMediator';

const { ccclass } = _decorator;

@ccclass('WinLineTestTrigger')
export class WinLineTestTrigger extends Component {

    onLoad() {
        // 延遲初始化，等待遊戲系統載入完成
        setTimeout(() => {
            this.initialize();
        }, 2000); // 延遲 2 秒
    }

    private initialize() {
        console.log('WinLineTestTrigger: 開始初始化...');
        
        // 註冊中獎連線顯示Mediator
        this.registerWinLineMediator();
        
        // 將測試函數暴露到全域（僅用於測試）
        if (typeof window !== 'undefined') {
            (window as any).testWinLineDisplay = this.testWinLineDisplay.bind(this);
            (window as any).hideWinLineDisplay = this.hideWinLineDisplay.bind(this);
            console.log('WinLineTestTrigger: 測試函數已暴露');
            console.log('可用命令: testWinLineDisplay(), hideWinLineDisplay()');
        }
    }

    /**
     * 註冊 WinLineDisplayMediator
     */
    private registerWinLineMediator() {
        const facade = puremvc.Facade.getInstance();
        const mediator = new WinLineDisplayMediator();
        facade.registerMediator(mediator);
        
        console.log('WinLineTestTrigger: WinLineDisplayMediator 已註冊');
    }

    /**
     * 測試中獎連線顯示
     */
    public testWinLineDisplay() {
        // 模擬真實的中獎數據
        const testWinData = [
            {
                symbolId: 2, // M1
                hitCount: 5,
                symbolWin: 250.50,
                hitOdds: 50.1,
                hitNumber: 1
            },
            {
                symbolId: 6, // Q
                hitCount: 3,
                symbolWin: 75.25,
                hitOdds: 25.08,
                hitNumber: 2
            }
        ];

        console.log('WinLineTestTrigger: 發送測試通知');
        const facade = puremvc.Facade.getInstance();
        facade.sendNotification('SHOW_WIN_LINES', testWinData);
    }

    /**
     * 隱藏中獎連線顯示
     */
    public hideWinLineDisplay() {
        console.log('WinLineTestTrigger: 發送隱藏通知');
        const facade = puremvc.Facade.getInstance();
        facade.sendNotification('HIDE_WIN_LINES');
    }

    onDestroy() {
        // 清理全域函數
        if (typeof window !== 'undefined') {
            delete (window as any).testWinLineDisplay;
            delete (window as any).hideWinLineDisplay;
        }
    }
}