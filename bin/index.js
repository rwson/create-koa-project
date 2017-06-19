#!/usr/bin/env node

import * as cp from "child_process";
import * as path from "path";
import * as inquirer from "inquirer";
import * as fse from "fs-extra-promise";
import * as cConsole from "color-console";
import minimist from "minimist";


const args = minimist(process.argv.slice(2))["_"];

cConsole.green("this command will create project based on koa2, if you want to use koa1, please use 'create-koa-app koa#1 <project name>'");

if (!args.length) {
    cConsole.red("you must provide the project name you will create!");
    process.exit(1);
}

const templatesMap = {
        JavaScript: path.resolve(__dirname, "../", "templates/javascript"),
        TypeScript: path.resolve(__dirname, "../", "templates/typescript")
    },
    cwd = process.cwd();

let projectCfgMap = {
    JavaScript: fse.readJsonSync(path.resolve(templatesMap.JavaScript, "package.json")),
    TypeScript: fse.readJsonSync(path.resolve(templatesMap.TypeScript, "package.json"))
};

inquirer.prompt({
    name: "language",
    message: "which language would you like to write this project?",
    choices: ["JavaScript", "TypeScript"],
    type: "list"
}).then(async({ language }) => {
    let target, copyRes, installRes, interval, name, version, description, main, asyncRes;

    //  initialize variables
    name = args[0];
    version = "1.0.0";
    description = "a koa app";
    main = "index.js";
    target = path.join(cwd, name);

    //  copy file
    cConsole.green("copying files ...");
    copyRes = await await fse.copySync(templatesMap[language], target);
    cConsole.green("copy file success!");

    //  user input some project infomation
    name = await projectName(name);
    version = await projectVersion(version);
    description = await projectDescription(description);
    main = await projectMain(main);
    projectCfgMap[language] = mergeInfo(projectCfgMap[language], name, version, description, main);
    await fse.outputJsonSync(path.join(target, "package.json"), projectCfgMap[language]);

    //  install dependences
    interval = startLoader();
    installRes = await installDep(target);
    if (installRes) {
        clearInterval(interval);
        process.stdout.write("\n");
        if (installRes.success) {
            cConsole.green("dependences install success!");
        } else {
            cConsole.red("dependences install fail with following message!");
            cConsole.red(installRes.errorInfo.toString());
        }

        //  output some developing infomation
        outputInfo(language, name, target);
        process.exit(1);
    }
});

//  user select project name
async function projectName(defaultName) {
    return await inquirer.prompt({
        name: "name",
        message: "your project name",
        type: "input",
        default: defaultName
    });
}

//  user select project version
async function projectVersion(defaultVersion) {
    return await inquirer.prompt({
        name: "version",
        message: "your project version",
        type: "input",
        default: defaultVersion
    });
}

//  user select project description
async function projectDescription(defaultDescription) {
    return await inquirer.prompt({
        name: "description",
        message: "your project description",
        type: "input",
        default: defaultDescription
    });
}

//  user input project main
async function projectMain(defaultMain) {
    return await inquirer.prompt({
        name: "main",
        message: "your project main scripts",
        type: "input",
        default: defaultMain
    });
}

//  installing packages
async function installDep(target) {
    const useYarn = yarnAccess();
    let install = null,
        errorInfo = {};
    try {
        return new Promise((resolve, reject) => {
            errorInfo = false;

            if (useYarn) {
                install = cp.spawn("yarn", {
                    cwd: target
                });
            } else {
                install = cp.spawn("npm", ["install"], {
                    cwd: target
                });
            }

            install.stdout.on("data", (info) => {
                info = info.toString();
                if (/error/gi.test(info)) {
                    errorInfo = info;
                }
            });

            install.stderr.on("error", (ex) => {
                errorInfo = ex;
            });

            install.on("close", (code) => {
                if (Object.keys(errorInfo).length === 0 || errorInfo.length === 0) {
                    resolve({
                        success: true
                    });
                } else {
                    resolve({
                        success: false,
                        errorInfo
                    });
                }
            });
        });
    } catch (e) {
        return {
            success: false,
            error: ex
        };
    }
}

//  should use yarn
function yarnAccess() {
    try {
        cp.execSync("yarnpkg --version", { stdio: "ignore" });
        return false;
    } catch (e) {
        return false;
    }
}

//  installing packages loader
function startLoader() {
    return (function() {
        var P = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
        var x = 0;
        return setInterval(() => {
            process.stdout.write("\r" + P[x++] + " installing packages. this might take a couple minutes...");
            x &= 7;
        }, 80);
    })()
}

//  output some develop infomation
function outputInfo(language, { name }, target) {
    console.log(`project create success! created ${name} at ${target}\n`);
    console.log("inside that directory, you can run following commands:\n");
    switch(language) {
        case "JavaScript":
            cConsole.green("npm run dev");
            console.log("   use nodemon to run your app\n");
            cConsole.green("npm run pm2");
            console.log("   use pm2 to run your app\n");
        break;
        case "JavaScript":
            cConsole.green("npm run dev");
            console.log("   typescript watch file changes & use nodemon to run your app\n");
        break;
        default:
        break;
    }
    console.log("happy coding! ^_^");
}

//  merge keys to object
function mergeInfo(obj1, { name }, { version }, { description }, { main }) {
    obj1.name = name;
    obj1.version = version;
    obj1.description = description;
    obj1.main = main;
    return obj1;
}
