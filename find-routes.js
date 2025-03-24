const fs = require('fs');
const path = require('path');

// Directories to check
const dirsToCheck = [
  'pages',
  'src/pages',
  'app',
  'src/app'
];

// Function to recursively find files
function findFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // If it's a dynamic route directory
      if (file.startsWith('[') && file.endsWith(']')) {
        fileList.push({
          type: 'directory',
          path: filePath,
          paramName: file.slice(1, -1)
        });
      }
      
      // Continue recursion
      findFiles(filePath, fileList);
    } else if (file.match(/\[\w+\]\.(js|jsx|ts|tsx)$/)) {
      // Extract parameter name from filename
      const paramName = file.match(/\[(\w+)\]/)[1];
      
      fileList.push({
        type: 'file',
        path: filePath,
        paramName: paramName
      });
    }
  });
  
  return fileList;
}

// Find all dynamic routes
let allRoutes = [];
dirsToCheck.forEach(dir => {
  if (fs.existsSync(dir)) {
    const routes = findFiles(dir);
    allRoutes = allRoutes.concat(routes);
  }
});

// Print all dynamic routes
console.log('All dynamic routes:');
allRoutes.forEach(route => {
  console.log(`${route.path} (param: ${route.paramName})`);
});

// Analyze for potential conflicts
console.log('\nAnalyzing for conflicts...');

// Group by normalized path (replace parameter names with PARAM)
const pathGroups = {};
allRoutes.forEach(route => {
  const normalizedPath = route.path.replace(/\[\w+\]/, '[PARAM]');
  if (!pathGroups[normalizedPath]) {
    pathGroups[normalizedPath] = [];
  }
  pathGroups[normalizedPath].push(route);
});

// Find paths with different parameter names
let foundConflict = false;
Object.keys(pathGroups).forEach(path => {
  const group = pathGroups[path];
  if (group.length > 1) {
    const paramNames = new Set(group.map(r => r.paramName));
    if (paramNames.size > 1) {
      foundConflict = true;
      console.log(`\nConflict found in path pattern: ${path}`);
      console.log('Conflicting routes:');
      group.forEach(r => {
        console.log(`- ${r.path} (param: ${r.paramName})`);
      });
    }
  }
});

if (!foundConflict) {
  console.log('No direct conflicts found in path patterns.');
  
  // Find all unique parameter names
  const paramNames = new Set(allRoutes.map(r => r.paramName));
  console.log('\nParameter names used in your project:');
  paramNames.forEach(param => {
    console.log(`- ${param}`);
    // List routes using this parameter
    const routes = allRoutes.filter(r => r.paramName === param);
    routes.forEach(r => {
      console.log(`  * ${r.path}`);
    });
  });
} 