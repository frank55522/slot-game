export class JackpotEvent {
    /**
     * JP pool ID
     */
    poolId: number;

    /**
     * JP hit amount in dollar (user's currency)
     */
    hitAmount: number;
    ts: number;
    balance: number;
}
