import util = require('util');



export interface Statement
{
    renderSQL():string;
}


export class ChangeLog
{
    changes : ChangeSet[] =[];

    addChange<T extends ChangeSet>(...changeSet:T[])
    {
        this.changes.push(...changeSet);
    }
    addChangeSets<T extends ChangeSet>(...changeSets:T[])
    {
        this.changes.push(...changeSets);
    }

    renderSQL()
    {
        return this.changes
            .map((changeSet:ChangeSet) => changeSet.renderSQL(true))
            .join("\n");
    }

}

export class ChangeSet
{
    public id : string;
    private changes : Statement[];

    constructor(id:string)
    {
        this.id = id;
        this.changes = [];
    }

    addChange<T extends Statement>(stmt :T):T
    {
        this.changes.push(stmt);
        return stmt;
    }
    addChanges(...stmt:Statement[])
    {
        this.changes.push(...stmt);
    }

    renderSQL(withBanner:boolean=false)
    {
        let sql ='';
        if(withBanner)
        {
            sql += `-- ChangeSet: ${this.id}\n`;
        }
        sql += this.changes.map(change => change.renderSQL()).join("\n");

        return sql;
    }
}


abstract class ConstraintSpec
{
    private name:string;
    protected constructor(name:string)
    {
        this.name = name;
    }

    renderSQL(): string
    {
        let sql = '';
        if(this.name)
            sql +=  `CONSTRAINT ${this.name} `;
        sql+=  this._render_constraint();
        return sql;
    }

    protected abstract  _render_constraint():string;
}


class ConstraintCheckSpec extends ConstraintSpec
{
    private _condition : string;
    constructor(name:string, condition:string)
    {
        super(name);
        this._condition=condition;
    }
    protected _render_constraint()
    {
        return  `CHECK(${this._condition})`;
    }
}

class ConstraintUniqueSpec extends ConstraintSpec
{
    protected _keyword : string;
    private _columns : string[]=[];
    constructor(keyword:('UNIQUE'|'PRIMARY KEY'), name:string, ...columns:string[])
    {
        super(name);
        this._keyword = keyword;
        for(let col of columns)
        {
            this._columns.push(col);
        }
    }
    protected _render_constraint()
    {
        return  `${this._keyword}(${this._columns.join(", ")})`;
    }
}

class ConstraintForeignKeySpec extends ConstraintSpec
{
    private columns : string[]=[];
    private foreignTable : string;
    private foreignColumns : string[]=[];
    constructor(name:string, columns:string[], foreignTable:string, foreignColumns:string[])
    {
        super(name);
        for(let col of columns) this.columns.push(col);
        this.foreignTable = foreignTable;
        for(let col of foreignColumns) this.foreignColumns.push(col);
    }
    protected _render_constraint()
    {
        return `FOREIGN KEY(${this.columns}) REFERENCES ${this.foreignTable}(${this.foreignColumns.join(", ")})`;
    }
}



export class CommentOn implements Statement
{
    private objectType;
    objectName;
    comment;
    constructor(type:('TABLE'|'COLUMN'))
    {
        this.objectType = type;
    }

    renderSQL():string
    {
        return `COMMENT ON ${this.objectType} ${this.objectName} IS '${this.comment}';`;
    }
}

export class DropTable implements Statement
{
    tableName:string;
    cascadeConstraints:boolean=false;
    constructor(tableName:string){this.tableName=tableName;}
    renderSQL():string
    {
        if(this.cascadeConstraints)
            return `DROP TABLE ${this.tableName} CASCADE CONSTRAINTS;`;
        else
            return `DROP TABLE ${this.tableName};`;
    }
}

export class DropSequence implements Statement
{
    sequenceName:string;
    constructor(sequenceName:string){this.sequenceName=sequenceName; }
    renderSQL():string
    {
        return `DROP SEQUENCE ${this.sequenceName};`;
    }
}



export class CreateTable implements Statement
{
    tableName:string;
    columns : ColumnSpec[];

    /** CREATE TABLE `tableName` (`columns`);
     * @param tableName
     * @param columns
     */
    constructor(tableName:string, columns:ColumnSpec[]){
        this.tableName = tableName;
        this.columns = columns;
    }

