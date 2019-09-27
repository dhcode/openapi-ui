const fs = require('fs');
const path = require('path');
const os = require('os');
const spawn = require('child_process').spawnSync;
const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

const newVersion = process.env.npm_package_version;
if (!newVersion) {
  throw new Error('No version provided');
}

const projectsDir = 'projects';

for (const projectName of fs.readdirSync(projectsDir)) {
  const projectPath = path.join(projectsDir, projectName);
  const stat = fs.statSync(projectPath);
  if (stat.isDirectory()) {
    console.log(`set version of ${projectPath} to ${newVersion}`);

    spawn(npmCmd, ['version', newVersion], { cwd: projectPath, stdio: 'inherit' });
    spawn('git', ['add', path.join(projectPath, 'package.json')], { stdio: 'inherit' });
  }
}
