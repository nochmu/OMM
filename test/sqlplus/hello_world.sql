/***********************************************
* Prints "Hello World!' or another message
* Usage:
*   @hello_world         -- prints 'Hello World'
*   @hello_world 'Buh!'  -- prints 'Buh!'
************************************************/

SET SERVEROUTPUT ON
SET VERIFY OFF
SET FEEDBACK OFF


SET TERMOUT OFF
DEFINE _MSG =&1 'Hello World!'
SET TERMOUT ON

SELECT '&_MSG' FROM DUAL;