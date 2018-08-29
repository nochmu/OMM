/**
 * Parser for the Abstract Syntax Tree
 * input: DLNode[type='changeLog']
 * output: changeLog
 */


import * as ddl from "../DDL";
import {AlterTableAddForeignKey, AlterTableAddPrimaryKey} from "../DDL";
import logger = require('lok');

logger.setLevel('trace');
import util = require('util');
import indentString = require('indent-string');

type DLNodeAttributes = { [key: string]: string };

export class DLNode
{
    type: string = null;
    private attributes: DLNodeAttributes = {};
    private children: DLNode[] = [];
    public value: any;

    constructor(type: string, attributes: DLNodeAttributes = {})
    {
        this.type = type;
    }

    public getValue()
    {
        return this.value;
    }

    public setAttribute(key: string, value: string)
    {
        this.attributes[key] = value;
    }

    public setAttributes(attributes: DLNodeAttributes)
    {
        for(let a in attributes)
        {
            this.attributes[a] = attributes[a];
        }
    }

    public getAttributes():DLNodeAttributes
    {
        return this.attributes;
    }

    public getAttribute(key: string): string
    {
        return this.attributes[key];
    }

    public addChild<T extends DLNode>(child: T): T
    {
        child._parent = this;
        this.children.push(child);
        return child;
    }

    public getChildren(): DLNode[]
    {
        return this.children;
    }

    private _parent: DLNode;

    public getParent(): DLNode
    {
        return this._parent;
    }


    /** replace this node with its children.
     * @param callback - `function(child, oldParent)`   called for each children, after replacing
     * @return parent node
     */
    public replaceByChildren(callback: (node: DLNode, oldParent: DLNode) => void): DLNode
    {
        //position at parent
        let parentIdx = this.getParent().children.indexOf(this);

        //replace by children
        this.getParent().children.splice(parentIdx, 1, ...this.children);

        // change children's parent
        this.children.forEach(child =>
        {
            child._parent = this._parent;
        });

        //call callback handler
        this.children.forEach(child =>
        {
            callback(child, this);
        });

        //clean up
        this.children = [];
        this._parent = null;

        return this._parent;
    }

    /**
     * makes a copy of this node. The copy has no parent!
     */
    public copy()
    {
        let node = Object.assign(new DLNode(''),this);
        node._parent = null;
        return node;
    }

    public render(indent = 2)
    {
        let str = `${this.type}${ JSON.stringify(this.attributes)}`;
        if(this.value) str += `[${this.value}]`
        let sub = this.children.map(child => child.render(indent)).join("\n");
        if(sub) str += "\n" + indentString(sub, indent);
        return str;
    }

}


function parseArrayAttribute(attr:string):string[]
{
    return attr.split(',').map(s=>s.trim());
}




async function parse(changeLogNode: DLNode): Promise<ddl.ChangeLog>
{
    if(changeLogNode.type !== 'changeLog') throw new Error(`is not a changeLog node`);
    let forEachNode = function(node: DLNode)
    {
        node.getChildren().forEach(forEachNode);

        let type = node.type;
        let a = node.getAttributes();

        if(null)
        {

        }
        else if(type == 'changeLog')
        {
            let val:ddl.ChangeLog = node.value = new ddl.ChangeLog();
            val.addChangeSets(...node.getChildren().map(c=>c.getValue()));
        }
        else if(type == 'changeSet')
        {
            let val:ddl.ChangeSet = node.value = new ddl.ChangeSet(a['id']);
            val.addChanges(...node.getChildren().map(c=>c.getValue()));
        }
        else if(type == 'createSequence')
        {
            let seq = new ddl.CreateSequence(a['name']);
            node.value = seq;
        }
        else if(type == 'createTable')
        {
            let cols = node.getChildren().map(propNode => {
                if(propNode.type === 'column')
                    return propNode.value;

            });
            if(cols.length > 1) throw new Error('illegal state');
            let tbl = new ddl.CreateTable(a['name'],cols);

            node.value = tbl;
        }
        else if(type == 'column')
        {
            let tbl = new ddl.ColumnSpec(a['name'],a['type']);
            node.value = tbl;
        }
        else if(type == 'addColumn')
        {
            let column = new ddl.ColumnSpec(a['name'], a['type']);
            node.value = new ddl.AlterTableAddColumn(a['tableName'],column);
        }
        else if(type == 'addPrimaryKey')
        {
            node.value = new AlterTableAddPrimaryKey(a['tableName'], a['name'],parseArrayAttribute(a['columns']));
        }
        else if(type == 'addUnique')
        {
            node.value = new ddl.AlterTableAddUnique(a['tableName'], a['name'],parseArrayAttribute(a['columns']));
        }
        else if(type == 'addCheck')
        {
            node.value = new ddl.AlterTableAddCheck(a['tableName'], a['name'],a['condition']);
        }
        else if(type == 'addForeignKey')
        {
            node.value = new AlterTableAddForeignKey(a['tableName'], a['name'],parseArrayAttribute(a['columns']),a['foreignTable'], parseArrayAttribute(a['foreignColumns']));
        }
        else
        {
            throw new Error(`type '${type}' not yet implemented`);
        }
    };
    forEachNode(changeLogNode);

    logger.trace("%s", util.inspect(changeLogNode, false, null, true));

    let changeLog:ddl.ChangeLog = changeLogNode.value;
    return changeLog;
}

export default parse;
