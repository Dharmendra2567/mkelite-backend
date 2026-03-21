const fs = require('fs');
const path = require('path');

const dirsToRemove = ['controllers', 'models', 'routes', 'services'];

dirsToRemove.forEach(dir => {
    const fullPath = path.join(__dirname, 'src', dir);
    if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`Removed ${fullPath}`);
    }
});
console.log('Cleanup complete.');
