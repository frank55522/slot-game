import { director } from 'cc';
import { BaseLocalized } from './BaseLocalized';
import { LocalizedSkeleton } from './LocalizedSkeleton';

export const _default = 'en';
export let _language = _default;
export let _version;

export let ready: boolean = false;

/**
 * 初始化
 * @param lang
 */
export function initLanguage(lang: string) {
    _language = getSupportedLanguage(lang);
}

export function init(mType: number) {
    ready = true;
    _version = String(mType).charAt(1) === '1' ? 'omni' : 'online';
    updateSceneRenderers();
}

export function getSupportedLanguage(language: string) {
    if (win.languages) {
        if (win.languages[language]) {
            return language;
        }
        let lang = language.replace(/-[^-]+$/, '');
        if (win.languages[lang]) {
            console.warn(`${language} is not supported and will automatically switch to ${lang}.`);
            return lang;
        } else {
            return _default;
        }
    }
    throw new Error('No Language Support');
}

/**
 * 翻译数据
 * @param key
 */
export function t(key: string, param?: any) {
    const win: any = window;

    if (!win.languages) {
        return key;
    }
    const searcher = key.split('.');

    let data = win.languages[_language];
    for (let i = 0; i < searcher.length; i++) {
        data = data[searcher[i]];
        if (!data) {
            return '';
        }
    }
    return stringInterpolation(data, param) || '';
}

export function stringInterpolation(text: string, param?: any) {
    if (param) {
        let embed = '';
        let keys = Object.keys(param);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = param[key];
            embed = embed.concat(`const ${key} = '${value}';`);
        }
        text = Function(`${embed}return (\`${text}\`)`)();
    }
    return text;
}

export function updateSceneRenderers() {
    const allLocalizedObjects: any[] = [];

    Array.prototype.push.apply(allLocalizedObjects, director.getScene().getComponentsInChildren(LocalizedSkeleton));
    Array.prototype.push.apply(allLocalizedObjects, director.getScene().getComponentsInChildren(BaseLocalized));

    for (let i = 0; i < allLocalizedObjects.length; i++) {
        allLocalizedObjects[i].localize?.();
    }
}

export function clearRef() {
    const allLocalizedObjects: any[] = [];

    Array.prototype.push.apply(allLocalizedObjects, director.getScene().getComponentsInChildren(LocalizedSkeleton));
    Array.prototype.push.apply(allLocalizedObjects, director.getScene().getComponentsInChildren(BaseLocalized));

    for (let i = 0; i < allLocalizedObjects.length; i++) {
        allLocalizedObjects[i].clearRef?.();
    }
}

// 供插件查询当前语言使用
const win = window as any;
win._languageData = {
    get language() {
        return _language;
    },
    init(lang: string) {
        initLanguage(lang);
    },
    getSupportedLanguage(lang: string) {
        return getSupportedLanguage(lang);
    },
    updateSceneRenderers() {
        updateSceneRenderers();
    },
    clearRef() {
        clearRef();
    }
};
