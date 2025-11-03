//   _  _____
//  (_)(  _  )
//  | || ( ) |
//  | || | | |
//  | || (_) |
//  (_)(_____)

import ShaderBoy from '../shaderboy'
import ShaderLib from '../shader/shaderlib'
import gdrive from './gdrive'
// import CodeMirror from 'codemirror/lib/codemirror'
import localforage from 'localforage'
import gui_timeline from '../gui/gui_timeline'
import gui_panel_shaderlist from '../gui/gui_panel_shaderlist'
import Hermite_class from 'hermite-resize'
import * as monaco from 'monaco-editor'

export default ShaderBoy.io = {

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	init()
	{
		localforage.config({
			driver: localforage.INDEXEDDB,
			name: 'ShaderBoy',
			version: 1.0,
			storeName: 'shaderdata'
		})

		ShaderBoy.renderScale = 2
		ShaderBoy.editor.textSize = 16
		// 現在のシェーダー名を保持するプロパティを初期化
		ShaderBoy.currentShaderName = '_default'

		this.initLoading = true
		this.isNewShader = false
		this.isAppInit = false
		this.idList = {}

		this.ID_DIR_APP = ''
		this.ID_DIR_SHADER = ''

		if (ShaderBoy.isTrialMode)
		{
			console.log('trial mode...')
			this.setupDevShader()
		}
		else
		{
			console.log('production mode...')
			gdrive.init()
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async loadGdrive()
	{
		try {
			ShaderBoy.gui_header.setStatus('prgrs', 'Loading from Google Drive...', 0);

			// IDが指定されていれば、まず直接IDでシェーダーを開く
			if (ShaderBoy.targetShaderId) {
				console.log('指定されたシェーダーIDを使用して直接開きます:', ShaderBoy.targetShaderId);

				try {
					// フォルダの種類かどうか確認
					const folder = await gdrive.getFileInfoByFileId(ShaderBoy.targetShaderId);

					if (folder && folder.result && folder.result.mimeType === 'application/vnd.google-apps.folder') {
						console.log('フォルダが見つかりました:', folder.result.name);

						// シェーダーフォルダが見つかったので、そのフォルダからシェーダーを読み込む
						this.ID_DIR_SHADER = ShaderBoy.targetShaderId;
						const folderName = folder.result.name;
						ShaderBoy.currentShaderName = folderName;

						// UIの更新
						const asnElement = document.getElementById('asn_name');
						if (asnElement) {
							asnElement.textContent = folderName;
						}

						// ファイルIDを収集して読み込む
						try {
							const files = await gdrive.getFileIdsInFolder(this.ID_DIR_SHADER);

							if (files && files.result && files.result.files && files.result.files.length > 0) {
								// ファイルIDを処理
								this.processFileIds(files.result.files);

								// 設定とGUIデータを読み込む
								await Promise.all([
									this.setShaderConfig(),
									this.loadGUIdata()
								]);

								// シェーダーコードを読み込む
								await this.loadShaderCodes();

								// シェーダをビルド
								ShaderBoy.bufferManager.buildShaderFromBuffers(false);
								ShaderBoy.gui_header.resetBtns(ShaderBoy.config.buffers);
								ShaderBoy.bufferManager.setFBOsProps();
								ShaderBoy.editor.setBuffer('Image', true);

								// シェーダをコンパイル
								ShaderBoy.bufferManager.compileShaders();

								ShaderBoy.gui_header.setStatus('gsuc', 'Loaded from ID.', 3000);

								// ローディング完了処理
								if (this.initLoading === true) {
									ShaderBoy.gui.hideLoading();
									this.initLoading = false;
									ShaderBoy.update();
								}

								ShaderBoy.commands.playTimeline();

								// 設定も読み込んでおく（バックグラウンドで）
								this.loadSetting();

								// サムネイル読み込み（非同期）
								setTimeout(() => {
									this.getThumbFiles().catch(err => {
										console.error('サムネイル読み込みエラー:', err);
									});
								}, 500);

								return; // 成功したら処理終了
							} else {
								console.warn('シェーダーフォルダ内にファイルが見つかりません。通常の読み込みに切り替えます。');
							}
						} catch (filesError) {
							console.error('フォルダ内のファイル読み込みエラー:', filesError);
						}
					} else {
						console.warn('指定されたIDはフォルダではないか、見つかりませんでした。通常の読み込みに切り替えます。');
					}
				} catch (idError) {
					console.error('IDからのシェーダー読み込みエラー:', idError);
				}

				// IDからの直接読み込みに失敗したことを表示
				ShaderBoy.gui_header.setStatus('wrn', '指定されたIDのシェーダーを直接開けませんでした', 3000);
			}

			// 通常の流れ（IDからの読み込みに失敗した場合や、IDが指定されていない場合）
			const isLoaded = await this.loadSetting();

			if (isLoaded) {
				try {
					// デフォルトはアクティブシェーダ名
					let targetShaderName = ShaderBoy.activeShaderName;

					// IDが指定されている場合は、設定ファイルから探す
					if (ShaderBoy.targetShaderId &&
						ShaderBoy.setting &&
						ShaderBoy.setting.shaders &&
						Array.isArray(ShaderBoy.setting.shaders.folderIds) &&
						ShaderBoy.setting.shaders.folderIds.length > 0) {

						console.log('設定ファイルからシェーダIDを検索:', ShaderBoy.targetShaderId);

						const targetFolder = ShaderBoy.setting.shaders.folderIds.find(
							folder => folder && folder.id === ShaderBoy.targetShaderId
						);

						if (targetFolder && targetFolder.name) {
							console.log('設定ファイルから指定IDのシェーダが見つかりました:', targetFolder.name);
							targetShaderName = targetFolder.name;
						} else {
							console.warn(`設定ファイルに指定IDのシェーダが見つかりません: ${ShaderBoy.targetShaderId}`);
						}
					}

					// シェーダを初期化
					if (ShaderBoy.bufferManager) {
						ShaderBoy.bufferManager.numCompiledBuffer = 0;
					}

					// シェーダー読み込み
					await this.loadShaderFiles(targetShaderName, true);

					// サムネイル読み込み（非同期）
					setTimeout(() => {
						this.getThumbFiles().catch(err => {
							console.error('サムネイル読み込みエラー:', err);
						});
					}, 500);
				} catch (error) {
					console.error('シェーダロード中にエラーが発生しました:', error);
					// エラーが発生した場合もデフォルトシェーダを読み込む
					await this.loadShaderFiles('_default', true);

					// サムネイル読み込みは回復処理後に行う
					setTimeout(() => {
						this.getThumbFiles().catch(err => {
							console.error('サムネイル読み込みエラー（復旧後）:', err);
						});
					}, 1000);
				}
			} else {
				this.isAppInit = true;
				this.setActiveShaderName('_default');
				await this.newShader(ShaderBoy.activeShaderName);
				if (ShaderBoy.bufferManager) {
					ShaderBoy.bufferManager.initBufferDoc(['Setting']);
				}
			}
		} catch (error) {
			console.error('loadGdrive総合エラー:', error);
			// 最終的なフォールバック
			this.isAppInit = true;
			this.setActiveShaderName('_default');
			this.setupDevShader(true);
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setActiveShaderName(name)
	{
		// アクティブシェーダー名を更新
		ShaderBoy.activeShaderName = name
		// 現在のシェーダー名も同期させる
		ShaderBoy.currentShaderName = name

		// 設定オブジェクトも更新
		if (ShaderBoy.setting && ShaderBoy.setting.shaders) {
			ShaderBoy.setting.shaders.active = name
		}

		// active_shader.jsonが初期化されていれば更新
		if (this.idList['active_shader.json']) {
			this.saveActiveShaderFile().catch(err => {
				console.error('Failed to save active shader file:', err);
			});
		}

		// UI（アクティブシェーダー名）を更新
		const asnElement = document.getElementById('asn_name');
		if (asnElement) {
			asnElement.textContent = name;
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupDevShader(withError = false)
	{
		// 現在のシェーダー名をUIに反映
		if (ShaderBoy.currentShaderName) {
			const asnElement = document.getElementById('asn_name');
			if (asnElement) {
				asnElement.textContent = ShaderBoy.currentShaderName;
			}
		}

		ShaderBoy.config = JSON.parse(ShaderBoy.buffers['Config'].getValue())

		ShaderBoy.buffers['Common'].active = ShaderBoy.config.buffers['Common'].active
		ShaderBoy.buffers['BufferA'].active = ShaderBoy.config.buffers['BufferA'].active
		ShaderBoy.buffers['BufferB'].active = ShaderBoy.config.buffers['BufferB'].active
		ShaderBoy.buffers['BufferC'].active = ShaderBoy.config.buffers['BufferC'].active
		ShaderBoy.buffers['BufferD'].active = ShaderBoy.config.buffers['BufferD'].active
		ShaderBoy.buffers['Image'].active = ShaderBoy.config.buffers['Image'].active
		ShaderBoy.buffers['Sound'].active = ShaderBoy.config.buffers['Sound'].active
		ShaderBoy.buffers['Image'].active = true

		ShaderBoy.gui_header.resetBtns(ShaderBoy.buffers)

		ShaderBoy.bufferManager.buildShaderFromBuffers()
		ShaderBoy.bufferManager.setFBOsProps()

		const knobsObj = JSON.parse(ShaderLib.shader['gui_knobs'])
		ShaderBoy.gui.knobs.show = knobsObj.show
		for (let i = 0; i < knobsObj.knobs.length; i++)
		{
			ShaderBoy.gui.knobs.knobs[i].value = knobsObj.knobs[i].value
			ShaderBoy.gui.knobs.knobs[i].active = knobsObj.knobs[i].active
			ShaderBoy.gui.knobs.toggle(i, false)
		}

		const timelineObj = JSON.parse(ShaderLib.shader['gui_timeline'])
		gui_timeline.guidata = timelineObj

		ShaderBoy.editor.setBuffer('Image', true)

		ShaderBoy.commands.playTimeline()

		ShaderBoy.gui.hideAuth()

		if (withError)
		{
			ShaderBoy.gui_header.setStatus('error', `"${ShaderBoy.activeShaderName}" was not found!`, 3000)
		}
		else
		{
			ShaderBoy.gui_header.setStatus('gsuc', 'Loaded.', 3000)
		}

		setTimeout(() =>
		{
			ShaderBoy.gui.hideLoading()
			if (this.initLoading === true)
			{
				this.initLoading = false
				ShaderBoy.update()
			}

			if (withError)
			{
				ShaderBoy.gui_header.setStatus('error', `"${ShaderBoy.activeShaderName}" was not found! Try other.`, 0)
				setTimeout(() =>
				{
					gui_panel_shaderlist.show()
				}, 100)
			}
		}, 100)

	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async loadSetting()
	{
		// ローカル設定を読み込み
		this.loadLocalSettings();

		// アクティブシェーダーを先に読み込む
		const activeShaderName = await this.loadActiveShaderFile();
		this.setActiveShaderName(activeShaderName);

		// バックグラウンドで完全なsetting.jsonを非同期に読み込む
		this.loadFullSettingAsync();

		return Promise.resolve(true);
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async loadFullSettingAsync() {
		// 非同期でバックグラウンドでsetting.jsonを読み込む
		setTimeout(async () => {
			try {
				let request = await gdrive.getFileInfoByName('setting.json', this.ID_DIR_APP);

				// 安全性チェック
				if (!request || !request.result) {
					console.warn('setting.jsonの取得に失敗しました: 無効なレスポンス');
					await this.createSetting();
					return;
				}

				let res = request.result;

				// res.filesの安全性チェック
				if (!res || !res.files || !Array.isArray(res.files) || res.files.length === 0) {
					console.warn('setting.json が見つかりません');
					await this.createSetting();
					return;
				}

				// setting.jsonを読み込む
				const file = res.files[0];
				this.idList['setting.json'] = {
					name: file.name,
					id: file.id,
					content: ''
				};

				request = await gdrive.getContentBody(file.id);

				// レスポンスボディの安全性チェック
				if (!request || !request.body) {
					console.warn('setting.jsonの内容が読み込めません');
					return;
				}

				try {
					const settingObj = JSON.parse(request.body);
					ShaderBoy.setting = settingObj;

					// フォルダ一覧を取得（シェーダーリストの構築用）
					request = await gdrive.getFolders(this.ID_DIR_APP);

					// 安全性チェック
					if (!request || !request.result) {
						console.warn('フォルダリストの取得に失敗しました');
						return;
					}

					res = request.result;

					// res.filesの安全性チェック
					if (!res || !res.files || !Array.isArray(res.files)) {
						console.warn('フォルダリストが空です');
						ShaderBoy.setting.shaders.names = [];
						ShaderBoy.setting.shaders.folderIds = [];
						return;
					}

					ShaderBoy.setting.shaders.names = [];
					ShaderBoy.setting.shaders.folderIds = [];

					for (const folder of res.files) {
						if (folder && folder.name && folder.id) {
							ShaderBoy.setting.shaders.names.push(folder.name);
							ShaderBoy.setting.shaders.folderIds.push({
								name: folder.name,
								id: folder.id,
								modifiedTime: folder.modifiedTime || new Date().toISOString()
							});
						}
					}

					// サムネイルも非同期で読み込む
					this.getThumbFiles();
				} catch (parseError) {
					console.error('setting.jsonのパースエラー:', parseError);
				}

			} catch (e) {
				console.error('Error in loadFullSettingAsync:', e);
			}
		}, 0); // 次のイベントループで実行
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async createSetting()
	{
		ShaderBoy.setting = JSON.parse(ShaderLib.shader['Setting'])
		ShaderBoy.setting.shaders.names = []
		ShaderBoy.setting.shaders.folderIds = []
		ShaderBoy.setting.shaders.names[0] = 'file.name'
		ShaderBoy.setting.shaders.folderIds[0] = { name: '_default', id: null }
		const request = await gdrive.createTextFile(this.ID_DIR_APP, 'setting.json', ShaderLib.shader['Setting'])
		const res = request.result
		this.idList['setting.json'] = {}
		this.idList['setting.json'].name = res.name
		this.idList['setting.json'].id = res.id
		this.idList['setting.json'].content = ''
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async createShaderFiles(id, isFork = false)
	{
		let request, res
		ShaderBoy.gui_header.setStatus('prgrs', 'Creating shader files...', 0)
		ShaderBoy.config = JSON.parse(ShaderBoy.buffers['Config'].getValue())

		let promises = []

		if (isFork)
		{
			// New shader with current editing...
			promises = [
				gdrive.createTextFile(id, 'config.json', JSON.stringify(ShaderBoy.config, null, "\t")),
				gdrive.createTextFile(id, '_guiknobs.json', JSON.stringify({ 'show': ShaderBoy.gui.knobs.show, 'knobs': ShaderBoy.gui.knobs.knobs })),
				gdrive.createTextFile(id, '_guitimeline.json', JSON.stringify(gui_timeline.guidata, null, "\t")),
				gdrive.createTextFile(id, 'common.fs', ShaderBoy.buffers['Common'].getValue()),
				gdrive.createTextFile(id, 'buf_a.fs', ShaderBoy.buffers['BufferA'].getValue()),
				gdrive.createTextFile(id, 'buf_b.fs', ShaderBoy.buffers['BufferB'].getValue()),
				gdrive.createTextFile(id, 'buf_c.fs', ShaderBoy.buffers['BufferC'].getValue()),
				gdrive.createTextFile(id, 'buf_d.fs', ShaderBoy.buffers['BufferD'].getValue()),
				gdrive.createTextFile(id, 'main.fs', ShaderBoy.buffers['Image'].getValue()),
				gdrive.createTextFile(id, 'sound.fs', ShaderBoy.buffers['Sound'].getValue())
			]
		}
		else
		{
			// New shader with default...
			promises = [
				gdrive.createTextFile(id, 'config.json', ShaderLib.shader['Config']),
				gdrive.createTextFile(id, 'common.fs', ShaderLib.shader['Common']),
				gdrive.createTextFile(id, '_guiknobs.json', ShaderLib.shader['gui_knobs']),
				gdrive.createTextFile(id, '_guitimeline.json', ShaderLib.shader['gui_timeline']),
				gdrive.createTextFile(id, 'buf_a.fs', ShaderLib.shader['BufferA']),
				gdrive.createTextFile(id, 'buf_b.fs', ShaderLib.shader['BufferB']),
				gdrive.createTextFile(id, 'buf_c.fs', ShaderLib.shader['BufferC']),
				gdrive.createTextFile(id, 'buf_d.fs', ShaderLib.shader['BufferD']),
				gdrive.createTextFile(id, 'main.fs', ShaderLib.shader['Image']),
				gdrive.createTextFile(id, 'sound.fs', ShaderLib.shader['Sound'])
			]
		}

		Promise.all(promises).then(async () =>
		{
			if (isFork)
			{
				ShaderBoy.gui_header.setStatus('gsuc', 'Fork.', 3000)
			}
			else
			{
				ShaderBoy.gui_header.setStatus('gsuc', 'New.', 3000)
			}

			if (this.isAppInit === true)
			{
				this.isAppInit = false
				await this.loadSetting()
				// アクティブシェーダー名ではなく現在のシェーダー名を使用
				await this.loadShaderFiles(ShaderBoy.currentShaderName, true)
				await this.getThumbFiles()
			}
			else
			{
				// アクティブシェーダー名ではなく現在のシェーダー名を使用
				this.loadShaderFiles(ShaderBoy.currentShaderName)
			}
		}).catch((error) =>
		{
			throw new Error(error)
		})
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	getConflictSafeName(shaderName)
	{
		let isSafeName = false
		let safeNewShaderName = shaderName
		while (!isSafeName)
		{
			isSafeName = true
			for (const name of ShaderBoy.setting.shaders.names)
			{
				if (safeNewShaderName === name)
				{
					safeNewShaderName += '.nameConflict'
					isSafeName = false
					break
				}
			}
		}

		if (safeNewShaderName !== shaderName)
		{
			ShaderBoy.gui_header.setStatus('wrn', 'Name confliction. Rename on GoogleDrive.', 3000)
		}

		return safeNewShaderName
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async newShader(shaderName, isFork = false)
	{
		let request, res

		const safeShaderName = this.getConflictSafeName(shaderName)

		request = await gdrive.getFolderByName(safeShaderName)
		res = request.result
		if (res.files.length !== 0)
		{
			return Promise.reject(() => { console.log('It exist. Use a different name.') })
		}

		request = await gdrive.createFolder(safeShaderName, this.ID_DIR_APP)
		res = request.result
		this.ID_DIR_SHADER = res.id

		// 新規シェーダー作成時には現在のシェーダー名を更新（アクティブにはしない）
		ShaderBoy.currentShaderName = safeShaderName

		// UIの更新
		const asnElement = document.getElementById('asn_name');
		if (asnElement) {
			asnElement.textContent = safeShaderName;
		}

		this.isNewShader = true
		await this.createShaderFiles(res.id, isFork)
		ShaderBoy.setting.shaders.names.push(safeShaderName)
		ShaderBoy.setting.shaders.names = Array.from(new Set(ShaderBoy.setting.shaders.names))
		return Promise.resolve()
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async saveShader()
	{
		ShaderBoy.gui_header.setStatus('prgrs', 'Saving...', 0)

		// 保存時にアクティブシェーダー名を更新
		if (ShaderBoy.currentShaderName) {
			this.setActiveShaderName(ShaderBoy.currentShaderName);
		}

		localforage.setItem('renderScale', ShaderBoy.renderScale, (error) => { if (error) { throw new Error(error) } })
		localforage.setItem('textSize', ShaderBoy.editor.textSize, (error) => { if (error) { throw new Error(error) } })
		localforage.setItem('isSplited', ShaderBoy.isSplited, (error) => { if (error) { throw new Error(error) } })

		const promises = []
		const saveBufferShader = (buffer, fileName) =>
		{
			if (buffer.active) promises.push(gdrive.saveTextFile(fileName, this.idList[fileName].id, buffer.getValue()))
		}

		// アクティブシェーダー情報も保存
		promises.push(this.saveActiveShaderFile())

		promises.push(this.saveThumbFile('thumb.png', ShaderBoy.canvas, this.ID_DIR_SHADER))
		promises.push(gdrive.saveTextFile('setting.json', this.idList['setting.json'].id, JSON.stringify(ShaderBoy.setting, null, "\t")))
		promises.push(gdrive.saveTextFile('_guiknobs.json', this.idList['_guiknobs.json'].id, JSON.stringify({ 'show': ShaderBoy.gui.knobs.show, 'knobs': ShaderBoy.gui.knobs.knobs }, null, "\t")))
		promises.push(gdrive.saveTextFile('_guitimeline.json', this.idList['_guitimeline.json'].id, JSON.stringify(gui_timeline.guidata, null, "\t")))
		promises.push(gdrive.saveTextFile('config.json', this.idList['config.json'].id, JSON.stringify(ShaderBoy.config, null, "\t")))

		saveBufferShader(ShaderBoy.buffers['Image'], 'main.fs')
		saveBufferShader(ShaderBoy.buffers['Common'], 'common.fs')
		saveBufferShader(ShaderBoy.buffers['BufferA'], 'buf_a.fs')
		saveBufferShader(ShaderBoy.buffers['BufferB'], 'buf_b.fs')
		saveBufferShader(ShaderBoy.buffers['BufferC'], 'buf_c.fs')
		saveBufferShader(ShaderBoy.buffers['BufferD'], 'buf_d.fs')
		saveBufferShader(ShaderBoy.buffers['Sound'], 'sound.fs')

		Promise.all(promises).then(() =>
		{
			ShaderBoy.gui_header.setStatus('gsuc', 'Saved.', 3000)
			ShaderBoy.gui_header.setDirty(false)
		}).catch((error) =>
		{
			throw new Error(error)
		})
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async saveThumbFile(name, mainCanvas, folderId)
	{
		const thumbCanvas = document.createElement("canvas")

		if (mainCanvas.width / mainCanvas.height > 16 / 9)
		{
			thumbCanvas.height = mainCanvas.height
			thumbCanvas.width = Math.floor(mainCanvas.height * (16 / 9))
			const offsetX = (mainCanvas.width - thumbCanvas.width) * 0.5
			thumbCanvas.getContext('2d').drawImage(mainCanvas, -offsetX, 0)
		}
		else
		{
			thumbCanvas.width = mainCanvas.width
			thumbCanvas.height = Math.floor(mainCanvas.width * (9 / 16))
			const offsetY = (mainCanvas.height - thumbCanvas.height) * 0.5
			thumbCanvas.getContext('2d').drawImage(mainCanvas, 0, -offsetY)
		}

		await new Promise((resolve, reject) => { new Hermite_class().resample(thumbCanvas, 320, 180, true, resolve) })
		// Change to JPG format
		const content = thumbCanvas.toDataURL("image/jpeg").replace("data:image/jpeg;base64,", "")

		// Change filename to thumb.jpg
		const fileName = 'thumb.jpg';

		let response = await gdrive.getFileInfoByName(fileName, folderId, null)
		const res = response.result
		if (res.files.length === 0)
		{
			// Change MIME type to image/jpeg
			gdrive.createFile(folderId, fileName, content, 'image/jpeg', null).then(() =>
			{
				return Promise.resolve()
			}).catch((error) =>
			{
				return Promise.reject()
			})
		}
		else
		{
			// Change MIME type to image/jpeg
			gdrive.saveFile(fileName, res.files[0].id, content, 'image/jpeg', null).then(() =>
			{
				return Promise.resolve()
			}).catch((error) =>
			{
				return Promise.reject()
			})
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async getThumbFiles()
	{
		try {
			const panelEl = document.getElementById('gp-shader-list');
			if (panelEl) {
				while (panelEl.hasChildNodes()) {
					panelEl.removeChild(panelEl.lastChild);
				}
				// 念のため、btns配列もクリアしておく (gui_panel_shaderlist が存在する場合)
				if (typeof ShaderBoy !== 'undefined' && ShaderBoy.gui_panel_shaderlist && Array.isArray(ShaderBoy.gui_panel_shaderlist.btns)) {
					ShaderBoy.gui_panel_shaderlist.btns = [];
				}
			} else {
				console.error('シェーダーリストパネルが見つかりません。');
				return Promise.resolve(); // パネルがなければ処理終了
			}

			ShaderBoy.gui_header.setStatus('prgrs', 'Fetching shader list...', 0);

			// ローカル開発環境チェック
			const isLocalhost = window.location.hostname === 'localhost' ||
				window.location.hostname === '127.0.0.1' ||
				window.location.hostname.startsWith('192.168.') ||
				window.location.hostname.startsWith('10.') ||
				window.location.protocol === 'file:';

			// ローカル環境では警告
			if (isLocalhost) {
				console.log('ローカル環境でのサムネイル読み込みは制限されます（CORSエラー防止）');
			}

			// 安全性チェック - setting.shadersが存在しない場合は早期リターン
			if (!ShaderBoy.setting || !ShaderBoy.setting.shaders || !ShaderBoy.setting.shaders.folderIds) {
				console.warn('getThumbFiles: ShaderBoy.setting.shaders.folderIds が見つかりません');
				return Promise.resolve(); // 空のPromiseを返して処理を続行
			}

			try {
				// 配列のディープコピーを作成
				let folderIds = Array.isArray(ShaderBoy.setting.shaders.folderIds) ?
					JSON.parse(JSON.stringify(ShaderBoy.setting.shaders.folderIds.filter(item => item !== null))) : [];

				// folderIdsが空の場合は早期リターン
				if (folderIds.length === 0) {
					console.log('getThumbFiles: フォルダIDがありません');
					return Promise.resolve();
				}

				// 日付順でソート（安全にソート）
				folderIds.sort((a, b) => {
					if (!a || !b) return 0;
					try {
						const timeA = a.modifiedTime ? new Date(a.modifiedTime) : new Date(0);
						const timeB = b.modifiedTime ? new Date(b.modifiedTime) : new Date(0);
						return timeB - timeA;
					} catch (e) {
						console.warn('getThumbFiles: ソートエラー', e);
						return 0; // エラーの場合は順序を変えない
					}
				});

				// まずシェーダリストだけを先に表示（サムネイルなし）
				if (typeof gui_panel_shaderlist !== 'undefined' && gui_panel_shaderlist) {
					folderIds.forEach(shaderId => {
						if (!shaderId) return; // nullやundefinedをスキップ

						try {
							gui_panel_shaderlist.addThumbBtn({
								name: shaderId.name || 'Unnamed',
								thumb: null,
								modifiedTime: shaderId.modifiedTime || new Date().toISOString(),
								folderId: shaderId.id || ''
							});
						} catch (err) {
							console.warn('サムネイルボタン追加エラー:', err);
						}
					});

					// リストをソート
					try {
						gui_panel_shaderlist.sort();
					} catch (err) {
						console.warn('シェーダリストソートエラー:', err);
					}

					// スクロールリスナーを設定
					try {
						gui_panel_shaderlist.setupScrollListener();

						// 初期の可視フォルダIDを取得
						const visibleItems = gui_panel_shaderlist.loadVisibleThumbnailsFirst();
						this.priorityFolderIds = Array.isArray(visibleItems) ?
							visibleItems.filter(item => item).map(item => item.id).filter(id => id) : [];
					} catch (err) {
						console.warn('スクロールリスナー設定エラー:', err);
						this.priorityFolderIds = [];
					}
				} else {
					console.warn('gui_panel_shaderlist が見つかりません');
					return Promise.resolve();
				}

				// サムネイル読み込みを少し遅延させてUIの応答性を保つ
				setTimeout(async () => {
					try {
						await this.loadThumbnailsBatched(folderIds);
					} catch (err) {
						console.error('サムネイル読み込みエラー:', err);
					}
				}, 2000);

				return Promise.resolve();
			} catch (error) {
				console.error('getThumbFiles総合エラー:', error);
				return Promise.resolve(); // エラーでも処理を続行
			}
		} catch (error) {
			console.error('getThumbFiles総合エラー:', error);
			return Promise.resolve(); // エラーでも処理を続行
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// サムネイル読み込みを別メソッドに分離して管理しやすくする
	async loadThumbnailsBatched(folderIds) {
		// ローカル環境チェック
		const isLocalhost = window.location.hostname === 'localhost' ||
			window.location.hostname === '127.0.0.1' ||
			window.location.hostname.startsWith('192.168.') ||
			window.location.hostname.startsWith('10.') ||
			window.location.protocol === 'file:';

		if (isLocalhost) {
			// ローカル環境ではサムネイル読み込みをスキップ
			// return;
		}

		// 進捗表示
		const totalCount = folderIds.length;

		// 処理済みフォルダIDを追跡
		const processedIds = new Set();
		const BATCH_SIZE = 4; // 同時読み込み数を減らす
		const pngFilesToDelete = []; // 削除対象のPNGファイルIDを収集するリスト

		// サムネイル読み込み処理のメインループ
		while (processedIds.size < totalCount) {
			try {
				// 優先フォルダIDから未処理のものを抽出
				const priorityBatch = Array.isArray(this.priorityFolderIds) ?
					this.priorityFolderIds
						.filter(id => id && !processedIds.has(id))
						.slice(0, BATCH_SIZE) : [];

				// 残りのフォルダIDからバッチサイズまで埋める
				let currentBatch = priorityBatch.slice();

				if (currentBatch.length < BATCH_SIZE) {
					const remainingIds = folderIds
						.filter(item => item && item.id && !processedIds.has(item.id) && !priorityBatch.includes(item.id))
						.slice(0, BATCH_SIZE - currentBatch.length)
						.map(item => item.id);

					currentBatch = currentBatch.concat(remainingIds);
				}

				// バッチが空なら終了
				if (currentBatch.length === 0) break;

				// 並列でサムネイルを取得（エラートラッピング付き）
				const promises = currentBatch.map(async (id) => {
					try {
						if (!id) return { id, thumb: null, pngFileIdToDelete: null };

						const folderItem = folderIds.find(item => item && item.id === id);
						if (!folderItem) return { id, thumb: null, pngFileIdToDelete: null };

						let fileInfo = null;
						let isJpg = false;
						let pngFileIdToDelete = null;

						// 1. Try thumb.jpg
						try {
							const jpgRequest = await gdrive.getFileInfoByName('thumb.jpg', id);
							if (jpgRequest && jpgRequest.result && jpgRequest.result.files && jpgRequest.result.files[0]) {
								fileInfo = jpgRequest.result.files[0];
								isJpg = true;

								// Check if thumb.png exists and schedule for deletion
								try {
									const pngRequest = await gdrive.getFileInfoByName('thumb.png', id);
									if (pngRequest && pngRequest.result && pngRequest.result.files && pngRequest.result.files[0]) {
										pngFileIdToDelete = pngRequest.result.files[0].id;
									}
								} catch (pngError) {
									// Ignore error if png doesn't exist
								}
							}
						} catch (jpgError) {
							// Ignore error, jpg might not exist
						}

						// 2. If thumb.jpg not found, try thumb.png
						if (!fileInfo) {
							try {
								const pngRequest = await gdrive.getFileInfoByName('thumb.png', id);
								if (pngRequest && pngRequest.result && pngRequest.result.files && pngRequest.result.files[0]) {
									fileInfo = pngRequest.result.files[0];
								}
							} catch (pngError) {
								// Ignore error, png might not exist either
							}
						}

						// 3. If neither found, return null
						if (!fileInfo) {
							return { id, thumb: null, pngFileIdToDelete: null };
						}

						// 4. Get content of the found thumbnail
						try {
							const res = await gdrive.getContentBody(fileInfo.id);
							if (!res || !res.body || !res.headers) {
								return { id, thumb: null, pngFileIdToDelete: null };
							}

							const imageType = res.headers['content-type'] || (isJpg ? 'image/jpeg' : 'image/png');
							try {
								const base64 = window.btoa(res.body);
								const dataURI = 'data:' + imageType + ';base64,' + base64;

								return {
									id,
									thumb: `url("${dataURI}")`,
									pngFileIdToDelete // Pass the ID to delete (if any)
								};
							} catch (base64Error) {
								return { id, thumb: null, pngFileIdToDelete: null };
							}
						} catch (contentError) {
							return { id, thumb: null, pngFileIdToDelete: null };
						}
					} catch (error) {
						// Catch any unexpected errors in the mapping function
						console.error(`Error processing thumbnail for ID ${id}:`, error);
						return { id, thumb: null, pngFileIdToDelete: null };
					}
				});

				// バッチの結果を処理
				const results = await Promise.allSettled(promises);

				results.forEach(result => {
					if (result.status === 'fulfilled' && result.value && result.value.id) {
						processedIds.add(result.value.id);
						if (result.value.thumb && typeof gui_panel_shaderlist !== 'undefined' && gui_panel_shaderlist) {
							try {
								gui_panel_shaderlist.updateThumb(result.value.id, result.value.thumb);
							} catch (updateError) {
								// コンソール出力を抑制
							}
						}
						// If a png needs deletion, add its ID to the list
						if (result.value.pngFileIdToDelete) {
							pngFilesToDelete.push(result.value.pngFileIdToDelete); // IDをリストに追加
						}
					} else if (result.status === 'rejected') {
						console.error("Thumbnail processing failed:", result.reason);
					}
				});

				// UIを更新する余裕を与える
				await new Promise(resolve => setTimeout(resolve, 100));

				// 優先IDリストを再取得（ユーザーがスクロールした場合に備えて）
				if (typeof gui_panel_shaderlist !== 'undefined' && gui_panel_shaderlist) {
					try {
						const visibleItems = gui_panel_shaderlist.loadVisibleThumbnailsFirst();
						this.priorityFolderIds = Array.isArray(visibleItems) ?
							visibleItems.map(item => item && item.id).filter(id => id) : [];
					} catch (visibleError) {
						// コンソール出力を抑制
					}
				}
			} catch (batchError) {
				// コンソール出力を抑制
				// エラーでも継続
				await new Promise(resolve => setTimeout(resolve, 500));
			}
		}

		// <<<--- ここから追加: ループ完了後にPNGファイルを削除 ---
		if (pngFilesToDelete.length > 0) {
			console.log(`Attempting to delete ${pngFilesToDelete.length} old thumb.png files...`);
			console.log('PNG file IDs to delete:', pngFilesToDelete);

			const deletionPromises = pngFilesToDelete.map(fileId =>
				gdrive.deleteFileOrFolder(fileId)
					.then(response => {
						console.log(`Successfully deleted thumb.png (ID: ${fileId})`);
						return { status: 'fulfilled', id: fileId };
					})
					.catch(err => {
						// 削除エラーは警告としてログに出力するが、処理は止めない
						console.warn(`Failed to delete old thumb.png (ID: ${fileId}):`, err);
						return { status: 'rejected', id: fileId, reason: err };
					})
			);

			const deletionResults = await Promise.all(deletionPromises); // Use all instead of allSettled to get structured results

			const successCount = deletionResults.filter(r => r.status === 'fulfilled').length;
			const failureCount = deletionResults.length - successCount;
			console.log(`Finished attempting to delete old thumb.png files. Success: ${successCount}, Failure: ${failureCount}`);

			if (failureCount > 0) {
				console.warn('Failures during PNG deletion:', deletionResults.filter(r => r.status === 'rejected'));
			}
		}
		// <<<--- ここまで追加 ---

		// 完了したらステータスを更新
		ShaderBoy.gui_header.setStatus('gsuc', `Loaded ${totalCount} shaders.`, 3000);
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async loadLocalSettings()
	{
		localforage.getItem('renderScale', (error, value) =>
		{
			if (error)
			{
				throw new Error(error)
			}

			if (!value)
			{
				value = 2
			}

			ShaderBoy.renderScale = value
		})

		localforage.getItem('textSize', (error, value) =>
		{
			if (error)
			{
				throw new Error(error)
			}

			if (!value)
			{
				value = 16
			}

			ShaderBoy.editor.setTextSize(value)
		})

		localforage.getItem('isSplited', (error, value) =>
		{
			if (error)
			{
				throw new Error(error)
			}

			if (!value)
			{
				value = false
			}

			if(value) ShaderBoy.commands.toggleSplitView()
		})

		return Promise.resolve()
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async getShaderFolder(shaderName)
	{
		const request = await gdrive.getFolderByName(shaderName)
		const res = request.result
		if (res.files[0] === undefined)
		{
			return null
		}
		return res.files[0].id
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async collectShaderFileIds(shaderName)
	{
		const request = await gdrive.getFileIdsInFolder(this.ID_DIR_SHADER)
		const res = request.result
		if (res.files.length === 0)
		{
			ShaderBoy.gui_header.setStatus('error', `"${shaderName}" folder is empty! Confirm on your GoogleDrive.`, 0)
			return Promise.reject()
		}

		for (const file of res.files)
		{
			this.idList[file.name] = {}
			this.idList[file.name].name = file.name
			this.idList[file.name].id = file.id
			this.idList[file.name].content = ''
		}
		return
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async versionCompatibilityFallback(configObj)
	{
		// Clean up setting.json
		if (ShaderBoy.setting.shaders.hasOwnProperty('thumbs'))
		{
			delete ShaderBoy.setting.shaders.thumbs
		}
		if (ShaderBoy.setting.shaders.hasOwnProperty('list'))
		{
			delete ShaderBoy.setting.shaders.list
		}
		if (ShaderBoy.setting.shaders.hasOwnProperty('datalist'))
		{
			delete ShaderBoy.setting.shaders.datalist
		}
		if (ShaderBoy.setting.shaders.hasOwnProperty('shaderlist'))
		{
			delete ShaderBoy.setting.shaders.shaderlist
		}

		if (ShaderBoy.setting.shaders.hasOwnProperty('shaderNames'))
		{
			delete ShaderBoy.setting.shaders.shaderNames
		}

		// Rename "MainImage" to "Image"
		if ('MainImage' in configObj.buffers)
		{
			Object.defineProperty(configObj.buffers, 'Image', Object.getOwnPropertyDescriptor(configObj.buffers, 'MainImage'))
			delete configObj.buffers['MainImage']
		}

		// Debug GUI feature
		if (this.idList['_guiknobs.json'] === undefined)
		{
			const request = await gdrive.createTextFile(this.ID_DIR_SHADER, '_guiknobs.json', ShaderLib.shader['gui_knobs'])
			const file = request.result
			this.idList['_guiknobs.json'] = {}
			this.idList['_guiknobs.json'].name = file.name
			this.idList['_guiknobs.json'].id = file.id
			this.idList['_guiknobs.json'].content = ''
		}

		// Timeline feature
		if (this.idList['_guitimeline.json'] === undefined)
		{
			const request = await gdrive.createTextFile(this.ID_DIR_SHADER, '_guitimeline.json', ShaderLib.shader['gui_timeline'])
			const file = request.result
			this.idList['_guitimeline.json'] = {}
			this.idList['_guitimeline.json'].name = file.name
			this.idList['_guitimeline.json'].id = file.id
			this.idList['_guitimeline.json'].content = ''
		}

		// Sound buffer feature
		if (configObj.buffers['Sound'] === undefined)
		{
			const defcon = JSON.parse(ShaderLib.shader['Config'])
			configObj.buffers['Sound'] = defcon.buffers['Sound']
		}

		if (this.idList['sound.fs'] === undefined)
		{
			const request = await gdrive.createTextFile(this.ID_DIR_SHADER, 'sound.fs', ShaderLib.shader['Sound'])
			const file = request.result
			this.idList['sound.fs'] = {}
			this.idList['sound.fs'].name = file.name
			this.idList['sound.fs'].id = file.id
			this.idList['sound.fs'].content = ''
		}

		return configObj
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// 例：setShaderConfig()メソッドの修正
    async setShaderConfig() {
        const id = this.idList['config.json'].id
        const request = await gdrive.getContentBody(id)

        // CodeMirror.Docの代わりにMonacoモデル経由で操作
        if (!ShaderBoy.editor.models['Config']) {
            ShaderBoy.editor.models['Config'] = monaco.editor.createModel(request.body, 'glsl')
        } else {
            ShaderBoy.editor.models['Config'].setValue(request.body)
        }

        // バージョン互換性チェックを一時的に無効化
        // const configObj = await this.versionCompatibilityFallback(JSON.parse(request.body))
        const configObj = JSON.parse(request.body);
        ShaderBoy.config = configObj
        return
    },

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async loadGUIdata()
	{
		let request, res, id, value

		// Knobs...
		id = this.idList['_guiknobs.json'].id
		request = await gdrive.getContentBody(id)
		const knobsObj = JSON.parse(request.body)
		ShaderBoy.gui.knobs.show = knobsObj.show
		for (let i = 0; i < ShaderBoy.gui.knobs.knobs.length; i++)
		{
			ShaderBoy.gui.knobs.knobs[i].value = knobsObj.knobs[i].value
			ShaderBoy.gui.knobs.knobs[i].active = knobsObj.knobs[i].active
			ShaderBoy.gui.knobs.toggle(i, false)
		}

		// Timeline...
		id = this.idList['_guitimeline.json'].id
		request = await gdrive.getContentBody(id)
		const timelineObj = JSON.parse(request.body)
		gui_timeline.guidata = timelineObj

		return
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// loadShaderCodes()メソッドの修正
	async loadShaderCodes() {
		// バッファ名と対応するファイル名の配列
		const buffers = [
			{name: 'Common', file: 'common.fs'},
			{name: 'BufferA', file: 'buf_a.fs'},
			{name: 'BufferB', file: 'buf_b.fs'},
			{name: 'BufferC', file: 'buf_c.fs'},
			{name: 'BufferD', file: 'buf_d.fs'},
			{name: 'Image', file: 'main.fs'},
			{name: 'Sound', file: 'sound.fs'}
		];

		// 必要なファイルIDをあらかじめ抽出
		const fileRequests = buffers.map(buffer => {
			const fileName = buffer.file;
			if (!this.idList[fileName]) {
				console.warn(`Missing file ${fileName} for buffer ${buffer.name}`);
				return null;
			}

			const id = this.idList[fileName].id;
			return gdrive.getContentBody(id).then(request => ({
				buffer: buffer.name,
				content: request.body
			}));
		}).filter(req => req !== null);

		// 並列処理で全ファイルを一度に取得
		const results = await Promise.all(fileRequests);

		// 結果を処理
		results.forEach(result => {
			if (!result) return;

			const bufName = result.buffer;
			ShaderBoy.buffers[bufName].active = ShaderBoy.config.buffers[bufName].active;

			// MonacoモデルにセットしてGUI更新
			if (!ShaderBoy.editor.models[bufName]) {
				ShaderBoy.editor.models[bufName] = monaco.editor.createModel(result.content, 'glsl');
			} else {
				ShaderBoy.editor.models[bufName].setValue(result.content);
			}
		});

		return Promise.resolve();
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async loadShaderFiles(shaderName = '_default', initLoading = false)
	{
		ShaderBoy.commands.stopTimeline()
		console.log(`シェーダ "${shaderName}" をロードします...`);

		// アクティブシェーダー名の保存をしない（保存時のみに変更）
		// this.setActiveShaderName(shaderName)
		// 現在のシェーダ名を一時的に保存（UIなどのために）
		ShaderBoy.currentShaderName = shaderName;

		// UIの現在のシェーダー名を更新
		const asnElement = document.getElementById('asn_name');
		if (asnElement) {
			asnElement.textContent = shaderName;
		}

		this.initLoading = initLoading

		try {
			// 進捗表示
			ShaderBoy.gui_header.setStatus('prgrs', `"${shaderName}" : Loading...`, 0)

			// シェーダーフォルダとファイル情報を一度に取得（最適化）
			const result = await this.getFileIdsInFolderOptimized(shaderName);

			if (!result || !result.folderId) {
				console.warn(`シェーダフォルダ "${shaderName}" が見つかりません。デフォルトシェーダを使用します。`);
				this.setupDevShader(true);
				return;
			}

			this.ID_DIR_SHADER = result.folderId;

			// ファイルIDを処理
			if (!result.files || !Array.isArray(result.files) || result.files.length === 0 || !this.processFileIds(result.files)) {
				// ファイルが見つからない場合はデフォルトシェーダを使用
				console.warn(`シェーダフォルダ "${shaderName}" 内にファイルが見つかりません。デフォルトシェーダを使用します。`);
				this.setupDevShader(true);
				return;
			}

			try {
				// 設定とGUIデータを並列で読み込み
				await Promise.all([
					this.setShaderConfig(),
					this.loadGUIdata()
				]);

				// シェーダーコード読み込み（並列処理済み）
				await this.loadShaderCodes();

				// シェーダが正しく読み込まれたか確認
				console.log('シェーダファイルの読み込みが完了しました。シェーダをビルドします...');
				ShaderBoy.bufferManager.buildShaderFromBuffers(false)
				ShaderBoy.gui_header.resetBtns(ShaderBoy.config.buffers)

				ShaderBoy.bufferManager.setFBOsProps()
				ShaderBoy.editor.setBuffer('Image', true)

				// シェーダをコンパイル
				console.log('シェーダのコンパイルを開始します...');
				ShaderBoy.bufferManager.compileShaders()

				ShaderBoy.gui_header.setStatus('gsuc', 'Loaded.', 3000)
				if (this.initLoading === true)
				{
					ShaderBoy.gui.hideLoading()
					this.initLoading = false
					ShaderBoy.update()
				}
				ShaderBoy.commands.playTimeline()

				if (this.isNewShader === true)
				{
					this.saveThumbFile('thumb.png', ShaderBoy.canvas, this.ID_DIR_SHADER)
					this.isNewShader = false
				}
			} catch (innerError) {
				console.error(`シェーダーファイルの読み込み中のエラー: ${innerError.message}`, innerError);
				this.setupDevShader(true);
			}
		}
		catch (error)
		{
			console.error(`シェーダ "${shaderName}" のロード中にエラーが発生しました:`, error);
			ShaderBoy.gui_header.setStatus('error', `"${shaderName}" のロードに失敗しました`, 3000);
			// エラー時はデフォルトシェーダを使用
			if (shaderName !== '_default') {
				console.log('デフォルトシェーダを使用します');
				this.setupDevShader(true);
			} else {
				throw error;
			}
		}
	},

	prioritizeThumbnails(visibleFolderIds) {
		// すでに処理中のサムネイル読み込みを中断するわけではなく、
		// 次のバッチで優先的に読み込む対象を設定する
		this.priorityFolderIds = visibleFolderIds.map(item => item.id);
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async createActiveShaderFile() {
		const activeShaderData = {
			active: ShaderBoy.activeShaderName,
			lastModified: new Date().toISOString()
		};

		const request = await gdrive.createTextFile(
			this.ID_DIR_APP,
			'active_shader.json',
			JSON.stringify(activeShaderData, null, "\t")
		);
		const res = request.result;
		this.idList['active_shader.json'] = {
			name: res.name,
			id: res.id,
			content: ''
		};
		return Promise.resolve();
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async saveActiveShaderFile() {
		const activeShaderData = {
			active: ShaderBoy.activeShaderName,
			lastModified: new Date().toISOString()
		};

		return gdrive.saveTextFile(
			'active_shader.json',
			this.idList['active_shader.json'].id,
			JSON.stringify(activeShaderData, null, "\t")
		);
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async loadActiveShaderFile() {
		ShaderBoy.gui_header.setStatus('prgrs', 'Loading active shader...', 0);

		try {
			// ShaderBoyフォルダを安全に取得
			let request = await gdrive.getFolderByName('ShaderBoy');

			// responseのチェック
			if (!request ||
				!request.result ||
				!request.result.files ||
				!Array.isArray(request.result.files) ||
				request.result.files.length === 0) {

				console.log('ShaderBoyフォルダが見つからないか、レスポンスが不正です。新規作成します。');

				// ShaderBoyフォルダがない場合は作成
				try {
					request = await gdrive.createFolder('ShaderBoy', 'root');

					if (!request || !request.result) {
						console.error('フォルダ作成に失敗しました。デフォルトシェーダーを使用します。');
						return '_default';
					}

					this.ID_DIR_APP = request.result.id;
					await this.createActiveShaderFile();
					await this.createSetting();
					return '_default'; // デフォルトシェーダー名を返す
				} catch (err) {
					console.error('フォルダ作成エラー:', err);
					return '_default';
				}
			}

			// ShaderBoyフォルダが見つかった
			this.ID_DIR_APP = request.result.files[0].id;

			try {
				// active_shader.jsonを探す
				request = await gdrive.getFileInfoByName('active_shader.json', this.ID_DIR_APP);

				// 安全性チェック
				if (!request ||
					!request.result ||
					!request.result.files ||
					!Array.isArray(request.result.files) ||
					request.result.files.length === 0) {

					// ファイルがない場合は作成
					await this.createActiveShaderFile();

					// setting.jsonが既に存在する可能性があるので確認
					try {
						request = await gdrive.getFileInfoByName('setting.json', this.ID_DIR_APP);

						if (request &&
							request.result &&
							request.result.files &&
							Array.isArray(request.result.files) &&
							request.result.files.length > 0) {

							// setting.jsonから読み込む
							const file = request.result.files[0];
							this.idList['setting.json'] = {
								name: file.name,
								id: file.id,
								content: ''
							};

							try {
								const settingRequest = await gdrive.getContentBody(file.id);
								if (settingRequest && settingRequest.body) {
									const settingObj = JSON.parse(settingRequest.body);
									return settingObj.shaders && settingObj.shaders.active ?
										settingObj.shaders.active : '_default';
								}
							} catch (err) {
								console.error('setting.jsonの読み込みエラー:', err);
							}
						}
					} catch (err) {
						console.error('setting.json検索エラー:', err);
					}

					return '_default';
				}

				// active_shader.jsonを読み込む
				const file = request.result.files[0];
				this.idList['active_shader.json'] = {
					name: file.name,
					id: file.id,
					content: ''
				};

				try {
					const activeRequest = await gdrive.getContentBody(file.id);
					if (activeRequest && activeRequest.body) {
						try {
							const activeData = JSON.parse(activeRequest.body);
							return activeData.active || '_default';
						} catch (parseError) {
							console.error('active_shader.jsonのパース失敗:', parseError);
							return '_default';
						}
					} else {
						console.warn('active_shader.jsonの内容が取得できません');
						return '_default';
					}
				} catch (e) {
					console.error('Failed to parse active_shader.json:', e);
					return '_default';
				}
			} catch (err) {
				console.error('active_shader.json検索エラー:', err);
				return '_default';
			}
		} catch (err) {
			console.error('loadActiveShaderFile総合エラー:', err);
			return '_default';
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async getFileIdsInFolderOptimized(shaderName) {
		try {
			// 一つのAPIコールでシェーダー名からフォルダIDを取得し、その内容を取得
			const folderRequest = await gdrive.getFolderByName(shaderName);

			// フォルダが見つからない場合のエラーハンドリング
			if (!folderRequest ||
				!folderRequest.result ||
				!folderRequest.result.files ||
				!Array.isArray(folderRequest.result.files) ||
				folderRequest.result.files.length === 0) {

				console.warn(`シェーダーフォルダ "${shaderName}" が見つかりません`);
				return { folderId: null, files: [] };
			}

			const folderId = folderRequest.result.files[0].id;

			try {
				// フォルダ内のファイル一覧を取得
				const filesRequest = await gdrive.getFileIdsInFolder(folderId);

				// レスポンスの安全性チェック
				if (!filesRequest ||
					!filesRequest.result ||
					!filesRequest.result.files ||
					!Array.isArray(filesRequest.result.files)) {

					console.warn(`フォルダ "${shaderName}" (${folderId}) の内容取得に失敗しました`);
					return { folderId, files: [] };
				}

				return { folderId, files: filesRequest.result.files };
			} catch (fileError) {
				console.error(`フォルダ内容取得エラー (${shaderName}):`, fileError);
				return { folderId, files: [] };
			}
		} catch (error) {
			console.error(`getFileIdsInFolderOptimizedエラー (${shaderName}):`, error);
			return { folderId: null, files: [] };
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	processFileIds(files) {
		if (files.length === 0) {
			ShaderBoy.gui_header.setStatus('error', `"${ShaderBoy.activeShaderName}" folder is empty! Confirm on your GoogleDrive.`, 0)
			return false;
		}

		for (const file of files)
		{
			this.idList[file.name] = {
				name: file.name,
				id: file.id,
				content: ''
			};
		}
		return true;
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async deleteShader(shaderNameToDelete) {
		ShaderBoy.gui_header.setStatus('prgrs', `Deleting shader: ${shaderNameToDelete}...`, 0);

		// デフォルトシェーダーは削除不可
		if (shaderNameToDelete === '_default') {
			ShaderBoy.gui_header.setStatus('error', 'Default shader cannot be deleted.', 3000);
			return;
		}

		try {
			// 削除対象のフォルダIDを取得
			const folderIdToDelete = await this.getShaderFolder(shaderNameToDelete);
			if (!folderIdToDelete) {
				ShaderBoy.gui_header.setStatus('error', `Shader folder not found: ${shaderNameToDelete}`, 3000);
				return;
			}

			let nextShaderNameToLoad = ShaderBoy.activeShaderName;
			let needsActiveShaderUpdate = false;

			// 削除対象が現在のアクティブシェーダーか確認
			if (shaderNameToDelete === ShaderBoy.activeShaderName) {
				needsActiveShaderUpdate = true;
				console.log('削除対象はアクティブシェーダーです。');

				// 他のシェーダーリストを取得
				const availableShaders = ShaderBoy.setting.shaders.folderIds
					.filter(folder => folder && folder.name !== shaderNameToDelete && folder.name !== '_default')
					.sort((a, b) => new Date(b.modifiedTime || 0) - new Date(a.modifiedTime || 0));

				if (availableShaders.length > 0) {
					// 最新のシェーダーを選択
					nextShaderNameToLoad = availableShaders[0].name;
					console.log('次に開くシェーダー (最新): ', nextShaderNameToLoad);
				} else {
					// 他にシェーダーがなければデフォルトを開く
					nextShaderNameToLoad = '_default';
					console.log('次に開くシェーダー (デフォルト): ', nextShaderNameToLoad);
				}
			}

			// 1. setting.jsonからシェーダー情報を削除
			if (ShaderBoy.setting && ShaderBoy.setting.shaders) {
				ShaderBoy.setting.shaders.names = ShaderBoy.setting.shaders.names.filter(name => name !== shaderNameToDelete);
				ShaderBoy.setting.shaders.folderIds = ShaderBoy.setting.shaders.folderIds.filter(folder => folder.id !== folderIdToDelete);

				// アクティブシェーダーを変更する必要がある場合、setting.jsonも更新
				if (needsActiveShaderUpdate) {
					ShaderBoy.setting.shaders.active = nextShaderNameToLoad;
				}
			}

			// 2. Google Driveからフォルダを削除
			console.log('Google Driveからフォルダを削除します...', folderIdToDelete);
			await gdrive.deleteFileOrFolder(folderIdToDelete);

			// 3. アクティブシェーダーファイルとsetting.jsonを更新（削除後に行う）
			if (needsActiveShaderUpdate) {
				this.setActiveShaderName(nextShaderNameToLoad);
				await this.saveActiveShaderFile();
			}
			await gdrive.saveTextFile('setting.json', this.idList['setting.json'].id, JSON.stringify(ShaderBoy.setting, null, "\t"));

			// 4. 次のシェーダーを読み込む
			console.log(`次にシェーダーを読み込みます: ${nextShaderNameToLoad}`);
			await this.loadShaderFiles(nextShaderNameToLoad);

			// シェーダリストUIを更新
			this.getThumbFiles(); // サムネイルリスト再読み込み

			ShaderBoy.gui_header.setStatus('gsuc', `Shader "${shaderNameToDelete}" deleted.`, 3000);

		} catch (error) {
			console.error('シェーダー削除エラー:', error);
			ShaderBoy.gui_header.setStatus('error', 'Failed to delete shader.', 3000);
			// エラーが発生した場合でも、可能な限り復旧を試みる
			try {
				// 設定を再読み込み
				await this.loadSetting();
				await this.loadShaderFiles(ShaderBoy.activeShaderName);
			} catch (recoveryError) {
				console.error('削除エラー後の復旧に失敗:', recoveryError);
			}
		}
	},
}