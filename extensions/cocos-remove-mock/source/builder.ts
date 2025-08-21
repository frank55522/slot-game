
import { IBuildPlugin } from '../@types';

export function load() {
    
}

export function unload() {
    
}

export const configs: Record<string, IBuildPlugin> = {
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
