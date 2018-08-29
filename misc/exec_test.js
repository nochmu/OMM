"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simpleExec_1 = require("../src/sqlplus/simpleExec");
//let stdin = new StringStream('Hallo World');
let opts = new simpleExec_1.ExecOpts(process.stdin, new simpleExec_1.EchoStream(), new simpleExec_1.EchoStream());
//exec('ls', [ '-la'], opts);
opts.stdin = "Hallo World!\n";
simpleExec_1.exec(['cat'], opts);
opts.stdout = function (inp) {
    process.stdout.write(inp);
    if (inp == null)
        console.log('');
};
simpleExec_1.exec(['cat'], opts);
let input = ['GET / HTTP/1.1', 'Host: localhost', '', ''];
opts = new simpleExec_1.ExecOpts(input, process.stdout, process.stderr);
let command = ['telnet', 'localhost', '80'];
simpleExec_1.exec(command, opts);
//# sourceMappingURL=exec_test.js.map