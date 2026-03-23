const fs = require('fs');
const path = require('path');

const copyRecursiveSync = (src, dest) => {
    if (!fs.existsSync(src)) return;
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
        fs.copyFileSync(src, dest);
    }
};

console.log('Starting directory copy...');
try {
    copyRecursiveSync(path.join(__dirname, 'server', 'src'), path.join(__dirname, 'src'));
    console.log('Successfully copied src directory.');
} catch (e) {
    console.error('Error copying src:', e.message);
}

try {
    copyRecursiveSync(path.join(__dirname, 'server', 'uploads'), path.join(__dirname, 'uploads'));
    console.log('Successfully copied uploads directory.');
} catch (e) {
    console.error('Error copying uploads:', e.message);
}
