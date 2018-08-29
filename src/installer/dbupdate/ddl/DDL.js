"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
class ChangeLog {
    constructor() {
        this.changes = [];
    }
    addChange(...changeSet) {
        this.changes.push(...changeSet);
    }
    addChangeSets(...changeSets) {
        this.changes.push(...changeSets);
    }
    renderSQL() {
        return this.changes
            .map((changeSet) => changeSet.renderSQL(true))
            .join("\n");
    }
}
exports.ChangeLog = ChangeLog;
class ChangeSet {
    constructor(id) {
        this.id = id;
        this.changes = [];
    }
    addChange(stmt) {
        this.changes.push(stmt);
        return stmt;
    }
    addChanges(...stmt) {
        this.changes.push(...stmt);
    }
    renderSQL(withBanner = false) {
        let sql = '';
        if (withBanner) {
            sql += `-- ChangeSet: ${this.id}\n`;
        }
        sql += this.changes.map(change => change.renderSQL()).join("\n");
        return sql;
    }
}
exports.ChangeSet = ChangeSet;
class ConstraintSpec {
    constructor(name) {
        this.name = name;
    }
    renderSQL() {
        let sql = '';
        if (this.name)
            sql += `CONSTRAINT ${this.name} `;
        sql += this._render_constraint();
        return sql;
    }
}
class ConstraintCheckSpec extends ConstraintSpec {
    constructor(name, condition) {
        super(name);
        this._condition = condition;
    }
    _render_constraint() {
        return `CHECK(${this._condition})`;
    }
}
class ConstraintUniqueSpec extends ConstraintSpec {
    constructor(keyword, name, ...columns) {
        super(name);
        this._columns = [];
        this._keyword = keyword;
        for (let col of columns) {
            this._columns.push(col);
        }
    }
    _render_constraint() {
        return `${this._keyword}(${this._columns.join(", ")})`;
    }
}
class ConstraintForeignKeySpec extends ConstraintSpec {
    constructor(name, columns, foreignTable, foreignColumns) {
        super(name);
        this.columns = [];
        this.foreignColumns = [];
        for (let col of columns)
            this.columns.push(col);
        this.foreignTable = foreignTable;
        for (let col of foreignColumns)
            this.foreignColumns.push(col);
    }
    _render_constraint() {
        return `FOREIGN KEY(${this.columns}) REFERENCES ${this.foreignTable}(${this.foreignColumns.join(", ")})`;
    }
}
class CommentOn {
    constructor(type) {
        this.objectType = type;
    }
    renderSQL() {
        return `COMMENT ON ${this.objectType} ${this.objectName} IS '${this.comment}';`;
    }
}
exports.CommentOn = CommentOn;
class DropTable {
    constructor(tableName) {
        this.cascadeConstraints = false;
        this.tableName = tableName;
    }
    renderSQL() {
        if (this.cascadeConstraints)
            return `DROP TABLE ${this.tableName} CASCADE CONSTRAINTS;`;
        else
            return `DROP TABLE ${this.tableName};`;
    }
}
exports.DropTable = DropTable;
class DropSequence {
    constructor(sequenceName) { this.sequenceName = sequenceName; }
    renderSQL() {
        return `DROP SEQUENCE ${this.sequenceName};`;
    }
}
exports.DropSequence = DropSequence;
class CreateTable {
    /** CREATE TABLE `tableName` (`columns`);
     * @param tableName
     * @param columns
     */
    constructor(tableName, columns) {
        this.tableName = tableName;
        this.columns = columns;
    }
    renderSQL() {
        let columnList = this.columns.map(column => column.renderSQL()).join(", ");
        let sql = util.format("CREATE TABLE %s(%s);", this.tableName, columnList);
        return sql;
    }
}
exports.CreateTable = CreateTable;
class CreateSequence {
    /** CREATE SEQUENCE `sequenceName`;
     * @param sequenceName
     */
    constructor(sequenceName) { this.sequenceName = sequenceName; }
    renderSQL() {
        return `CREATE SEQUENCE ${this.sequenceName};`;
    }
}
exports.CreateSequence = CreateSequence;
class AlterTableAdd {
    constructor(tableName) {
        this.tableName = tableName;
    }
    renderSQL() {
        return `ALTER TABLE ${this.tableName} ADD ${this._render_add()};`;
    }
}
class AlterTableAddColumn extends AlterTableAdd {
    constructor(tableName, column) {
        super(tableName);
        this.column = column;
    }
    _render_add() {
        return this.column.renderSQL();
    }
}
exports.AlterTableAddColumn = AlterTableAddColumn;
class AlterTableAddPrimaryKey extends AlterTableAdd {
    constructor(tableName, constraintName, columns) {
        super(tableName);
        this.constraintName = null;
        this.constraintName = constraintName;
        this.columns = columns;
    }
    _render_add() {
        return new ConstraintUniqueSpec('PRIMARY KEY', this.constraintName, ...this.columns).renderSQL();
    }
}
exports.AlterTableAddPrimaryKey = AlterTableAddPrimaryKey;
class AlterTableAddForeignKey extends AlterTableAdd {
    /** ALTER TABLE `tableName` ADD CONSTRAINT `constraintName` FOREIGN KEY (`columns`)  REFERENCES `foreignTable`(`foreignColumns`);
     * @param tableName
     * @param constraintName
     * @param columns
     * @param foreignTable
     * @param foreignColumns
     */
    constructor(tableName, constraintName, columns, foreignTable, foreignColumns) {
        super(tableName);
        this.constraintName = constraintName;
        this.columns = columns;
        this.foreignTable = foreignTable;
        this.foreignColumns = foreignColumns;
    }
    _render_add() {
        return new ConstraintForeignKeySpec(this.constraintName, this.columns, this.foreignTable, this.foreignColumns).renderSQL();
    }
}
exports.AlterTableAddForeignKey = AlterTableAddForeignKey;
class AlterTableAddUnique extends AlterTableAdd {
    constructor(tableName, constraintName, columns) {
        super(tableName);
        this.constraintName = constraintName;
        this.columns = columns;
    }
    _render_add() {
        return new ConstraintUniqueSpec('UNIQUE', this.constraintName, ...this.columns).renderSQL();
    }
}
exports.AlterTableAddUnique = AlterTableAddUnique;
class AlterTableAddCheck extends AlterTableAdd {
    constructor(tableName, constraintName, condition) {
        super(tableName);
        this.constraintName = constraintName;
        this.condition = condition;
    }
    _render_add() {
        return new ConstraintCheckSpec(this.constraintName, this.condition).renderSQL();
    }
}
exports.AlterTableAddCheck = AlterTableAddCheck;
class ColumnSpec {
    constructor(name, type, defaultValue = null, notNull = false) {
        this.name = name;
        this.type = type;
        this.defaultValue = defaultValue;
        this.notNull = notNull;
    }
    validate() {
        if (!this.name)
            throw new Error("column name is null");
        if (!this.type)
            throw new Error("column type is null");
    }
    renderSQL() {
        this.validate();
        let parts = [];
        parts.push(this.name);
        parts.push(this.type);
        if (this.defaultValue)
            parts.push("DEFAULT " + this.defaultValue);
        if (this.notNull)
            parts.push("NOT NULL");
        return parts.join(" ");
    }
}
exports.ColumnSpec = ColumnSpec;
//# sourceMappingURL=DDL.js.map