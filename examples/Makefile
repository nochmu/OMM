
opm = ../omm.ts
opm_args = --verbose -u ORAMODS -p oramods -d localhost:1531/MYPDB

MODULES = hello-world

test:
	$(opm) $(opm_args)  -i hello-world


test_selfupdate:
	$(opm) -V -u SYS -p "welcome-1" -d "localhost:1531/MYPDB" selfupdate