#!/usr/bin/env node

import * as cp from 'child_process';
import * as path from 'path';
import * as inquirer from 'inquirer';
import * as fse from 'fs-extra-promise';
import * as cConsole from 'color-console';
import minimist from 'minimist';
import nodeVersion from 'node-version';
import spawn from 'cross-spawn';

if (nodeVersion.major < 6) {
    cConsole.red('create-koa-app requires at least version 6 of NodeJs. Please upgrade!');
    process.exit(1);
}

const args = minimist(process.argv.slice(2))['_'];

if (!args.length) {
    cConsole.red('you must provide the project name you will create!');
    process.exit(1);
}

const templatesMap = {
        JavaScript: path.resolve(__dirname, '../', 'templates/javascript'),
        TypeScript: path.resolve(__dirname, '../', 'templates/typescript')
    },
    cwd = process.cwd();

let projectCfgMap = {
        JavaScript: fse.readJsonSync(path.resolve(templatesMap.JavaScript, 'package.json')),
        TypeScript: fse.readJsonSync(path.resolve(templatesMap.TypeScript, 'package.json')),
    },
    name = args[0],
    target = path.join(cwd, name);

const exists = fse.existsSync(target);

//  folder exits
if (exists) {
    cConsole.red(`The directory ${name} contains files that could conflict.`);
    process.exit(1);
}

// cConsole.cyan('this command will create project based on koa2, if you want to use koa1, please use 'create-koa-app koa#1 <project name>'');

inquirer.prompt({
    name: 'language',
    message: 'which language would you like to write this project?',
    choices: ['JavaScript', 'TypeScript'],
    type: 'list'
}).then(async({ language }) => {
    let target, installRes, name, version, description, main;

    //  tsc check
    if (language !== 'JavaScript' && !tscAccess()) {
        cConsole.red('you select `TypeScript` as your project language, but your system is missing global typescript environment!');
        cConsole.cyan('please run `npm install typescript -g` before you choose `TypeScript` as your project language');
        process.exit(1);
    }

    //  initialize variables
    name = args[0];
    version = '1.0.0';
    description = 'a koa app';
    main = 'index.js';
    target = path.join(cwd, name);

    //  copy file
    cConsole.cyan('copy files...');
    await fse.copySync(templatesMap[language], target);
    cConsole.cyan('copy file success!');

    //  user input some project information
    name = await projectName(name);

    if (name.name !== args[0]) {
        fse.moveSync(target, path.join(cwd, name.name));
        target = path.join(cwd, name.name);
    }

    version = await projectVersion(version);
    description = await projectDescription(description);
    main = await projectMain(main);
    projectCfgMap[language] = mergeInfo(projectCfgMap[language], name, version, description, main);
    await fse.outputJsonSync(path.join(target, 'package.json'), projectCfgMap[language]);

    //  install dependence
    cConsole.cyan('installing packages, this might take a couple minutes...');
    installRes = await installDep(target);
    console.log('');
    if (installRes.success) {
        cConsole.cyan('dependencies install success!');
        //  output some developing information
        outputInfo(language, name, target);
    } else {
        await fse.removeSync(target);
        cConsole.red('dependencies install fail!');
    }
    process.exit(1);
});

//  user select project name
async function projectName(defaultName) {
    return await inquirer.prompt({
        name: 'name',
        message: 'your project name',
        type: 'input',
        default: defaultName
    });
}

//  user select project version
async function projectVersion(defaultVersion) {
    return await inquirer.prompt({
        name: 'version',
        message: 'your project version',
        type: 'input',
        default: defaultVersion
    });
}

//  user select project description
async function projectDescription(defaultDescription) {
    return await inquirer.prompt({
        name: 'description',
        message: 'your project description',
        type: 'input',
        default: defaultDescription
    });
}

//  user input project main
async function projectMain(defaultMain) {
    return await inquirer.prompt({
        name: 'main',
        message: 'your project main scripts',
        type: 'input',
        default: defaultMain
    });
}

//  installing packages
async function installDep(target) {
    const useYarn = yarnAccess();
    let install;
    try {
        return new Promise((resolve, reject) => {
            if (useYarn) {
                cConsole.cyan('your command line supported \'yarn\', use yarn to install dependencies');
                install = spawn('yarn', {
                    cwd: target,
                    stdio: 'inherit'
                });
            } else {
                cConsole.cyan('your command line unsupported \'yarn\', use npm to install dependencies');
                install = spawn('npm', ['install', '--exact'], {
                    cwd: target,
                    stdio: 'inherit'
                });
            }

            install.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        success: true
                    });
                } else {
                    resolve({
                        success: false
                    });
                }
            });
        });
    } catch (e) {
        return {
            success: false,
            error: e
        };
    }
}

//  should use yarn
function yarnAccess() {
    try {
        cp.execSync('yarnpkg --version', {
            stdio: 'ignore'
        });
        return true;
    } catch (e) {
        return false;
    }
}

//  global typescript environment
function tscAccess() {
    try {
        cp.execSync('tsc -v', {
            stdio: 'ignore'
        });
        return true;
    } catch (e) {
        return false;
    }
}

//  output some develop infomation
function outputInfo(language, { name }, target) {
    const useYarn = yarnAccess();
    console.log(`project create success! ${name} at ${cwd}\n`);
    console.log('inside that directory, you can run following commands:\n');
    switch (language) {
        case 'JavaScript':
            cConsole.cyan(`${useYarn ? 'yarn' : 'npm'} run dev`);
            console.log('   use nodemon to run your app\n');
            cConsole.cyan(`${useYarn ? 'yarn' : 'npm'} run pm2`);
            console.log('   use pm2 to run your app\n');
            break;
        case 'JavaScript':
            cConsole.cyan(`${useYarn ? 'yarn' : 'npm'} run dev`);
            console.log('   typescript watch file changes & use nodemon to run your app\n');
            break;
        default:
            break;
    }
    console.log('happy coding! ^_^');
}

//  merge keys to object
function mergeInfo(obj1, { name }, { version }, { description }, { main }) {
    obj1.name = name;
    obj1.version = version;
    obj1.description = description;
    obj1.main = main;
    return obj1;
}