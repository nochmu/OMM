#!/usr/bin/env ts-node

import dbc = require('@noctaru/dbc') ;
import {ModuleManager,OMMArgs} from "./src/ModuleManager";

const program = require('commander');
const util = require('util');
const logger = require('lok');
const fs = require('fs');
const OracleModule = require('./src/OracleModule');

// ------------------------------------ MAIN
program
    .option('-u, --user <user>', 'Username')
    .option('-p, --password <password>', 'Password')
    .option('-d, --database <database>', 'hostname:port/service')
    .version('0.0.1', '-v, --version')
    .option('-V, --verbose', 'show full debug output')
;

program
    .command('list').alias('l')
    .description('list installed modules')
    .action(function(options){
        logger.log('modules: %o', options);
    });


program
    .command('install [path]').alias('i')
    .description('install a module')
    .action(function(path, options){
        logger.log('install module: %s %o', path, options.parent.user);
    });

program
    .command('update [path]').alias('u')
    .description('update a module')
    .action(function(path, options){
        logger.log('update module: %s', path);
    });

program
    .command('selfupdate')
    .description('install or update OMM')
    .action(function(){
        let opts = this.parent.opts();
        logger.trace('cmd:selfupdate%o', opts);

        selfupdate(opts['user'], opts['password'], opts['database']);
    });


program.on('command:*', function () {
    logger.error('Invalid command: %s', program.args.join(' '));
    logger.error(program);
    process.exit(1);
});

program.on('option:verbose', function () {
    process.env.VERBOSE = this.verbose;
    logger.setLevel("trace");
});


// parse arguments
program.parse(process.argv);

// called without command
if(!program.args.length) {
    program.help();
}



//------------------------



function selfupdate(user, password, connectString )
{
    let args : OMMArgs = {
        user: user,
        password: password,
        database:connectString
    };

    let mm : ModuleManager = new ModuleManager(args);
    mm.selfupdate().then((res)=>{

    });
}



function loadManifest(manifestFile)
{
    let oramodule = OracleModule.parseManifestFile(manifestFile);
    logger.trace("%o", oramodule);
}


if(false){



let manifestFile = program.install+'/Manifest.json';
let oramodule = loadManifest(manifestFile);
}