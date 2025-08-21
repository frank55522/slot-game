"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const autoAtlasContent = `{
    "__type__": "cc.SpriteAtlas"
}`;
const PACKAGE_NAME = 'i18n';
const languagePath = `db://assets/art/language`;
function log(...arg) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
exports.throwError = true;
async function load() {
    log(`Load cocos plugin example in builder.`);
}
exports.load = load;
//#region onBeforeBuild
async function onBeforeBuild(options) {
    log(`onBeforeBuild`);
    await removeReference();
    await fixSpineImageMeta();
    await fillResources(options.packages[PACKAGE_NAME].defaultLang);
}
exports.onBeforeBuild = onBeforeBuild;
async function removeReference() {
    return new Promise(async (resolve, reject) => {
        let metaData = await fs_1.default.readFileSync((0, path_1.join)(Editor.Project.path, 'extensions/i18n/assets/LocalizedSprite.ts.meta'), 'utf8');
        let localizedSpriteUuid = Editor.Utils.UUID.compressUUID(JSON.parse(metaData).uuid, false);
        metaData = await fs_1.default.readFileSync((0, path_1.join)(Editor.Project.path, 'extensions/i18n/assets/LocalizedSkeleton.ts.meta'), 'utf8');
        let localizedSkeletonUuid = Editor.Utils.UUID.compressUUID(JSON.parse(metaData).uuid, false);
        let assets = [];
        await Editor.Message.request('asset-db', 'query-assets', {
            pattern: 'db://assets/**'
        }).then((infos) => Array.prototype.push.apply(assets, infos.filter(filterFn)));
        await Editor.Message.request('asset-db', 'query-assets', {
            pattern: 'db://common-ui/**'
        }).then((infos) => Array.prototype.push.apply(assets, infos.filter(filterFn)));
        for (let i = 0; i < assets.length; i++) {
            await setNullToReference(assets[i], localizedSpriteUuid, localizedSkeletonUuid);
        }
        log(`removeReference end`);
        resolve();
    });
}
function filterFn(info) {
    return info.type == 'cc.Prefab' || info.type == 'cc.SceneAsset';
}
async function setNullToReference(info, localizedSpriteUuid, localizedSkeletonUuid) {
    let path = info.file;
    let data = fs_1.default.readFileSync(path, 'utf8');
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
        fs_1.default.writeFileSync(path, data, 'utf8');
        await Editor.Message.request('asset-db', 'reimport-asset', info.url);
    }
}
function removeSpriteReference(data, uuid) {
    var _a;
    let json = JSON.parse(data);
    // get all LocalizedSprite
    const target = json.filter((element) => element.__type__ == uuid);
    for (let i = 0; i < target.length; i++) {
        const targetNodeID = (_a = target[i].node) === null || _a === void 0 ? void 0 : _a.__id__;
        if (targetNodeID) {
            json.find((element) => element.__type__ == 'cc.Sprite' && element.node.__id__ == targetNodeID)._spriteFrame = null;
        }
    }
    return JSON.stringify(json);
}
function removeSkeletonReference(data, uuid) {
    let json = JSON.parse(data);
    // get all LocalizedSkeleton
    while (true) {
        let target = json.find((element) => element.__type__ == uuid && element._skeletonData != null);
        if (target) {
            target._skeletonData = null;
        }
        else {
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
    let spinePaths = Array.from(await Editor.Message.request('asset-db', 'query-assets', {
        pattern: 'db://assets/**',
        ccType: 'sp.SkeletonData'
    }), (info) => info.path);
    for (let info of imageInfos) {
        if (checkSpinePath(info.path, spinePaths) != '') {
            let metaFile = `${info.file}.meta`;
            let metaData = fs_1.default.readFileSync(metaFile, 'utf8').replace(/"packable"\s*:\s*true\s*/, `"packable": false`);
            fs_1.default.writeFileSync(metaFile, metaData, 'utf8');
            await Editor.Message.request('asset-db', 'reimport-asset', info.url);
        }
    }
}
async function fillResources(defaultLang) {
    const sourcePath = `${languagePath}/${defaultLang}/**`;
    let sources = await Editor.Message.request('asset-db', 'query-assets', {
        pattern: sourcePath
    });
    //${path}.skel ${path}.atlas ${path}.png ${path}2.png ....
    let spinePaths = Array.from(await Editor.Message.request('asset-db', 'query-assets', {
        pattern: sourcePath,
        ccType: 'sp.SkeletonData'
    }), (info) => info.path);
    const languages = Array.from(await Editor.Message.request('asset-db', 'query-assets', {
        pattern: `${languagePath}/**`,
        isBundle: true
    }), (info) => info.name);
    for (const lang of languages) {
        await fillAutoAtlas(lang);
        if (lang != defaultLang) {
            await fillTargetResource(sources, spinePaths, defaultLang, lang);
        }
    }
}
async function fillTargetResource(sources, spinePaths, defaultLang, targetLang) {
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
        }
        else {
            await Editor.Message.request('asset-db', 'copy-asset', source, target);
        }
    }
}
function checkSpinePath(fullPath, spinePaths) {
    for (let path of spinePaths) {
        if (fullPath.startsWith(path)) {
            return path;
        }
    }
    return '';
}
async function isExist(path) {
    return (await Editor.Message.request('asset-db', 'query-asset-info', path)) != null;
}
async function fillAutoAtlas(lang) {
    const autoAtlas = await Editor.Message.request('asset-db', 'query-assets', {
        pattern: `${languagePath}/${lang}/**`,
        ccType: 'cc.SpriteAtlas'
    });
    if (autoAtlas.length == 0) {
        await Editor.Message.request('asset-db', 'create-asset', `db://assets/art/language/${lang}/auto-atlas.pac`, autoAtlasContent);
    }
}
//#endregion
function unload() {
    log(`Unload cocos plugin example in builder.`);
}
exports.unload = unload;
