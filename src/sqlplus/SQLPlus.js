"use strict";
const child_process_1 = require("child_process");
const logger = require("lok");
logger.setLevel('trace');
function findExecutable() {
    return "sqlplus";
}
const SQLPLUS_EXE = findExecutable();
class SQLPlusCall {
    constructor() {
        /** SQL*Plus Executable */
        this.sqlplus_exe = SQLPLUS_EXE;
        /** -S
         * suppresses the display of the SQL*Plus banner, prompts, and echoing of commands.
         */
        this.silent = true;
        /** -L
         *  Attempts to log on just once, instead of reprompting on error.
         */
        this.noReprompt = true;
        /** -R <level>
         * disable SQL*Plus commands that interact with the file system.
         * The most restrictive is  3 which disables all user commands interacting with the file system.
         */
        this.restricted = false;
        /** -M "<options>"
         * Sets automatic HTML or CSV markup of output.
         * The options have the form: {HTML html_options|CSV csv_options}
         * See SQL*Plus User's Guide for detailed HTML and CSV options.
         * */
        this.markup = null;
        /** -NOLOGINTIME
         *  Don't display Last Successful Login Time.
         */
        this.noLogintime = true;
        /**
         *   <logon> is: {<username>[/<password>][@<connect_identifier>] | / }[AS {SYSDBA | SYSOPER | SYSASM | SYSBACKUP | SYSDG | SYSKM | SYSRAC}] [EDITION=value]
         */
        this.logon = null;
        /**
         *  <start> is: @<URL>|<filename>[.<ext>] [<parameter> ...]
         */
        this.start = null;
        this.spawnOptions = {
            stdio: ['pipe', 1, 2],
        };
    }
    getStartScript() {
        if (this.start !== null)
            return this.start;
        else
            return '@' + __dirname + '/null';
    }
    setLogon(logon) {
        this.logon = logon;
    }
    getCommand() {
        return this.sqlplus_exe;
    }
    getCLIArgs() {
        let cmdArgs = [];
        if (this.silent)
            cmdArgs.push('-S');
        if (this.noReprompt)
            cmdArgs.push('-L');
        if (this.markup)
            cmdArgs.push('-M', this.markup);
        if (this.noLogintime)
            cmdArgs.push('-NOLOGINTIME');
        if (this.restricted > 0)
            cmdArgs.push('-R ' + this.restricted);
        if (!this.logon)
            throw new Error('missing <logon>');
        else
            cmdArgs.push(this.logon);
        cmdArgs.push(this.getStartScript());
        if (this.start_args) {
            cmdArgs.push(...this.start_args);
        }
        return cmdArgs;
    }
    setInput(input) {
        this.stdin = input;
    }
    getInput() {
        if (this.stdin === null)
            return '';
        else
            return this.stdin;
    }
    setWorkingDir(path) {
        this.spawnOptions.cwd = path;
    }
    spawnProcess() {
        logger.trace(this.toString());
        let proc = child_process_1.spawn(this.getCommand(), this.getCLIArgs(), this.spawnOptions);
        proc.stdin.write(this.getInput());
        proc.stdin.end();
        return proc;
    }
    toString() {
        let cmd = this.getCommand();
        let args = this.getCLIArgs().map(e => `"${e}"`).join(" ");
        return `${cmd} ${args}`;
    }
}
function normalizeArray() {
}
class SQLPlusCLIArgs {
}
function sqlplus_cli(logon, startFile = null, args = [], input = '', opts = {}) {
    let wrapper = new SQLPlusCall();
    wrapper.setLogon(logon);
    wrapper.setInput(input);
    wrapper.start = startFile;
    wrapper.start_args = args;
    if (opts) {
        if (opts['workingDir']) {
            wrapper.setWorkingDir(opts.workingDir);
        }
    }
    let proc = wrapper.spawnProcess();
    let prom = new Promise((resolve, reject) => {
        let error = null;
        proc.on('error', (err) => {
            error = err;
        });
        proc.on('exit', (code, signal) => {
            if (error)
                reject(error);
            else if (signal !== null)
                reject(signal);
            else if (code > 0)
                reject(code);
            else
                resolve(code);
        });
    });
    return prom;
}
module.exports = sqlplus_cli;
//# sourceMappingURL=SQLPlus.js.map