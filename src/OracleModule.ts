import fs = require('fs');



export class OracleModule
{
    name : string;
    version : string;
    description : string;
    main_pkg : string;

    constructor()
    {

    }

    static parseManifestFile(manifestFile : string)
    {
        // @ts-ignore
        let manifest = JSON.parse(fs.readFileSync(manifestFile));

        let mod =  new OracleModule();
        mod.name = manifest.name;
        mod.version = manifest.version;
        mod.description = manifest.description;
        mod.main_pkg = manifest.export;

        return mod;
    }
}


export default  OracleModule;


