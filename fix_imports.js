const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const files = walk('./resources/js');
let changedCount = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('@/components/')) {
        content = content.replace(/@\/components\//g, '@/Components/');
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log(`Updated: ${file}`);
    }
});
console.log(`Total files updated: ${changedCount}`);
