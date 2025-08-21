import { CoreMsgCode } from '../../core/constants/CoreMsgCode';

export class MsgCode extends CoreMsgCode {
    /**
     * 停輪Symbol與數學SymbolId有出入時顯示
     * @static
     * @default 8888
     */
    public static readonly ERR_SYMBOL_NOTMATCH: number = 8888;
}
