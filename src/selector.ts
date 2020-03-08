import * as vscode from 'vscode';

interface UseSubObject {
    packageName: string,
    subList: string[],
}

export class Selector {
    private getRangesByRegex(regex: RegExp): vscode.Range[] | undefined {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        const fullText = document?.getText();

        if (editor === undefined || fullText === undefined) { return undefined; }

        const matches = fullText.matchAll(regex);
        let ranges = new Array<vscode.Range>();
        for (const match of matches) {
            const startIndex = match.index !== undefined ? match.index : 0;
            const endIndex = match.index !== undefined ? match.index + match[0].length : 0;
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

    public insertUseSelection(useStatement: string): void {
        const editor = vscode.window.activeTextEditor;
        const ranges = this.getRangesByRegex(new RegExp(/package [A-Za-z0-9:]+;/, 'g'));

        if (ranges === undefined) { return; }

        // package の次の行にuseを挿入する
        const endPosition = new vscode.Position(ranges[0].end.line + 1, 0);
        editor?.edit(e => e.insert(endPosition, useStatement + "\n"));
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