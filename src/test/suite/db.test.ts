import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { DB, ImportObject } from '../../db';

suite('Extension Test Suite', () => {
	setup(() => {
		DB.deleteAll();
	});

	const object: ImportObject = {
		name: 'test',
		packageName: 'Test::Now',
		file: vscode.Uri.file('/test'),
		workspace: undefined,
	};

	test('add', async () => {
		await DB.add(object.name, object.packageName, object.file, object.workspace);

		const objects = DB.all();
		assert.strictEqual(objects.length, 1, 'get one');
		assert.strictEqual(objects[0].name, object.name);
		assert.strictEqual(objects[0].packageName, object.packageName);
	});

	test('add already exist', async () => {
		await DB.add(object.name, object.packageName, object.file, object.workspace);

		const objects = DB.all();
		assert.strictEqual(objects.length, 1, 'do not add');
	});
});
