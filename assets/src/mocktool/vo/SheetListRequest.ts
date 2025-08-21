import { StringUtil } from '../../core/utils/StringUtil';
import { GDRequest, IGDRequest } from './GDRequest';

/**
 * Get the sheet list
 */
export class SheetListRequest extends GDRequest {
    public static readonly NAME: string = 'SheetListRequest';

    public constructor(l: IGDRequest, key: string, folderId: string) {
        super(SheetListRequest.NAME, l);

        this.url = StringUtil.format(
            'https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&includeItemsFromAllDrives=true&q=%22{0}%22+in+parents&key={1}',
            folderId,
            key
        );
    }
}
