WHENEVER SQLERROR CONTINUE;

DROP SEQUENCE OPM_SEQUENCE;
DROP TABLE OMM_REGISTRY_T;

WHENEVER SQLERROR EXIT SQL.SQLCODE;
CREATE SEQUENCE OPM_SEQUENCE;


create table OMM_REGISTRY_T
(
    entry_id number DEFAULT opm_sequence.nextval,
    module_name varchar2(200),
    module_version varchar2(20),
    install_date date DEFAULT sysdate,
    install_schema varchar2(30),
    module_package varchar2(30)
);

CREATE or REPLACE PACKAGE OMM AS
    TYPE module_type is RECORD(
        name    varchar2(200),
        version varchar2(20),
        main_pkg varchar2(30)
    );

    procedure register_module(p_module module_type, p_schema varchar2);

END;
/


CREATE OR REPLACE PACKAGE BODY OMM AS

    procedure register_module(p_module module_type, p_schema varchar2)
    is
    begin
        merge into omm_registry_t r  using dual
        on(r.module_name = p_module.name )
        WHEN not matched then
            INSERT (module_name, module_version, install_schema, module_package)
            VALUES(p_module.name, p_module.version, p_schema, p_module.main_pkg )
        ;
    END;

END;
/

DECLARE
    l_module OMM.module_type;
BEGIN
    l_module.name := 'info';
    l_module.version := '0.1';
    OMM.register_module(l_module, 'MY_TEST');

    l_module.name := 'info3';
    l_module.version := '0.2';
    OMM.register_module(l_module,  'MY_TEST');

    l_module.name := 'demo 4';
    l_module.version := '0.2';
    OMM.register_module(l_module,  'MY_TEST');
    commit;
END;
/