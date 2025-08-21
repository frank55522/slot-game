"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.unload = exports.load = void 0;
function load() { }
exports.load = load;
function unload() { }
exports.unload = unload;
exports.configs = {
    '*': {
        hooks: './hooks',
        options: {
            defaultLang: {
                label: 'i18n:i18n.buildPanel.title',
                description: 'i18n:i18n.buildPanel.title',
                default: 'en',
                render: {
                    ui: 'ui-input'
                }
            }
        }
    }
};
