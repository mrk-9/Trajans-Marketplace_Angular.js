## trajans.market

A market place for Trajans with Braintree and Coinjar Integration.

## Deployment

Make sure you have node.js and git installed

Clone project repository from https://bitbucket.org/trajans/trajans.market (currently develop is used for latest version)

Install dependencies:

```
sudo npm install
sudo bower install
cd server
sudo npm install
```

Compile server:

Make sure you have typescript installed globally (check with tsc --version)
If not install globally with
```
npm install -g typescript
```

compile server side code with:

```
cd server
sudo tsc
```

Build client:

Run grunt build with
```
sudo grunt build
```

Change config file:

Default settings are located in /server/data/config.json
You can override them locally in /server/local/config.local.json

Run server:

Start server with script file located at /server/build/src/trajans.js (you can use forever/pm2 for production)

## Admin access

Admin access needs to be granted via the mongodb console. You can use this command to give access to a user:

```
Update user roles via mongodb shell:

db.users.update({"username" : "kahnhood"}, { $set : { roles : ["admin"]}})
```

Admin access is at following address:

```
#!/admin
```


## Interact with bitcoin

Trajans now uses bitcore.io for transactions, there is a file in app/constants/constants.js where fee's and address management can be changed.

Bitcoind was swapped out in favour of bitcore.io.

We use blockr.io for checking bitcoin balances.  This may need to change depending on if blockr API is ever down.  I think the API is used in ordersFactory.js and socketService.js, may need to update this area as to where else its used.

## Backups

Back up script located at `/root/trajandump`
Run the command > `backup-trajan.sh` to save a database backup.

May need to cron this every so often as it is manaul process at the moment.
