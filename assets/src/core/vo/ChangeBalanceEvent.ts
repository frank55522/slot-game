/**
 * @author Vince vinceyang
 */
export class ChangeBalanceEvent {
    public ts: number;
    public balance: number;
    constructor(ts: number, balance: number) {
        this.ts = ts;
        this.balance = balance;
    }
}
