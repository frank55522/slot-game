"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const PACKAGE_NAME = 'brand';
function log(...arg) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
exports.throwError = true;
async function load() {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
}
exports.load = load;
async function onBeforeBuild(options) {
    await removeReference();
}
exports.onBeforeBuild = onBeforeBuild;
async function removeReference() {
    return new Promise(async (resolve, reject) => {
        let assets = [];
        await Editor.Message.request('asset-db', 'query-assets', {
            pattern: 'db://assets/**'
        }).then((infos) => Array.prototype.push.apply(assets, infos.filter(filterFn)));
        // await Editor.Message.request('asset-db', 'query-assets', {
        //     pattern: 'db://assets/scenes/**'
        // }).then((infos) => Array.prototype.push.apply(assets, infos.filter(filterFn)));
        // assets.forEach((data) => console.log(`asset : ${data.name} , ${data.type} , ${data.url}`));
        let path = (0, path_1.join)(Editor.Project.path, 'extensions/brand/assets/LocalizedBrandSprite.ts.meta');
        let rawData = fs_1.default.readFileSync(path, 'utf8');
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
function filterFn(info) {
    return info.type == 'cc.Prefab' || info.type == 'cc.SceneAsset';
}
async function setNullToReference(uuid, info) {
    //db://assets/prefabs/Button.prefab
    let path = (0, path_1.join)(Editor.Project.path, info.url.slice(5));
    let data = fs_1.default.readFileSync(path, 'utf8');
    if (data.includes(uuid)) {
        let json = JSON.parse(data);
        // get all LocalizedBrandSprite
        const target = json.filter((element) => element.__type__ == uuid);
        for (let i = 0; i < target.length; i++) {
            const targetNodeID = target[i].node.__id__;
            json.find((element) => element.__type__ == 'cc.Sprite' && element.node.__id__ == targetNodeID)._spriteFrame = null;
        }
        data = JSON.stringify(json);
        fs_1.default.writeFileSync(path, data, 'utf8');
        await Editor.Message.request('asset-db', 'reimport-asset', info.url);
    }
}
function unload() {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
exports.unload = unload;
