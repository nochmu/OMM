# DBUpdate
Automatic updating of database objects. 

## 
### Object Types
#### non-Replacable (Static Object)
- can not be replaced (without data loss)
- Types: TABLE, SEQUENCE
- changes via ALTER

#### Replacable
- ca be replaced (without data loss)
- Types: VIEW, PACKAGE, PROCEDURE, TYPE,..
- changes via REPLACE 

 