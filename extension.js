
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

function flatSave(oConf, sFileText, sFilePath, sBakPath) {
    try {
        var sFileName = $$path.basename(sFilePath);
        if (new RegExp(oConf.fileNameMatch).test(sFileName)) {
            var sFileDir = $$path.dirname(sBakPath);
            if (!$$fs.existsSync(sFileDir)) {
                $$fs.mkdirSync(sFileDir);
            }
            $$fs.writeFileSync(sBakPath, sFileText); 
        }
    } catch (error) {
        vscode.window.showErrorMessage(`extension.saveBackup : ${error.message}`);
    }
}

function backupFile(document) {
    var sFileText = document.getText();
    var sFilePath = document.uri.path;
    if (sFilePath[0] === '/') {
        sFilePath = sFilePath.slice(1); 
    }
    var oConf = vscode.workspace.getConfiguration('saveBackup.conf');

    if (oConf.enable) {
        var backupDir = getParsePath(oConf.backupDir);
        var sBakPath = buildeBakPath(sFilePath, backupDir);
        if ($$fs.existsSync(backupDir)) {
            if (oConf.recreateSubfolders) {
                //rebuildDirSave()
            } else {
                var sBakPath = buildeBakPath(sFilePath, backupDir);
                flatSave(oConf, sFileText, sFilePath, sBakPath)
            }
        }else{
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
function getParsePath(sPath) {
    var sVscodeDir = $$path.join(__dirname, '../..'); 
    sPath = sPath.replace('${.vscode}', sVscodeDir);
    return sPath.replace(/\\/g, '/');
}
function c2(n) {
    return (n/100).toFixed(2).slice(-2);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;




