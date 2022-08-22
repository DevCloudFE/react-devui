import lernaJson from 'lerna.json';
import packageJson from 'package.json';

export default function (name: string) {
  return `{
  "name": "${name} - ${lernaJson.version}",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.tsx",
  "dependencies": {
    "@react-devui/hooks": "${lernaJson.version}",
    "@react-devui/icons": "${lernaJson.version}",
    "@react-devui/ui": "${lernaJson.version}",
    "@react-devui/utils": "${lernaJson.version}",
    "react": "${packageJson.dependencies['react']}",
    "react-dom": "${packageJson.dependencies['react-dom']}",
    "react-scripts": "latest",
    "sass": "latest"
  },
  "devDependencies": {
    "@types/react": "${packageJson.dependencies['@types/react']}",
    "@types/react-dom": "${packageJson.dependencies['@types/react-dom']}",
    "typescript": "${packageJson.dependencies['typescript']}"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
}
`;
}
