/**
 * FIXME: DEPRECATED
 *
 * @author Jam
 * @author Vince vinceyang
 * 字串處理
 */
export class StringTools {
    public constructor() {}
    public static Mark_1: string = '_';
    public static MixString(sStrText: string, sStrList: string[], sStrMark: string): string {
        var Res = sStrText;
        var iCount = sStrList.length;
        for (var i = 0; i < iCount; i++) if (sStrList[i] != '') Res += sStrMark + sStrList[i];
        return Res;
    }
    /**
     * deprecated
     */
    public static Format(format, args): string {
        var i;
        if (args instanceof Array) {
            for (i = 0; i < args.length; i++) {
                format = format.replace(new RegExp('\\{' + i + '\\}', 'gm'), args[i]);
            }
            return format;
        }
        for (i = 0; i < arguments.length - 1; i++) {
            format = format.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i + 1]);
        }
        return format;
    }
    public static format(text: string, ...args: string[]): string {
        const len = args.length;
        for (let i = 0; i < len; i++) {
            text = text.replace(new RegExp('\\{' + String(i) + '\\}', 'gm'), args[i]);
        }
        return text;
    }
    public static toCredit(val: number): string {
        return String(Math.floor(val))
            .split('')
            .reverse()
            .join('')
            .replace(/(\d{3}\B)/g, '$1,')
            .split('')
            .reverse()
            .join('');
    }
}
