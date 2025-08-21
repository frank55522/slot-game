import { CoreKibanaLog } from '../../../core/utils/Logger';

export class LogType {
    public static ERROR_LOADITEM = 'slot_onItemLoadError';
}

export class KibanaLog extends CoreKibanaLog {
    /** 檔案url */
    public fileURL: string;
    /** error code */
    public errorCode: number;
}
