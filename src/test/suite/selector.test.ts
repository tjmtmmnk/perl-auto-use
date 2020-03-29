import * as assert from 'assert';
import * as vscode from 'vscode';

import { AutoUseContext } from '../../autoUseContext';
import { Selector } from '../../selector';
import { join } from 'path';

suite('Selector Test', () => {
    let mockAutoUseContext: AutoUseContext;

    setup(async () => {
        const file = vscode.Uri.file(join(vscode.workspace.rootPath || '', 'Selector.pm'));
        const document = await vscode.workspace.openTextDocument(file);
        const editor = await vscode.window.showTextDocument(document);
        mockAutoUseContext = {
            extensionContext: '',
            editor: editor,
            workspace: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined,
            config: vscode.workspace.getConfiguration('autouse')
        };
    });

    test('getFullyQualifiedModules', async () => {
        const selector = new Selector(mockAutoUseContext);
        const fullyQualifiedModules = selector.getFullyQualifiedModules();
        assert.deepStrictEqual(fullyQualifiedModules, [
            'Animal::Cat',
            'Hoge::Bar',
            'Human'
        ], 'get fullyQualifiedModules sort by asc');
    });
});