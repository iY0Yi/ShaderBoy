//
//   _  _____ 
//  (_)(  _  )
//  | || ( ) |
//  | || | | |
//  | || (_) |
//  (_)(_____)
//            
//            

import ShaderBoy from './shaderboy'
import ShaderLib from './shaderlib'
import gdrive from './gdrive'
import CodeMirror from 'codemirror/lib/codemirror'
import localforage from 'localforage'
import gui_timeline from './gui/gui_timeline'
import gui_panel_shaderlist from './gui/gui_panel_shaderlist'

export default ShaderBoy.io = {

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async init()
	{
		localforage.config({
			driver: localforage.INDEXEDDB,
			name: 'ShaderBoy',
			version: 1.0,
			storeName: 'shaderdata'
		})

		ShaderBoy.renderScale = 2
		// ShaderBoy.editor.textSize = 16

		this.useGoogleDrive = true
		this.loadedNum = 0
		this.needLoadingNum = 0
		this.initLoading = true
		this.isNewShader = false
		this.isAppInit = false
		this.idList = {}

		this.ID_DIR_APP = ''
		this.ID_DIR_SHADER = ''

		const authDiv = document.getElementById('div_authrise')
		const authLaterButton = document.getElementById('btn_authrise_later')
		authLaterButton.onclick = () =>
		{
			authDiv.classList.add('hide')
			setTimeout(() =>
			{
				document.getElementById('div_authrise').classList.add('hidden')
			}, 400)
			ShaderBoy.runInDevMode = true
			this.init()
		}

		if (ShaderBoy.runInDevMode)
		{
			console.log('devlopment mode...')
			this.setupDevShader()
		}
		else
		{
			console.log('production mode...')
			let authDiv = document.getElementById('div_authrise')
			authDiv.classList.add('hide')
			const response = await gdrive.init()
			await this.getShadersSetting()
			await this.getShaderFiles(ShaderBoy.activeShaderName, true)
			this.getThumbFileIds()
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupDevShader()
	{
		ShaderBoy.config = JSON.parse(ShaderBoy.buffers['Config'].cm.getValue())
		ShaderBoy.buffers['Setting'].cm = CodeMirror.Doc(ShaderLib.shader['Setting'], 'x-shader/x-fragment')
		ShaderBoy.buffers['Config'].cm = CodeMirror.Doc(ShaderLib.shader['Config'], 'x-shader/x-fragment')
		ShaderBoy.buffers['Common'].cm = CodeMirror.Doc(ShaderLib.shader['Common'], 'x-shader/x-fragment')
		ShaderBoy.buffers['BufferA'].cm = CodeMirror.Doc(ShaderLib.shader['BufferA'], 'x-shader/x-fragment')
		ShaderBoy.buffers['BufferB'].cm = CodeMirror.Doc(ShaderLib.shader['BufferB'], 'x-shader/x-fragment')
		ShaderBoy.buffers['BufferC'].cm = CodeMirror.Doc(ShaderLib.shader['BufferC'], 'x-shader/x-fragment')
		ShaderBoy.buffers['BufferD'].cm = CodeMirror.Doc(ShaderLib.shader['BufferD'], 'x-shader/x-fragment')
		ShaderBoy.buffers['Image'].cm = CodeMirror.Doc(ShaderLib.shader['Image'], 'x-shader/x-fragment')
		ShaderBoy.buffers['Sound'].cm = CodeMirror.Doc(ShaderLib.shader['Sound'], 'x-shader/x-fragment')

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

		ShaderBoy.isPlaying = true
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async getShadersSetting()
	{
		document.getElementById('div_authrise').classList.add('hide')
		setTimeout(() =>
		{
			document.getElementById('div_authrise').classList.add('hidden')
		}, 400)

		let request, res

		request = await gdrive.getFolderByName('ShaderBoy')
		console.log('getShadersSetting', request)
		res = request.result
		if (res.files.length === 0)
		{
			// No folder is named as ShaderBoy. So make it.
			request = await gdrive.createFolder('ShaderBoy', 'root')
			res = request.result
			this.ID_DIR_APP = res.id
			this.createSetting()
			return
		}

		// A folder found named as ShaderBoy. So lets load shaders.
		this.ID_DIR_APP = res.files[0].id
		request = await gdrive.getFileInfoByName('setting.json', this.ID_DIR_APP)
		res = request.result
		if (res.files.length === 0)
		{
			this.createSetting()
			return
		}

		const file = res.files[0]
		this.idList['setting.json'] = {}
		this.idList['setting.json'].name = file.name
		this.idList['setting.json'].id = file.id
		this.idList['setting.json'].content = ''
		request = await gdrive.getContentBody(file.id)
		//active shader name. to be loaded.
		const settingObj = JSON.parse(request.body)
		ShaderBoy.setting = settingObj
		ShaderBoy.activeShaderName = settingObj.shaders.active

		request = await gdrive.getFolders(this.ID_DIR_APP)
		res = request.result
		ShaderBoy.setting.shaders.list = []
		ShaderBoy.setting.shaders.datalist = []
		for (const folder of res.files)
		{
			ShaderBoy.setting.shaders.list.push(folder.name)
			ShaderBoy.setting.shaders.datalist.push({ name: folder.name, id: folder.id })
		}

		const settingText = JSON.stringify(ShaderBoy.setting, null, "\t")
		ShaderBoy.buffers['Setting'].cm = CodeMirror.Doc(settingText, 'x-shader/x-fragment')
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async createSetting()
	{
		ShaderBoy.setting = JSON.parse(ShaderLib.shader['Setting'])
		ShaderBoy.setting.shaders.list = []
		ShaderBoy.setting.shaders.datalist = []
		ShaderBoy.setting.shaders.list[0] = 'file.name'
		ShaderBoy.setting.shaders.datalist[0] = { name: '_default', id: null }
		const request = await gdrive.createTextFile(this.ID_DIR_APP, 'setting.json', ShaderLib.shader['Setting'])
		const res = request.resultult
		this.idList['setting.json'] = {}
		this.idList['setting.json'].name = res.name
		this.idList['setting.json'].id = res.id
		this.idList['setting.json'].content = ''

		ShaderBoy.activeShaderName = '_default'
		this.isAppInit = true
		await this.newShader(ShaderBoy.activeShaderName)
		ShaderBoy.bufferManager.initBufferDoc(['Setting'])
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async createDefaultShaderFiles(id)
	{
		let request, res
		console.log('createDefaultShaderFiles')
		ShaderBoy.config = JSON.parse(ShaderBoy.buffers['Config'].cm.getValue())
		Promise.all(
			[
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
		).then(async () =>
		{
			ShaderBoy.gui_header.setStatus('suc1', 'New.', 3000)
			if (this.isAppInit === true)
			{
				this.isAppInit = false
				await this.getShadersSetting()
				await this.getShaderFiles(ShaderBoy.activeShaderName, true)
				this.getThumbFileIds()
			}
			else
			{
				const name = ShaderBoy.setting.shaders.active
				this.getShaderFiles(name, name === '_default')
			}
		}).catch((error) =>
		{
			console.log(error)
		})
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async newShader(shaderName)
	{
		let request, res
		request = await gdrive.getFolderByName(shaderName)
		res = request.result
		if (res.files.length !== 0)
		{
			return Promise.reject(() => { console.log('It exist. Use a different name.') })
		}

		request = await gdrive.createShaderFolder(shaderName, this.ID_DIR_APP)
		res = request.result
		this.ID_DIR_SHADER = res.id
		ShaderBoy.setting.shaders.active = shaderName
		this.isNewShader = true
		this.createDefaultShaderFiles(res.id)
		ShaderBoy.setting.shaders.list.push(ShaderBoy.setting.shaders.active)
		ShaderBoy.setting.shaders.list = Array.from(new Set(ShaderBoy.setting.shaders.list))
		return Promise.resolve()
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	saveShader()
	{
		ShaderBoy.gui_header.setStatus('prgrs', 'Saving...', 0)

		localforage.setItem('renderScale', ShaderBoy.renderScale, (err) => { if (err) { console.log('db error...') } })
		localforage.setItem('textSize', ShaderBoy.textSize, (err) => { if (err) { console.log('db error...') } })

		const promises = []
		const saveBufferShader = (buffer, fileName) =>
		{
			if (buffer.active) promises.push(gdrive.saveTextFile(fileName, this.idList[fileName].id, buffer.cm.getValue()))
		}

		promises.push(gdrive.saveThumbFile('thumb.png', ShaderBoy.canvas, this.ID_DIR_SHADER))
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
			ShaderBoy.gui_header.setStatus('suc1', 'Saved.', 3000)
		}).catch((error) =>
		{
			console.log(error)
		})
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async getThumbFileIds()
	{
		// console.log('getThumbFileIds')
		let shaderlist = []
		for (const shaderData of ShaderBoy.setting.shaders.datalist)
		{
			const request = await gdrive.getFileInfoByName('thumb.png', shaderData.id)
			const res = request.result
			if (res.files === undefined || res.files.length === 0)
			{
				continue
			}

			for (const file of res.files) 
			{
				if (file.name === 'thumb.png')
				{
					shaderlist.push({ name: shaderData.name, thumb: 'https://drive.google.com/uc?id=' + file.id })
				}
			}
		}
		// return shaderlist
		// console.log('getThumbFileIds:done2:', shaderlist)
		gui_panel_shaderlist.setup(shaderlist)

		// let promises = []
		// for (const shaderData of ShaderBoy.setting.shaders.datalist)
		// {
		// 	promises.push(gdrive.getFileInfoByName('thumb.png', shaderData.id))
		// }
		// console.log(promises)
		// Promise.all(promises).then(
		// 	(allRequests) =>
		// 	{
		// 		console.log(allRequests)
		// 		for (const request of allRequests)
		// 		{
		// 			console.log(request)
		// 			const res = request.result
		// 			for (const file of res.files) 
		// 			{
		// 				if (file.name === 'thumb.png')
		// 				{
		// 					shaderlist.push({ name: shaderData.name, thumb: 'https://drive.google.com/uc?id=' + file.id })
		// 				}
		// 			}
		// 		}
		// 		return
		// 	}
		// ).then(
		// 	() =>
		// 	{
		// 		console.log('getThumbFileIds:done3:', shaderlist)
		// 		gui_panel_shaderlist.setup(shaderlist)
		// 	}
		// ).catch(
		// 	(allErrors) =>
		// 	{
		// 		console.log(allErrors)
		// 		for (const error of allErrors)
		// 		{
		// 			console.log(error)
		// 		}
		// 	}
		// )
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async versionCompatibilityFallback(configObj)
	{
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
			const file = request.result.file
			this.idList['_guiknobs.json'] = {}
			this.idList['_guiknobs.json'].name = file.name
			this.idList['_guiknobs.json'].id = file.id
			this.idList['_guiknobs.json'].content = ''
		}

		// Timeline feature
		if (this.idList['_guitimeline.json'] === undefined)
		{
			const request = await gdrive.createTextFile(this.ID_DIR_SHADER, '_guitimeline.json', ShaderLib.shader['gui_timeline'])
			const file = request.result.file
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
			const file = request.result.file
			this.idList['sound.fs'] = {}
			this.idList['sound.fs'].name = file.name
			this.idList['sound.fs'].id = file.id
			this.idList['sound.fs'].content = ''
		}

		return configObj
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	async getShaderFiles(shaderName = '_default', initLoading = false)
	{
		if (ShaderBoy.buffers['Sound'].active === true)
		{
			ShaderBoy.soundRenderer.stop()
		}

		localforage.getItem('renderScale', (err, value) =>
		{
			if (!value)
			{
				value = 2
			}
			ShaderBoy.renderScale = value
		})

		localforage.getItem('textSize', (err, value) =>
		{
			if (!value)
			{
				// value = 16
			}
			// ShaderBoy.editor.textSize = value
		})

		this.initLoading = initLoading

		ShaderBoy.gui_header.setStatus('prgrs', 'Loading from Google Drive...', 0)

		let request, res, id, value

		// get shader folder
		request = await gdrive.getFolderByName(shaderName)
		res = request.result
		if (res.files[0] === undefined)
		{
			ShaderBoy.gui_header.setStatus('error', shaderName + ' was not found.', 3000)
			await this.newShader(shaderName)
			return Promise.resolve()
		}
		this.ID_DIR_SHADER = res.files[0].id
		ShaderBoy.gui_header.setStatus('prgrs', '"' + shaderName + '" was found. Loading shader files...', 0)

		// get file ids
		request = await gdrive.getFilesInFolder(this.ID_DIR_SHADER)
		res = request.result
		if (res.files.length === 0)
		{
			ShaderBoy.gui_header.setStatus('error', shaderName + ' folder is empty. Confirm on your GoogleDrive.', 0)
			return Promise.reject()
		}

		for (const file of res.files)
		{
			this.idList[file.name] = {}
			this.idList[file.name].name = file.name
			this.idList[file.name].id = file.id
			this.idList[file.name].content = ''
		}

		id = this.idList['config.json'].id
		request = await gdrive.getContentBody(id)
		ShaderBoy.buffers['Config'].cm = CodeMirror.Doc(request.body, 'x-shader/x-fragment')
		let configObj = JSON.parse(request.body)
		configObj = await this.versionCompatibilityFallback(configObj)
		console.log('configObj: ', configObj)
		ShaderBoy.config = configObj

		// Load GUI jsons...
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

		id = this.idList['_guitimeline.json'].id
		request = await gdrive.getContentBody(id)
		const timelineObj = JSON.parse(request.body)
		gui_timeline.guidata = timelineObj

		const setupBufferByConfig = async (bufName, config) =>
		{
			ShaderBoy.buffers[bufName].active = config.buffers[bufName].active
			console.log(bufName, config.buffers[bufName].active);
			if (ShaderBoy.buffers[bufName].active === true)
			{
				const fileName = ShaderBoy.buffers[bufName].fileName
				const id = this.idList[fileName].id
				const request = await gdrive.getContentBody(id)
				ShaderBoy.buffers[bufName].cm = CodeMirror.Doc(request.body, 'x-shader/x-fragment')
			}
			return Promise.resolve()
		}

		Promise.all([
			setupBufferByConfig('Common', configObj),
			setupBufferByConfig('BufferA', configObj),
			setupBufferByConfig('BufferB', configObj),
			setupBufferByConfig('BufferC', configObj),
			setupBufferByConfig('BufferD', configObj),
			setupBufferByConfig('Image', configObj),
			setupBufferByConfig('Sound', configObj),
		]).then(() =>
		{
			console.log('Loaded all buffers.')
			ShaderBoy.bufferManager.buildShaderFromBuffers()
			ShaderBoy.bufferManager.setFBOsProps()
			ShaderBoy.editor.setBuffer('Image', true)
			if (this.isNewShader === true)
			{
				gdrive.saveThumbFile('thumb.png', ShaderBoy.canvas, this.ID_DIR_SHADER)
				this.isNewShader = false
			}
			ShaderBoy.gui_header.resetBtns(ShaderBoy.config.buffers)
			ShaderBoy.isPlaying = true
		}).catch((error) =>
		{
			throw new Error(error)
			return Promise.reject()
		})
	}
}