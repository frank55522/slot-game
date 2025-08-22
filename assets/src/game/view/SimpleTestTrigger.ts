import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass('SimpleTestTrigger')
export class SimpleTestTrigger extends Component {
    onLoad() {
        console.log('SimpleTestTrigger: onLoad 被調用了！');
        
        setTimeout(() => {
            console.log('SimpleTestTrigger: 延遲執行成功！');
            
            if (typeof window !== 'undefined') {
                (window as any).simpleTest = () => {
                    console.log('SimpleTestTrigger: 測試函數運行成功！');
                };
                console.log('SimpleTestTrigger: 請在控制台輸入 simpleTest() 進行測試');
            }
        }, 1000);
    }

    start() {
        console.log('SimpleTestTrigger: start 被調用了！');
    }

    onEnable() {
        console.log('SimpleTestTrigger: onEnable 被調用了！');
    }
}