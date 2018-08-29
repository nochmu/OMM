# Modes

## Mode
- update: generic-script
- InstallUser: SYS
- Schema: fixed_by_script
- schema names: fixed
- like ords


{
    install: {
        sql_file  : 'install.sql'
        call_user : 'SYS' 
    },
    update: {
        sql_file : 'update.sql',
        call_user : '<schema>' 
    },
    

}