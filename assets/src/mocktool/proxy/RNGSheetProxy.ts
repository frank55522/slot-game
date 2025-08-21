import { Logger } from '../../core/utils/Logger';
import { IGDRequest, GDRequest } from '../vo/GDRequest';
import { RNGSheet } from '../vo/RNGSheet';
import { SheetList } from '../vo/SheetList';
import { SheetListRequest } from '../vo/SheetListRequest';
import { SheetRequest } from '../vo/SheetRequest';

/**
 * RNG service連結接口
 */
export class RNGSheetProxy extends puremvc.Proxy implements IGDRequest {
    public static readonly NAME: string = 'RNGSheetProxy';

    public static EV_DATA = 'EV_DATA';

    private machineType: string;
    private fildId: string;
    private key: string = 'AIzaSyDxi7lK0cfhOzppMkhFCNfrOCXN5eC3DLo';
    private gdId: string = '1g9HdtCsrIEvrThDq_n5Fa2m0jdwRDbKU';

    public constructor() {
        super(RNGSheetProxy.NAME);
    }

    public connect(machineType: string): void {
        const self = this;

        self.machineType = machineType;
        const sheetListReq = new SheetListRequest(self, self.key, self.gdId);
        sheetListReq.request();
    }

    public reconnect(): void {
        const self = this;

        if (!self.machineType) Logger.i('machineType no setting!');
        if (!self.fildId) Logger.i('sheet fild Id undefind!');

        const sheetReq = new SheetRequest(self, self.fildId, self.key);
        sheetReq.request();
    }

    public onSuccess(req: GDRequest): void {
        Logger.i('sheetList response: ' + req.getName());

        const self = this;

        switch (req.getName()) {
            case SheetListRequest.NAME:
                self.onGetSheetList(req.getResponse());
                break;
            case SheetRequest.NAME:
                self.onGetSheet(req.getResponse());
                break;
        }
    }

    private onGetSheetList(sheetList: SheetList): void {
        const self = this;
        const len = sheetList.files.length;
        for (let i = 0; i < len; i++) {
            const file = sheetList.files[i];
            if (file.name == self.machineType) {
                self.fildId = file.id;
                const sheetReq = new SheetRequest(self, self.fildId, self.key);
                sheetReq.request();
                break;
            }
        }
    }

    private onGetSheet(sheet: RNGSheet): void {
        const self = this;

        self.sendNotification(RNGSheetProxy.EV_DATA, sheet);
    }

    public onError(e: ProgressEvent): void {
        const self = this;

        Logger.w('RNG Sheet Failed connection: ' + e + '  machineType: ' + self.machineType);
    }
}
