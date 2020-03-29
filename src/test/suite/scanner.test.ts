import * as assert from 'assert';
import * as vscode from 'vscode';

import { AutoUseContext } from '../../autoUseContext';
import { DB } from '../../db';
import { Scanner } from '../../scanner';
import { join } from 'path';

suite('Scanner Test', () => {
    let mockAutoUseContext: AutoUseContext;
    
    setup(() => {
        DB.deleteAll();
        mockAutoUseContext = {
            extensionContext: '',
            editor: vscode.window.activeTextEditor!,
            workspace: undefined,
            config: vscode.workspace.getConfiguration('autouse')
        };
    });

    test('rootPath', () => {
        assert.strictEqual(vscode.workspace.workspaceFolders!.length, 1);
        assert.strictEqual(vscode.workspace.rootPath!, join(__dirname, '../../../src/test/testWorkSpace'));
    });

    test('scan', async () => {
        const scanner = new Scanner(mockAutoUseContext);
        await scanner.scan();
        assert.strictEqual(DB.all().length, 6, 'scanned six sub objects');

        const subArgsObjects = DB.findByName('args');
        assert.strictEqual(subArgsObjects.length, 1);
        assert.strictEqual(subArgsObjects[0].name, 'args');
        assert.strictEqual(subArgsObjects[0].packageName, 'Smart::Args::TypeTiny');
    });
});
