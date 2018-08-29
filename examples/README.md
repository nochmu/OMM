# /Examples

## Example: PLSQL Package
- two PL/SQL Packages: 
  - a public Package:  `LIB_API`

- can be installed in any available schema 

- installModes: 
  - `PUBLIC SYNONYM`
  - `SYNONYM`
  - `SCHEMA`
  

## Example: PLSQL Library
- two PL/SQL Packages: 
  - a public Package:  `LIB_API`
  - a private Package: `LIB_PKG`
    - only accessible for `LIB_API` 
    
- can be installed in any available schema 

- installModes: 
  - `PUBLIC SYNONYM`
  - `SYNONYM`
  - `SCHEMA`
  
  
## Example: Dependency
- contains two Modules

  - Module A: a simple PL/SQL Package
  - Module B: Package that depends on the package from module A
