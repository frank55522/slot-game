import { CoreKibanaLog } from '../../../core/utils/Logger';

export class SymbolErrorLog extends CoreKibanaLog {
    errorCode: number;
    reelIndex: number;
    reelRng: number;
    strip: number[];
    autoPlayMode: boolean;
    turboMode: boolean;
}
