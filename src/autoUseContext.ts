import * as vscode from 'vscode';

export interface AutoUseContext {
    extensionContext: any;
    editor: vscode.TextEditor;
    workspace: vscode.WorkspaceFolder | undefined;
    config: vscode.WorkspaceConfiguration;
};