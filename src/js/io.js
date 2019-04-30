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
import ShaderLib from './shaderlib';
import gdrive from './gdrive';
import CodeMirror from 'codemirror/lib/codemirror';
import localforage from 'localforage';
import gui_timeline from './gui/gui_timeline';
import gui_panel_shaderlist from './gui/gui_panel_shaderlist';

export default ShaderBoy.io = {

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	init: function ()
	{
		console.log('io: init');
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
		this.isNewShader = false;
		this.createdNum = 0;
		this.isInitializationSB = false;

		let authDiv = document.getElementById('div_authrise');
		let authLaterButton = document.getElementById('btn_authrise_later');
		authLaterButton.onclick = function ()
		{
			authDiv.classList.add('hide');
			setTimeout(() =>
			{
				document.getElementById('div_authrise').classList.add('hidden');
			}, 400);
			ShaderBoy.runInDevMode = true;
			ShaderBoy.io.init();
		};

		this.getShadersFromGD = function ()
		{
			gdrive.getFolderByName('ShaderBoy', function (res)
			{
				if (res.files.length === 0)
				{
					// No folder is named as ShaderBoy. So make it.
					gdrive.createFolder('ShaderBoy', 'root', function (res)
					{
						gdrive.ID_DIR_APP = res.id;
						ShaderBoy.io.createSetting();
					});
				}
				else
				{
					// A folder found named as ShaderBoy. So lets load shaders.
					gdrive.ID_DIR_APP = res.files[0].id;
					gdrive.getFileByName('setting.json', gdrive.ID_DIR_APP,
						function cb_loadSettingFile(res)
						{
							if (res.files.length !== 0)
							{
								for (let i = 0; i < res.files.length; i++)
								{
									const file = res.files[i];
									if (file.name === 'setting.json')
									{
										gdrive.appData = {};
										gdrive.appData['Setting'] = {};
										gdrive.appData['Setting']['name'] = file.name;
										gdrive.appData['Setting']['id'] = file.id;
										gdrive.appData['Setting']['content'] = '';

										gdrive.getContentBody(file.id, function (res)
										{
											let value = res.body;
											if (!value)
											{
												value = ShaderLib.shader['Setting'];
											}
											let settingObj = JSON.parse(value);

											//active shader name. to be loaded.
											ShaderBoy.activeShaderName = settingObj.shaders.active;
											ShaderBoy.setting = settingObj;
											gdrive.getFolders(
												function cb_listupShaders(res)
												{
													ShaderBoy.setting.shaders.list = [];
													ShaderBoy.setting.shaders.datalist = [];
													ShaderBoy.setting.shaders.thumbs = [];
													for (let i = 0; i < res.files.length; i++)
													{
														const file = res.files[i];
														console.log('file: ', file);
														console.log(ShaderBoy.setting);
														console.log(ShaderBoy.setting.shaders);
														ShaderBoy.setting.shaders.list[i] = file.name;
														ShaderBoy.setting.shaders.datalist[i] = { name: file.name, id: file.id };
													}

													let settingText = JSON.stringify(ShaderBoy.setting, null, "\t");
													// gdrive.appData[file.name]['content'] = settingText;
													ShaderBoy.buffers['Setting'].cm = CodeMirror.Doc(settingText, 'x-shader/x-fragment');
													console.log('datalist: ', ShaderBoy.setting.shaders.datalist);

													ShaderBoy.io.loadShader(ShaderBoy.activeShaderName, true);
												}
											);
										});
									}
								}
							}
							else
							{
								ShaderBoy.io.createSetting();
							}
						}
					);

				}
			});
		};

		if (!ShaderBoy.runInDevMode)
		{
			console.log('production');
			gdrive.init(this.getShadersFromGD);
		}
		else
		{
			console.log('Running ShaderBoy as devlopment mode...');
			ShaderBoy.config = JSON.parse(ShaderBoy.buffers['Config'].cm.getValue());
			ShaderBoy.buffers['Setting'].cm = CodeMirror.Doc(ShaderLib.shader['Setting'], 'x-shader/x-fragment');
			ShaderBoy.buffers['Config'].cm = CodeMirror.Doc(ShaderLib.shader['Config'], 'x-shader/x-fragment');
			ShaderBoy.buffers['Common'].cm = CodeMirror.Doc(ShaderLib.shader['Common'], 'x-shader/x-fragment');
			ShaderBoy.buffers['BufferA'].cm = CodeMirror.Doc(ShaderLib.shader['BufferA'], 'x-shader/x-fragment');
			ShaderBoy.buffers['BufferB'].cm = CodeMirror.Doc(ShaderLib.shader['BufferB'], 'x-shader/x-fragment');
			ShaderBoy.buffers['BufferC'].cm = CodeMirror.Doc(ShaderLib.shader['BufferC'], 'x-shader/x-fragment');
			ShaderBoy.buffers['BufferD'].cm = CodeMirror.Doc(ShaderLib.shader['BufferD'], 'x-shader/x-fragment');
			ShaderBoy.buffers['MainImage'].cm = CodeMirror.Doc(ShaderLib.shader['MainImage'], 'x-shader/x-fragment');
			ShaderBoy.buffers['MainImage'].active = true;
			// ShaderBoy.gui.header.showCommandInfo('loaded.', 'st-sucsess-gdrive', false);
			ShaderBoy.gui_header.setStatus('suc2', 'Loaded.', 3000, function ()
			{
				document.getElementById('cvr-loading').classList.add('loading-hide');
				setTimeout(() =>
				{
					console.log('HIDOOOOOO!!!!!!');
					document.getElementById('cvr-loading').classList.add('loading-hidden');
				}, 400);
			});

			ShaderBoy.bufferManager.buildShaderFromBuffers();
			ShaderBoy.bufferManager.setFBOsProps();

			let value = ShaderLib.shader['gui_knobs'];
			let knobsObj = JSON.parse(value);
			console.log('knobsObj: ', knobsObj);
			ShaderBoy.gui.knobs.show = knobsObj.show;
			for (let i = 0; i < knobsObj.knobs.length; i++)
			{
				console.log(i);
				console.log(ShaderBoy.gui.knobs.knobs);
				ShaderBoy.gui.knobs.knobs[i].value = knobsObj.knobs[i].value;
				ShaderBoy.gui.knobs.knobs[i].active = knobsObj.knobs[i].active;
				ShaderBoy.gui.knobs.toggle(i, false);
			}
			console.log('ShaderBoy.gui.knobs:2 ', ShaderBoy.gui.knobs);

			value = ShaderLib.shader['gui_timeline'];
			let timelineObj = JSON.parse(value);
			console.log(timelineObj);
			gui_timeline.guidata = timelineObj;


			ShaderBoy.editor.setBuffer('MainImage');
			// if (ShaderBoy.io.initLoading === true)
			// {
			// } else
			// {
			// 	ShaderBoy.editor.setBuffer('Setting');
			// }
			// document.getElementById('div_loading').classList.toggle('show');
			// document.getElementById('div_loading').classList.toggle('hide');
			// document.getElementById('main').classList.toggle('show');
			// document.getElementById('main').classList.toggle('hide');
			// document.getElementById('code').classList.toggle('show');
			// document.getElementById('code').classList.toggle('hide');

			ShaderBoy.isPlaying = true;

		}
	},

	createSetting: function ()
	{
		console.log('io: createSetting');
		ShaderBoy.setting = JSON.parse(ShaderLib.shader['Setting']);
		ShaderBoy.setting.shaders.list = [];
		ShaderBoy.setting.shaders.datalist = [];
		ShaderBoy.setting.shaders.thumbs = [];
		ShaderBoy.setting.shaders.list[0] = 'file.name';
		ShaderBoy.setting.shaders.datalist[0] = { name: '_default', id: null };
		gdrive.createTextFile(gdrive.ID_DIR_APP, 'setting.json', ShaderLib.shader['Setting'], function (res)
		{
			console.log(res);
			gdrive.appData = {};
			gdrive.appData['Setting'] = {};
			gdrive.appData['Setting']['name'] = res.name;
			gdrive.appData['Setting']['id'] = res.id;
			gdrive.appData['Setting']['content'] = '';
			ShaderBoy.activeShaderName = '_default';
			ShaderBoy.io.isInitializationSB = true;
			ShaderBoy.io.newShader(ShaderBoy.activeShaderName);
		});
		// ShaderBoy.buffers['Setting'].active = true;
		ShaderBoy.bufferManager.initBufferDoc(['Setting']);
	},

	createGuiData_Knobs: function ()
	{
		console.log('io: createGuiData_Knobs');
		gdrive.createTextFile(gdrive.ID_DIR_APP, 'gui_data_knobs.json', ShaderLib.shader['gui_knobs'], function (res)
		{
			console.log(res);
		});
	},

	createGuiData_Timeline: function ()
	{
		console.log('io: createGuiData_Timeline');
		gdrive.createTextFile(gdrive.ID_DIR_APP, 'gui_data_timeline.json', ShaderLib.shader['gui_timeline'], function (res)
		{
			console.log(res);
		});
	},

	updateShaderList: function ()
	{
		console.log('io: updateShaderList');
		// let settingObj = ShaderBoy.bufferManager.getSetting();
		ShaderBoy.setting.shaders.list.push(ShaderBoy.setting.shaders.active);
		ShaderBoy.setting.shaders.list = Array.from(new Set(ShaderBoy.setting.shaders.list));
		// ShaderBoy.buffers['Setting'].cm.setValue(JSON.stringify(settingObj, null, "\t"));
	},

	activateShader: function (name)
	{
		console.log('io: activateShader');
		// let settingObj = ShaderBoy.setting;
		ShaderBoy.setting.shaders.active = name;
		// ShaderBoy.buffers['Setting'].cm.setValue(JSON.stringify(settingObj, null, "\t"));
	},

	createDefaultShaderFiles: function (id)
	{
		console.log('io: createDefaultShaderFiles');
		this.createdNum = 0;
		let load = function ()
		{
			console.log('load.');
			ShaderBoy.io.createdNum++;
			if (ShaderBoy.io.createdNum === 8)
			{
				// let settingObj = ShaderBoy.bufferManager.getSetting();
				if (ShaderBoy.io.isInitializationSB === true)
				{
					ShaderBoy.io.isInitializationSB = false;
					ShaderBoy.io.getShadersFromGD();
				}
				else
				{
					let name = ShaderBoy.setting.shaders.active;
					ShaderBoy.io.loadShader(name, name === '_default');
				}
			}
		};

		ShaderBoy.config = JSON.parse(ShaderBoy.buffers['Config'].cm.getValue());
		gdrive.createTextFile(id, 'config.json', ShaderLib.shader['Config'], load);
		gdrive.createTextFile(id, 'common.fs', ShaderLib.shader['Common'], load);
		gdrive.createTextFile(id, '_guiknobs.json', ShaderLib.shader['gui_knobs'], load);
		gdrive.createTextFile(id, '_guitimeline.json', ShaderLib.shader['gui_timeline'], load);
		gdrive.createTextFile(id, 'buf_a.fs', ShaderLib.shader['BufferA'], load);
		gdrive.createTextFile(id, 'buf_b.fs', ShaderLib.shader['BufferB'], load);
		gdrive.createTextFile(id, 'buf_c.fs', ShaderLib.shader['BufferC'], load);
		gdrive.createTextFile(id, 'buf_d.fs', ShaderLib.shader['BufferD'], load);
		gdrive.createTextFile(id, 'main.fs', ShaderLib.shader['MainImage'], load);
		// ShaderBoy.gui.header.showCommandInfo('new.', 'st-sucsess-gdrive', false);
		ShaderBoy.gui_header.setStatus('suc1', 'New.', 3000);
		console.log('New shader files were created.');
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	newShader: function (shaderName)
	{
		console.log('io: newShader');
		gdrive.getFolderByName(shaderName, function (res)
		{
			console.log(res);
			if (res.files.length === 0)
			{
				console.log('It is not exist. Create new shader files.');
				gdrive.createShaderFolder(shaderName, function (ress)
				{
					console.log(res);
					gdrive.ID_DIR_SHADER = ress.id;
					ShaderBoy.io.isNewShader = true;
					ShaderBoy.io.createDefaultShaderFiles(ress.id);
					ShaderBoy.io.activateShader(shaderName);
					ShaderBoy.io.updateShaderList();
					// ShaderBoy.io.loadShader(ress.name, false);
					// ShaderBoy.editor.setBuffer('MainImage');
					// ShaderBoy.bufferManager.buildShaderFromBuffers(true);
					// ShaderBoy.isPlaying = true;
				});
			}
			else
			{
				console.log('It exist. Use a different name.');
			}
		});
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	saveShader: function ()
	{
		console.log('io: saveShader');
		ShaderBoy.gui_header.setStatus('prgrs', 'Saving...', 0);

		ShaderBoy.io.numNeedSaving = 5;
		ShaderBoy.io.numSaved = 0;
		ShaderBoy.io.numNeedSaving += (ShaderBoy.buffers['Common'].active === true) ? 1 : 0;
		ShaderBoy.io.numNeedSaving += (ShaderBoy.buffers['BufferA'].active === true) ? 1 : 0;
		ShaderBoy.io.numNeedSaving += (ShaderBoy.buffers['BufferB'].active === true) ? 1 : 0;
		ShaderBoy.io.numNeedSaving += (ShaderBoy.buffers['BufferC'].active === true) ? 1 : 0;
		ShaderBoy.io.numNeedSaving += (ShaderBoy.buffers['BufferD'].active === true) ? 1 : 0;

		let confirmSaving = () =>
		{
			ShaderBoy.io.numSaved++;
			console.log('ShaderBoy.io.numSaved: ', ShaderBoy.io.numSaved);
			console.log('ShaderBoy.io.numNeedSaving: ', ShaderBoy.io.numNeedSaving);

			if (ShaderBoy.io.numNeedSaving === ShaderBoy.io.numSaved)
			{
				ShaderBoy.gui_header.setStatus('suc1', 'Saved.', 3000);
			}
		};

		gdrive.saveThumbFile('thumb.png', ShaderBoy.canvas, function (res, err) { console.log(res, err, 'thumbnail was saved.'); }, confirmSaving);
		// gdrive.saveTextFile('setting.json', gdrive.appData['Setting'].id, JSON.stringify(JSON.parse(ShaderBoy.buffers['Setting'].cm.getValue()), null, "\t"), confirmSaving);
		gdrive.saveTextFile('setting.json', gdrive.appData['Setting'].id, JSON.stringify(ShaderBoy.setting, null, "\t"), confirmSaving);
		gdrive.saveTextFile('_guiknobs.json', gdrive.ids_shaderFiles['_guiknobs.json'].id, JSON.stringify({ 'show': ShaderBoy.gui.knobs.show, 'knobs': ShaderBoy.gui.knobs.knobs }, null, "\t"), confirmSaving);
		gdrive.saveTextFile('_guitimeline.json', gdrive.ids_shaderFiles['_guitimeline.json'].id, JSON.stringify(gui_timeline.guidata, null, "\t"), confirmSaving);
		// gdrive.saveTextFile('config.json', gdrive.ids_shaderFiles['config.json'].id, JSON.stringify(JSON.parse(ShaderBoy.buffers['Config'].cm.getValue()), null, "\t"), confirmSaving);
		gdrive.saveTextFile('config.json', gdrive.ids_shaderFiles['config.json'].id, JSON.stringify(ShaderBoy.config, null, "\t"), confirmSaving);
		gdrive.saveTextFile('main.fs', gdrive.ids_shaderFiles['main.fs'].id, ShaderBoy.buffers['MainImage'].cm.getValue(), confirmSaving);
		if (ShaderBoy.buffers['Common'].active === true) gdrive.saveTextFile('common.fs', gdrive.ids_shaderFiles['common.fs'].id, ShaderBoy.buffers['Common'].cm.getValue(), confirmSaving);
		if (ShaderBoy.buffers['BufferA'].active === true) gdrive.saveTextFile('buf_a.fs', gdrive.ids_shaderFiles['buf_a.fs'].id, ShaderBoy.buffers['BufferA'].cm.getValue(), confirmSaving);
		if (ShaderBoy.buffers['BufferB'].active === true) gdrive.saveTextFile('buf_b.fs', gdrive.ids_shaderFiles['buf_b.fs'].id, ShaderBoy.buffers['BufferB'].cm.getValue(), confirmSaving);
		if (ShaderBoy.buffers['BufferC'].active === true) gdrive.saveTextFile('buf_c.fs', gdrive.ids_shaderFiles['buf_c.fs'].id, ShaderBoy.buffers['BufferC'].cm.getValue(), confirmSaving);
		if (ShaderBoy.buffers['BufferD'].active === true) gdrive.saveTextFile('buf_d.fs', gdrive.ids_shaderFiles['buf_d.fs'].id, ShaderBoy.buffers['BufferD'].cm.getValue(), confirmSaving);
		localforage.setItem('renderScale', ShaderBoy.renderScale, function (err) { if (err) { console.log('db error...') } });
		localforage.setItem('textSize', ShaderBoy.textSize, function (err) { if (err) { console.log('db error...') } });
		// ShaderBoy.gui.header.showCommandInfo('saved.', 'st-sucsess-gdrive', false);
		// ShaderBoy.gui_header.setStatus('suc1', 'Saved.', 3000);
	},

	isLoaded: function (nm)
	{

		console.log('io: isLoaded');
		ShaderBoy.io.loadedNum++;
		console.log('isLoaded:' + nm);
		console.log('ShaderBoy.io.loadedNum:' + ShaderBoy.io.loadedNum);
		console.log('ShaderBoy.io.needLoadingNum:' + ShaderBoy.io.needLoadingNum);
		// ShaderBoy.gui.header.showCommandInfo('Loading shader files...(' + ShaderBoy.io.loadedNum + '/' + ShaderBoy.io.needLoadingNum + ')', 'st-default', false);
		ShaderBoy.gui_header.setStatus('prgrs', 'Loading shader files...(' + ShaderBoy.io.loadedNum + '/' + ShaderBoy.io.needLoadingNum + ')', 0);
		if (ShaderBoy.io.loadedNum === ShaderBoy.io.needLoadingNum)
		{
			console.log('io: Loaded all files...');
			// ShaderBoy.gui.header.showCommandInfo('loaded.', 'st-sucsess-local', false);
			// ShaderBoy.gui_header.setStatus('suc2', 'Loaded.', 3000);
			ShaderBoy.bufferManager.buildShaderFromBuffers();
			ShaderBoy.bufferManager.setFBOsProps();
			ShaderBoy.editor.setBuffer('MainImage');
			if (ShaderBoy.io.isNewShader === true)
			{
				// ShaderBoy.io.saveShader();
				gdrive.saveThumbFile('thumb.png', ShaderBoy.canvas, function (res, err) { console.log(res, err, 'thumbnail was saved.'); });
				ShaderBoy.io.isNewShader = false;
			}

			ShaderBoy.gui_header.resetBtns(ShaderBoy.config.buffers);

			// document.getElementById('div_loading').classList.add('hide');
			// document.getElementById('div_loading').classList.remove('show');
			// document.getElementById('main').classList.add('show');
			// document.getElementById('main').classList.remove('hide');
			// document.getElementById('code').classList.add('show');
			// document.getElementById('code').classList.remove('hide');
			ShaderBoy.gui_header.setStatus('suc2', 'Loaded.', 3000, function ()
			{
				document.getElementById('cvr-loading').classList.add('loading-hide');
				setTimeout(() =>
				{
					console.log('HIDEEEEEEE!!!!!!');
					document.getElementById('cvr-loading').classList.add('loading-hidden');
				}, 400);
			});
			ShaderBoy.isPlaying = true;
		}
	},

	getActiveShaderName: function ()
	{
		console.log('io: getActiveShaderName');
		let rowtxt = ShaderBoy.buffers['BufferA'].cm.getValue();
		return rowtxt;
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	loadShader: function (sn, initLoading)
	{
		// document.getElementById('div_loading').classList.remove('hide');
		// document.getElementById('div_loading').classList.add('show');
		// document.getElementById('main').classList.remove('show');
		// document.getElementById('main').classList.add('hide');
		ShaderBoy.io.activateShader(sn);

		console.log('initLoading: ', initLoading);
		if (initLoading === true)
		{
			window.idi = 0;
			const id = ShaderBoy.setting.shaders.datalist[window.idi].id;
			ShaderBoy.setting.shaders.shaderlist = [];

			window.cb_thumb = function (res)
			{
				if (res.files !== undefined)
				{
					if (res.files.length !== 0)
					{
						for (let i = 0; i < res.files.length; i++)
						{
							const file = res.files[i];
							if (file.name === 'thumb.png')
							{
								console.log(file);

								let img = new Image();
								img.onload = function ()
								{
									let div = document.getElementById('gui-layer');
									// div.appendChild(img);
									let imgcon = document.createElement('div');
									div.appendChild(imgcon);
									imgcon.style.width = '0px';
									imgcon.style.height = '0px';
									imgcon.style.backgroundImage = 'url("' + img.src + '")';

									ShaderBoy.setting.shaders.shaderlist[window.idi] = { name: ShaderBoy.setting.shaders.datalist[window.idi].name, thumb: 'url("' + img.src + '")' }
									console.log('img loaded: ', ShaderBoy.setting.shaders.shaderlist[window.idi]);

									window.idi++;
									if (ShaderBoy.setting.shaders.datalist[window.idi] !== undefined)
									{
										const id = ShaderBoy.setting.shaders.datalist[window.idi].id;
										gdrive.getFileByName('thumb.png', id, window.cb_thumb);
									}
									else
									{
										gui_panel_shaderlist.setup(ShaderBoy.setting.shaders.shaderlist);
										console.log('window.idi: ', window.idi);
									}
								};
								img.src = 'https://drive.google.com/uc?id=' + file.id;
							}
						}
					}
				}
			};
			gdrive.getFileByName('thumb.png', id, window.cb_thumb);
		}

		console.log('io: loadShader');
		ShaderBoy.io.initLoading = (initLoading === undefined) ? false : initLoading;
		ShaderBoy.buffers['Config'].active = true;
		ShaderBoy.io.loadedNum = 0;
		ShaderBoy.io.needLoadingNum = 0;
		// ShaderBoy.gui.header.showCommandInfo('Loading from Google Drive...', 'st-default', false);
		ShaderBoy.gui_header.setStatus('prgrs', 'Loading from Google Drive...', 0);

		let shaderName = '_default';
		if (sn !== undefined)
		{
			shaderName = sn;
		}

		// let shaderName =  ShaderBoy.util.deepcopy(ShaderBoy.buffers['BufferA'].cm.getValue());
		gdrive.getFolderByName(shaderName, function (res)
		{
			if (res.files[0] !== undefined)
			{
				// ShaderBoy.gui.header.showCommandInfo('"' + shaderName + '" was found. Loading shader files...', 'st-sucsess-gdrive', false);
				ShaderBoy.gui_header.setStatus('prgrs', '"' + shaderName + '" was found. Loading shader files...', 0);
				let folderId = res.files[0].id;

				gdrive.ID_DIR_SHADER = folderId;

				gdrive.getFilesInFolder(folderId,
					function (res)
					{

						if (res.files.length !== 0)
						{
							gdrive.ids_shaderFiles = {};
							for (let i = 0; i < res.files.length; i++)
							{
								const file = res.files[i];
								gdrive.ids_shaderFiles[file.name] = {};
								gdrive.ids_shaderFiles[file.name]['name'] = file.name;
								gdrive.ids_shaderFiles[file.name]['id'] = file.id;
								gdrive.ids_shaderFiles[file.name]['content'] = '';
							}

							let id = gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['Config']].id;
							gdrive.getContentBody(id, function (res)
							{
								let value = res.body;
								if (!value)
								{
									value = ShaderLib.shader['Config'];
								}

								let configObj = JSON.parse(value);
								ShaderBoy.config = configObj;
								console.log('configObj: ', configObj);
								for (const key in configObj.buffers)
								{
									const buffer = configObj.buffers[key];
									console.log(buffer);
									if (buffer.active === true)
									{
										ShaderBoy.io.needLoadingNum++;
									}
								}

								// Load GUI jsons...
								if (gdrive.ids_shaderFiles['_guiknobs.json'] !== undefined)
								{
									let id = gdrive.ids_shaderFiles['_guiknobs.json'].id;
									gdrive.getContentBody(id, function (res)
									{
										let value = res.body;
										console.log('knobbbb: ', res);
										if (!value)
										{
											value = ShaderLib.shader['gui_knobs'];
										}
										let knobsObj = JSON.parse(value);
										ShaderBoy.gui.knobs.show = knobsObj.show;
										for (let i = 0; i < ShaderBoy.gui.knobs.knobs.length; i++)
										{
											ShaderBoy.gui.knobs.knobs[i].value = knobsObj.knobs[i].value;
											ShaderBoy.gui.knobs.knobs[i].active = knobsObj.knobs[i].active;
											ShaderBoy.gui.knobs.toggle(i, false);
										}
									});
								}
								else
								{
									gdrive.createTextFile(gdrive.ID_DIR_SHADER, '_guiknobs.json', ShaderLib.shader['gui_knobs'], function (file)
									{
										gdrive.ids_shaderFiles['_guiknobs.json'] = {};
										gdrive.ids_shaderFiles['_guiknobs.json']["name"] = file.name;
										gdrive.ids_shaderFiles['_guiknobs.json']["id"] = file.id;
										gdrive.ids_shaderFiles['_guiknobs.json']["content"] = '';
										console.log('_guiknobs.json was created.');
									});
								}

								if (gdrive.ids_shaderFiles['_guitimeline.json'] !== undefined)
								{
									let id = gdrive.ids_shaderFiles['_guitimeline.json'].id;
									gdrive.getContentBody(id, function (res)
									{
										let value = res.body;
										console.log('timeline: ', res);
										if (!value)
										{
											value = ShaderLib.shader['gui_timeline'];
										}
										let timelineObj = JSON.parse(value);
										gui_timeline.guidata = timelineObj;
									});
								}
								else
								{
									gdrive.createTextFile(gdrive.ID_DIR_SHADER, '_guitimeline.json', ShaderLib.shader['gui_timeline'], function (file)
									{
										gdrive.ids_shaderFiles['_guitimeline.json'] = {};
										gdrive.ids_shaderFiles['_guitimeline.json']["name"] = file.name;
										gdrive.ids_shaderFiles['_guitimeline.json']["id"] = file.id;
										gdrive.ids_shaderFiles['_guitimeline.json']["content"] = '';
										console.log('_guitimeline.json was created.');
									});
								}


								let bufferConfig = configObj.buffers;

								console.log(bufferConfig['Common'].active);
								ShaderBoy.buffers['Common'].active = bufferConfig['Common'].active;
								if (ShaderBoy.buffers['Common'].active === true)
								{
									let id = gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['Common']].id;
									gdrive.getContentBody(id, function (res)
									{
										let value = res.body;
										if (!value)
										{
											value = ShaderLib.shader['Common'];
										}
										ShaderBoy.buffers['Common'].cm = CodeMirror.Doc(value, 'x-shader/x-fragment');
										ShaderBoy.io.isLoaded('Common');
									});
								}

								console.log(bufferConfig['BufferA'].active);
								ShaderBoy.buffers['BufferA'].active = bufferConfig['BufferA'].active;
								if (ShaderBoy.buffers['BufferA'].active === true)
								{
									let id = gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['BufferA']].id;
									gdrive.getContentBody(id, function (res)
									{
										let value = res.body;
										if (!value)
										{
											value = ShaderLib.shader['BufferA'];
										}
										ShaderBoy.buffers['BufferA'].cm = CodeMirror.Doc(value, 'x-shader/x-fragment');
										ShaderBoy.io.isLoaded('BufferA');
									});
								}

								console.log(bufferConfig['BufferB'].active);
								ShaderBoy.buffers['BufferB'].active = bufferConfig['BufferB'].active;
								if (ShaderBoy.buffers['BufferB'].active === true)
								{
									let id = gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['BufferB']].id;
									gdrive.getContentBody(id, function (res)
									{
										let value = res.body;
										if (!value)
										{
											value = ShaderLib.shader['BufferB'];
										}
										ShaderBoy.buffers['BufferB'].cm = CodeMirror.Doc(value, 'x-shader/x-fragment');
										ShaderBoy.io.isLoaded('BufferB');
									});
								}

								console.log(bufferConfig['BufferC'].active);
								ShaderBoy.buffers['BufferC'].active = bufferConfig['BufferC'].active;
								if (ShaderBoy.buffers['BufferC'].active === true)
								{
									let id = gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['BufferC']].id;
									gdrive.getContentBody(id, function (res)
									{
										let value = res.body;
										if (!value)
										{
											value = ShaderLib.shader['BufferC'];
										}
										ShaderBoy.buffers['BufferC'].cm = CodeMirror.Doc(value, 'x-shader/x-fragment');
										ShaderBoy.io.isLoaded('BufferC');
									});
								}

								console.log(bufferConfig['BufferD'].active);
								ShaderBoy.buffers['BufferD'].active = bufferConfig['BufferD'].active;
								if (ShaderBoy.buffers['BufferD'].active === true)
								{
									let id = gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['BufferD']].id;
									gdrive.getContentBody(id, function (res)
									{
										let value = res.body;
										if (!value)
										{
											value = ShaderLib.shader['BufferD'];
										}
										ShaderBoy.buffers['BufferD'].cm = CodeMirror.Doc(value, 'x-shader/x-fragment');
										ShaderBoy.io.isLoaded('BufferD');
									});
								}

								console.log(bufferConfig['MainImage'].active);
								ShaderBoy.buffers['MainImage'].active = bufferConfig['MainImage'].active;
								if (ShaderBoy.buffers['MainImage'].active === true)
								{
									let id = gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['MainImage']].id;
									gdrive.getContentBody(id, function (res)
									{
										let value = res.body;
										if (!value)
										{
											value = ShaderLib.shader.mainFS;
										}
										ShaderBoy.buffers['MainImage'].cm = CodeMirror.Doc(value, 'x-shader/x-fragment');
										ShaderBoy.io.isLoaded('MainImage');
									});
								}

								let configText = JSON.stringify(configObj, null, "\t");
								ShaderBoy.buffers['Config'].cm = CodeMirror.Doc(configText, 'x-shader/x-fragment');

								localforage.getItem('renderScale', function (err, value)
								{
									if (!value)
									{
										value = 2;
									}
									ShaderBoy.renderScale = value;
									// ShaderBoy.io.isLoaded('renderScale');
								});

								localforage.getItem('textSize', function (err, value)
								{
									if (!value)
									{
										value = 16;
									}
									ShaderBoy.editor.textSize = value;
									// ShaderBoy.io.isLoaded('textSize');
								});
							});
						}
						else
						{
							// ShaderBoy.gui.header.showCommandInfo(shaderName + ' folder is empty! Confirm on your GoogleDrive.', 'st-error', false);
							ShaderBoy.gui_header.setStatus('error', shaderName + ' folder is empty. Confirm on your GoogleDrive.', 0);
						}
					}
				);
			} else
			{
				// ShaderBoy.gui.header.showCommandInfo(shaderName + ' was not found! Create it.', 'st-error', false);
				ShaderBoy.gui_header.setStatus('error', shaderName + ' was not found.', 3000);
				ShaderBoy.io.newShader(shaderName);

			}
		}
		);

	}
};