
var vscode = require('vscode');
var $$path = require('path');
var $$fs = require('fs');

function activate(context) {
    // console.log('Congratulations, your extension "savebackup" is now active!');

    var disposable = vscode.commands.registerTextEditorCommand('extension.saveBackup.backupFile', function (textEditor, edit) {
        backupFile(textEditor.document);
    });
    vscode.workspace.onDidSaveTextDocument(function (document) {
        backupFile(document);
    });

    context.subscriptions.push(disposable);
}

function saveBackupFile(sBakPath, sFileText) {
    var sFileDir = $$path.dirname(sBakPath);
    console.log(
        `/////////// inside saveBackupFile -- before mkdir\n`,
        `sFileDir:`, sFileDir
        );
    console.log(
        `/////////// inside saveBackupFile -- before mkdir\n`,
        `!$$fs.existsSync(sFileDir):`, !$$fs.existsSync(sFileDir)
        );
    // console.log(
    //     `/////////// inside saveBackupFile -- before mkdir\n`,
    //     `!$$fs.stat(sFileDir, (err, stats) => console.log(stats.isDirectory())):`,
    //     !$$fs.stat(sFileDir, (err, stats) => console.log(`stats.isDirectory(): ${stats.isDirectory()}`))
    //     );
    $$fs.stat(sFileDir, (err, stats) => console.log(`stats.isDirectory(): ${stats.isDirectory()}
    err: ${err}
    sFileDir: ${sFileDir}`))

    if (!$$fs.existsSync(sFileDir)) {
        console.log(`dir tree does not exist, trying to create it`);
        
        $$fs.mkdirSync(sFileDir, {recursive: true});
    }
    console.log(
        `/////////// inside saveBackupFile -- after if(dir exist)\n`,
        `sFileDir:`, sFileDir
        );
    console.log(
        `/////////// inside saveBackupFile 2-- \n`,
        `sFileText:\n`, sFileText, `\n`,
    );
    console.log(
        `/////////// inside saveBackupFile 3-- \n`,
        `sBakPath:`, sBakPath, `\n`
    );
    $$fs.writeFileSync(sBakPath, sFileText);
}

function flatSave(oConf, sFileText, sFilePath, sBakPath) {
    console.log(
        `/////////// inside flatSave 1-- oConf:`, oConf, `\n`,
    );
    console.log(
        `/////////// inside flatSave 2-- \n`,
        `sFileText:\n`, sFileText, `\n`,
    );
    console.log(
        `/////////// inside flatSave 3-- \n`,
        `sFilePath:`, sFilePath, `\n`,
    );
    console.log(
        `/////////// inside flatSave 4-- \n`,
        `sBakPath:`, sBakPath, `\n`
    );

    try {
        var sFileName = $$path.basename(sFilePath);
        console.log(
            `/////////// inside flatSave -- try\n`,
            `sFileName:`, sFileName
            );
        
        if (new RegExp(oConf.fileNameMatch).test(sFileName)) {
            saveBackupFile(sBakPath, sFileText)
        }

        console.log(`successfully backed up by saveBackup?`);
        
        vscode.window.showInformationMessage(`${sFileName} successfully backed up by saveBackup`);
    } catch (error) {
        vscode.window.showErrorMessage(`extension.saveBackup : ${error.message}`);
    }
}

