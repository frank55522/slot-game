
export class LoadEvent {
    public static LOAD_GROUP_COMPLETE: string = 'LOAD_GROUP_COMPLETE';
    public static LOAD_ITEM_PROGRESS: string = 'LOAD_ITEM_PROGRESS';
    /**
     * Egret預設的preload group可能會由IDE自動偵測而提示開發者是否插入資源，
     * 為預防開發者誤觸插入資源的按鈕，造成不可預期的資源放入preload group，故
     * 使用preload_group group來取代
     */
    public static PRELOAD_GROUP = 'preload_group';
}

