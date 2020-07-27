/**
 * @file rollup config
 * @author cxtom(cxtom2008@gmail.com)
 */

import {join} from 'path';
import batchdelcache from 'batchdelcache';

interface IFileMap {
    [fileName: string]: string;
}

interface IOptions {

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
        for (const [name, md5] of Object.entries(newFileMap)) {
            if (this.filter(name) && (name in this.fileMap) && this.fileMap[name] !== md5) {
                reloadModules.add(require.resolve(join(this.context, name)));
            }
        }
        batchdelcache(
            Array.from(reloadModules)
        );
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
        return errors;
    }

    updateFileMap(fileMap: IFileMap) {
        this.fileMap = fileMap;
        this.updateFiles();
    }

    private updateFiles() {
        this.files = Object.keys(this.fileMap);
    }

}
