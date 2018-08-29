/** XML Parser; returns an Abstract Syntax Tree
 * input: XML File
 * output: DLNode[type='changeLog']
 */


import libxml = require("libxmljs");
import * as ddl from "../DDL";
import * as fs from "fs";
import logger =  require('lok');
import {ChangeLog} from "../DDL";
logger.setLevel('trace');
import util = require('util');

import {DLNode} from "./ASTParser";
var xsdValidator = require('xsd-schema-validator');



function parseXML(file:string):Promise<DLNode>
{
    let prom:Promise<DLNode> = new Promise((resolve, reject) => {

        let dl :{
            root:DLNode;
            parent:DLNode;
            autoParseElements:Set<string>
        } = {
            root:null,
            parent:null,
            autoParseElements:new Set<string>()
        };


        let  parser = new libxml.SaxParser();

        parser.on('startDocument', function()
        {
            dl.root =  new DLNode('root');
            dl.parent = dl.root;
        });


        parser.on('startElementNS', function(elem, attrs:string[][])
        {
            try{
                let a = {};
                for(let at of attrs){ a[at[0]] = at[3]};


                if(!elem)
                {
                    throw new Error(`element expected: ${elem}`);
                }
                else
                {
                    //default handler
                    dl.autoParseElements.add(elem);
                    let node = new DLNode(elem);
                    node.setAttributes(a);
                    dl.parent.addChild(node);
                    dl.parent=node;
                }

                console.log('%s %s', elem, JSON.stringify(a));
            }catch(err){
                reject(err);
            }

        });
        parser.on('endElementNS', function(elem)
        {
            try{

                let node = dl.parent;
                // default handler
                if(dl.autoParseElements.has(elem))
                {
                    dl.parent = node.getParent();
                }
                { // Quickfix: CreateTable has just Column Elements
                    if(elem === 'createTable')
                    {
                        // transform createTable block into single statements
                        const createTableNodeTypes = {
                            'column' : 'addColumn',
                            'check' : 'addCheck',
                            'foreignKey' : 'addForeignKey',
                            'unique' : 'addUnique',
                            'primaryKey' : 'addPrimaryKey'
                        };
                        //replace first node 'column' with 'createTable', other  'column'-nodes with 'addColumn'
                        let firstColumn = true;
                        node = node.replaceByChildren((child, oldParent) => {
                            if(!createTableNodeTypes[child.type])
                                throw new Error(`'createTable > ${child.type}' not expected`);

                            if(child.type === 'column' && firstColumn)
                            {
                                    firstColumn = false;


                                let columnNode = new DLNode('column');
                                columnNode.setAttributes(child.getAttributes());
                                child.type = 'createTable';
                                child.setAttribute('name', oldParent.getAttribute('name'))
                                child.addChild(columnNode);
                            }
                            else
                            {
                                child.type = createTableNodeTypes[child.type];
                                child.setAttribute("tableName", oldParent.getAttribute("name"));
                            }


                        });
                    }
                }
                if(elem === 'alterTable')
                {
                    // transform alterTable block into single statements
                    const alterNodeTypes = {
                        'column' : 'addColumn',
                        'check' : 'addCheck',
                        'foreignKey' : 'addForeignKey',
                        'unique' : 'addUnique',
                        'primaryKey' : 'addPrimaryKey'
                    };
                    node = node.replaceByChildren((child, oldParent) => {
                        if(!alterNodeTypes[child.type])
                            throw new Error(`'alterTable > ${child.type}' not expected`);
                        child.type = alterNodeTypes[child.type];
                        child.setAttribute("tableName", oldParent.getAttribute("name"));
                    });
                }

                console.log('/%s', elem);
            }catch(err){
                reject(err);
            }
        });
        parser.on('warning', function(warn)
        {
            reject(warn);
        });
        parser.on('error', function(err)
        {
            reject(err);
        });
        parser.on('endDocument', function()
        {
            let changeLogNode = dl.root.getChildren()[0];
            logger.log("%s",util.inspect(changeLogNode, false, null, true));
            logger.trace("%s",changeLogNode.render());
            resolve(changeLogNode);
        });

        try
        {

            let xml = fs.readFileSync(file).toString();
            //validate XML via XSD
            xsdValidator.validateXML(xml, __dirname+'/Changelog.xsd', function(err, result) {
                if (err) {
                    throw err;
                }

                result.valid; // true
            });

            parser.parseString(xml);
        }catch(err)
        {
            reject(err);
        }

    });


    return prom;
}


async function parse(file:string):Promise<DLNode>
{

    let changeLog : DLNode = await parseXML(file).then(res => {
        return res;
    }, err=>{
        throw err;
    });
    return changeLog;
}


export = parse;