import { execSync } from 'child_process';
import { platform } from 'os';

if (platform() === 'linux') {
  execSync('chmod ug+x .husky/*');
}
