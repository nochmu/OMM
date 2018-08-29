
DB_HOSTNAME=localhost
DB_PORT=1531
DB_SERVICE=MYPDB
DB_SYS_USER=SYS
DB_SYS_PW="welcome-1"


############
.DEFAULT_GOAL:= build
.PHONY: install db_update test

### Goals
install: db_init db_update

build:
	echo Buh

test:
	$(MAKE)  -C examples/ test_selfupdate