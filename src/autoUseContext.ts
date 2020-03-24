import * as vscode from 'vscode';

export interface AutoUseContext {
    extensionContext: vscode.ExtensionContext;
    editor: vscode.TextEditor;
};