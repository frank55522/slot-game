/**
 * 測試案例中所要模擬的參數
 */
export class MTTask {
    public name: string;
    public data: any;
    public description: string;
    public event: string;
    public delay: number;
    public repeat: number;
    public duration: number;
    public relate: Array<string>;

    /**
     * task key，記錄在def.case.json中
     */
    public task: string;
}
