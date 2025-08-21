export class CommonSetting {
    /** 設定需在loading畫面顯示的資源 */
    public preloadResList: string[];
    /** 設定要載入 default 內的 GroupName */
    public gameResList: string[];
    /** 連線合理延遲時間 */
    public connectBufferTime: number = 10;
    /** 下載素材合理延遲時間 */
    public downloadBufferTime: number = 40;
    /** 舞台寬 */
    public screenWidth: number = 0.9;
    /** 舞台高 */
    public screenHeight: number = 1.6;
    /** 是否強迫大獎滾停 */
    public isBigWinForceComplete = true;
    /** 結束計分緩衝時間 */
    public endWinDelayTime: number = 0.5;
}
