const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'server');
const destDir = __dirname;

console.log(`Source: ${srcDir}`);
console.log(`Dest: ${destDir}`);

if (!fs.existsSync(srcDir)) {
    console.log('Source directory does not exist!');
    process.exit(1);
}

const items = fs.readdirSync(srcDir);

items.forEach(item => {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);

    console.log(`Processing ${item}...`);

    try {
        if (fs.existsSync(destPath)) {
            const srcStat = fs.statSync(srcPath);
            const destStat = fs.statSync(destPath);

            if (srcStat.isDirectory() && destStat.isDirectory()) {
                console.log(`Both are directories. Merging not implemented, but moving contents...`);
                // For simplicity, just rename src to dest_new and let user deal? 
                // No, we know structure. server/src -> server/src (doesn't exist in dest)
                // server/.env -> server/.env (doesn't exist)
                // server/package.json -> server/package.json (exists)
            } else if (srcStat.isFile() && destStat.isFile()) {
                console.log(`Overwriting file ${item}`);
                fs.unlinkSync(destPath);
                fs.renameSync(srcPath, destPath);
            } else {
                console.log(`Type mismatch for ${item}, skipping.`);
            }
        } else {
            console.log(`Moving ${item} to ${destPath}`);
            fs.renameSync(srcPath, destPath);
        }
    } catch (err) {
        console.error(`Error processing ${item}: ${err.message}`);
    }
});

try {
    const remaining = fs.readdirSync(srcDir);
    if (remaining.length === 0) {
        fs.rmdirSync(srcDir);
        console.log('Removed empty source directory');
    } else {
        console.log('Source directory not empty:', remaining);
    }
} catch (err) {
    console.error('Error removing source directory:', err.message);
}
