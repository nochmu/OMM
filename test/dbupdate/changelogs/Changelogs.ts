var expect = require('chai').expect;

import * as ddl from '../../../src/installer/dbupdate/ddl/DDL';
import parseXML =require('../../../src/installer/dbupdate/ddl/parser/XMLParser');
import {default as parseABS , DLNode} from "../../../src/installer/dbupdate/ddl/parser/ASTParser";
import path = require("path");

import glob = require("glob");

describe('dbupdate.changelogs', function() {


    describe('simple',function()
    {
        let tests = glob.sync(__dirname+"/simple/*.xml");
        for(let testFile of tests)
        {
            let name = path.basename( testFile,'.xml');

            it(name, async function()
            {
                let abs = await parseXML(testFile);
                let res = await parseABS(abs);
                let sql = res.renderSQL();
                console.log("%s",sql);

            });
        }


    });



});



