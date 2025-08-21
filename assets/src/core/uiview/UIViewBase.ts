import { _decorator, Component } from 'cc';
import { UIViewStateBase, UIViewStateRegister } from './UIViewStateRegister';

const { ccclass } = _decorator;

@ccclass('UIViewBase')
export abstract class UIViewBase extends Component {
    private _pool: UIViewStateRegister | null = null;

    private get pool() {
        if (!this._pool) {
            this._pool = this.getComponent(UIViewStateRegister);
        }
        return this._pool;
    }

    protected currentState!: UIViewStateBase;

    public getEffectState(key: number) {
        return this.pool.getEffectState(key);
    }

    public get currentStateId() {
        return this.currentState.effectId;
    }

    public get isPlaying() {
        return this.currentState != null ? this.currentState.isPlaying : false;
    }

    public play(playType: number, callBack: Function | null = null) {
        this.currentState = this.pool.getEffectState(playType);
        this.currentState.play(callBack);
    }

    public stop() {
        if (!this.isPlaying || !this.currentState) {
            return;
        }

        this.currentState.stop();
    }

    public skip() {
        if (!this.isPlaying || !this.currentState) {
            return;
        }

        this.currentState.skip();
    }
    /** 直立橫式使用 */
    public change(isHorizontal: boolean) {
        if (this.currentState == null) {
            return;
        }
        this.currentState.change(isHorizontal);
    }

    start() {
        if(this.currentState== null){
            this.currentState = this.pool.getEffectState(0);
        }
        this.OnStart();
    }

    protected OnStart() {}
}