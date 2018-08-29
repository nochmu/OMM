"use strict";
/**
 * Parser for the Abstract Syntax Tree
 * input: DLNode[type='changeLog']
 * output: changeLog
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ddl = require("../DDL");
const DDL_1 = require("../DDL");
const logger = require("lok");
logger.setLevel('trace');
const util = require("util");
const indentString = require("indent-string");
class DLNode {
    constructor(type, attributes = {}) {
        this.type = null;
        this.attributes = {};
        this.children = [];
        this.type = type;
    }
    getValue() {
        return this.value;
    }
    setAttribute(key, value) {
        this.attributes[key] = value;
    }
    setAttributes(attributes) {
        for (let a in attributes) {
            this.attributes[a] = attributes[a];
        }
    }
    getAttributes() {
        return this.attributes;
    }
    getAttribute(key) {
        return this.attributes[key];
    }
    addChild(child) {
        child._parent = this;
        this.children.push(child);
        return child;
    }
    getChildren() {
        return this.children;
    }
    getParent() {
        return this._parent;
    }
    /** replace this node with its children.
     * @param callback - `function(child, oldParent)`   called for each children, after replacing
     * @return parent node
     */
    replaceByChildren(callback) {
        //position at parent
        let parentIdx = this.getParent().children.indexOf(this);
        //replace by children
        this.getParent().children.splice(parentIdx, 1, ...this.children);
        // change children's parent
        this.children.forEach(child => {
            child._parent = this._parent;
        });
        //call callback handler
        this.children.forEach(child => {
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
    copy() {
        let node = Object.assign(new DLNode(''), this);
        node._parent = null;
        return node;
    }
    render(indent = 2) {
        let str = `${this.type}${JSON.stringify(this.attributes)}`;
        if (this.value)
            str += `[${this.value}]`;
        let sub = this.children.map(child => child.render(indent)).join("\n");
        if (sub)
            str += "\n" + indentString(sub, indent);
        return str;
    }
}
exports.DLNode = DLNode;
function parseArrayAttribute(attr) {
    return attr.split(',').map(s => s.trim());
}
function parse(changeLogNode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (changeLogNode.type !== 'changeLog')
            throw new Error(`is not a changeLog node`);
        let forEachNode = function (node) {
            node.getChildren().forEach(forEachNode);
            let type = node.type;
            let a = node.getAttributes();
            if (null) {
            }
            else if (type == 'changeLog') {
                let val = node.value = new ddl.ChangeLog();
                val.addChangeSets(...node.getChildren().map(c => c.getValue()));
            }
            else if (type == 'changeSet') {
                let val = node.value = new ddl.ChangeSet(a['id']);
                val.addChanges(...node.getChildren().map(c => c.getValue()));
            }
            else if (type == 'createSequence') {
                let seq = new ddl.CreateSequence(a['name']);
                node.value = seq;
            }
            else if (type == 'createTable') {
                let cols = node.getChildren().map(propNode => {
                    if (propNode.type === 'column')
                        return propNode.value;
                });
                if (cols.length > 1)
                    throw new Error('illegal state');
                let tbl = new ddl.CreateTable(a['name'], cols);
                node.value = tbl;
            }
            else if (type == 'column') {
                let tbl = new ddl.ColumnSpec(a['name'], a['type']);
                node.value = tbl;
            }
            else if (type == 'addColumn') {
                let column = new ddl.ColumnSpec(a['name'], a['type']);
                node.value = new ddl.AlterTableAddColumn(a['tableName'], column);
            }
            else if (type == 'addPrimaryKey') {
                node.value = new DDL_1.AlterTableAddPrimaryKey(a['tableName'], a['name'], parseArrayAttribute(a['columns']));
            }
            else if (type == 'addUnique') {
                node.value = new ddl.AlterTableAddUnique(a['tableName'], a['name'], parseArrayAttribute(a['columns']));
            }
            else if (type == 'addCheck') {
                node.value = new ddl.AlterTableAddCheck(a['tableName'], a['name'], a['condition']);
            }
            else if (type == 'addForeignKey') {
                node.value = new DDL_1.AlterTableAddForeignKey(a['tableName'], a['name'], parseArrayAttribute(a['columns']), a['foreignTable'], parseArrayAttribute(a['foreignColumns']));
            }
            else {
                throw new Error(`type '${type}' not yet implemented`);
            }
        };
        forEachNode(changeLogNode);
        logger.trace("%s", util.inspect(changeLogNode, false, null, true));
        let changeLog = changeLogNode.value;
        return changeLog;
    });
}
exports.default = parse;
//# sourceMappingURL=ASTParser.js.map