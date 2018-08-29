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
const url_1 = require("url");
const logger = require('lok');
const dbc = require("@noctaru/dbc");
const sqlplus = require("./sqlplus/SQLPlus");
class ModuleManager {
    constructor(args) {
        this._args = args;
    }
    _getDatabaseURL() {
        let dbUrl = new url_1.URL('dbc+oracle://' + this._args.user + ':' + this._args.password + '@' + this._args.database);
        return dbUrl;
    }
    _getDataSource() {
        let dbUrl = this._getDatabaseURL();
        let args = {
            user: dbUrl.username,
            password: dbUrl.password,
            host: dbUrl.hostname,
            port: dbUrl.port,
            database: dbUrl.pathname.substr(1)
        };
        if (args.user.toUpperCase() == 'SYS') {
            args['privilege'] = 'SYSDBA';
        }
        return dbc.createDataSource('oracle', args);
    }
    _dbQuery(sql, binds) {
        return __awaiter(this, void 0, void 0, function* () {
            let ds = this._getDataSource();
            let prom = ds.query(sql, binds);
            return prom;
        });
    }
    _sqlplus_exe(sql, workingDir = './src/sql/') {
        let connectString = this._args.user + '/' + this._args.password + '@' + this._args.database;
        if (this._args.user.toUpperCase() == 'SYS')
            connectString += ' AS SYSDBA';
        return sqlplus(connectString, null, null, `
                WHENEVER SQLERROR EXIT SQL.SQLCODE;
                ${sql}
            `, { workingDir: workingDir });
    }
    selfupdate() {
        return __awaiter(this, void 0, void 0, function* () {
            let schema = "OMM";
            let user_exists = yield this._dbQuery("SELECT count(*) user_count FROM all_users WHERE username = :u", { u: schema }).then(resultSet => {
                let res = resultSet.fetchObject()['USER_COUNT'];
                return (res == 1);
            });
            if (user_exists) {
                this._sqlplus_exe(`
                ALTER SESSION SET CURRENT_SCHEMA=omm;
                @registry
           `);
            }
            else {
                this._sqlplus_exe(`
                @create_user omm
           `);
            }
            return null;
        });
    }
}
exports.ModuleManager = ModuleManager;
exports.default = ModuleManager;
//# sourceMappingURL=ModuleManager.js.map