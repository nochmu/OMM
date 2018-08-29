
import {exec, EchoStream, ExecOpts} from "../src/sqlplus/simpleExec";


//let stdin = new StringStream('Hallo World');
let opts = new ExecOpts(process.stdin, new EchoStream(), new EchoStream());

//exec('ls', [ '-la'], opts);

opts.stdin = "Hallo World!\n";
exec(['cat'], opts )


opts.stdout = function(inp){
    process.stdout.write(inp);
    if(inp == null) console.log('');
};
exec(['cat'], opts );



let input = ['GET / HTTP/1.1', 'Host: localhost', '', ''];
 opts = new ExecOpts(input, process.stdout, process.stderr);
let command: string[] = ['telnet', 'localhost', '80']
exec(command, opts);