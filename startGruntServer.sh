#!/bin/bash
cd `dirname $0`




GRUNT=`which grunt`
PID=/tmp/.arbor.grunt.pid

case "$1" in
         ""|start)
         echo "Starting grunt..."
         if [ -f $PID ]
                then
                echo "Sorry, but grunt is already running here... ($PID)" 
                exit 1
         fi
         nohup $GRUNT serve > /dev/null 2>/dev/null &
         echo $! > $PID
         echo "Done."
         ;;

        stop)
         echo "Stopping grunt..."
         if [ -f $PID ]
                then
                xargs kill -9 < $PID
                rm $PID
                echo "Done."
                exit 0
         fi
         echo "Sorry, but grunt is not running here..."
         exit 1
         ;;

        *)
         echo "Usage: startGruntServer {start|stop}"
         exit 1
         ;;
esac

exit 0

