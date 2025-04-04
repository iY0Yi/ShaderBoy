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
		ShaderBoy.gui_header.setStatus('prgrs', 'Loading from Google Drive...', 0)
		const isLoaded = await this.loadSetting()
		if (isLoaded)
		{
			await this.loadShaderFiles(ShaderBoy.activeShaderName, true)
			await this.getThumbFiles()
		}
		else
		{
			this.isAppInit = true
			this.setActiveShaderName('_default')
			await this.newShader(ShaderBoy.activeShaderName)
			ShaderBoy.bufferManager.initBufferDoc(['Setting'])
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setActiveShaderName(name)
	{
		ShaderBoy.activeShaderName = name
		ShaderBoy.setting.shaders.active = name
		document.getElementById('asn_name').textContent = name
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupDevShader(withError = false)
	{
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
				}, 3000)
			}
		}, 3000)

	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async loadSetting()
	{
		let request, res

		this.loadLocalSettings()

		request = await gdrive.getFolderByName('ShaderBoy')
		res = request.result
		if (res.files.length === 0)
		{
			// No folder is named as ShaderBoy. So make it.
			request = await gdrive.createFolder('ShaderBoy', 'root')
			res = request.result
			this.ID_DIR_APP = res.id
			this.createSetting()
			return Promise.resolve(false)
		}

		// A folder found named as ShaderBoy. So lets load shaders.
		this.ID_DIR_APP = res.files[0].id
		request = await gdrive.getFileInfoByName('setting.json', this.ID_DIR_APP)
		res = request.result
		if (res.files.length === 0)
		{
			this.createSetting()
			return Promise.resolve(false)
		}

		const file = res.files[0]
		this.idList['setting.json'] = {}
		this.idList['setting.json'].name = file.name
		this.idList['setting.json'].id = file.id
		this.idList['setting.json'].content = ''
		request = await gdrive.getContentBody(file.id)

		const settingObj = JSON.parse(request.body)
		ShaderBoy.setting = settingObj

		this.setActiveShaderName(settingObj.shaders.active)

		request = await gdrive.getFolders(this.ID_DIR_APP)
		res = request.result
		ShaderBoy.setting.shaders.names = []
		ShaderBoy.setting.shaders.folderIds = []
		for (const folder of res.files)
		{
			ShaderBoy.setting.shaders.names.push(folder.name)
			ShaderBoy.setting.shaders.folderIds.push({ name: folder.name, id: folder.id, modifiedTime: folder.modifiedTime })
		}

		return Promise.resolve(true)
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
				await this.loadShaderFiles(ShaderBoy.activeShaderName, true)
				await this.getThumbFiles()
			}
			else
			{
				this.loadShaderFiles(ShaderBoy.activeShaderName)
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
		this.setActiveShaderName(safeShaderName)
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

		localforage.setItem('renderScale', ShaderBoy.renderScale, (error) => { if (error) { throw new Error(error) } })
		localforage.setItem('textSize', ShaderBoy.editor.textSize, (error) => { if (error) { throw new Error(error) } })
		localforage.setItem('isSplited', ShaderBoy.isSplited, (error) => { if (error) { throw new Error(error) } })

		const promises = []
		const saveBufferShader = (buffer, fileName) =>
		{
			if (buffer.active) promises.push(gdrive.saveTextFile(fileName, this.idList[fileName].id, buffer.getValue()))
		}

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
		const content = thumbCanvas.toDataURL("image/png").replace("data:image/png;base64,", "")

		let response = await gdrive.getFileInfoByName(name, folderId, null)
		const res = response.result
		if (res.files.length === 0)
		{
			gdrive.createFile(folderId, name, content, 'image/png', null).then(() =>
			{
				return Promise.resolve()
			}).catch((error) =>
			{
				return Promise.reject()
			})
		}
		else
		{
			gdrive.saveFile(name, res.files[0].id, content, 'image/png', null).then(() =>
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
		let folderIds = ShaderBoy.setting.shaders.folderIds.concat()
		folderIds.sort((a, b) =>
		{
			const timeA = new Date(a.modifiedTime)
			const timeB = new Date(b.modifiedTime)
			return timeB - timeA
		})

		// まずシェーダリストだけを先に表示（サムネイルなし）
		folderIds.forEach(shaderId => {
			gui_panel_shaderlist.addThumbBtn({
				name: shaderId.name,
				thumb: null,
				modifiedTime: shaderId.modifiedTime,
				folderId: shaderId.id
			})
		})

		// リストをソート
		gui_panel_shaderlist.sort()

		// スクロールリスナーを設定
		gui_panel_shaderlist.setupScrollListener()

		// 初期の可視フォルダIDを取得
		this.priorityFolderIds = gui_panel_shaderlist.loadVisibleThumbnailsFirst().map(item => item.id)

		// 進捗表示
		const totalCount = folderIds.length
		// if (totalCount > 0) {
		// 	ShaderBoy.gui_header.setStatus('prgrs', `Loading thumbnails (0/${totalCount})...`, 0)
		// }

		// 処理済みフォルダIDを追跡
		const processedIds = new Set()
		const BATCH_SIZE = 8

		// サムネイル読み込み処理のメインループ
		while (processedIds.size < totalCount) {
			// 優先フォルダIDから未処理のものを抽出
			const priorityBatch = this.priorityFolderIds
				.filter(id => !processedIds.has(id))
				.slice(0, BATCH_SIZE)

			// 残りのフォルダIDからバッチサイズまで埋める
			let currentBatch = priorityBatch.slice()

			if (currentBatch.length < BATCH_SIZE) {
				const remainingIds = folderIds
					.filter(item => !processedIds.has(item.id) && !priorityBatch.includes(item.id))
					.slice(0, BATCH_SIZE - currentBatch.length)
					.map(item => item.id)

				currentBatch = currentBatch.concat(remainingIds)
			}

			// バッチが空なら終了
			if (currentBatch.length === 0) break

			// 並列でサムネイルを取得
			const promises = currentBatch.map(async (id) => {
				const folderItem = folderIds.find(item => item.id === id)
				if (!folderItem) return { id, thumb: null }

				try {
					const request = await gdrive.getFileInfoByName('thumb.png', id)
					const file = request.result.files[0]
					if (!file) return { id, thumb: null }

					const res = await gdrive.getContentBody(file.id)
					const imageType = res.headers['content-type']
					const base64 = window.btoa(res.body)
					const dataURI = 'data:' + imageType + ';base64,' + base64

					return {
						id,
						thumb: `url("${dataURI}")`
					}
				} catch (error) {
					console.warn(`Failed to load thumbnail for ${folderItem.name}:`, error)
					return { id, thumb: null }
				}
			})

			// バッチの結果を処理
			const results = await Promise.all(promises)
			results.forEach(result => {
				processedIds.add(result.id)
				if (result.thumb) {
					gui_panel_shaderlist.updateThumb(result.id, result.thumb)
				}
			})

			// 進捗を更新
			// ShaderBoy.gui_header.setStatus('prgrs', `Loading thumbnails (${processedIds.size}/${totalCount})...`, 0)

			// UIを更新する余裕を与える
			await new Promise(resolve => setTimeout(resolve, 0))

			// 優先IDリストを再取得（ユーザーがスクロールした場合に備えて）
			this.priorityFolderIds = gui_panel_shaderlist.loadVisibleThumbnailsFirst().map(item => item.id)
		}

		// 完了したらステータスを更新
		ShaderBoy.gui_header.setStatus('gsuc', `Loaded ${totalCount} shaders.`, 3000)
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

        const configObj = await this.versionCompatibilityFallback(JSON.parse(request.body))
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
		const load = async (bufName) => {
			ShaderBoy.buffers[bufName].active = ShaderBoy.config.buffers[bufName].active
			const fileName = ShaderBoy.buffers[bufName].fileName
			const id = this.idList[fileName].id
			const request = await gdrive.getContentBody(id)

			// CodeMirror.Docの代わりにMonacoモデルを使用
			if (!ShaderBoy.editor.models[bufName]) {
				ShaderBoy.editor.models[bufName] = monaco.editor.createModel(request.body, 'glsl')
			} else {
				ShaderBoy.editor.models[bufName].setValue(request.body)
			}

			return Promise.resolve()
		}

		return Promise.all([
			load('Common'),
			load('BufferA'),
			load('BufferB'),
			load('BufferC'),
			load('BufferD'),
			load('Image'),
			load('Sound')
		])
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async loadShaderFiles(shaderName = '_default', initLoading = false)
	{
		ShaderBoy.commands.stopTimeline()

		this.setActiveShaderName(shaderName)
		this.initLoading = initLoading

		this.ID_DIR_SHADER = await this.getShaderFolder(shaderName);
		if (this.ID_DIR_SHADER === null)
		{
			this.setupDevShader(true)
			return
		}

		ShaderBoy.gui_header.setStatus('prgrs', `"${shaderName}" : Loading...`, 0)
		await this.collectShaderFileIds(shaderName)
		await this.setShaderConfig()

		this.loadGUIdata()

		try
		{
			await this.loadShaderCodes()

			ShaderBoy.bufferManager.buildShaderFromBuffers(false)
			ShaderBoy.gui_header.resetBtns(ShaderBoy.config.buffers)

			ShaderBoy.bufferManager.setFBOsProps()
			ShaderBoy.editor.setBuffer('Image', true)
			ShaderBoy.bufferManager.compileShaders()

			ShaderBoy.gui_header.setStatus('gsuc', 'Loaded.', 3000)
			setTimeout(() =>
			{
				if (this.initLoading === true)
				{
					ShaderBoy.gui.hideLoading()
					this.initLoading = false
					ShaderBoy.update()
				}
				ShaderBoy.commands.playTimeline()
			}, 3000)

			if (this.isNewShader === true)
			{
				this.saveThumbFile('thumb.png', ShaderBoy.canvas, this.ID_DIR_SHADER)
				this.isNewShader = false
			}
		}
		catch (error)
		{
			throw new Error(error)
		}
	},

	prioritizeThumbnails(visibleFolderIds) {
		// すでに処理中のサムネイル読み込みを中断するわけではなく、
		// 次のバッチで優先的に読み込む対象を設定する
		this.priorityFolderIds = visibleFolderIds.map(item => item.id);
	},
}