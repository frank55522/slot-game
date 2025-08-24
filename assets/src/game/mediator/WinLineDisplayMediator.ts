import { _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';

const { ccclass } = _decorator;

@ccclass('WinLineDisplayMediator')
export class WinLineDisplayMediator extends BaseMediator<any> {
    public static NAME: string = 'WinLineDisplayMediator';
    
    private htmlOverlay: HTMLElement | null = null;

    public constructor(component?: any) {
        super(WinLineDisplayMediator.NAME, component);
    }

    protected lazyEventListener(): void {
        // WinLineDisplayMediator 主要透過 HTML DOM 操作，不需要監聽 Cocos Creator 組件事件
        // 保留此方法以滿足 BaseMediator 抽象方法要求
    }

    public listNotificationInterests(): Array<any> {
        return [
            'SHOW_WIN_LINES',
            'HIDE_WIN_LINES'
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case 'SHOW_WIN_LINES':
                this.showHTMLWinText(notification.getBody());
                break;
            case 'HIDE_WIN_LINES':
                this.hideHTMLWinText();
                break;
        }
    }

    /**
     * 顯示HTML覆蓋層中獎文字（繞過Cocos Creator渲染）+ 動畫效果
     */
    private showHTMLWinText(winData: any[]) {
        if (!winData || winData.length === 0) return;
        
        // 清除現有的覆蓋層
        this.hideHTMLWinText();
        
        // 組合顯示文字
        const winTexts = winData.map((win, _index) => {
            const symbolName = this.getSymbolNameById(win.symbolId);
            return `${symbolName} × ${win.hitCount} = ${win.symbolWin.toFixed(2)}`;
        });
        
        // 創建HTML覆蓋層
        this.htmlOverlay = document.createElement('div');
        
        // 先添加CSS動畫定義到頁面
        if (!document.getElementById('win-bounce-animation')) {
            const style = document.createElement('style');
            style.id = 'win-bounce-animation';
            style.textContent = `
                @keyframes winBounce {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    25% { transform: translate(-50%, -50%) scale(1.1); }
                    50% { transform: translate(-50%, -50%) scale(1.2); }
                    75% { transform: translate(-50%, -50%) scale(1.1); }
                }
                @keyframes winGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(255,215,0,0.6); }
                    50% { box-shadow: 0 0 40px rgba(255,215,0,1), 0 0 60px rgba(255,215,0,0.8); }
                }
                @keyframes winShake {
                    0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
                    10% { transform: translate(-50%, -50%) rotate(-1deg) scale(1.05); }
                    20% { transform: translate(-50%, -50%) rotate(1deg) scale(1.1); }
                    30% { transform: translate(-50%, -50%) rotate(-1deg) scale(1.05); }
                    40% { transform: translate(-50%, -50%) rotate(1deg) scale(1.1); }
                    50% { transform: translate(-50%, -50%) rotate(0deg) scale(1.15); }
                    60% { transform: translate(-50%, -50%) rotate(1deg) scale(1.1); }
                    70% { transform: translate(-50%, -50%) rotate(-1deg) scale(1.05); }
                    80% { transform: translate(-50%, -50%) rotate(1deg) scale(1.1); }
                    90% { transform: translate(-50%, -50%) rotate(-1deg) scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.htmlOverlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: rgba(0, 0, 0, 0.9);
            color: #FFD700;
            font-family: Arial, sans-serif;
            font-size: 36px;
            font-weight: bold;
            text-align: center;
            padding: 40px;
            border-radius: 20px;
            border: 4px solid #FFD700;
            z-index: 10000;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.9), 0 0 10px rgba(255,215,0,0.8);
            box-shadow: 0 0 20px rgba(255,215,0,0.6);
            white-space: pre-line;
            max-width: 700px;
            word-wrap: break-word;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        `;
        
        this.htmlOverlay.innerHTML = `🎉 中獎連線 🎉<br>${winTexts.join('<br>')}`;
        
        // 添加到頁面
        document.body.appendChild(this.htmlOverlay);
        
        // 立即顯示並開始持續動畫
        setTimeout(() => {
            if (this.htmlOverlay) {
                // 先顯示元素
                this.htmlOverlay.style.opacity = '1';
                this.htmlOverlay.style.transform = 'translate(-50%, -50%) scale(1)';
                
                // 開始持續的組合動畫
                this.htmlOverlay.style.animation = `
                    winShake 0.8s ease-in-out infinite,
                    winGlow 1.5s ease-in-out infinite
                `;
            }
        }, 10);
        
        // 3秒後自動隱藏（帶淡出動畫）
        setTimeout(() => {
            this.hideHTMLWinTextWithAnimation();
        }, 3000);
    }

    /**
     * 隱藏HTML覆蓋層（帶動畫）
     */
    private hideHTMLWinTextWithAnimation() {
        if (this.htmlOverlay && this.htmlOverlay.parentNode) {
            // 停止持續動畫，開始淡出
            this.htmlOverlay.style.animation = 'none';
            this.htmlOverlay.style.transition = 'all 0.5s ease-out';
            this.htmlOverlay.style.transform = 'translate(-50%, -50%) scale(0.5)';
            this.htmlOverlay.style.opacity = '0';
            
            // 動畫完成後移除元素
            setTimeout(() => {
                if (this.htmlOverlay && this.htmlOverlay.parentNode) {
                    this.htmlOverlay.parentNode.removeChild(this.htmlOverlay);
                    this.htmlOverlay = null;
                }
            }, 500);
        }
    }

    /**
     * 隱藏HTML覆蓋層（無動畫，用於立即清除）
     */
    private hideHTMLWinText() {
        if (this.htmlOverlay && this.htmlOverlay.parentNode) {
            // 停止所有動畫
            this.htmlOverlay.style.animation = 'none';
            this.htmlOverlay.parentNode.removeChild(this.htmlOverlay);
            this.htmlOverlay = null;
        }
    }

    /**
     * 根據 symbolId 獲取符號名稱
     */
    private getSymbolNameById(symbolId: number): string {
        const symbolMap: { [key: number]: string } = {
            0: 'WILD',
            1: 'C1', // Scatter
            2: 'M1',
            3: 'M2', 
            4: 'M3',
            5: 'J',
            6: 'Q',
            7: 'K',
            8: 'A',
            9: '10',
            10: '9'
        };
        return symbolMap[symbolId] || `Symbol_${symbolId}`;
    }
}