import * as vscode from 'vscode';

interface UseSubObject {
    packageName: string,
    subList: string[],
}

export class Selector {
    public getSelectText(): string {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        if (editor === undefined || document === undefined) { return ''; }
        return document.getText(editor.selection);
    }

    // package の次の行にuseを挿入する
    public insertUseSelection(useStatement: string): void {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;

        if (document === undefined) { return; }

        let startLine = 0;
        for (let i = 0; i < document.lineCount; i++) {
            const line = document?.lineAt(i).text;
            const packageMatches = line.match(/package [A-Za-z0-9:]+;/g);
            if (packageMatches) {
                startLine = i + 1;
                break;
            }
        }

        const position = new vscode.Position(startLine, 0);
        editor?.edit(e => e.insert(position, useStatement + "\n"));
    }

    public getFullyQualifiedModules(): string[] | undefined {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        const fullText = document?.getText();
        const fullyQualifiedMatches = fullText?.match(/[A-Za-z0-9:]+(->|::)\w+\([\s\S]*\);/g);
        const uniqueFullyQualifieeMatches = fullyQualifiedMatches?.filter((f, index, self) => self.indexOf(f) === index);
        return uniqueFullyQualifieeMatches?.map(f => f.replace(/(->)?\w+\([\s\S]*\);/, ''));
    }

    public getDeclaredUse(): string[] | undefined {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        const fullText = document?.getText();
        const useMatches = fullText?.match(/use [A-Za-z0-9:]+;/g);
        return useMatches?.map(u => u.replace('use ', '').replace(';', ''));
    }

    public getDeclaredUseSub(): UseSubObject[] | undefined {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        const fullText = document?.getText();
        const useSubMatches = fullText?.match(/use [A-Za-z0-9:]+ qw(\/|\()(\s*\w+\s*)*(\/|\));/g);
    
        return useSubMatches?.map(u => {
            const packageName = u
                .replace('use ', '')
                .replace(/ qw(\/|\()(\s*\w+\s*)*(\/|\));/, '');

            const subList = u
                .replace(/use [A-Za-z0-9:]+ /, '')
                .replace(/qw(\/|\()/, '')
                .replace(/(\/|\));/, '')
                .split(/\s/)
                .filter(s => s !== '');

            const obj: UseSubObject = {
                packageName,
                subList
            };

            return obj;
        });
    }
}