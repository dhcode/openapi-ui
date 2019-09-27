const fs = require('fs');
const path = require('path');
const os = require('os');
const spawn = require('child_process').spawnSync;
const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

const projectsDir = 'dist';

for (const projectName of fs.readdirSync(projectsDir)) {
  const projectPath = path.join(projectsDir, projectName);
  const packageJson = path.join(projectPath, 'package.json');
  const stat = fs.statSync(projectPath);
  if (stat.isDirectory() && fs.existsSync(packageJson)) {
    console.log(`publish ${projectPath}`);

    spawn(npmCmd, ['publish', '--access', 'public', '.'], { cwd: projectPath, stdio: 'inherit' });
  }
}
