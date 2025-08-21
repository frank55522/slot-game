import { AssetInfo } from '../@types/packages/asset-db/@types/public';
import fs from 'fs';
import { join } from 'path';
import { IBuildResult, IBuildTaskOption } from '../@types/packages/builder/@types';

const autoAtlasContent = `{
    "__type__": "cc.SpriteAtlas"
}`;

interface IOptions {
    defaultLang: string;
}

const PACKAGE_NAME = 'i18n';
const languagePath = `db://assets/art/language`;

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        i18n: IOptions;
    };
}

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

export const throwError = true;

export async function load() {
    log(`Load cocos plugin example in builder.`);
}

//#region onBeforeBuild
export async function onBeforeBuild(options: ITaskOptions) {
    log(`onBeforeBuild`);
    await removeReference();
    await fixSpineImageMeta();
    await fillResources(options.packages[PACKAGE_NAME].defaultLang);
}

async function removeReference() {
    return new Promise<void>(async (resolve, reject) => {
        let metaData = await fs.readFileSync(
            join(Editor.Project.path, 'extensions/i18n/assets/LocalizedSprite.ts.meta'),
            'utf8'
        );
        let localizedSpriteUuid = Editor.Utils.UUID.compressUUID(JSON.parse(metaData).uuid, false);

        metaData = await fs.readFileSync(
            join(Editor.Project.path, 'extensions/i18n/assets/LocalizedSkeleton.ts.meta'),
            'utf8'
        );
        let localizedSkeletonUuid = Editor.Utils.UUID.compressUUID(JSON.parse(metaData).uuid, false);

        let assets: AssetInfo[] = [];
        await Editor.Message.request('asset-db', 'query-assets', {
            pattern: 'db://assets/**'
        }).then((infos) => Array.prototype.push.apply(assets, infos.filter(filterFn)));

        for (let i = 0; i < assets.length; i++) {
            await setNullToReference(assets[i], localizedSpriteUuid, localizedSkeletonUuid);
        }
        log(`removeReference end`);
        resolve();
    });
}

function filterFn(info: AssetInfo) {
    return info.type == 'cc.Prefab' || info.type == 'cc.SceneAsset';
}

async function setNullToReference(info: AssetInfo, localizedSpriteUuid: string, localizedSkeletonUuid: string) {
    let path = join(Editor.Project.path, info.url.replace('db://', ''));
    let data = fs.readFileSync(path, 'utf8');
    let needToSave = false;
    if (data.includes(localizedSpriteUuid)) {
        data = removeSpriteReference(data, localizedSpriteUuid);
        needToSave = true;
    }

    if (data.includes(localizedSkeletonUuid)) {
        data = removeSkeletonReference(data, localizedSkeletonUuid);
        needToSave = true;
    }

    if (needToSave) {
        fs.writeFileSync(path, data, 'utf8');
        await Editor.Message.request('asset-db', 'reimport-asset', info.url);
    }
}

function removeSpriteReference(data: string, uuid: string) {
    let json = JSON.parse(data);
    // get all LocalizedSprite
    const target = json.filter((element: { __type__: string }) => element.__type__ == uuid);

    for (let i = 0; i < target.length; i++) {
        const targetNodeID = target[i].node?.__id__;
        if (targetNodeID) {
            json.find(
                (element: { __type__: string; node: { __id__: any } }) =>
                    element.__type__ == 'cc.Sprite' && element.node.__id__ == targetNodeID
            )._spriteFrame = null;
        }
    }
    return JSON.stringify(json);
}

function removeSkeletonReference(data: string, uuid: string) {
    let json = JSON.parse(data);
    // get all LocalizedSkeleton
    while (true) {
        let target = json.find(
            (element: { __type__: string; _skeletonData: string }) =>
                element.__type__ == uuid && element._skeletonData != null
        );
        if (target) {
            target._skeletonData = null;
        } else {
            break;
        }
    }
    return JSON.stringify(json);
}

async function fixSpineImageMeta() {
    let imageInfos = await Editor.Message.request('asset-db', 'query-assets', {
        pattern: 'db://assets/**',
        ccType: 'cc.ImageAsset'
    });

    let spinePaths = Array.from(
        await Editor.Message.request('asset-db', 'query-assets', {
            pattern: 'db://assets/**',
            ccType: 'sp.SkeletonData'
        }),
        (info) => info.path
    );

    for (let info of imageInfos) {
        if (checkSpinePath(info.path, spinePaths) != '') {
            let metaFile = `${info.file}.meta`;
            let metaData = fs.readFileSync(metaFile, 'utf8').replace(/"packable"\s*:\s*true\s*/, `"packable": false`);
            fs.writeFileSync(metaFile, metaData, 'utf8');
            await Editor.Message.request('asset-db', 'reimport-asset', info.url);
        }
    }
}

async function fillResources(defaultLang: string) {
    const sourcePath = `${languagePath}/${defaultLang}/**`;
    let sources = await Editor.Message.request('asset-db', 'query-assets', {
        pattern: sourcePath
    });

    //${path}.skel ${path}.atlas ${path}.png ${path}2.png ....
    let spinePaths = Array.from(
        await Editor.Message.request('asset-db', 'query-assets', {
            pattern: sourcePath,
            ccType: 'sp.SkeletonData'
        }),
        (info) => info.path
    );

    const languages = Array.from(
        await Editor.Message.request('asset-db', 'query-assets', {
            pattern: `${languagePath}/**`,
            isBundle: true
        }),
        (info) => info.name
    );

    for (const lang of languages) {
        await fillAutoAtlas(lang);
        if (lang != defaultLang) {
            await fillTargetResource(sources, spinePaths, defaultLang, lang);
        }
    }
}

async function fillTargetResource(sources: AssetInfo[], spinePaths: string[], defaultLang: string, targetLang: string) {
    // xxx.skel xxx.atlas xxx.png xxx2.png ...
    for (let i = 0; i < sources.length; i++) {
        const source = sources[i].source;
        //ignore auto-atlas
        if (source.endsWith('.pac')) {
            continue;
        }
        const target = source.replace(`/${defaultLang}/`, `/${targetLang}/`);
        if (await isExist(target)) {
            let spinePath = checkSpinePath(source, spinePaths);
            if (spinePath != '') {
                const lastSpine = sources.filter((info) => info.source.startsWith(spinePath)).slice(-1)[0];
                i = sources.indexOf(lastSpine);
            }
        } else {
            await Editor.Message.request('asset-db', 'copy-asset', source, target);
        }
    }
}

function checkSpinePath(fullPath: string, spinePaths: string[]) {
    for (let path of spinePaths) {
        if (fullPath.startsWith(path)) {
            return path;
        }
    }
    return '';
}

async function isExist(path: string) {
    return (await Editor.Message.request('asset-db', 'query-asset-info', path)) != null;
}

async function fillAutoAtlas(lang: string) {
    const autoAtlas = await Editor.Message.request('asset-db', 'query-assets', {
        pattern: `${languagePath}/${lang}/**`,
        ccType: 'cc.SpriteAtlas'
    });
    if (autoAtlas.length == 0) {
        await Editor.Message.request(
            'asset-db',
            'create-asset',
            `db://assets/art/language/${lang}/auto-atlas.pac`,
            autoAtlasContent
        );
    }
}
//#endregion

export function unload() {
    log(`Unload cocos plugin example in builder.`);
}
