import { _decorator, Component } from 'cc';
import { CountdownDisplayMediator } from '../mediator/CountdownDisplayMediator';

const { ccclass } = _decorator;

@ccclass('CountdownTestTrigger')
export class CountdownTestTrigger extends Component {

    onLoad() {
        // 延遲初始化，等待遊戲系統載入完成
        setTimeout(() => {
            this.initialize();
        }, 2000); // 延遲 2 秒
    }

    private initialize() {
        // 註冊倒數顯示Mediator
        this.registerCountdownMediator();
        
        // 將測試函數暴露到全域（僅用於測試）
        if (typeof window !== 'undefined') {
            (window as any).testCountdownDisplay = this.testCountdownDisplay.bind(this);
            (window as any).hideCountdownDisplay = this.hideCountdownDisplay.bind(this);
        }
    }

    /**
     * 註冊 CountdownDisplayMediator
     */
    private registerCountdownMediator() {
        const facade = puremvc.Facade.getInstance();
        const mediator = new CountdownDisplayMediator();
        facade.registerMediator(mediator);
    }

    /**
     * 測試倒數顯示
     */
    public testCountdownDisplay() {
        const facade = puremvc.Facade.getInstance();
        
        // 模擬倒數流程
        facade.sendNotification('SHOW_COUNTDOWN_DISPLAY');
        
        // 模擬5秒倒數
        let countdown = 5;
        const timer = setInterval(() => {
            facade.sendNotification('UPDATE_COUNTDOWN_DISPLAY', countdown);
            countdown--;
            
            if (countdown < 0) {
                clearInterval(timer);
                facade.sendNotification('HIDE_COUNTDOWN_DISPLAY');
            }
        }, 1000);
    }

    /**
     * 隱藏倒數顯示
     */
    public hideCountdownDisplay() {
        const facade = puremvc.Facade.getInstance();
        facade.sendNotification('HIDE_COUNTDOWN_DISPLAY');
    }

    onDestroy() {
        // 清理全域函數
        if (typeof window !== 'undefined') {
            delete (window as any).testCountdownDisplay;
            delete (window as any).hideCountdownDisplay;
        }
    }
}