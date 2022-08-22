import lernaJson from 'lerna.json';
import packageJson from 'package.json';

export default function (name: string) {
  return [
    `{
    "name": "${name} - ${lernaJson.version}",
    "version": "0.0.0",
    "private": true,
    "dependencies": {
      "@react-devui/hooks": "${lernaJson.version}",
      "@react-devui/icons": "${lernaJson.version}",
      "@react-devui/ui": "${lernaJson.version}",
      "@react-devui/utils": "${lernaJson.version}",
      "@types/react": "${packageJson.dependencies['@types/react']}",
      "@types/react-dom": "${packageJson.dependencies['@types/react-dom']}",
      "react": "${packageJson.dependencies['react']}",
      "react-dom": "${packageJson.dependencies['react-dom']}",
      "sass": "latest"
    },
    "scripts": {
      "start": "react-scripts start",
      "build": "react-scripts build",
      "test": "react-scripts test --env=jsdom",
      "eject": "react-scripts eject"
    },
    "devDependencies": {
      "react-scripts": "latest"
    }
  }
  `,
    {
      '@react-devui/hooks': `${lernaJson.version}`,
      '@react-devui/icons': `${lernaJson.version}`,
      '@react-devui/ui': `${lernaJson.version}`,
      '@react-devui/utils': `${lernaJson.version}`,
      '@types/react': `${packageJson.dependencies['@types/react']}`,
      '@types/react-dom': `${packageJson.dependencies['@types/react-dom']}`,
      react: `${packageJson.dependencies['react']}`,
      'react-dom': `${packageJson.dependencies['react-dom']}`,
      sass: 'latest',
    },
  ] as const;
}
