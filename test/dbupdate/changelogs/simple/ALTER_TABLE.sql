ALTER TABLE TEST_TBL ADD A varchar2(60);

ALTER TABLE TEST_TBL ADD B varchar2(60);
COMMENT ON COLUMN TEST_TBL.B IS 'Column B';