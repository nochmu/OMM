"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class OracleModule {
    constructor() {
    }
    static parseManifestFile(manifestFile) {
        // @ts-ignore
        let manifest = JSON.parse(fs.readFileSync(manifestFile));
        let mod = new OracleModule();
        mod.name = manifest.name;
        mod.version = manifest.version;
        mod.description = manifest.description;
        mod.main_pkg = manifest.export;
        return mod;
    }
}
exports.OracleModule = OracleModule;
exports.default = OracleModule;
//# sourceMappingURL=OracleModule.js.map