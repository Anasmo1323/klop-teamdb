const fs = require('fs');
const path = require('path');
const dirPath = 'C:\\Users\\Anas Mohamed\\Desktop\\Work\\KLS-Martin\\Pipelines';
const folders = fs.readdirSync(dirPath).filter(f => fs.statSync(path.join(dirPath, f)).isDirectory());
console.log(JSON.stringify(folders));
