import fs from "fs";
import { join } from "path";
import path from "path";
// import packageJSON from './package.json';

const PACKAGE_NAME = "meta-fixer";

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
  fixMeta() {

    let path = join(Editor.Project.path, "assets");
    walk(path, (err, results) => {
      results?.forEach(deleteMismatchMetaFile);
    });
  },
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export const load = function () {};

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function () {};

const walk = (
  dir: string,
  done: (err: Error | null, results?: string[]) => void,
  filter?: (f: string) => boolean
) => {
  let results: string[] = [];
  fs.readdir(dir, (err: Error | null, list: string[]) => {
    if (err) {
      return done(err);
    }
    let pending = list.length;
    if (!pending) {
      return done(null, results);
    }
    list.forEach((file: string) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err2, stat) => {
        if (typeof filter === "undefined" || (filter && filter(file))) {
          results.push(file);
        }
        if (stat.isDirectory()) {
          walk(
            file,
            (err3, res) => {
              if (res) {
                results = results.concat(res);
              }
              if (!--pending) {
                done(null, results);
              }
            },
            filter
          );
        } else {
          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  });
};

const deleteMismatchMetaFile = (
  result: string,
  index: number,
  results: string[]
) => {
  if (result.endsWith(".meta")) {
    if (results.includes(result.slice(0, -5)) == false) {
      fs.unlink(result, (err) => {
        if (err) throw err;
        console.log(`${result} was deleted`);
      });
    }
  }
};
