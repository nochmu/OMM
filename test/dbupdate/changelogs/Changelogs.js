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
const parseXML = require("../../../src/installer/dbupdate/ddl/parser/XMLParser");
const ASTParser_1 = require("../../../src/installer/dbupdate/ddl/parser/ASTParser");
const path = require("path");
const glob = require("glob");
describe('dbupdate.changelogs', function () {
    describe('simple', function () {
        let tests = glob.sync(__dirname + "/simple/*.xml");
        for (let testFile of tests) {
            let name = path.basename(testFile, '.xml');
            it(name, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    let abs = yield parseXML(testFile);
                    let res = yield ASTParser_1.default(abs);
                    let sql = res.renderSQL();
                    console.log("%s", sql);
                });
            });
        }
    });
});
//# sourceMappingURL=Changelogs.js.map