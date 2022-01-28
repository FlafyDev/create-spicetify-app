#!/usr/bin/env node

import inquirer from 'inquirer'
import download from 'download-git-repo'
import fs from 'fs-extra';
import chalk from 'chalk'
import path from 'path/posix';

console.log(process.cwd(0))

const __dirname = path.resolve();

const questions = [
  {
    type: 'list',
    name: 'type',
    message: `What's your app's type?`,
    choices: ['Extension', 'Custom App'],
    filter(val) {
      return val.toLowerCase();
    },
  },
  {
    type: 'input',
    name: `displayName`,
    message: `What's the name of your app?`,
    default: 'My App',
    when(answers) {
      return answers['type'] === 'custom app'
    }    
  },
  {
    type: 'input',
    name: `nameId`,
    message: `What's the name id of your app?`,
    default: 'my-app',
    async validate(value) {
      if (value.match(
        /^[a-z,\-,_]*[a-z,_]$/
      )) {
        if (await fs.stat(value).then(() => false).catch(() => true)) {
          return true;
        } else {
          return "A folder with this name already exists.";
        }
      } else {
        return "Please enter a valid name id";
      }
    }
  },
  {
    type: 'confirm',
    name: 'example',
    message: 'Do you want to generate an example? (Recommended)',
    default: true,
  }
];

inquirer.prompt(questions).then(async (answers) => {
  const projectDir = path.join(__dirname, answers['nameId'])
  await new Promise((resolve, reject) => download("FlafyDev/spicetify-creator", projectDir, undefined, (err) => resolve()))
  
  if (answers['example']) {
    let settings;
    if (answers['type'] === "extension") {
      await fs.copy('./extension-template', path.join(projectDir, 'src'));
      settings = {
        nameId: answers['nameId']
      }
    } else {
      await fs.copy('./customapp-template', path.join(projectDir, 'src'));
      settings = {
        displayName: answers['displayName'],
        nameId: answers['nameId'],
        icon: "css/icon.svg",
        activeIcon: "css/icon.svg",
      }
    }

    await fs.writeFile(path.join(projectDir, 'settings.json'), JSON.stringify(settings, null, 2));
  }
});