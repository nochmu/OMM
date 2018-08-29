import {spawn,ChildProcess, SpawnOptions} from 'child_process';
import  logger = require('lok');
logger.setLevel('trace');

function findExecutable(){
    return "sqlplus";
}
const SQLPLUS_EXE = findExecutable();


class SQLPlusCall
{
    /** SQL*Plus Executable */
    sqlplus_exe : string = SQLPLUS_EXE;

    /** -S
     * suppresses the display of the SQL*Plus banner, prompts, and echoing of commands.
     */
    silent     : boolean = true;

    /** -L
     *  Attempts to log on just once, instead of reprompting on error.
     */
    noReprompt : boolean = true;

    /** -R <level>
     * disable SQL*Plus commands that interact with the file system.
     * The most restrictive is  3 which disables all user commands interacting with the file system.
     */
    restricted : (false|1|2|3) = false;

    /** -M "<options>"
     * Sets automatic HTML or CSV markup of output.
     * The options have the form: {HTML html_options|CSV csv_options}
     * See SQL*Plus User's Guide for detailed HTML and CSV options.
     * */
    markup : string = null;

    /** -NOLOGINTIME
     *  Don't display Last Successful Login Time.
     */
    noLogintime : boolean = true;

    /**
     *   <logon> is: {<username>[/<password>][@<connect_identifier>] | / }[AS {SYSDBA | SYSOPER | SYSASM | SYSBACKUP | SYSDG | SYSKM | SYSRAC}] [EDITION=value]
     */
    logon : string = null;

    /**
     *  <start> is: @<URL>|<filename>[.<ext>] [<parameter> ...]
     */
    start : string = null;
    start_args : string[];


    getStartScript():string
    {
        if(this.start !== null)
            return this.start;
        else
            return '@'+__dirname +'/null';
    }

    setLogon(logon:string) :void
    {
        this.logon = logon;
    }

    getCommand() : string
    {
        return this.sqlplus_exe;
    }

    getCLIArgs() : string[]
    {
        let cmdArgs : string[] = [];
        if(this.silent) cmdArgs.push('-S');
        if(this.noReprompt) cmdArgs.push('-L');
        if(this.markup) cmdArgs.push('-M', this.markup);
        if(this.noLogintime) cmdArgs.push('-NOLOGINTIME');
        if(this.restricted > 0 ) cmdArgs.push('-R '+this.restricted);
        if(!this.logon)
            throw new Error('missing <logon>');
        else
            cmdArgs.push(this.logon);

        cmdArgs.push(this.getStartScript());

        if(this.start_args){
            cmdArgs.push(...this.start_args);
        }
        return cmdArgs;
    }

    spawnOptions : SpawnOptions = {
        stdio:['pipe', 1, 2],
    };
    stdin : string;

    setInput(input:string)
    {
        this.stdin = input;
    }
    getInput():string
    {
        if(this.stdin === null)
            return '';
        else
            return this.stdin;
    }

    setWorkingDir(path:string)
    {
        this.spawnOptions.cwd = path;
    }


    spawnProcess():ChildProcess
    {
        logger.trace(this.toString());
        let proc:ChildProcess = spawn(this.getCommand(),this.getCLIArgs(), this.spawnOptions);
        proc.stdin.write(this.getInput());
        proc.stdin.end();
        return proc;
    }

    toString() : string
    {
        let cmd = this.getCommand();
        let args = this.getCLIArgs().map(e=>`"${e}"`).join(" ");
        return `${cmd} ${args}`;
    }
}

function normalizeArray()
{

}

class SQLPlusCLIArgs
{
    workingDir?: string;
    start?: string;
    args?:string[]
}

function sqlplus_cli(logon:string, startFile:string=null, args:string[]=[], input:string='', opts:SQLPlusCLIArgs={}) : Promise<any>
{
    let wrapper = new SQLPlusCall();
    wrapper.setLogon(logon);
    wrapper.setInput(input);
    wrapper.start = startFile;
    wrapper.start_args = args;
    if(opts)
    {
        if(opts['workingDir'])
        {
            wrapper.setWorkingDir(opts.workingDir);
        }
    }

    let proc = wrapper.spawnProcess();

    let prom = new Promise((resolve, reject) => {
        let error = null;
        proc.on('error', (err) => {
             error = err;
        });
        proc.on('exit', (code,signal) => {
            if(error)  reject(error);
            else if(signal !== null) reject(signal);
            else if(code > 0) reject(code);
            else
                resolve(code);
        });
    })
    return prom;
}


export  = sqlplus_cli;