function backupFile(document) {
    var sFileText = document.getText();
    var sFilePath = document.uri.path;
    var oConf = vscode.workspace.getConfiguration('saveBackup.conf');
    console.log(
            `/////////// inside backupFile -- before if(oConf.enable)\n`,
            `oConf:`, oConf
            );
    console.log(
            `/////////// inside backupFile -- before if(oConf.enable)\n`,
            `$$path.basename(sFilePath):`, $$path.basename(sFilePath)
            );
    
    if (oConf.enable) {
        var backupDir = getParsePath(oConf.backupDir);
        console.log(
            `/////////// inside backupFile -- after if(oConf.enable)\n`,
            `backupDir:`, backupDir
            );
        console.log(
            `/////////// inside backupFile -- after if(oConf.enable)\n`,
            `$$fs.existsSync(backupDir):`, $$fs.existsSync(backupDir)
            );
        if ($$fs.existsSync(backupDir)) {
            var sBakPath
            if (oConf.recreateSubfolders) {
                const dirPath = rebuildBakPath(oConf, backupDir, sFilePath);
                console.log(
                `/////////// inside backupFile -- recreateSubfolders === true\n`,
                `dirPath:`, dirPath
                );
                const fileName = rebuildFileName(sFilePath, backupDir)
                console.log(
                `/////////// inside backupFile -- recreateSubfolders === true\n`,
                `fileName:`, fileName
                );
                sBakPath = $$path.join(dirPath, fileName);
                console.log(
                `/////////// inside backupFile -- recreateSubfolders === true\n`,
                `sBakPath:`, sBakPath
                );
            } else {
                if (sFilePath[0] === '/') {
                    sFilePath = sFilePath.slice(1); 
                }
                sBakPath = buildeBakPath(sFilePath, backupDir);
            }
            flatSave(oConf, sFileText, sFilePath, sBakPath)
        } else {
            vscode.window.showErrorMessage(`extension.saveBackup : ${backupDir} does not exist. Create the dir, or configure an existing one in saveBackup.conf.backupDir`);
        }
    }
}

function buildeBakPath(sFilePath, sBackupDir) {
    var sNewPath = sFilePath.replace(/[\/:]/g, '_');
    var sR = $$path.join(sBackupDir, sNewPath);
    var sExName = $$path.extname(sFilePath);
    var oD = new Date(); 
    var sTime = `${oD.getFullYear()}${c2(oD.getMonth()+1)}${c2(oD.getDate())}`;
    sTime += `_${c2(oD.getHours())}${c2(oD.getMinutes())}${c2(oD.getSeconds())}` + '_' + (+oD).toString().slice(-3);
    sR = $$path.join(sR, sTime + sExName).replace(/\\/g, '/');

    return sR;
}

function rebuildBakPath(oConf, backupDir, sFilePath) {
    return oConf.recreateFullSubfolders ?
        $$path.join(backupDir, sFilePath
            .replace($$path.basename(sFilePath), ''))
            :
        $$path.join(backupDir, sFilePath
            .replace($$path.join(__dirname, '../..'), '')
            .replace($$path.basename(sFilePath), '')
            )
}

function rebuildFileName(sFilePath) {
    const fN_extension = $$path.extname(sFilePath);
    const fN_base = $$path.basename(sFilePath, fN_extension)
    console.log(
        `/////////// inside backupFile -- after if(oConf.enable)\n`,
        `fN_extension:`, fN_extension
        );
    console.log(
        `/////////// inside backupFile -- after if(oConf.enable)\n`,
        `fN_base:`, fN_base
        );

    var oD = new Date(); 
    var sTime = `${oD.getFullYear()}${c2(oD.getMonth()+1)}${c2(oD.getDate())}`;
    sTime += `_${c2(oD.getHours())}${c2(oD.getMinutes())}${c2(oD.getSeconds())}_${(+oD).toString().slice(-3)}`;

    sR = `${fN_base}--${sTime}${fN_extension}`;

    return sR;
}

function getParsePath(sPath) {
    var sVscodeDir = $$path.join(__dirname, '../..');
    console.log(
        `/////////// inside getParsePath -- before replace\n`,
        `sPath:`, sPath, '\n',
        `sVscodeDir:`, sVscodeDir,
        );
    sPath = sPath.replace('${.vscode}', sVscodeDir);
    console.log(
        `/////////// inside getParsePath -- after replace\n`,
        `sPath:`, sPath, '\n',
        `sPath.replace(/\\/g, '/'):`, sPath.replace(/\\/g, '/'),
        );
    return sPath.replace(/\\/g, '/');
}

function c2(n) {
    return (n/100).toFixed(2).slice(-2);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;




