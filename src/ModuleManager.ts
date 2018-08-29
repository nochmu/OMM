import {URL} from "url";

const logger = require('lok');
import dbc = require('@noctaru/dbc') ;
import sqlplus = require('./sqlplus/SQLPlus');
import url  = require("url");
import util  = require("util");

/**
 * DAO
 */
export type OMMArgs = {
    user:string;
    password:string;
    database:string;
};

export class ModuleManager
{
    private _args:OMMArgs;

    constructor(args:OMMArgs)
    {
        this._args=args;


    }
    private _getDatabaseURL() : URL
    {
        let dbUrl = new URL('dbc+oracle://'+this._args.user+':'+this._args.password+'@'+this._args.database);
        return dbUrl;
    }

    private _getDataSource()
    {
        let dbUrl = this._getDatabaseURL();
        let args = {
            user     : dbUrl.username,
            password : dbUrl.password,
            host     : dbUrl.hostname,
            port     : dbUrl.port,
            database : dbUrl.pathname.substr(1)
        };
        if(args.user.toUpperCase() == 'SYS') {
            args['privilege'] = 'SYSDBA';
        }
        return dbc.createDataSource('oracle', args);
    }

    private async _dbQuery(sql:string, binds:object):Promise<dbc.ResultSet>
    {
        let ds = this._getDataSource();
        let prom = ds.query(sql,binds);
        return prom;
    }

    private _sqlplus_exe(sql:string, workingDir:string='./src/sql/')
    {
        let connectString = this._args.user+'/'+this._args.password+'@'+this._args.database;
        if(this._args.user.toUpperCase() == 'SYS')
            connectString += ' AS SYSDBA';

        return sqlplus(connectString, null,null, `
                WHENEVER SQLERROR EXIT SQL.SQLCODE;
                ${sql}
            `, {workingDir:workingDir});
    }


    async selfupdate()
    {
        let schema = "OMM";
        let user_exists = await this._dbQuery("SELECT count(*) user_count FROM all_users WHERE username = :u", {u:schema}).then(resultSet => {
            let res = resultSet.fetchObject()['USER_COUNT'];
            return (res == 1);
        });

        if(user_exists)
        {
            this._sqlplus_exe(`
                ALTER SESSION SET CURRENT_SCHEMA=omm;
                @registry
           `);

        }else
        {
            this._sqlplus_exe(`
                @create_user omm
           `);
        }

        return null;
    }
}




export default  ModuleManager;



