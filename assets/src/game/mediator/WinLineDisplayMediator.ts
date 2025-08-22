import { _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';

const { ccclass } = _decorator;

@ccclass('WinLineDisplayMediator')
export class WinLineDisplayMediator extends BaseMediator<any> {
    public static NAME: string = 'WinLineDisplayMediator';
    
    private htmlOverlay: HTMLElement | null = null;

    public constructor(component?: any) {
        super(WinLineDisplayMediator.NAME, component);
        console.log('[WinLineDisplayMediator] constructor()');
    }

    public listNotificationInterests(): Array<any> {
        return [
            'SHOW_WIN_LINES', // 監聽我們在 GAME_ParseStateWinResultCommand 中發送的事件
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
     * 顯示HTML覆蓋層中獎文字（繞過Cocos Creator渲染）
     */
    private showHTMLWinText(winData: any[]) {
        if (!winData || winData.length === 0) return;
        
        console.log(`[WinLineDisplayMediator] 顯示HTML覆蓋層中獎文字，共 ${winData.length} 條`);
        
        // 清除現有的覆蓋層
        this.hideHTMLWinText();
        
        // 組合顯示文字
        const winTexts = winData.map((win, index) => {
            const symbolName = this.getSymbolNameById(win.symbolId);
            return `${symbolName} × ${win.hitCount} = ${win.symbolWin.toFixed(2)}`;
        });
        
        // 創建HTML覆蓋層
        this.htmlOverlay = document.createElement('div');
        this.htmlOverlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: #FFD700;
            font-family: Arial, sans-serif;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            padding: 30px;
            border-radius: 15px;
            border: 3px solid #FFD700;
            z-index: 10000;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            box-shadow: 0 0 20px rgba(255,215,0,0.6);
            white-space: pre-line;
            max-width: 600px;
            word-wrap: break-word;
        `;
        
        this.htmlOverlay.innerHTML = `🎉 中獎連線 🎉<br>${winTexts.join('<br>')}`;
        
        // 添加到頁面
        document.body.appendChild(this.htmlOverlay);
        
        console.log(`[WinLineDisplayMediator] HTML覆蓋層已創建: ${winTexts.join(', ')}`);
        
        // 3秒後自動隱藏
        setTimeout(() => {
            this.hideHTMLWinText();
        }, 3000);
    }

    /**
     * 隱藏HTML覆蓋層
     */
    private hideHTMLWinText() {
        if (this.htmlOverlay && this.htmlOverlay.parentNode) {
            console.log('[WinLineDisplayMediator] 隱藏HTML覆蓋層');
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