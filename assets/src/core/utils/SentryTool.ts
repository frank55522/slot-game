export class SentryTool {
    private static instance() {
        return window['Sentry'];
    }

    /** 初始化 */
    public static init(version: string, env: string) {
        try {
            this.instance()?.init({
                dsn: 'https://e5603c21146452f130e4e52d40e01865@o4508635464859648.ingest.us.sentry.io/4508685657112576',
                release: version,
                environment: env
            });
        } catch (e) {}
    }

    /** 設定User */
    public static setUserID(id: string) {
        try {
            this.instance()?.setUser({
                id: id
            });
        } catch (e) {}
    }

    /** 加Log紀錄 */
    public static addLog(category: string, message: string) {
        try {
            this.instance()?.addBreadcrumb({
                category: category,
                message: message,
                level: 'log'
            });
        } catch (e) {}
    }

    public static captureException(error: Error) {
        try {
            this.instance()?.captureException(error);
        } catch (e) {}
    }
}
