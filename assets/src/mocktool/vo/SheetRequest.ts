import { StringUtil } from '../../core/utils/StringUtil';
import { GDRequest, IGDRequest } from './GDRequest';

/**
 * Get the sheet
 */
export class SheetRequest extends GDRequest {
    public static readonly NAME: string = 'SheetRequest';

    public constructor(l: IGDRequest, fileId: string, key: string) {
        super(SheetRequest.NAME, l);

        const self = this;

        self.url = StringUtil.format(
            'https://sheets.googleapis.com/v4/spreadsheets/{0}?includeGridData=true&key={1}',
            fileId,
            key
        );
    }
}
