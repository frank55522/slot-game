
import { _decorator, Component,Material, ParticleSystem,systemEvent, SystemEvent, EventKeyboard, macro, CCString} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShaderValueList')

export class ShaderValueList{

   // @property({type: CCString})public ShaderNameIndex : string|null = null;

    @property public IsMaxValue: number = 0.0;

    @property public Speed: number = .001;

    @property public loop: number = 0;

    @property public delayTime: number = 0;

    private mat: Material = null;

    private current: number = 0;

    private finished: boolean = false;

    private loopTime: number = 0;
    

    public UpdateValue(){

        if(this.finished)return;
        
        this.current += this.Speed;

        if(this.current >= this.IsMaxValue){

            this.current = 0;

            if(--this.loopTime <= 0){

                this.finished = true;

                return;

            }

        }

        if(this.mat){

            const pass = this.mat.passes[0];

           // pass.setUniform(pass.getHandle(this.ShaderNameIndex) , this.current );


        }

    }

}

@ccclass('ShaderTimesController')
export class ShaderTimesController extends Component {

    @property({type: [ShaderValueList]}) ShaderValueList:  Array<ShaderValueList> = []

    private mat: Material = null;

    private particle: ParticleSystem = null;

    private current: number = 0;

    private finished: boolean = false;

    private loopTime: number = 0;

    start () {

        this.unschedule(()=>this.onParticle());

        //this.scheduleOnce(()=>this.onParticle(),this.ShaderValueList[]);        

    }

    onEnable(){

        systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        
        const _particlar = this.getComponent(ParticleSystem);

        if(! _particlar){

            return;

        }

        const mat = _particlar.material;

        this.particle = _particlar;

        this.mat = mat;

        this.finished = true;
            
        this.loopTime = this.loopTime <= 0 ? 2 ^ 63 : this.loopTime;

    }

    onKeyDown(event: EventKeyboard) {

        if (event.keyCode == macro.KEY.l) {

        this.onParticle();

        }

    }

    private onParticle(){

        //this.delayTime = 0.0;

        this.finished = false;

    }

    update (deltaTime: number) {

        if(this.finished)return;

        if(this.mat){

            const pass = this.mat.passes[0];

            //pass.setUniform(pass.getHandle(this.ShaderNameIndex) , this.current );


        }

    }

}