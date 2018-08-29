import clone = require('git-clone');
import tmp = require('tmp');
import path = require("path");
import glob = require("glob");

async function  cloneGit(repo, dir) : Promise<string>
{

    let prom = new Promise((resolve, reject) => {
        let opts = {

        }
        let targetPath:string = dir;
        clone(repo, targetPath, opts, function(){
            resolve(targetPath);
        });
    });
    let path = await prom.then((x:string)=>x);

    return path;
}

cloneGit('./examples/git-repo', './tmp/git-repo');

let prom = cloneGit('https://github.com/nochmu/node-lok.git', './tmp/node-lok');
prom.then(path => {
    let files =  glob.sync(path+"/**");
    console.log(files);
});
