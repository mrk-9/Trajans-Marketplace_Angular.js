var bitcore = require('bitcore');
var assert = require('assert');
bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;

var index = 99999999;

/*
tprv8ZgxMBicQKsPd2iJoc9JzKMF97q3uGs3XjXX7yRzF34UX7v2hVZrzDxRK2YPN1sK97iWhdRqjuWkVcgDmkgmZ1N5ZpHR22iR75Pfa6ushWM
---
tpubD6NzVbkrYhZ4WVk6hFouPj1Mi9Lz4c3x738JQVUHfJrsMcAoKtPTAiaHV8XkE2AYwP8tEXNzVaLNkGWEwh4dZ8erWxhrVrdGoqN9keUQ5p8

Max keys can be created = 99999999

*/

// Get master key from database.

var hdPublicKey = new bitcore.HDPublicKey('tpubD6NzVbkrYhZ4WVk6hFouPj1Mi9Lz4c3x738JQVUHfJrsMcAoKtPTAiaHV8XkE2AYwP8tEXNzVaLNkGWEwh4dZ8erWxhrVrdGoqN9keUQ5p8');

// Derive new public address from public key.

var derivedAddress = new bitcore.Address(hdPublicKey.derive(index).publicKey);

//Check balance of new derived address.

console.log(derivedAddress.toString());