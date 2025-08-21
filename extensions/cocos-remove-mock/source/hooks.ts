import { IBuildTaskOption } from '../@types';
import fs from 'fs';
import { join } from 'path';

interface IOptions {
    develop: boolean;
}

const PACKAGE_NAME = 'cocos-remove-mock';

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        'cocos-plugin-template': IOptions;
    };
}

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

export const throwError = true;

export async function onBeforeBuild(options: ITaskOptions) {
    // Todo some thing
    log(`${PACKAGE_NAME}.webTestOption`, 'onBeforeBuild');
    if (options.packages[PACKAGE_NAME].develop == false) {
        await deleteMock();
        await removeReference();
        await Editor.Message.request('asset-db', 'reimport-asset', options.startScene);
        await Editor.Message.request('asset-db', 'refresh-asset', options.startScene);
    }
}

async function deleteMock() {
    return new Promise<void>((resolve, reject) => {
        let path = join(Editor.Project.path, 'assets/src/core/utils/SceneManager.ts');
        fs.readFile(path, 'utf8', async (err, data) => {
            if (err) return reject(err);
            fs.writeFile(path, data.replace('instantiate(this.prefabMockTool).setParent(this.node);', ''), (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
}

async function removeReference() {
    return new Promise<void>((resolve, reject) => {
        let path = join(Editor.Project.path, 'assets/scenes/LoadScene.scene');
        fs.readFile(path, 'utf8', async (err, data) => {
            if (err) return reject(err);
            if (data.includes('bbdb3f2d-f9d4-46fd-b61b-e44579664e9f')) {
                const mockStartIndex = data.indexOf('prefabMockTool');
                const mockLeftIndex = data.indexOf('{', mockStartIndex);
                const mockRightIndex = data.indexOf('}', mockStartIndex);
                data = data
                    .slice(0, mockLeftIndex)
                    .concat('null')
                    .concat(data.slice(mockRightIndex + 1));
                fs.writeFile(path, data, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    });
}

export function unload() {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
