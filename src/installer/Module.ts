import {Installer} from "./installer";


export interface Module
{
    install(installer:Installer);
}


export class Module implements Module
{


    install(installer:Installer)
    {

    }
}


class TestModule extends Module
{
    install(installer:Installer)
    {
        installer.installFile('install.sql', 'examples/plsql_package',[],null);
    }
}


export let testModule = new TestModule();



