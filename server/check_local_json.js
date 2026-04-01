const fs = require('fs');
const path = require('path');

const files = [
    'cms_db.departments.json',
    'cms_db.documents.json',
    'cms_db.missions.json',
    'cms_db.refreshtokens.json',
    'cms_db.regulations.json',
    'cms_db.tasks.json',
    'cms_db.users.json'
];

console.log('--- Summary of Local JSON Exports found ---');
files.forEach(f => {
    const filePath = path.join(__dirname, f);
    if (fs.existsSync(filePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log(`${f.padEnd(30)}: Found ${data.length} records`);
        } catch (e) {
            console.log(`${f.padEnd(30)}: ERROR parsing JSON`);
        }
    } else {
        console.log(`${f.padEnd(30)}: NOT FOUND`);
    }
});
