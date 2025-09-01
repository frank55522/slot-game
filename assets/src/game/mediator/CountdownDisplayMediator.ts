import { _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { ScreenEvent } from '../../sgv3/util/Constant';

const { ccclass } = _decorator;

@ccclass('CountdownDisplayMediator')
export class CountdownDisplayMediator extends BaseMediator<any> {
    public static NAME: string = 'CountdownDisplayMediator';
    
    private htmlOverlay: HTMLElement | null = null;
    private isStyleInjected: boolean = false;

    constructor() {
        super(CountdownDisplayMediator.NAME);
    }

    protected lazyEventListener(): void {
        // CountdownDisplayMediator 主要透過 HTML DOM 操作，不需要監聽 Cocos Creator 組件事件
        // 保留此方法以滿足 BaseMediator 抽象方法要求
    }

    public listNotificationInterests(): Array<any> {
        return [
            'SHOW_COUNTDOWN_DISPLAY',
            'UPDATE_COUNTDOWN_DISPLAY', 
            'HIDE_COUNTDOWN_DISPLAY'
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        const notificationName = notification.getName();
        
        switch (notificationName) {
            case 'SHOW_COUNTDOWN_DISPLAY':
                this.showCountdownDisplay();
                break;
                
            case 'UPDATE_COUNTDOWN_DISPLAY':
                const remainingTime = notification.getBody() as number;
                this.updateCountdownDisplay(remainingTime);
                break;
                
            case 'HIDE_COUNTDOWN_DISPLAY':
                this.removeCountdownOverlay(); // 直接移除，避免淡出動畫造成時序衝突
                break;
                
        }
    }

    private showCountdownDisplay(): void {
        // 確保樣式已注入
        this.injectCountdownCSS();
        
        // 創建HTML覆蓋層
        this.createCountdownOverlay();
    }

    private injectCountdownCSS(): void {
        if (this.isStyleInjected) return;
        
        const style = document.createElement('style');
        style.id = 'countdown-display-styles';
        style.textContent = `
            @keyframes countdownPulse {
                0%, 100% { 
                    transform: translate(-50%, -50%) scale(1); 
                    box-shadow: 0 0 30px rgba(255,215,0,0.8);
                }
                50% { 
                    transform: translate(-50%, -50%) scale(1.05); 
                    box-shadow: 0 0 50px rgba(255,215,0,1), 0 0 70px rgba(255,215,0,0.6);
                }
            }
            
            @keyframes numberBounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        this.isStyleInjected = true;
    }

    private createCountdownOverlay(): void {
        // 如果已存在則先移除
        if (this.htmlOverlay) {
            this.removeCountdownOverlay();
        }

        this.htmlOverlay = document.createElement('div');
        this.htmlOverlay.id = 'countdown-overlay';
        this.htmlOverlay.style.cssText = `
            position: fixed;
            top: 50%; 
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #FFD700;
            font-family: 'Arial Black', Arial, sans-serif;
            padding: 60px 80px;
            border-radius: 25px;
            border: 5px solid #FFD700;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 0 30px rgba(255,215,0,0.8);
            animation: fadeIn 0.3s ease-in, countdownPulse 2s ease-in-out infinite;
            user-select: none;
        `;

        // 初始內容（等待更新）
        this.htmlOverlay.innerHTML = this.generateCountdownHTML(5);
        
        document.body.appendChild(this.htmlOverlay);
    }

    private updateCountdownDisplay(remainingTime: number): void {
        if (!this.htmlOverlay) {
            return;
        }

        this.htmlOverlay.innerHTML = this.generateCountdownHTML(remainingTime);
        
        // 為數字添加彈跳動畫
        const numberElement = this.htmlOverlay.querySelector('.countdown-number') as HTMLElement;
        if (numberElement) {
            numberElement.style.animation = 'none';
            // 強制重排以重新啟動動畫
            numberElement.offsetHeight;
            numberElement.style.animation = 'numberBounce 0.6s ease-in-out';
        }
    }

    private generateCountdownHTML(remainingTime: number): string {
        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;">⏰</div>
                <div class="countdown-number" style="
                    font-size: 120px; 
                    font-weight: 900; 
                    text-shadow: 4px 4px 8px rgba(0,0,0,0.9), 0 0 20px rgba(255,215,0,0.8);
                    line-height: 1;
                    ${remainingTime <= 2 ? 'color: #FF6B6B;' : ''}
                ">
                    ${remainingTime}
                </div>
                <div style="
                    font-size: 28px; 
                    font-weight: bold;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                    opacity: 0.9;
                ">
                    ${remainingTime === 1 ? '秒後繼續遊戲' : '秒後繼續遊戲'}
                </div>
            </div>
        `;
    }

    private hideCountdownDisplay(): void {
        if (!this.htmlOverlay) {
            return;
        }

        // 添加淡出動畫
        this.htmlOverlay.style.animation = 'fadeOut 0.5s ease-out';
        
        // 動畫完成後移除元素
        setTimeout(() => {
            this.removeCountdownOverlay();
        }, 500);
    }

    private removeCountdownOverlay(): void {
        if (this.htmlOverlay && this.htmlOverlay.parentNode) {
            this.htmlOverlay.parentNode.removeChild(this.htmlOverlay);
            this.htmlOverlay = null;
        }
    }

    // 清理資源
    public onRemove(): void {
        super.onRemove();
        this.removeCountdownOverlay();
        
        // 移除注入的樣式
        const style = document.getElementById('countdown-display-styles');
        if (style && style.parentNode) {
            style.parentNode.removeChild(style);
            this.isStyleInjected = false;
        }
    }
}