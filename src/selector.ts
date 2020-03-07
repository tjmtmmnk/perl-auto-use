import * as vscode from 'vscode';

export class Selector {
    public getSelectText(): string {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        if (editor === undefined || document === undefined) { return ''; }
        return editor.document.getText(editor.selection);
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
}