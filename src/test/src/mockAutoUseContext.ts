import * as vscode from 'vscode';
import { AutoUseContext } from '../../autoUseContext';

export const MockAutoUseContext: AutoUseContext = {
    extensionContext: '',
    editor: vscode.window.activeTextEditor!,
    workspace: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined,
    config: vscode.workspace.getConfiguration('autouse')
};