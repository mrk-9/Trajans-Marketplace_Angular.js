#!/bin/bash

#Force file syncronization and lock writes
mongo admin --eval "printjson(db.fsyncLock())"

MONGODUMP_PATH="/usr/bin/mongodump"
MONGO_HOST="91.121.220.161" #replace with your server ip
MONGO_PORT="27017"
MONGO_DATABASE="trajans-marketplace-dev"

TIMESTAMP=`date +%F-%H%M`

# Create backup
$MONGODUMP_PATH -h $MONGO_HOST:$MONGO_PORT -d $MONGO_DATABASE

# Add timestamp to backup
mv dump mongodb-$HOSTNAME-$TIMESTAMP
tar cf mongodb-$HOSTNAME-$TIMESTAMP.tar mongodb-$HOSTNAME-$TIMESTAMP

#Unlock database writes
mongo admin --eval "printjson(db.fsyncUnlock())"
