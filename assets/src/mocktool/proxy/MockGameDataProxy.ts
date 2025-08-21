import { CoreGameDataProxy } from '../../core/proxy/CoreGameDataProxy';
import { MTTask } from '../vo/MTTask';
import { MockSFSProxy } from './MockSFSProxy';

/**
 * 切換mock資料的代理器，不會取代原有的GameDataProxy
 * 需先註冊MockSFSProxy
 */
export class MockGameDataProxy extends puremvc.Proxy {
    public static NAME: string = 'MockGameDataProxy';

    private rawSFSId: number;
    private rawBmd: number;

    private objGameDataProxy: CoreGameDataProxy;
    private objMockSFSProxy: MockSFSProxy;

    /**
     * 防止重覆使用mock()
     */
    private isMocked: boolean;

    public constructor() {
        super(MockGameDataProxy.NAME);

        this.isMocked = false;
    }

    protected get gameDataProxy(): CoreGameDataProxy {
        if (!this.objGameDataProxy) {
            this.objGameDataProxy = this.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
        }

        return this.objGameDataProxy;
    }

    protected get mockSFSProxy(): MockSFSProxy {
        if (!this.objMockSFSProxy) {
            this.objMockSFSProxy = this.facade.retrieveProxy(MockSFSProxy.NAME) as MockSFSProxy;
        }

        return this.objMockSFSProxy;
    }

    /**
     * 當模擬資料載完後啟動
     */
    public mock(): void {
        if (this.isMocked) return;

        this.isMocked = true;

        let sfsUser = this.gameDataProxy.extendNetworkData;
        if (sfsUser) {
            let sfUser = this.gameDataProxy.extendNetworkData as SFS2X.Entities.SFSUser;
            this.rawSFSId = sfUser.id;
        }

        this.rawBmd = this.gameDataProxy.bmd;

        let gameLoginTask: MTTask = this.mockSFSProxy.getTask('gameLoginReturn');
        if (gameLoginTask) {
            this.gameDataProxy.setBmd(gameLoginTask.data.balance, true);
        }

        let sfsDataTask: MTTask = this.mockSFSProxy.getTask('MOCK_SFS_DATA');
        if (sfsDataTask) {
            if (!this.gameDataProxy.extendNetworkData) {
                this.gameDataProxy.extendNetworkData = new SFS2X.Entities.SFSUser(sfsDataTask.data.sfsId, 'MockName');
            }
            let sfUser = this.gameDataProxy.extendNetworkData as SFS2X.Entities.SFSUser;
            sfUser.id = sfsDataTask.data.sfsId;
        }
    }

    /**
     * 恢復原始GameDataProxy
     */
    public recover(): void {
        if (!this.isMocked) return;

        this.isMocked = false;
        let sfUser = this.gameDataProxy.extendNetworkData as SFS2X.Entities.SFSUser;
        sfUser.id = this.rawSFSId;
        this.gameDataProxy.setBmd(this.rawBmd);
    }
}
