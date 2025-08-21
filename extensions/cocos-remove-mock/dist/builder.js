"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.unload = exports.load = void 0;
function load() {
}
exports.load = load;
function unload() {
}
exports.unload = unload;
exports.configs = {
    '*': {
        hooks: './hooks',
        options: {
            develop: {
                label: 'i18n:cocos-remove-mock.options.develop',
                default: false,
                render: {
                    ui: 'ui-checkbox'
                }
            }
        }
    },
};
