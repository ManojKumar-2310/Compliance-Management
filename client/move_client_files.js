const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client');
const destDir = __dirname;

console.log(`Source: ${srcDir}`);
console.log(`Dest: ${destDir}`);

if (!fs.existsSync(srcDir)) {
    console.log('Source directory does not exist!');
    process.exit(1);
}

// Function to copy directory recursively
const copyRecursiveSync = (src, dest) => {
    const stats = fs.statSync(src);
    const isDirectory = stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        // If file exists, delete it first to ensure overwrite
        if (fs.existsSync(dest)) {
            fs.unlinkSync(dest);
        }
        fs.copyFileSync(src, dest);
    }
};

const items = fs.readdirSync(srcDir);

items.forEach(item => {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);

    console.log(`Processing ${item}...`);

    try {
        copyRecursiveSync(srcPath, destPath);
        console.log(`Moved ${item}`);
    } catch (err) {
        console.error(`Error processing ${item}: ${err.message}`);
    }
});

// Optional: Start cleanup (commented out to be safe first)
// try {
//   fs.rmdirSync(srcDir, { recursive: true });
// } catch (e) { console.error('Cleanup failed', e); }
