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
const sqlplus = require("../sqlplus/SQLPlus");
const m = require("./Module");
class SQLPlusInstaller {
    constructor(connectString) {
        this._connectString = connectString;
    }
    installFile(file, workingDir = null, args = [], input = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let opts = { workingDir: workingDir };
            return sqlplus(this._connectString, '@' + file, args, input, opts);
        });
    }
}
const SYS_CONNECT = "SYS/welcome-1@localhost:1531/MYPDB AS SYSDBA";
const DB_CONNECT = "TESt1/test1@localhost:1531/MYPDB";
//------------
let instSys = new SQLPlusInstaller(SYS_CONNECT);
let inst = new SQLPlusInstaller(DB_CONNECT);
let mo = m.testModule;
mo.install(inst);
//# sourceMappingURL=installer.js.map