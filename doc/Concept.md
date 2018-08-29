
### 1. OMM/Installer -  simplified installation
A module can be installed with an OMM-Installer.
```$xslt
omm_pkg = omm [args...] 
omm_pkg install <module>
``` 

### 2. OMM/Registry - Module Database
Each installed module is tracked and can be safely updated.


###3. OMM/Repository - Module Repository
A OMM-Module can be referenced via git. 

###4.  OMM/Dependency - Dependency management
In the ```Manifest.json``` other modules can be defined as to be required. 