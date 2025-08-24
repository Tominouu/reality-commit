// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('reality-commit.commit', async () => {
        // 1. Popup pour l'humeur
        const moods = ['😀 Heureux', '😴 Fatigué', '😡 Fâché', '🤔 Pensif'];
        const mood = await vscode.window.showQuickPick(moods, {
            placeHolder: 'Comment te sens-tu pour ce commit ?'
        });
        if (!mood) return; // si utilisateur annule

        // 2. Récupérer météo (exemple fixe pour l’instant, tu pourras ajouter la géoloc plus tard)
        const city = 'Paris';
        const apiKey = 'TON_API_KEY_OPENWEATHERMAP';
        let weatherDesc = 'inconnue';
        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
            weatherDesc = response.data.weather[0].description;
        } catch (err) {
            console.error('Erreur météo', err);
        }

        // 3. Stocker les infos dans un fichier JSON dans le repo courant
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Pas de dossier ouvert dans VS Code.');
            return;
        }
        const repoPath = workspaceFolders[0].uri.fsPath;
        const filePath = path.join(repoPath, '.reality-commits.json');

        let data: any[] = [];
        if (fs.existsSync(filePath)) {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        data.push({
            date: new Date().toISOString(),
            mood,
            weather: weatherDesc
        });

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        vscode.window.showInformationMessage(`Reality Commit enregistré : ${mood}, météo: ${weatherDesc}`);
    });

    context.subscriptions.push(disposable);
}



// This method is called when your extension is deactivated
export function deactivate() {}
