"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Module {
    install(installer) {
    }
}
exports.Module = Module;
class TestModule extends Module {
    install(installer) {
        installer.installFile('install.sql', 'examples/plsql_package', [], null);
    }
}
exports.testModule = new TestModule();
//# sourceMappingURL=Module.js.map