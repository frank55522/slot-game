
import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('UIViewStateRegister')
export class UIViewStateRegister extends Component {
    private _pool: Map<number,UIViewStateBase> | null = null;

    private get pool(){
        if(this._pool == null){
            this._pool = new Map<number,UIViewStateBase>();   
            this.onRegister();        
        }
        return this._pool;
    }

    public registerState(state: UIViewStateBase){
        this.pool.set(state.effectId,state);
    }

    public getEffectState(key: number) {
        return  this.pool.get(key);
    }

    protected onRegister(){}
}

export class UIViewStateBase {
    //region Internal Member
    private onFinished: Function | null = null;
    //endregion

    //region Property API
    public effectId: number = 0;

    public isPlaying: boolean = false;

    //endregion

    //region API
    public play(onFinished: Function | null = null) {
        if (this.isPlaying) {
            return;
        }

        if (onFinished != null) {
            this.onFinished = () => onFinished();
        }

        this.isPlaying = true;

        this.onPlay();
    }

    public stop() {
        if (!this.isPlaying) {
            return;
        }

        this.onStop();

        this.isPlaying = false;
    }

    public skip() {
        if (!this.isPlaying) {
            return;
        }

        this.onSkip();
    }
    //直立橫式使用
    public change(isHorizontal: boolean) {
        this.onChange(isHorizontal);
    }
    //endregion

    //region Internal Method
    protected onEffectFinished(isCancelCallBack: boolean = false) {
        this.isPlaying = false;

        if (this.onFinished != null && !isCancelCallBack) {
            this.onFinished();
        }
        this.onFinished = null;
    }

    protected onPlay() {}

    protected onStop() {}

    protected onSkip() {}
    //直立橫式使用
    protected onChange(isHorizontal: boolean) {}

    //endregion
}
 
