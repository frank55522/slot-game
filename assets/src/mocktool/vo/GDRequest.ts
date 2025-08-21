import { Logger } from '../../core/utils/Logger';

/**
 * Google Drive API
 */
export class GDRequest {
    public static readonly NAME: string = 'GDRequest';

    private listener: IGDRequest;

    protected url: string;
    private name: string;
    private response: string;

    public constructor(name: string, l: IGDRequest) {
        const self = this;

        self.name = name;
        self.listener = l;
    }

    /**
     * @param onComplete
     * @param onError
     * @param thisObj
     */
    public request(): void {
        const self = this;

        const req = new XMLHttpRequest();
        req.responseType = 'text';
        req.open('GET', self.url);
        req.setRequestHeader('Content-Type', 'application/json');
        req.onload = (e) => {
            self.onComplete(e);
        };
        req.onerror = (e) => {
            self.onError(e);
        };
        req.send();
    }

    public getUrl(): string {
        return this.url;
    }

    public getName(): string {
        return this.name;
    }

    public getResponse(): any {
        return this.response;
    }

    private onComplete(e: ProgressEvent): void {
        const self = this;
        const req: XMLHttpRequest = e.currentTarget as XMLHttpRequest;
        let ioError = req.status >= 400;
        if (ioError) {
            self.listener.onError(e);
        } else {
            Logger.i('connection onComplete: ' + e);
            self.response = JSON.parse(req.response);
            self.listener.onSuccess(self);
        }
    }

    private onError(e: ProgressEvent): void {
        Logger.i('Failed connection: ' + e);
        this.listener.onError(e);
    }
}

export interface IGDRequest {
    onSuccess(req: GDRequest): void;

    onError(e: ProgressEvent): void;
}
