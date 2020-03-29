import * as assert from 'assert';
import * as vscode from 'vscode';

import { AutoUse } from '../../autoUse';
import { AutoUseContext } from '../../autoUseContext';
import { DB } from '../../db';
import { Scanner } from '../../scanner';
import { Selector } from '../../selector';
import { join } from 'path';

suite('AutoUse Test', () => {
    let mockAutoUseContext: AutoUseContext;
    let autoUse: AutoUse;
    let selector: Selector;

    setup(async () => {
        DB.deleteAll();

        const file = vscode.Uri.file(join(vscode.workspace.rootPath || '', 'AutoUse.pm'));
        const document = await vscode.workspace.openTextDocument(file);
        const editor = await vscode.window.showTextDocument(document, undefined, false);
        mockAutoUseContext = {
            extensionContext: '',
            editor: editor,
            workspace: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined,
            config: vscode.workspace.getConfiguration('autouse')
        };
        const scanner = new Scanner(mockAutoUseContext);
        await scanner.scan();

        selector = new Selector(mockAutoUseContext);
        await selector.deleteByRegex(/use .+;\n|\r\n/g);

        autoUse = new AutoUse(mockAutoUseContext);
    });

    test('insertModules', async () => {
        await autoUse.insertModules();
        const fullText = selector.getFullText();
        const okFullyQualifiedModule = RegExp(/Hoge::Fuga/).test(fullText);
        const okLibraryModule =
            RegExp(/use Hoge::Piyo qw\(create_piyo piyo_piyo\)/).test(fullText) &&
            RegExp(/use Smart::Args::TypeTiny qw\(args_pos\)/);

        assert.ok(okFullyQualifiedModule && okLibraryModule);
    });
});