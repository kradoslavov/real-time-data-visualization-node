#!/bin/bash
printf "{\"tx\": \"0\", \"rx\": \"0\"}" | nc -lU ./datasocket
while true
do
	TKB=$(( ( RANDOM % 1000 )  + 1 ));
	RKB=$(( ( RANDOM % 1000 )  + 1 ));
	printf "{\"tx\": \"$TKB\", \"rx\": \"$RKB\"}" | nc -U ./datasocket
	sleep 1;
done
