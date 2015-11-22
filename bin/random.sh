#!/bin/bash

while true
do
	TKB=$(( ( RANDOM % 1000 )  + 1 ));
	RKB=$(( ( RANDOM % 1000 )  + 1 ));
	printf "{\"tx\": \"$TKB\", \"rx\": \"$RKB\"}" | nc -lU ../datasocket
	sleep 1;
done
