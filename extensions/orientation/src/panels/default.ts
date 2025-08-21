'use strict';

import { join } from 'path';
import { existsSync, readdirSync, rm } from 'fs';

const Vue = require('vue/dist/vue.common.prod');

const orientationContentTemplate = `
const win = window as any;

export const orientation = {
    // Data
    'designResolution' : {
        'width': 900,
        'height': 1600
    }
};

if (CC_EDITOR) {

    if (!win.orientation) {
        win.orientation = {};
    }

    win.orientation["{{name}}"] = orientation;
}
`;

// 兼容 3.3.0 之前的版本
Editor.Panel.define = Editor.Panel.define || function(options) {
    return options;
}

module.exports = Editor.Panel.define({
    template: `
    <div class="content">
        <header>
            <ui-button class="transparent add"
                @confirm="add()"
            >
                <ui-icon value="add"></ui-icon>
            </ui-button>
            <ui-button class="transparent refresh"
                @confirm="refresh()"
            >
                <ui-icon value="refresh"></ui-icon>
            </ui-button>
        </header>
        <section>
            <div
                v-for="item of list"
            >
                <ui-icon value="eye-open"
                    v-if="item === current"
                ></ui-icon>
                <ui-icon value="eye-close"
                    v-else
                    @click="select(item)"
                ></ui-icon>
                <span>{{item}}</span>
                <ui-icon class="option" value="del"
                    @click="del(item)"
                ></ui-icon>
            </div>

            <div
                v-if="showAddInput"
            >
                <ui-input ref="addInput"
                    @confirm="generateOrientationFile($event)"
                ></ui-input>
            </div>
        </section>
    <div>
    `,
    style: `
    :host { display: flex; padding: 6px; flex-direction: column; }
    :host .content { flex: 1; display: flex; flex-direction: column; }
    header { margin-bottom: 6px; }
    header > ui-button.refresh { float: right; }
    section { flex: 1; background: var(--color-normal-fill-emphasis); border-radius: calc( var(--size-normal-radius)* 1px); padding: 4px; }
    section > div { padding: 0 10px; }
    section > div > .slider { margin-right: 4px; }
    section > div > .option { float: right; display: none; }
    section > div > ui-icon { cursor: pointer; color: var(--color-warn-fill-normal); }
    section > div > ui-icon[value=eye-open] { color: var(--color-success-fill-normal); }
    section > div > ui-icon[value=del] { color: var(--color-danger-fill-normal); }
    section > div:hover { background: var(--color-normal-fill); border-radius: calc( var(--size-normal-radius)* 1px); }
    section > div:hover > .option { display: inline; }
    `,
    $: {
        content: '.content',
    },
    ready() {
        const vm = new Vue({
            el: this.$.content,
            data: {
                current: '',
                list: [],
                showAddInput: false,
            },
            watch: {
                current() {
                    const vm: any = this;
                    Editor.Message.send('scene', 'execute-scene-script', {
                        name: 'orientation',
                        method: 'changeCurrentOrientation',
                        args: [vm.current || ''],
                    });
                },
            },
            methods: {
                add() {
                    vm.showAddInput = true;
                    requestAnimationFrame(() => {
                        vm.$refs.addInput.focus();
                    });
                },
                select(orientation: string) {
                    vm.current = orientation;
                },
                async del(name: string) {
                    const result = await Editor.Dialog.info(`Make sure delete ${name} file?`, {
                        buttons: ['confirm', 'cancel'],
                        default: 0,
                        cancel: 1,
                    });
                    if (result.response === 0) {
                        await Editor.Message.request('asset-db', 'delete-asset', `db://assets/resources/orientation/${name}.ts`);
                        vm.refresh();
                    }
                },
                async refresh() {
                    const dir = join(Editor.Project.path, 'assets/resources/orientation');
                    if (!existsSync(dir)) {
                        return;
                    }
                    vm.current = await Editor.Message.request('scene', 'execute-scene-script', {
                        name: 'orientation',
                        method: 'queryCurrentOrientation',
                        args: [],
                    }) || '';
                    const names = readdirSync(dir);
                    vm.$set(vm, 'list', []);
                    names.forEach((name) => {
                        const orientation = name.replace(/\.[^\.]+$/, '');
                        if (!/\./.test(orientation)) {
                            vm.list.push(orientation);
                        }
                    });
                },
                async generateOrientationFile(event: Event) {
                    // @ts-ignore
                    const orientation = event.target.value;
                    if (!/[a-zA-Z]/.test(orientation)) {
                        console.warn(`File name can only use a-z A-Z, ${orientation} is illegal`);
                        return;
                    }

                    const orientationContent = orientationContentTemplate.replace(/{{name}}/g, orientation);
                    vm.showAddInput = false;

                    await Editor.Message.request('asset-db', 'create-asset', `db://assets/resources/orientation/${orientation}.ts`, orientationContent);
                    vm.refresh();
                }
            },
        });
        vm.refresh();
    },
});
