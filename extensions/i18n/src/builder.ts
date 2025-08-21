import { IBuildPlugin } from '../@types/packages/builder/@types';

export function load() {}

export function unload() {}

export const configs: Record<string, IBuildPlugin> = {
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
