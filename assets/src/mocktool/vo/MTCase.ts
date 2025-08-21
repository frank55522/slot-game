import { MTTask } from './MTTask';

/**
 * 測試案例流程，包含案例中的所有工作
 */
export class MTCase {
    /**
     * 測試案例中的工項清單
     */
    public tasks: Array<MTTask>;

    /**
     * 當tasks被放入flow中時，由程式輸入
     */
    public description;
}
