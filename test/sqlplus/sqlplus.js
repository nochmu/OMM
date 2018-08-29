"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
var expect = require('chai').expect;
const sqlplus = require("../../src/sqlplus/SQLPlus");
const DB_CONNECT = "SYS/welcome-1@localhost:1531/MYPDB AS SYSDBA";
describe('SQLPlus', function () {
    describe('misc', function () {
        it('test1', function (done) {
            sqlplus(DB_CONNECT, null, [], `
                WHENEVER SQLERROR EXIT SQL.SQLCODE;
                @echo 'Hello World!'
            `, { workingDir: 'test/sqlplus' }).then(done).catch(assert.fail);
        });
    });
    describe('scriptFile', function () {
        it('t1', function (done) {
            sqlplus(DB_CONNECT, null, ["Gut!"], [
                'WHENEVER OSERROR  EXIT FAILURE;',
                'WHENEVER SQLERROR EXIT SQL.SQLCODE;',
                '@echo &1;',
            ].join("\n"), { workingDir: 'test/sqlplus' }).then(done).catch(assert.fail);
        });
    });
    describe('Error Handling', function () {
        it('should fail if SQLError', function (done) {
            let prom = sqlplus(DB_CONNECT, null, [], `
                    WHENEVER SQLERROR EXIT SQL.SQLCODE;
                    SELECT 1/0 FROM DUAL; 
                `, {});
            prom.then((res) => {
                assert.fail("expected error, result:" + res);
            }, (err) => {
                done();
            });
        });
        it('should fail if OSError', function (done) {
            let prom = sqlplus(DB_CONNECT, null, [], `
                    WHENEVER OSERROR EXIT FAILURE;
                    START no_such_file
                `, {});
            prom.then((res) => {
                assert.fail("expected error, result:" + res);
            }, (err) => {
                done();
            });
        });
        it('should not fail if no error', function (done) {
            let prom = sqlplus(DB_CONNECT, null, [], `
                    WHENEVER SQLERROR EXIT SQL.SQLCODE;
                    SELECT 1/1 FROM DUAL; 
                `, {});
            prom.then((res) => {
                done();
            }, (err) => {
                assert.fail("expected success, result:" + err);
            });
        });
    });
    describe('opts.workingDir', function () {
        it('is not given: parent dir', function (done) {
            sqlplus(DB_CONNECT, null, [], `
                WHENEVER SQLERROR EXIT SQL.SQLCODE;
                @test/sqlplus/hello_world
            `, {}).then(done).catch(assert.fail);
        });
        it('is given: should change the workingDir', function (done) {
            let doneCount = 2;
            function finish() {
                doneCount--;
                if (doneCount <= 0) {
                    done();
                }
            }
            sqlplus(DB_CONNECT, null, [], `
                WHENEVER SQLERROR EXIT SQL.SQLCODE;
                @sqlplus/hello_world
            `, { workingDir: 'test/' }).then(finish).catch(assert.fail);
            sqlplus(DB_CONNECT, null, [], `
                WHENEVER SQLERROR EXIT SQL.SQLCODE;
                @hello_world
            `, { workingDir: 'test/sqlplus/' }).then(finish).catch(assert.fail);
        });
    });
});
//# sourceMappingURL=sqlplus.js.map