import * as vscode from 'vscode';

interface ModuleSubObject {
    packageName: string,
    subList: string[],
}

export class Selector {
    private editor: vscode.TextEditor;

    constructor(private _editor: vscode.TextEditor) {
        this.editor = _editor;
    }

    private getRangesByRegex(regex: RegExp): vscode.Range[] {
        const document = this.editor.document;
        const fullText = document?.getText();

        if (fullText === undefined) { return []; }

        const matches = fullText.matchAll(regex);

        let ranges = new Array<vscode.Range>();
        for (const match of matches) {
            const startIndex = match.index !== undefined ? match.index : 0;
            const endIndex = match.index !== undefined ? match.index + match[0].length : 0;
            const startPosition = this.editor.document.positionAt(startIndex);
            const endPosition = this.editor.document.positionAt(endIndex);
            ranges.push(new vscode.Range(startPosition, endPosition));
        }

        return ranges;
    }

    public getSelectText(): string {
        const document = this.editor.document;
        if (document === undefined) { return ''; }
        return document.getText(this.editor.selection);
    }

    // insert use statement next line of 'package'
    public insertUseSelection(useStatement: string): Thenable<boolean> {
        const ranges = this.getRangesByRegex(RegExp(/package [A-Za-z0-9:]+;/));

        if (ranges === []) { return Promise.reject(new Error('no package found')); }

        const endPosition = new vscode.Position(ranges[0].end.line + 1, 0);
        return this.editor.edit(e => e.insert(endPosition, useStatement + "\n"));
    }

    public getFullyQualifiedModules(): string[] | undefined {
        const document = this.editor.document;
        const fullText = document?.getText();
        const fullyQualifiedMatches = fullText?.match(/[A-Za-z0-9:]+(->|::)\w+\((\n|\r\n|\r|\w|=|>|,| |\{|\})*\);/g);
        const uniqueFullyQualifiedMatches = fullyQualifiedMatches?.filter((f, index, self) => self.indexOf(f) === index);
        return uniqueFullyQualifiedMatches?.map(f => f.replace(/(->)?\w+\([\s\S]*\);/, ''));
    }

    public getDeclaredModule(): string[] | undefined {
        const document = this.editor.document;
        const fullText = document?.getText();
        const useMatches = fullText?.match(/use [A-Za-z0-9:]+;/g);
        return useMatches?.map(u => u.replace('use ', '').replace(';', ''));
    }

    public getDeclaredModuleSub(): ModuleSubObject[] | undefined {
        const document = this.editor.document;
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

            const obj: ModuleSubObject = {
                packageName,
                subList
            };

            return obj;
        });
    }

    public deleteByRegex(regex: RegExp): Thenable<boolean> {
        const ranges = this.getRangesByRegex(regex);

        if (ranges === []) { return Promise.reject('not match'); }

        return this.editor.edit(e => ranges.forEach(range => e.delete(range)));
    }
}