const fs = require('fs');
const path = require('path');

// Configuration
const dirsToCheck = [
  'pages',
  'src/pages',
  'app',
  'src/app'
];

// Should we actually make changes or just simulate?
const DRY_RUN = false; // Set to false to actually make changes

// Target parameter names to standardize to
const PREFERRED_PARAMS = {
  'messageId': 'id',
  'conversationId': 'id'
};

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
      const paramMatch = file.match(/\[(\w+)\]/);
      if (paramMatch && paramMatch[1]) {
        const paramName = paramMatch[1];
        
        fileList.push({
          type: 'file',
          path: filePath,
          paramName: paramName
        });
      }
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
  // Create a normalized path by replacing the specific param name with PARAM
  let normalizedPath = route.path;
  
  // Replace the parameter name in the path
  if (route.type === 'directory') {
    // For directories, the parameter is in the last directory segment
    const dirParts = normalizedPath.split(path.sep);
    dirParts[dirParts.length - 1] = '[PARAM]';
    normalizedPath = dirParts.join(path.sep);
  } else {
    // For files, the parameter is in the filename
    const dirParts = normalizedPath.split(path.sep);
    const fileName = dirParts[dirParts.length - 1];
    dirParts[dirParts.length - 1] = fileName.replace(/\[\w+\]/, '[PARAM]');
    normalizedPath = dirParts.join(path.sep);
  }
  
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
      
      // Fix the conflicts by renaming files/directories to preferred parameter names
      group.forEach(route => {
        if (PREFERRED_PARAMS[route.paramName]) {
          const targetParamName = PREFERRED_PARAMS[route.paramName];
          
          if (route.type === 'directory') {
            const dirParts = route.path.split(path.sep);
            dirParts[dirParts.length - 1] = `[${targetParamName}]`;
            const newPath = dirParts.join(path.sep);
            
            console.log(`Would rename directory: ${route.path} -> ${newPath}`);
            if (!DRY_RUN) {
              try {
                // Check if target directory already exists
                if (fs.existsSync(newPath)) {
                  console.log(`Target directory ${newPath} already exists. Removing ${route.path}`);
                  // Recursively delete directory
                  fs.rmdirSync(route.path, { recursive: true });
                } else {
                  fs.renameSync(route.path, newPath);
                  console.log(`Renamed directory to ${newPath}`);
                }
              } catch (err) {
                console.error(`Error renaming directory: ${err.message}`);
              }
            }
          } else {
            const dirParts = route.path.split(path.sep);
            const fileName = dirParts[dirParts.length - 1];
            dirParts[dirParts.length - 1] = fileName.replace(`[${route.paramName}]`, `[${targetParamName}]`);
            const newPath = dirParts.join(path.sep);
            
            console.log(`Would rename file: ${route.path} -> ${newPath}`);
            if (!DRY_RUN) {
              try {
                // Check if target file already exists
                if (fs.existsSync(newPath)) {
                  console.log(`Target file ${newPath} already exists. Removing ${route.path}`);
                  fs.unlinkSync(route.path);
                } else {
                  fs.renameSync(route.path, newPath);
                  console.log(`Renamed file to ${newPath}`);
                }
              } catch (err) {
                console.error(`Error renaming file: ${err.message}`);
              }
            }
          }
        }
      });
    }
  }
});

// Check for duplicate routes and clean up
console.log('\nLooking for duplicates between pages/ and src/pages/...');

// Group by filename (ignoring the directory part)
const fileNameGroups = {};
allRoutes.forEach(route => {
  let basePath;
  if (route.type === 'directory') {
    basePath = route.path.split(path.sep).pop();
  } else {
    basePath = route.path.split(path.sep).pop();
  }
  
  if (!fileNameGroups[basePath]) {
    fileNameGroups[basePath] = [];
  }
  fileNameGroups[basePath].push(route);
});

// Find duplicates
Object.keys(fileNameGroups).forEach(fileName => {
  const group = fileNameGroups[fileName];
  if (group.length > 1) {
    console.log(`\nDuplicate found: ${fileName}`);
    
    // Sort: prioritize src/pages over pages
    group.sort((a, b) => {
      const aInSrc = a.path.includes('src/pages');
      const bInSrc = b.path.includes('src/pages');
      
      if (aInSrc && !bInSrc) return -1;
      if (!aInSrc && bInSrc) return 1;
      return 0;
    });
    
    // Keep the first one (src/pages), delete the rest
    console.log(`Keeping: ${group[0].path}`);
    for (let i = 1; i < group.length; i++) {
      console.log(`Would remove: ${group[i].path}`);
      if (!DRY_RUN) {
        try {
          if (group[i].type === 'directory') {
            fs.rmdirSync(group[i].path, { recursive: true });
          } else {
            fs.unlinkSync(group[i].path);
          }
          console.log(`Removed: ${group[i].path}`);
        } catch (err) {
          console.error(`Error removing ${group[i].path}: ${err.message}`);
        }
      }
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

console.log('\nDone analyzing routes.');
if (DRY_RUN) {
  console.log('This was a dry run - no changes were made. Set DRY_RUN = false to apply changes.');
} else {
  console.log('Changes have been applied. Please check your project files and build again.');
} 