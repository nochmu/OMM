"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const clone = require("git-clone");
const glob = require("glob");
function cloneGit(repo, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        let prom = new Promise((resolve, reject) => {
            let opts = {};
            let targetPath = dir;
            clone(repo, targetPath, opts, function () {
                resolve(targetPath);
            });
        });
        let path = yield prom.then((x) => x);
        return path;
    });
}
cloneGit('./examples/git-repo', './tmp/git-repo');
let prom = cloneGit('https://github.com/nochmu/node-lok.git', './tmp/node-lok');
prom.then(path => {
    let files = glob.sync(path + "/**");
    console.log(files);
});
//# sourceMappingURL=repository.js.map