//
//   _  _____ 
//  (_)(  _  )
//  | || ( ) |
//  | || | | |
//  | || (_) |
//  (_)(_____)
//            
//            

import ShaderBoy from './shaderboy';
import ShaderLib from './shader/shaderlib';
import gdrive from './gdrive';
import CodeMirror from 'codemirror/lib/codemirror';
import localforage from 'localforage';

export default ShaderBoy.io = {

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	init: function () {

		localforage.config({
			driver: localforage.INDEXEDDB,
			name: 'ShaderBoy',
			version: 1.0,
			storeName: 'shaderdata'
		});

		ShaderBoy.renderScale = 2;
		ShaderBoy.editor.textSize = 16;

		this.fileNameByBufferName = {
			'Setting': 'setting.json',
			'Config': 'config.json',
			'BufferA': 'buf_a.fs',
			'BufferB': 'buf_b.fs',
			'BufferC': 'buf_c.fs',
			'BufferD': 'buf_d.fs',
			'MainImage': 'main.fs',
			'Common': 'common.fs'
		};

		this.useGoogleDrive = true;
		this.loadedNum = 0;
		this.needLoadingNum = 0;
		this.initLoading = true;

		ShaderBoy.gdrive.init(function () {
			ShaderBoy.gdrive.getFolderByName('ShaderBoy', function (res) {
				if (res.files.length === 0) {
					// No folder is named as ShaderBoy. So make it.
					ShaderBoy.gdrive.createFolder('ShaderBoy', 'root', function (ress) {
						ShaderBoy.gdrive.createTextFile(ShaderBoy.gdrive.ID_DIR_APP, 'setting.json', ShaderLib.shader.settingJSON);
						ShaderBoy.activeShaderName = '_defaultShader';
						ShaderBoy.io.loadShader(ShaderBoy.activeShaderName, true);
					});
				}
				else {
					// A folder found named as ShaderBoy. So lets load shaders.
					ShaderBoy.gdrive.ID_DIR_APP = res.files[0].id;
					ShaderBoy.gdrive.getFileByName('setting.json', ShaderBoy.gdrive.ID_DIR_APP,
						function cb_loadSettingFile(res) {
							if (res.files.length !== 0) {
								for (let i = 0; i < res.files.length; i++) {
									const file = res.files[i];
									if (file.name === 'setting.json') {
										ShaderBoy.gdrive.appData = {};
										ShaderBoy.gdrive.appData[file.name] = {};
										ShaderBoy.gdrive.appData[file.name]['name'] = file.name;
										ShaderBoy.gdrive.appData[file.name]['id'] = file.id;
										ShaderBoy.gdrive.appData[file.name]['content'] = '';

										ShaderBoy.gdrive.getContentBody(file.id, function (res) {
											let value = res.body;
											if (!value) {
												value = ShaderLib.shader.settingJSON;
											}
											let settingObj = JSON.parse(value);

											//active shader name. to be loaded.
											ShaderBoy.activeShaderName = settingObj.shaders.active;
											ShaderBoy.setting = settingObj;
											ShaderBoy.gdrive.getFolders(
												function cb_listupShaders(res) {
													for (let i = 0; i < res.files.length; i++) {
														const file = res.files[i];
														console.log(ShaderBoy.setting);
														console.log(ShaderBoy.setting.shaders);
														ShaderBoy.setting.shaders.list[i] = file.name;
													}
													let settingText = JSON.stringify(ShaderBoy.setting, null, "\t");
													// ShaderBoy.gdrive.appData[file.name]['content'] = settingText;
													ShaderBoy.buffers['Setting'].cm = CodeMirror.Doc(settingText, 'x-shader/x-fragment');
													ShaderBoy.io.loadShader(ShaderBoy.activeShaderName, true);
												}
											);
										});
									}
								}
							}
							else {
								ShaderBoy.gdrive.createTextFile(ShaderBoy.gdrive.ID_DIR_APP, 'setting.json', ShaderLib.shader.settingJSON, ShaderBoy.io.loadShader);
							}
						}
					);

				}
			});
		});
	},

	createDefaultShaderFiles: function (id) {
		ShaderBoy.gdrive.createTextFile(id, 'config.json', ShaderLib.shader.configJSON);
		ShaderBoy.gdrive.createTextFile(id, 'common.fs', ShaderLib.shader.commonFS);
		ShaderBoy.gdrive.createTextFile(id, 'buf_a.fs', ShaderLib.shader.buf_aFS);
		ShaderBoy.gdrive.createTextFile(id, 'buf_b.fs', ShaderLib.shader.buf_bFS);
		ShaderBoy.gdrive.createTextFile(id, 'buf_c.fs', ShaderLib.shader.buf_cFS);
		ShaderBoy.gdrive.createTextFile(id, 'buf_d.fs', ShaderLib.shader.buf_dFS);
		ShaderBoy.gdrive.createTextFile(id, 'main.fs', ShaderLib.shader.imageFS);

		ShaderBoy.buffers['Setting'].active = true;
		ShaderBoy.buffers['Setting'].cm = CodeMirror.Doc(ShaderLib.shader.settingJSON, 'x-shader/x-fragment');

		ShaderBoy.buffers['Config'].active = true;
		ShaderBoy.buffers['Config'].cm = CodeMirror.Doc(ShaderLib.shader.configJSON, 'x-shader/x-fragment');

		ShaderBoy.buffers['Common'].active = false;
		ShaderBoy.buffers['Common'].cm = CodeMirror.Doc(ShaderLib.shader.commonFS, 'x-shader/x-fragment');

		ShaderBoy.buffers['BufferA'].active = false;
		ShaderBoy.buffers['BufferA'].cm = CodeMirror.Doc(ShaderLib.shader.buf_aFS, 'x-shader/x-fragment');

		ShaderBoy.buffers['BufferB'].active = false;
		ShaderBoy.buffers['BufferB'].cm = CodeMirror.Doc(ShaderLib.shader.buf_bFS, 'x-shader/x-fragment');

		ShaderBoy.buffers['BufferC'].active = false;
		ShaderBoy.buffers['BufferC'].cm = CodeMirror.Doc(ShaderLib.shader.buf_cFS, 'x-shader/x-fragment');

		ShaderBoy.buffers['BufferD'].active = false;
		ShaderBoy.buffers['BufferD'].cm = CodeMirror.Doc(ShaderLib.shader.buf_dFS, 'x-shader/x-fragment');

		ShaderBoy.buffers['MainImage'].active = true;
		ShaderBoy.buffers['MainImage'].cm = CodeMirror.Doc(ShaderLib.shader.imageFS, 'x-shader/x-fragment');

		ShaderBoy.editor.setBuffer('MainImage');
		ShaderBoy.bufferManager.resetBufferData(true);
		ShaderBoy.isPlaying = true;
		ShaderBoy.gui.header.showCommandInfo('new.', '#d8d4c5', '#fcbd00', false);
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	newShader: function () {
		if (!this.useGoogleDrive) {
			ShaderBoy.buffers['Setting'].active = true;
			ShaderBoy.buffers['Setting'].cm = CodeMirror.Doc(ShaderLib.shader.settingJSON, 'x-shader/x-fragment');

			ShaderBoy.buffers['Config'].active = true;
			ShaderBoy.buffers['Config'].cm = CodeMirror.Doc(ShaderLib.shader.configJSON, 'x-shader/x-fragment');

			ShaderBoy.buffers['Common'].active = false;
			ShaderBoy.buffers['Common'].cm = CodeMirror.Doc(ShaderLib.shader.commonFS, 'x-shader/x-fragment');

			ShaderBoy.buffers['BufferA'].active = false;
			ShaderBoy.buffers['BufferA'].cm = CodeMirror.Doc(ShaderLib.shader.buf_aFS, 'x-shader/x-fragment');

			ShaderBoy.buffers['BufferB'].active = false;
			ShaderBoy.buffers['BufferB'].cm = CodeMirror.Doc(ShaderLib.shader.buf_bFS, 'x-shader/x-fragment');

			ShaderBoy.buffers['BufferC'].active = false;
			ShaderBoy.buffers['BufferC'].cm = CodeMirror.Doc(ShaderLib.shader.buf_cFS, 'x-shader/x-fragment');

			ShaderBoy.buffers['BufferD'].active = false;
			ShaderBoy.buffers['BufferD'].cm = CodeMirror.Doc(ShaderLib.shader.buf_dFS, 'x-shader/x-fragment');

			ShaderBoy.buffers['MainImage'].active = true;
			ShaderBoy.buffers['MainImage'].cm = CodeMirror.Doc(ShaderLib.shader.imageFS, 'x-shader/x-fragment');

			ShaderBoy.editor.setBuffer('MainImage');
			ShaderBoy.bufferManager.resetBufferData(true);

			ShaderBoy.gui.header.showCommandInfo('new.', '#d8d4c5', '#fcbd00', false);
		} else {
			// google drive
			let shaderName = 'yourshader';
			ShaderBoy.gdrive.getFolderByName(shaderName, function (res) {
				if (res.files.length === 0) {
					ShaderBoy.gdrive.createShaderFolder(shaderName, function (ress) {
						ShaderBoy.gdrive.ID_DIR_SHADER = ress.id;
						ShaderBoy.io.createDefaultShaderFiles(ress.id);
					});
				}
				else {
					console.log('It exist. Use a different name.');
				}
			});
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	saveShader: function () {
		ShaderBoy.gdrive.saveThumbFile('thumb.png', ShaderBoy.canvas, function (res, err) { console.log(res, err, 'thumbnail was saved.'); });
		ShaderBoy.gdrive.saveTextFile('setting.json', gdrive.appData['setting.json'].id, JSON.stringify(JSON.parse(ShaderBoy.buffers['Setting'].cm.getValue()), null, "\t"));
		ShaderBoy.gdrive.saveTextFile('config.json', gdrive.ids_shaderFiles['config.json'].id, JSON.stringify(JSON.parse(ShaderBoy.buffers['Config'].cm.getValue()), null, "\t"));
		ShaderBoy.gdrive.saveTextFile('buf_a.fs', gdrive.ids_shaderFiles['buf_a.fs'].id, ShaderBoy.buffers['BufferA'].cm.getValue());
		ShaderBoy.gdrive.saveTextFile('buf_b.fs', gdrive.ids_shaderFiles['buf_b.fs'].id, ShaderBoy.buffers['BufferB'].cm.getValue());
		ShaderBoy.gdrive.saveTextFile('buf_c.fs', gdrive.ids_shaderFiles['buf_c.fs'].id, ShaderBoy.buffers['BufferC'].cm.getValue());
		ShaderBoy.gdrive.saveTextFile('buf_d.fs', gdrive.ids_shaderFiles['buf_d.fs'].id, ShaderBoy.buffers['BufferD'].cm.getValue());
		ShaderBoy.gdrive.saveTextFile('main.fs', gdrive.ids_shaderFiles['main.fs'].id, ShaderBoy.buffers['MainImage'].cm.getValue());
		ShaderBoy.gdrive.saveTextFile('common.fs', gdrive.ids_shaderFiles['common.fs'].id, ShaderBoy.buffers['Common'].cm.getValue());
		localforage.setItem('renderScale', ShaderBoy.renderScale, function (err) { if (err) { console.log('db error...') } });
		localforage.setItem('textSize', ShaderBoy.textSize, function (err) { if (err) { console.log('db error...') } });
		ShaderBoy.gui.header.showCommandInfo('saved.', '#d8d4c5', '#1794be', false);
	},


	isLoaded: function (nm) {
		this.loadedNum++;
		console.log('isLoaded:' + nm);
		ShaderBoy.gui.header.showCommandInfo('Loading shader files...(' + this.loadedNum + '/' + ShaderBoy.io.needLoadingNum + ')', '#d8d4c5', '#1E1E1E', false);
		if (this.loadedNum === ShaderBoy.io.needLoadingNum) {
			ShaderBoy.gui.header.showCommandInfo('loaded.', '#d8d4c5', '#fcbd00', false);
			ShaderBoy.bufferManager.resetBufferData(true);
			if (ShaderBoy.io.initLoading === true) {
				ShaderBoy.editor.setBuffer('MainImage');
			} else {
				ShaderBoy.editor.setBuffer('Setting');
			}
			ShaderBoy.isPlaying = true;
		}
	},

	getActiveShaderName: function () {
		let rowtxt = ShaderBoy.buffers['BufferA'].cm.getValue();
		return rowtxt;
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	loadShader: function (sn, initLoading) {
		ShaderBoy.io.initLoading = initLoading;
		ShaderBoy.buffers['Config'].active = true;
		this.loadedNum = 0;
		this.needLoadingNum = 0;
		ShaderBoy.gui.header.showCommandInfo('Loading from Google Drive...', '#d8d4c5', '#1E1E1E', false);

		let shaderName = '_defaultShader';
		if (sn !== undefined) {
			shaderName = sn;
		}
		// let shaderName =  ShaderBoy.util.deepcopy(ShaderBoy.buffers['BufferA'].cm.getValue());
		ShaderBoy.gdrive.getFolderByName(shaderName, function (res) {
			if (res.files[0] !== undefined) {
				ShaderBoy.gui.header.showCommandInfo('"' + shaderName + '" was found. Loading shader files...', '#d8d4c5', '#1E1E1E', false);
				let folderId = res.files[0].id;

				ShaderBoy.gdrive.ID_DIR_SHADER = folderId;

				ShaderBoy.gdrive.getFilesInFolder(folderId,
					function (res) {

						if (res.files.length !== 0) {
							ShaderBoy.gdrive.ids_shaderFiles = {};
							for (let i = 0; i < res.files.length; i++) {
								const file = res.files[i];
								ShaderBoy.gdrive.ids_shaderFiles[file.name] = {};
								ShaderBoy.gdrive.ids_shaderFiles[file.name]['name'] = file.name;
								ShaderBoy.gdrive.ids_shaderFiles[file.name]['id'] = file.id;
								ShaderBoy.gdrive.ids_shaderFiles[file.name]['content'] = '';
							}

							let id = ShaderBoy.gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['Config']].id;
							ShaderBoy.gdrive.getContentBody(id, function (res) {
								let value = res.body;
								if (!value) {
									value = ShaderLib.shader.configJSON;
								}

								let configObj = JSON.parse(value);
								console.log('configObj: ', configObj);
								for (const key in configObj.buffers) {
									if (configObj.buffers.hasOwnProperty(key)) {
										const buffer = configObj.buffers[key];
										console.log(buffer);
										if (buffer.active === true) {
											ShaderBoy.io.needLoadingNum++;
										}
									}
								}

								console.log('commm:', configObj.buffers['Common']);
								console.log('commm2:', configObj.buffers.Common);

								let bufferConfig = configObj.buffers;

								console.log(bufferConfig['Common'].active);
								ShaderBoy.buffers['Common'].active = bufferConfig['Common'].active;
								if (ShaderBoy.buffers['Common'].active === true) {
									let id = ShaderBoy.gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['Common']].id;
									ShaderBoy.gdrive.getContentBody(id, function (res) {
										let value = res.body;
										if (!value) {
											value = ShaderLib.shader.commonFS;
										}
										ShaderBoy.buffers['Common'].cm = CodeMirror.Doc(value, 'x-shader/x-fragment');
										ShaderBoy.io.isLoaded('Common');
									});
								}

								console.log(bufferConfig['BufferA'].active);
								ShaderBoy.buffers['BufferA'].active = bufferConfig['BufferA'].active;
								if (ShaderBoy.buffers['BufferA'].active === true) {
									let id = ShaderBoy.gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['BufferA']].id;
									ShaderBoy.gdrive.getContentBody(id, function (res) {
										let value = res.body;
										if (!value) {
											value = ShaderLib.shader.buf_aFS;
										}
										ShaderBoy.buffers['BufferA'].cm = CodeMirror.Doc(value, 'x-shader/x-fragment');
										ShaderBoy.io.isLoaded('BufferA');
									});
								}

								console.log(bufferConfig['BufferB'].active);
								ShaderBoy.buffers['BufferB'].active = bufferConfig['BufferB'].active;
								if (ShaderBoy.buffers['BufferB'].active === true) {
									let id = ShaderBoy.gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['BufferB']].id;
									ShaderBoy.gdrive.getContentBody(id, function (res) {
										let value = res.body;
										if (!value) {
											value = ShaderLib.shader.buf_bFS;
										}
										ShaderBoy.buffers['BufferB'].cm = CodeMirror.Doc(value, 'x-shader/x-fragment');
										ShaderBoy.io.isLoaded('BufferB');
									});
								}

								console.log(bufferConfig['BufferC'].active);
								ShaderBoy.buffers['BufferC'].active = bufferConfig['BufferC'].active;
								if (ShaderBoy.buffers['BufferC'].active === true) {
									let id = ShaderBoy.gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['BufferC']].id;
									ShaderBoy.gdrive.getContentBody(id, function (res) {
										let value = res.body;
										if (!value) {
											value = ShaderLib.shader.buf_cFS;
										}
										ShaderBoy.buffers['BufferC'].cm = CodeMirror.Doc(value, 'x-shader/x-fragment');
										ShaderBoy.io.isLoaded('BufferC');
									});
								}

								console.log(bufferConfig['BufferD'].active);
								ShaderBoy.buffers['BufferD'].active = bufferConfig['BufferD'].active;
								if (ShaderBoy.buffers['BufferD'].active === true) {
									let id = ShaderBoy.gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['BufferD']].id;
									ShaderBoy.gdrive.getContentBody(id, function (res) {
										let value = res.body;
										if (!value) {
											value = ShaderLib.shader.buf_dFS;
										}
										ShaderBoy.buffers['BufferD'].cm = CodeMirror.Doc(value, 'x-shader/x-fragment');
										ShaderBoy.io.isLoaded('BufferD');
									});
								}

								console.log(bufferConfig['MainImage'].active);
								ShaderBoy.buffers['MainImage'].active = bufferConfig['MainImage'].active;
								if (ShaderBoy.buffers['MainImage'].active === true) {
									let id = ShaderBoy.gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['MainImage']].id;
									ShaderBoy.gdrive.getContentBody(id, function (res) {
										let value = res.body;
										if (!value) {
											value = ShaderLib.shader.mainFS;
										}
										ShaderBoy.buffers['MainImage'].cm = CodeMirror.Doc(value, 'x-shader/x-fragment');
										ShaderBoy.io.isLoaded('MainImage');
									});
								}

								let configText = JSON.stringify(configObj, null, "\t");
								ShaderBoy.buffers['Config'].cm = CodeMirror.Doc(configText, 'x-shader/x-fragment');

								localforage.getItem('renderScale', function (err, value) {
									if (!value) {
										value = 2;
									}
									ShaderBoy.renderScale = value;
									// ShaderBoy.io.isLoaded('renderScale');
								});

								localforage.getItem('textSize', function (err, value) {
									if (!value) {
										value = 16;
									}
									ShaderBoy.editor.textSize = value;
									// ShaderBoy.io.isLoaded('textSize');
								});
							});
						}
						else {
							ShaderBoy.io.createDefaultShaderFiles(folderId);
						}
					}
				);
			} else {
				ShaderBoy.gui.header.showCommandInfo('"' + shaderName + '" was not found.', '#d8d4c5', '#FF0000', false);
			}
		}
		);

	}
};