"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const path_2 = __importDefault(require("path"));
// import packageJSON from './package.json';
const PACKAGE_NAME = "meta-fixer";
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    fixMeta() {
        let path = (0, path_1.join)(Editor.Project.path, "assets");
        walk(path, (err, results) => {
            results === null || results === void 0 ? void 0 : results.forEach(deleteMismatchMetaFile);
        });
    },
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
const load = function () { };
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
const unload = function () { };
exports.unload = unload;
const walk = (dir, done, filter) => {
    let results = [];
    fs_1.default.readdir(dir, (err, list) => {
        if (err) {
            return done(err);
        }
        let pending = list.length;
        if (!pending) {
            return done(null, results);
        }
        list.forEach((file) => {
            file = path_2.default.resolve(dir, file);
            fs_1.default.stat(file, (err2, stat) => {
                if (typeof filter === "undefined" || (filter && filter(file))) {
                    results.push(file);
                }
                if (stat.isDirectory()) {
                    walk(file, (err3, res) => {
                        if (res) {
                            results = results.concat(res);
                        }
                        if (!--pending) {
                            done(null, results);
                        }
                    }, filter);
                }
                else {
                    if (!--pending) {
                        done(null, results);
                    }
                }
            });
        });
    });
};
const deleteMismatchMetaFile = (result, index, results) => {
    if (result.endsWith(".meta")) {
        if (results.includes(result.slice(0, -5)) == false) {
            fs_1.default.unlink(result, (err) => {
                if (err)
                    throw err;
                console.log(`${result} was deleted`);
            });
        }
    }
};
