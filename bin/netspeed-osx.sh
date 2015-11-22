#!/bin/bash

INTERVAL="1"  # update interval in seconds

if [ -z "$1" ]; then
        echo
        echo usage: $0 [network-interface]
        echo
        echo e.g. $0 eth0
        echo
        exit
fi

IF=$1

while true
do
        RATES1=`netstat -bi -I $IF | grep -v Ibytes | head -n 1 | awk '{ x = $7; y = $10 } END { print x,y }'`;
	RATESARR1=($RATES1);
        R1=${RATESARR1[0]}
        T1=${RATESARR1[1]}
	sleep $INTERVAL
	RATES2=`netstat -bi -I $IF | grep -v Ibytes | head -n 1 | awk '{ x = $7; y = $10 } END { print x,y }'`;
        RATESARR2=($RATES2);
        R2=${RATESARR2[0]}
        T2=${RATESARR2[1]}
	TB=`expr $T2 - $T1`
        RB=`expr $R2 - $R1`
        TKB=`expr $TB / 1024`
        RKB=`expr $RB / 1024`
        printf "{\"tx\": \"$TKB\", \"rx\": \"$RKB\"}" | nc -U ../datasocket
done
