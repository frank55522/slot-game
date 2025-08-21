export class BoardDisplayResult {
    public static readonly NOTHING = 'nothing';
    public static readonly BIG_WIN = 'bigWin';
    public static readonly MEGA_WIN = 'megaWin';
    public static readonly SUPER_WIN = 'superWin';
    public static readonly JUMBO_WIN = 'jumboWin';
    /**
     * 贏分面板類型
     * - "UltraWin"
     * - "MegaWin"
     * - "BigWin"
     */
    winRankType: string = BoardDisplayResult.NOTHING;
}
