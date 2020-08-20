/**
 * @file test case
 * @author cxtom(cxtom2008@gmail.com)
 */

import {resolve} from 'path';
import Reloader from '../src/index';
import {expect} from 'chai';
import batchdelcache from 'batchdelcache';
// import {symlinkSync, existsSync} from 'fs';

/**
 * Dummy test
 */
describe('Reloader test', () => {

    // before(() => {
    //     const lnPath = resolve(__dirname, './fixtures/lns.js');
    //     if (!existsSync(lnPath)) {
    //         symlinkSync(
    //             resolve(__dirname, './fixtures/mod3.js'),
    //             lnPath
    //         );
    //     }
    // });

    afterEach(() => {
        batchdelcache(['./fixtures/mainModule.js']);
    });

    it('reload success', () => {
        require('./fixtures/mainModule');

        const reloader = new Reloader({
            fileMap: {
                mod1: '1',
                mod2: '2',
            },
            context: resolve(__dirname, './fixtures'),
            commonRootPath: resolve(__dirname, './fixtures/mainModule.js'),
        });

        require('./fixtures/mod1').num++;
        require('./fixtures/mod2').num++;

        expect(require('./fixtures/mod1').num).to.be.equal(2);
        expect(require('./fixtures/mod2').num).to.be.equal(3);

        let {errors, reloadModules} = reloader.reload({
            mod1: '2',
        });

        expect(errors.length).to.be.equal(0);
        expect(reloadModules.length).to.be.equal(1);
        expect(require('./fixtures/mod1').num).to.be.equal(1);
        expect(require('./fixtures/mod2').num).to.be.equal(3);

        errors = reloader.reload({
            mod2: '3',
        }).errors;
        expect(require('./fixtures/mod1').num).to.be.equal(1);
        expect(require('./fixtures/mod2').num).to.be.equal(2);
    });

    it('reload all success', () => {
        require('./fixtures/mainModule');

        const reloader = new Reloader({
            context: resolve(__dirname, './fixtures'),
            commonRootPath: resolve(__dirname, './fixtures/mainModule.js'),
            filterAll: (id) => id.endsWith('fixtures/mod1.js')
        });

        require('./fixtures/mod1').num++;
        require('./fixtures/mod2').num++;

        expect(require('./fixtures/mod1').num).to.be.equal(2);
        expect(require('./fixtures/mod2').num).to.be.equal(3);

        let {errors, reloadModules} = reloader.reloadAll();

        expect(errors.length).to.be.equal(0);
        expect(reloadModules.length).to.be.equal(1);
        expect(require('./fixtures/mod1').num).to.be.equal(1);
        expect(require('./fixtures/mod2').num).to.be.equal(3);
    });

    it('reload success with parents', () => {
        require('./fixtures/mainModule');

        const reloader = new Reloader({
            fileMap: {
                mod3: {
                    key: '2',
                    parents: [
                        'mod2.js'
                    ]
                },
            },
            context: resolve(__dirname, './fixtures'),
            commonRootPath: resolve(__dirname, './fixtures/mainModule.js'),
        });

        require('./fixtures/mod2').num++;
        require('./fixtures/mod3').num++;

        expect(require('./fixtures/mod2').num).to.be.equal(3);
        expect(require('./fixtures/mod3').num).to.be.equal(4);

        let {errors, reloadModules} = reloader.reload({
            mod3: {
                key: '3',
                parents: [
                    'mod2.js'
                ]
            },
        });

        expect(errors.length).to.be.equal(0);
        expect(reloadModules.length).to.be.equal(2);
        expect(reloadModules.includes('mod2.js')).to.be.equal(true);
        expect(require('./fixtures/mod2').num).to.be.equal(2);
        expect(require('./fixtures/mod3').num).to.be.equal(3);

    });


});
