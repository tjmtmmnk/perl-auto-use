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

        autoUse = new AutoUse(mockAutoUseContext);
    });

    test('insertModules', async () => {
        await selector.deleteByRegex(/use .+;\n|\r\n/g);

        await selector.insertUseStatements(['use strict;', 'use warnings;']);

        await autoUse.insertModules();

        const fullText = selector.getFullText();

        const insertAfterPackage = RegExp(/package AutoUse;\nuse strict;/).test(fullText);
        const insertAfterUse = RegExp(/use warnings;\nuse Foo::Bar;/).test(fullText);

        const useStatementsOrder =
            RegExp(/use Foo::Bar;\nuse Hoge::Ao::WW;\nuse Hoge::Ao::XX;\nuse Hoge::Fuga;\nuse Hoge::Nyo;\nuse Hoge::Piyo/).test(fullText) &&
            RegExp(/use Hoge::Piyo[\s\w\(\)]+;\nuse Smart::Args::TypeTiny/).test(fullText);

        const suffixReference = !RegExp(/use HOGE;/).test(fullText);
        const ignored = !RegExp(/use Hoge::Bar/).test(fullText);

        const notExportedFullyQualifiedSub = RegExp(/use Hoge::Nyo;/).test(fullText);

        assert.ok(insertAfterPackage, 'inserted after package statement when no use statement');
        assert.ok(insertAfterUse, 'inserted after last use statement');
        assert.ok(useStatementsOrder, 'sorted use statements asc');
        assert.ok(suffixReference, 'suffix reference is not used');
        assert.ok(ignored, 'ignored');
        assert.ok(notExportedFullyQualifiedSub, 'not exported sub is not used');

        const okFullyQualifiedModule =
            RegExp(/use Hoge::Fuga;/).test(fullText) &&
            RegExp(/use Hoge::Nyo;/).test(fullText);

        const okLibraryModule =
            RegExp(/use Hoge::Piyo qw\(create_piyo my_name pipi piyo_piyo\)/).test(fullText) &&
            RegExp(/use Smart::Args::TypeTiny qw\(args_pos\)/).test(fullText) &&
            !RegExp(/use Smart::Args::TypeTiny::Check/).test(fullText);

        assert.ok(okFullyQualifiedModule && okLibraryModule, 'success use and checked not used hash key and comment');
    });

    test('module having sub already existed', async () => {
        await selector.deleteByRegex(/use .+;\n|\r\n/g);
        await selector.insertUseStatements(['use Smart::Args::TypeTiny qw(args);']);
        await selector.insertUseStatements(['use Hoge::Piyo qw(create_piyo piyo_piyo);']);

        await autoUse.insertModules();

        const fullText = selector.getFullText();
        const okFullyQualifiedModule = RegExp(/Hoge::Fuga/).test(fullText);
        const okLibraryModule =
            RegExp(/use Hoge::Piyo qw\(create_piyo my_name pipi piyo_piyo\)/).test(fullText) &&
            RegExp(/use Smart::Args::TypeTiny qw\(args args_pos\)/).test(fullText);

        assert.ok(okFullyQualifiedModule && okLibraryModule, 'success add sub');
    });
});