    renderSQL()
    {
        let columnList = this.columns.map(column => column.renderSQL()).join(", ");
        let sql = util.format("CREATE TABLE %s(%s);", this.tableName, columnList);
        return sql;
    }
}

export class CreateSequence implements Statement
{
    sequenceName:string;

    /** CREATE SEQUENCE `sequenceName`;
     * @param sequenceName
     */
    constructor(sequenceName:string){this.sequenceName=sequenceName; }
    renderSQL()
    {
        return `CREATE SEQUENCE ${this.sequenceName};`;
    }
}


abstract class AlterTableAdd implements   Statement
{
    tableName:string;
    constructor(tableName:string)
    {
        this.tableName = tableName;
    }
    renderSQL()
    {
        return `ALTER TABLE ${this.tableName} ADD ${this._render_add()};`;
    }

    protected abstract  _render_add():string;
}


export class AlterTableAddColumn extends AlterTableAdd
{
    column:ColumnSpec;
    constructor(tableName:string, column:ColumnSpec)
    {
        super(tableName);
        this.column=column;
    }
    protected  _render_add():string
    {
       return this.column.renderSQL();
    }
}

export class AlterTableAddPrimaryKey extends AlterTableAdd
{
    constraintName:string = null;
    columns:string[];
    constructor(tableName:string, constraintName:string, columns:string[])
    {
        super(tableName);
        this.constraintName=constraintName;
        this.columns=columns;
    }
    protected  _render_add():string
    {
        return new ConstraintUniqueSpec('PRIMARY KEY',this.constraintName,...this.columns).renderSQL()
    }
}


export class AlterTableAddForeignKey extends AlterTableAdd
{
    constraintName?: string;
    columns:string[];
    foreignTable:string;
    foreignColumns:string[];

    /** ALTER TABLE `tableName` ADD CONSTRAINT `constraintName` FOREIGN KEY (`columns`)  REFERENCES `foreignTable`(`foreignColumns`);
     * @param tableName
     * @param constraintName
     * @param columns
     * @param foreignTable
     * @param foreignColumns
     */
    public constructor(tableName:string, constraintName:(string|null), columns:string[], foreignTable:string, foreignColumns:string[])
    {
        super(tableName);
        this.constraintName=constraintName;
        this.columns=columns;
        this.foreignTable=foreignTable;
        this.foreignColumns = foreignColumns;
    }
    protected  _render_add():string
    {
        return new ConstraintForeignKeySpec(this.constraintName, this.columns,this.foreignTable,this.foreignColumns).renderSQL()
    }
}


export class AlterTableAddUnique extends AlterTableAdd
{
    constraintName?: string;
    columns:string[];
    constructor(tableName:string, constraintName:string, columns:string[])
    {
        super(tableName);
        this.constraintName=constraintName;
        this.columns=columns;
    }
    protected  _render_add():string
    {
        return new ConstraintUniqueSpec('UNIQUE', this.constraintName,...this.columns).renderSQL()
    }
}


export class AlterTableAddCheck extends AlterTableAdd
{
    constraintName: string;
    condition:string;
    constructor(tableName:string, constraintName:string, condition:string)
    {
        super(tableName);
        this.constraintName=constraintName;
        this.condition=condition;
    }
    protected  _render_add():string
    {
        return new ConstraintCheckSpec(this.constraintName,this.condition).renderSQL()
    }
}

export class ColumnSpec
{
    name:string;
    type:string;
    defaultValue:string;
    notNull:boolean;

    constructor(name:string,type:string, defaultValue:string=null,notNull:boolean=false)
    {
        this.name = name;
        this.type=type;
        this.defaultValue = defaultValue;
        this.notNull=notNull;
    }

    validate()
    {
        if(!this.name) throw new Error("column name is null");
        if(!this.type) throw new Error("column type is null");
    }
    renderSQL()
    {
        this.validate();

        let parts = [];
        parts.push(this.name);
        parts.push(this.type);

        if(this.defaultValue)
            parts.push("DEFAULT "+this.defaultValue);

        if(this.notNull)
            parts.push("NOT NULL");


        return parts.join(" ");
    }
}

