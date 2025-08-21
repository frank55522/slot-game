import { AssetInfo } from '../@types/packages/asset-db/@types/public';
import fs from 'fs';
import { join } from 'path';
import { IBuildTaskOption } from '../@types/packages/builder/@types';

const PACKAGE_NAME = 'brand';

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

export const throwError = true;

export async function load() {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
}

export async function onBeforeBuild(options: IBuildTaskOption) {
    await removeReference();
}

async function removeReference() {
    return new Promise<void>(async (resolve, reject) => {
        let assets: AssetInfo[] = [];
        await Editor.Message.request('asset-db', 'query-assets', {
            pattern: 'db://assets/**'
        }).then((infos) => Array.prototype.push.apply(assets, infos.filter(filterFn)));

        // await Editor.Message.request('asset-db', 'query-assets', {
        //     pattern: 'db://assets/scenes/**'
        // }).then((infos) => Array.prototype.push.apply(assets, infos.filter(filterFn)));
        // assets.forEach((data) => console.log(`asset : ${data.name} , ${data.type} , ${data.url}`));
        let path = join(Editor.Project.path, 'extensions/brand/assets/LocalizedBrandSprite.ts.meta');
        let rawData = fs.readFileSync(path, 'utf8');
        let data = JSON.parse(rawData);
        let uuid = Editor.Utils.UUID.compressUUID(data.uuid, false);
        // console.log(`uuid = ${uuid}, uuid compare : ${uuid == "c05c25C4xNAupWYMB93tIzp"}`);
        for (let i = 0; i < assets.length; i++) {
            await setNullToReference(uuid, assets[i]);
        }
        console.log(`${PACKAGE_NAME} removeReference end`);
        resolve();
    });
}

function filterFn(info: AssetInfo) {
    return info.type == 'cc.Prefab' || info.type == 'cc.SceneAsset';
}

async function setNullToReference(uuid: string, info: AssetInfo) {
    //db://assets/prefabs/Button.prefab
    let path = join(Editor.Project.path, info.url.slice(5));
    let data = fs.readFileSync(path, 'utf8');
    if (data.includes(uuid)) {
        let json = JSON.parse(data);
        // get all LocalizedBrandSprite
        const target = json.filter((element: { __type__: string }) => element.__type__ == uuid);

        for (let i = 0; i < target.length; i++) {
            const targetNodeID = target[i].node.__id__;
            json.find(
                (element: { __type__: string; node: { __id__: any } }) =>
                    element.__type__ == 'cc.Sprite' && element.node.__id__ == targetNodeID
            )._spriteFrame = null;
        }
        data = JSON.stringify(json);

        fs.writeFileSync(path, data, 'utf8');
        await Editor.Message.request('asset-db', 'reimport-asset', info.url);
    }
}

export function unload() {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
