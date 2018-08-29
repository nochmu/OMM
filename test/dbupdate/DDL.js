"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var expect = require('chai').expect;
const ddl = require("../../src/installer/dbupdate/ddl/DDL");
const parseXML = require("../../src/installer/dbupdate/ddl/parser/XMLParser");
const ASTParser_1 = require("../../src/installer/dbupdate/ddl/parser/ASTParser");
describe('dbupdate.ddl', function () {
    describe('Fragments', function () {
        it('Column', function () {
            let s = new ddl.ColumnSpec('id', 'number');
            expect(s.renderSQL()).be.equal("id number");
        });
    });
    describe('Statements', function () {
        it('DROP TABLE', function () {
            let s = new ddl.DropTable('table1');
            expect(s.renderSQL()).be.equal('DROP TABLE table1;');
            s.cascadeConstraints = true;
            expect(s.renderSQL()).be.equal('DROP TABLE table1 CASCADE CONSTRAINTS;');
        });
        it('DROP SEQUENCE', function () {
            let s = new ddl.DropSequence('default_seq');
            expect(s.renderSQL()).be.equal('DROP SEQUENCE default_seq;');
        });
        describe('CREATE', function () {
            it('TABLE', function () {
                let s = new ddl.CreateTable('table1', [new ddl.ColumnSpec('id', 'number')]);
                expect(s.renderSQL()).be.equal("CREATE TABLE table1(id number);");
                s.columns.push(new ddl.ColumnSpec('key', 'varchar2(64)'));
                expect(s.renderSQL()).be.equal("CREATE TABLE table1(id number, key varchar2(64));");
            });
            it('SEQUENCE', function () {
                let s = new ddl.CreateSequence('default_seq');
                expect(s.renderSQL()).be.equal("CREATE SEQUENCE default_seq;");
            });
        });
        describe('ALTER TABLE', function () {
            it('ADD PRIMARY KEY', function () {
                let s = new ddl.AlterTableAddPrimaryKey('table1', 'table1_pk', ['column1', 'column2']);
                expect(s.renderSQL()).be.equal("ALTER TABLE table1 ADD CONSTRAINT table1_pk PRIMARY KEY(column1, column2);");
            });
            it('ADD UNIQUE', function () {
                let s = new ddl.AlterTableAddUnique('table1', "table1_uk", ['column1', 'column2']);
                expect(s.renderSQL()).be.equal("ALTER TABLE table1 ADD CONSTRAINT table1_uk UNIQUE(column1, column2);");
            });
            it('ADD CHECK', function () {
                let s = new ddl.AlterTableAddCheck('table1', "table1_nn", 'id IS NOT NULL');
                expect(s.renderSQL()).be.equal("ALTER TABLE table1 ADD CONSTRAINT table1_nn CHECK(id IS NOT NULL);");
            });
            it('ADD COLUMN', function () {
                let s = new ddl.AlterTableAddColumn('table1', new ddl.ColumnSpec('id', 'number'));
                expect(s.renderSQL()).be.equal("ALTER TABLE table1 ADD id number;");
            });
        });
        describe('COMMENT ON', function () {
            it('TABLE', function () {
                let s = new ddl.CommentOn('TABLE');
                s.objectName = 'table1';
                s.comment = 'a Comment';
                expect(s.renderSQL()).be.equal("COMMENT ON TABLE table1 IS 'a Comment';");
            });
            it('COLUMN', function () {
                let s = new ddl.CommentOn('COLUMN');
                s.objectName = 'table1.column1';
                s.comment = 'a Comment';
                expect(s.renderSQL()).be.equal("COMMENT ON COLUMN table1.column1 IS 'a Comment';");
            });
        });
    });
    it('ChangeSet', function () {
        let table = 'table1';
        let sql = [
            new ddl.AlterTableAddColumn(table, new ddl.ColumnSpec('id', 'number')),
            new ddl.AlterTableAddColumn(table, new ddl.ColumnSpec('key', 'varchar2(64)')),
            new ddl.AlterTableAddPrimaryKey(table, 'table1_pk', ['id']),
            new ddl.AlterTableAddCheck(table, "table1_nn", 'key IS NOT NULL')
        ];
        let changeSet = new ddl.ChangeSet('test');
        changeSet.addChanges(...sql);
        expect(changeSet.renderSQL()).to.be.equal([
            "ALTER TABLE table1 ADD id number;",
            "ALTER TABLE table1 ADD key varchar2(64);",
            "ALTER TABLE table1 ADD CONSTRAINT table1_pk PRIMARY KEY(id);",
            "ALTER TABLE table1 ADD CONSTRAINT table1_nn CHECK(key IS NOT NULL);"
        ].join("\n"));
    });
    describe('Parser', function () {
        it('XML', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let res = yield parseXML(__dirname + '/changelogs/test1.xml');
                console.log("res:%o", res);
            });
        });
        it('ABS', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let abs = yield parseXML(__dirname + '/changelogs/test1.xml');
                let res = yield ASTParser_1.default(abs);
                let sql = res.renderSQL();
                console.log("SQL:\n%s", sql);
            });
        });
    });
});
//# sourceMappingURL=DDL.js.map