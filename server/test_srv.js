const dns = require('dns').promises;

// Set Google DNS
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

async function testSrv() {
    try {
        const hostname = '_mongodb._tcp.cluster0.no3plf8.mongodb.net';
        console.log('Resolving SRV for:', hostname);
        const addresses = await dns.resolveSrv(hostname);
        console.log('✅ Success! SRV records:', JSON.stringify(addresses, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('❌ SRV Resolution failed:');
        console.error(err);
        process.exit(1);
    }
}

testSrv();
