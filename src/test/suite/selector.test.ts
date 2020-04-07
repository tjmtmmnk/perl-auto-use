import * as assert from 'assert';
import * as vscode from 'vscode';

import { AutoUseContext } from '../../autoUseContext';
import { Selector } from '../../selector';
import { join } from 'path';

suite('Selector Test', () => {
    let selector: Selector;
    let mockAutoUseContext: AutoUseContext;

    setup(async () => {
        const file = vscode.Uri.file(join(vscode.workspace.rootPath || '', 'Selector.pm'));
        const document = await vscode.workspace.openTextDocument(file);
        const editor = await vscode.window.showTextDocument(document, undefined, false);
        mockAutoUseContext = {
            extensionContext: '',
            editor: editor,
            workspace: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined,
            config: vscode.workspace.getConfiguration('autouse')
        };
        selector = new Selector(mockAutoUseContext);
    });

    test('getFullyQualifiedModules', () => {
        const fullyQualifiedModules = selector.getFullyQualifiedModules();
        assert.deepStrictEqual(fullyQualifiedModules, [
            'Animal::Cat',
            'Hoge::Bar',
            'Human'
        ], 'get fullyQualifiedModules sort by asc');
    });

    test('getModules', () => {
        const declaredModule = selector.getUseModules().sort();
        assert.deepStrictEqual(declaredModule, [
            'Nanimonai',
            'Nothing',
            'strict',
            'utf8',
            'warnings'
        ], 'get declared module not having subs');
    });

    test('getModuleSubs', () => {
        const declaredModuleSub = selector.getUseModuleSubs().sort((a, b) => a.packageName > b.packageName ? 1 : -1);
        assert.deepStrictEqual(declaredModuleSub, [
            {
                packageName: 'Empty',
                subList: []
            },
            {
                packageName: 'Foo',
                subList: ['foo_func']
            },
            {
                packageName: 'Smart::Args::TypeTiny',
                subList: ['args', 'args_pos']
            }
        ], 'get declared module having subs');
    });

    test('deleteByRegex', async () => {
        await mockAutoUseContext.editor.edit(e => e.insert(new vscode.Position(0, 0), 'atodekesu'));
        const fullText = selector.getFullText();
        assert.ok(RegExp(/atodekesu/).test(fullText), 'inserted');

        await selector.deleteByRegex(/atodekesu/g);

        const updatedFullText = selector.getFullText();
        assert.ok(!RegExp(/atodekesu/).test(updatedFullText), 'deleted');
    });
});