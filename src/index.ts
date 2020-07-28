/**
 * @file rollup config
 * @author cxtom(cxtom2008@gmail.com)
 */

import {join} from 'path';
import batchdelcache from 'batchdelcache';

interface IFileMap {
    [fileName: string]: IFileMapItem;
}

type IFileMapItem = string | {
    key: string;
    parents?: string[];
};

export interface IOptions {

    /* 项目所在根目录 */
    context: string;

    /* 每个模块文件所对应的 md5 */
    fileMap: IFileMap;

    /* 过滤器，过滤需要 reload 的模块 */
    filter?: (file: string) => boolean;

    commonRootPath?: string;
}

interface IError {
    file: string;
    code: number;
}

export default class Reloader {

    context: string;
    fileMap: IFileMap = {};
    filter: (file: string) => boolean;
    commonRootPath: string;

    files: string[] = [];

    constructor(options: IOptions) {
        this.context = options.context;
        this.fileMap = {
            ...options.fileMap,
        };
        this.filter = (() => true);
        if (options.filter) {
            this.filter = options.filter;
        }
        this.commonRootPath = options.commonRootPath || '';
        this.updateFiles();
    }

    reload(newFileMap: IFileMap) {

        const reloadModules = new Set<string>();

        for (const [name, item] of Object.entries(newFileMap)) {
            const hasKey = name in this.fileMap;
            const md5 = this.getKey(item);
            if (hasKey && this.getKey(this.fileMap[name]) !== md5 && this.filter.call(this, name)) {
                const parents = this.getParents(item);
                if (parents.length > 0) {
                    parents.forEach(filename => reloadModules.add(join(this.context, filename)));
                }
                reloadModules.add(join(this.context, name));
            }
        }

        // 删除缓存
        batchdelcache(
            Array.from(reloadModules),
            true, this.commonRootPath
        );

        /* istanbul ignore next */
        if (typeof global.gc === 'function') {
            global.gc();
        }

        const errors: IError[] = [];
        for (const mod of reloadModules) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                require(mod);
            }
            catch (e) {
                errors.push({
                    file: mod,
                    code: 1,
                });
            }
        }

        this.updateFileMap(Object.assign(this.fileMap, newFileMap));

        return {
            reloadModules: Array.from(reloadModules),
            errors,
        };
    }

    updateFileMap(fileMap: IFileMap) {
        this.fileMap = fileMap;
        this.updateFiles();
    }

    private getKey(item: IFileMapItem): string {
        if (typeof item === 'string') {
            return item;
        }
        else if (item) {
            return item.key;
        }
        return '';
    }

    private getParents(item: IFileMapItem): string[] {
        if (typeof item === 'object' && item.parents) {
            return item.parents;
        }
        return [];
    }

    private updateFiles() {
        this.files = Object.keys(this.fileMap);
    }

}
