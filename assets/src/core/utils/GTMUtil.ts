export class GTMUtil {
    public static registerGTM(gtmId: string): void {
        // 檢查是否已經初始化過 GTM
        if (document.getElementById('gtm-script')) {
            return;
        }

        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js',
        });

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
        script.id = 'gtm-script'; // 用於防止重複加載
        document.head.appendChild(script);
    }

    public static async setGTMEvent(eventName: string, eventParams: Record<string, any>): Promise<void> {
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: eventName,
                    ...eventParams
                });
                resolve();
            }, 0);
        });
    }
}