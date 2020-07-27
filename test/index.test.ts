/**
 * @file test case
 * @author cxtom(cxtom2008@gmail.com)
 */

import {resolve} from 'path';
import Reloader from '../src/index';
import {expect} from 'chai';

/**
 * Dummy test
 */
describe('Reloader test', () => {

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

        let errors = reloader.reload({
            mod1: '2',
        });

        expect(errors.length).to.be.equal(0);
        expect(require('./fixtures/mod1').num).to.be.equal(1);
        expect(require('./fixtures/mod2').num).to.be.equal(3);

        errors = reloader.reload({
            mod2: '3',
        });
        expect(require('./fixtures/mod1').num).to.be.equal(1);
        expect(require('./fixtures/mod2').num).to.be.equal(2);
    });


});
