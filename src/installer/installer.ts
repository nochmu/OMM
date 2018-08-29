import sqlplus = require('../sqlplus/SQLPlus');
import path = require("path");
import * as m from './Module';

export interface FileInstaller
{
    installFile( file:string,workingDir:string, args:[], input:string);
}

export interface Installer extends FileInstaller
{

}

class SQLPlusInstaller implements Installer
{
    private _connectString;
    constructor(connectString:string)
    {
        this._connectString = connectString;

    }

    async installFile( file:string,workingDir:string=null, args:[]=[], input:string=null)
    {
        let opts = {workingDir:workingDir};
        return sqlplus(this._connectString,'@'+file,args,input,opts);
    }

}

const SYS_CONNECT="SYS/welcome-1@localhost:1531/MYPDB AS SYSDBA";
const DB_CONNECT="TESt1/test1@localhost:1531/MYPDB";


//------------
let instSys = new SQLPlusInstaller(SYS_CONNECT);
let inst = new SQLPlusInstaller(DB_CONNECT);


let mo = m.testModule;
mo.install(inst);