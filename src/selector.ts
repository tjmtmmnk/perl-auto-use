import * as vscode from 'vscode';

interface UseSubObject {
    packageName: string,
    subList: string[],
}

export class Selector {
    private getFirstLineByRegex(regex: RegExp): number | undefined {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        if (editor === undefined || document === undefined) { return undefined; }

        for (let i = 0; i < document.lineCount; i++) {
            const line = document?.lineAt(i).text;
            const packageMatches = line.match(regex);
            if (packageMatches) { return i + 1; }
        }
    }

    private getStartPositionsByRegex(regex: RegExp): vscode.Position[] | undefined {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        const fullText = document?.getText();

        if (editor === undefined || fullText === undefined) { return undefined; }

        const matches = fullText.matchAll(regex);
        let startPositions = new Array<vscode.Position>();
        for (const match of matches) {
            const startIndex = match.index ? match.index : 0;
            const startPosition = editor.document.positionAt(startIndex);
            startPositions.push(startPosition);
        }

        return startPositions;
    }

    private getRangesByRegex(regex: RegExp): vscode.Range[] | undefined {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        const fullText = document?.getText();

        if (editor === undefined || fullText === undefined) { return undefined; }

        const matches = fullText.matchAll(regex);
        let ranges = new Array<vscode.Range>();
        for (const match of matches) {
            const startIndex = match.index ? match.index : 0;
            const endIndex = match.index ? match.index + match[0].length : 0;
            const startPosition = editor.document.positionAt(startIndex);
            const endPosition = editor.document.positionAt(endIndex);
            ranges.push(new vscode.Range(startPosition, endPosition));
        }

        return ranges;
    }

    public getSelectText(): string {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        if (editor === undefined || document === undefined) { return ''; }
        return document.getText(editor.selection);
    }

    // package の次の行にuseを挿入する
    public insertUseSelection(useStatement: string): void {
        const editor = vscode.window.activeTextEditor;
        const startLine = this.getFirstLineByRegex(new RegExp(/package [A-Za-z0-9:]+;/, 'g'));

        if (startLine === undefined) { return; }

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