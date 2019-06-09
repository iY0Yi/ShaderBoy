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
	init()
	{
		localforage.config({
			driver: localforage.INDEXEDDB,
			name: 'ShaderBoy',
			version: 1.0,
			storeName: 'shaderdata'
		})

		ShaderBoy.renderScale = 2
		// ShaderBoy.editor.textSize = 16

		this.fileNameByBufferName = {
			'Setting': 'setting.json',
			'Config': 'config.json',
			'BufferA': 'buf_a.fs',
			'BufferB': 'buf_b.fs',
			'BufferC': 'buf_c.fs',
			'BufferD': 'buf_d.fs',
			'Image': 'main.fs',
			'Sound': 'sound.fs',
			'Common': 'common.fs'
		}

		this.useGoogleDrive = true
		this.loadedNum = 0
		this.needLoadingNum = 0
		this.initLoading = true
		this.isNewShader = false
		this.createdNum = 0
		this.isInitializationSB = false

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
			ShaderBoy.io.init()
		}

		if (!ShaderBoy.runInDevMode)
		{
			console.log('production mode...')
			gdrive.init(this.getShadersFromGdrive)
		}
		else
		{
			console.log('devlopment mode...')
			this.setupTestShaders()
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	getShadersFromGdrive()
	{
		gdrive.getFolderByName('ShaderBoy', (res) =>
		{
			if (res.files.length === 0)
			{
				// No folder is named as ShaderBoy. So make it.
				gdrive.createFolder('ShaderBoy', 'root', (res) =>
				{
					gdrive.ID_DIR_APP = res.id
					ShaderBoy.io.createSetting()
				})
				return
			}

			// A folder found named as ShaderBoy. So lets load shaders.
			gdrive.ID_DIR_APP = res.files[0].id

			gdrive.getFileByName('setting.json', gdrive.ID_DIR_APP, (res) =>
			{
				if (res.files.length === 0)
				{
					ShaderBoy.io.createSetting()
					return
				}

				for (const file of res.files)
				{
					if (file.name !== 'setting.json')
					{
						continue
					}

					gdrive.appData = {}
					gdrive.appData['Setting'] = {}
					gdrive.appData['Setting']['name'] = file.name
					gdrive.appData['Setting']['id'] = file.id
					gdrive.appData['Setting']['content'] = ''

					gdrive.getContentBody(file.id, (res) =>
					{
						let value = res.body
						if (!value)
						{
							value = ShaderLib.shader['Setting']
						}
						const settingObj = JSON.parse(value)

						//active shader name. to be loaded.
						ShaderBoy.activeShaderName = settingObj.shaders.active
						ShaderBoy.setting = settingObj
						gdrive.getFolders((res) =>
						{
							ShaderBoy.setting.shaders.list = []
							ShaderBoy.setting.shaders.datalist = []
							ShaderBoy.setting.shaders.thumbs = []
							for (let i = 0; i < res.files.length; i++)
							{
								const file = res.files[i]
								ShaderBoy.setting.shaders.list[i] = file.name
								ShaderBoy.setting.shaders.datalist[i] = { name: file.name, id: file.id }
							}

							const settingText = JSON.stringify(ShaderBoy.setting, null, "\t")
							ShaderBoy.buffers['Setting'].cm = CodeMirror.Doc(settingText, 'x-shader/x-fragment')
							ShaderBoy.io.loadShader(ShaderBoy.activeShaderName, true)
						})
					})
				}
			})
		})
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupTestShaders()
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
	createSetting()
	{
		ShaderBoy.setting = JSON.parse(ShaderLib.shader['Setting'])
		ShaderBoy.setting.shaders.list = []
		ShaderBoy.setting.shaders.datalist = []
		ShaderBoy.setting.shaders.thumbs = []
		ShaderBoy.setting.shaders.list[0] = 'file.name'
		ShaderBoy.setting.shaders.datalist[0] = { name: '_default', id: null }
		gdrive.createTextFile(gdrive.ID_DIR_APP, 'setting.json', ShaderLib.shader['Setting'], (res) =>
		{
			gdrive.appData = {}
			gdrive.appData['Setting'] = {}
			gdrive.appData['Setting']['name'] = res.name
			gdrive.appData['Setting']['id'] = res.id
			gdrive.appData['Setting']['content'] = ''
			ShaderBoy.activeShaderName = '_default'
			ShaderBoy.io.isInitializationSB = true
			ShaderBoy.io.newShader(ShaderBoy.activeShaderName)
		})
		ShaderBoy.bufferManager.initBufferDoc(['Setting'])
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	updateShaderList()
	{
		ShaderBoy.setting.shaders.list.push(ShaderBoy.setting.shaders.active)
		ShaderBoy.setting.shaders.list = Array.from(new Set(ShaderBoy.setting.shaders.list))
	},

	activateShader(name)
	{
		ShaderBoy.setting.shaders.active = name
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	createDefaultShaderFiles(id)
	{
		this.createdNum = 0
		const load = () =>
		{
			ShaderBoy.io.createdNum++
			if (ShaderBoy.io.createdNum === 8)
			{
				if (ShaderBoy.io.isInitializationSB === true)
				{
					ShaderBoy.io.isInitializationSB = false
					ShaderBoy.io.getShadersFromGdrive()
				}
				else
				{
					const name = ShaderBoy.setting.shaders.active
					ShaderBoy.io.loadShader(name, name === '_default')
				}
			}
		}

		ShaderBoy.config = JSON.parse(ShaderBoy.buffers['Config'].cm.getValue())
		gdrive.createTextFile(id, 'config.json', ShaderLib.shader['Config'], load)
		gdrive.createTextFile(id, 'common.fs', ShaderLib.shader['Common'], load)
		gdrive.createTextFile(id, '_guiknobs.json', ShaderLib.shader['gui_knobs'], load)
		gdrive.createTextFile(id, '_guitimeline.json', ShaderLib.shader['gui_timeline'], load)
		gdrive.createTextFile(id, 'buf_a.fs', ShaderLib.shader['BufferA'], load)
		gdrive.createTextFile(id, 'buf_b.fs', ShaderLib.shader['BufferB'], load)
		gdrive.createTextFile(id, 'buf_c.fs', ShaderLib.shader['BufferC'], load)
		gdrive.createTextFile(id, 'buf_d.fs', ShaderLib.shader['BufferD'], load)
		gdrive.createTextFile(id, 'main.fs', ShaderLib.shader['Image'], load)
		gdrive.createTextFile(id, 'sound.fs', ShaderLib.shader['Sound'], load)

		ShaderBoy.gui_header.setStatus('suc1', 'New.', 3000)
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	newShader(shaderName)
	{
		gdrive.getFolderByName(shaderName, (res) =>
		{
			if (res.files.length !== 0)
			{
				console.log('It exist. Use a different name.')
				return
			}

			gdrive.createShaderFolder(shaderName, (ress) =>
			{
				gdrive.ID_DIR_SHADER = ress.id
				ShaderBoy.io.isNewShader = true
				ShaderBoy.io.createDefaultShaderFiles(ress.id)
				ShaderBoy.io.activateShader(shaderName)
				ShaderBoy.io.updateShaderList()
			})
		})
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	saveShader()
	{
		ShaderBoy.gui_header.setStatus('prgrs', 'Saving...', 0)

		ShaderBoy.io.numNeedSaving = 5
		ShaderBoy.io.numSaved = 0
		ShaderBoy.io.numNeedSaving += (ShaderBoy.buffers['Common'].active === true) ? 1 : 0
		ShaderBoy.io.numNeedSaving += (ShaderBoy.buffers['BufferA'].active === true) ? 1 : 0
		ShaderBoy.io.numNeedSaving += (ShaderBoy.buffers['BufferB'].active === true) ? 1 : 0
		ShaderBoy.io.numNeedSaving += (ShaderBoy.buffers['BufferC'].active === true) ? 1 : 0
		ShaderBoy.io.numNeedSaving += (ShaderBoy.buffers['BufferD'].active === true) ? 1 : 0

		const confirmSaving = () =>
		{
			ShaderBoy.io.numSaved++
			if (ShaderBoy.io.numNeedSaving === ShaderBoy.io.numSaved)
			{
				ShaderBoy.gui_header.setStatus('suc1', 'Saved.', 3000)
			}
		}

		gdrive.saveThumbFile('thumb.png', ShaderBoy.canvas, (res, err) => { console.log(res, err, 'thumbnail was saved.'); }, confirmSaving)
		gdrive.saveTextFile('setting.json', gdrive.appData['Setting'].id, JSON.stringify(ShaderBoy.setting, null, "\t"), confirmSaving)
		gdrive.saveTextFile('_guiknobs.json', gdrive.ids_shaderFiles['_guiknobs.json'].id, JSON.stringify({ 'show': ShaderBoy.gui.knobs.show, 'knobs': ShaderBoy.gui.knobs.knobs }, null, "\t"), confirmSaving)
		gdrive.saveTextFile('_guitimeline.json', gdrive.ids_shaderFiles['_guitimeline.json'].id, JSON.stringify(gui_timeline.guidata, null, "\t"), confirmSaving)
		gdrive.saveTextFile('config.json', gdrive.ids_shaderFiles['config.json'].id, JSON.stringify(ShaderBoy.config, null, "\t"), confirmSaving)
		gdrive.saveTextFile('main.fs', gdrive.ids_shaderFiles['main.fs'].id, ShaderBoy.buffers['Image'].cm.getValue(), confirmSaving)
		if (ShaderBoy.buffers['Common'].active === true) gdrive.saveTextFile('common.fs', gdrive.ids_shaderFiles['common.fs'].id, ShaderBoy.buffers['Common'].cm.getValue(), confirmSaving)
		if (ShaderBoy.buffers['BufferA'].active === true) gdrive.saveTextFile('buf_a.fs', gdrive.ids_shaderFiles['buf_a.fs'].id, ShaderBoy.buffers['BufferA'].cm.getValue(), confirmSaving)
		if (ShaderBoy.buffers['BufferB'].active === true) gdrive.saveTextFile('buf_b.fs', gdrive.ids_shaderFiles['buf_b.fs'].id, ShaderBoy.buffers['BufferB'].cm.getValue(), confirmSaving)
		if (ShaderBoy.buffers['BufferC'].active === true) gdrive.saveTextFile('buf_c.fs', gdrive.ids_shaderFiles['buf_c.fs'].id, ShaderBoy.buffers['BufferC'].cm.getValue(), confirmSaving)
		if (ShaderBoy.buffers['BufferD'].active === true) gdrive.saveTextFile('buf_d.fs', gdrive.ids_shaderFiles['buf_d.fs'].id, ShaderBoy.buffers['BufferD'].cm.getValue(), confirmSaving)
		if (ShaderBoy.buffers['Sound'].active === true) gdrive.saveTextFile('sound.fs', gdrive.ids_shaderFiles['sound.fs'].id, ShaderBoy.buffers['Sound'].cm.getValue(), confirmSaving)
		localforage.setItem('renderScale', ShaderBoy.renderScale, (err) => { if (err) { console.log('db error...') } })
		localforage.setItem('textSize', ShaderBoy.textSize, (err) => { if (err) { console.log('db error...') } })
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	isLoaded(nm)
	{
		ShaderBoy.io.loadedNum++
		ShaderBoy.gui_header.setStatus('prgrs', 'Loading shader files...(' + ShaderBoy.io.loadedNum + '/' + ShaderBoy.io.needLoadingNum + ')', 0)
		if (ShaderBoy.io.loadedNum === ShaderBoy.io.needLoadingNum)
		{
			ShaderBoy.bufferManager.buildShaderFromBuffers()
			ShaderBoy.bufferManager.setFBOsProps()
			ShaderBoy.editor.setBuffer('Image', true)
			if (ShaderBoy.io.isNewShader === true)
			{
				gdrive.saveThumbFile('thumb.png', ShaderBoy.canvas, (res, err) => { console.log(res, err, 'thumbnail was saved.'); })
				ShaderBoy.io.isNewShader = false
			}

			ShaderBoy.gui_header.resetBtns(ShaderBoy.config.buffers)
			ShaderBoy.isPlaying = true
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	getActiveShaderName()
	{
		return ShaderBoy.buffers['BufferA'].cm.getValue()
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	loadShader(sn, initLoading)
	{
		if (ShaderBoy.buffers['Sound'].active === true)
		{
			ShaderBoy.soundRenderer.stop()
		}

		if (initLoading === true)
		{
			window.idi = 0
			const id = ShaderBoy.setting.shaders.datalist[window.idi].id
			ShaderBoy.setting.shaders.shaderlist = []

			window.cb_thumb = (res) =>
			{
				if (res.files === undefined || res.files.length === 0)
				{
					return
				}

				for (const file of res.files) 
				{
					if (file.name === 'thumb.png')
					{
						ShaderBoy.setting.shaders.shaderlist[window.idi] = { name: ShaderBoy.setting.shaders.datalist[window.idi].name, thumb: 'https://drive.google.com/uc?id=' + file.id }
						window.idi++
						if (ShaderBoy.setting.shaders.datalist[window.idi] !== undefined)
						{
							const id = ShaderBoy.setting.shaders.datalist[window.idi].id
							gdrive.getFileByName('thumb.png', id, window.cb_thumb)
						}
						else
						{
							gui_panel_shaderlist.setup(ShaderBoy.setting.shaders.shaderlist)
						}
					}

				}

			}
			gdrive.getFileByName('thumb.png', id, window.cb_thumb)
		}

		ShaderBoy.io.initLoading = (initLoading === undefined) ? false : initLoading
		ShaderBoy.buffers['Config'].active = true
		ShaderBoy.io.loadedNum = 0
		ShaderBoy.io.needLoadingNum = 0

		ShaderBoy.gui_header.setStatus('prgrs', 'Loading from Google Drive...', 0)

		let shaderName = '_default'
		if (sn !== undefined)
		{
			shaderName = sn
		}

		gdrive.getFolderByName(shaderName, (res) =>
		{
			if (res.files[0] !== undefined)
			{
				ShaderBoy.gui_header.setStatus('prgrs', '"' + shaderName + '" was found. Loading shader files...', 0)
				const folderId = res.files[0].id

				gdrive.ID_DIR_SHADER = folderId

				gdrive.getFilesInFolder(folderId, (res) =>
				{

					if (res.files.length === 0)
					{
						ShaderBoy.gui_header.setStatus('error', shaderName + ' folder is empty. Confirm on your GoogleDrive.', 0)
						return
					}

					gdrive.ids_shaderFiles = {}
					for (const file of res.files)
					{
						gdrive.ids_shaderFiles[file.name] = {}
						gdrive.ids_shaderFiles[file.name]['name'] = file.name
						gdrive.ids_shaderFiles[file.name]['id'] = file.id
						gdrive.ids_shaderFiles[file.name]['content'] = ''
					}

					const id = gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName['Config']].id
					gdrive.getContentBody(id, (res) =>
					{
						let value = res.body
						if (!value)
						{
							value = ShaderLib.shader['Config']
						}

						const configObj = JSON.parse(value)
						ShaderBoy.config = configObj
						if (configObj.buffers['Sound'] === undefined)
						{
							const defcon = JSON.parse(ShaderLib.shader['Config'])
							configObj.buffers['Sound'] = ShaderBoy.config.buffers['Sound'] = defcon.buffers['Sound']
						}

						for (const key in configObj.buffers)
						{
							const buffer = configObj.buffers[key]
							if (buffer.active === true)
							{
								ShaderBoy.io.needLoadingNum++
							}
						}

						// Load GUI jsons...
						if (gdrive.ids_shaderFiles['_guiknobs.json'] !== undefined)
						{
							const id = gdrive.ids_shaderFiles['_guiknobs.json'].id
							gdrive.getContentBody(id, (res) =>
							{
								let value = res.body
								if (!value)
								{
									value = ShaderLib.shader['gui_knobs']
								}
								const knobsObj = JSON.parse(value)
								ShaderBoy.gui.knobs.show = knobsObj.show
								for (let i = 0; i < ShaderBoy.gui.knobs.knobs.length; i++)
								{
									ShaderBoy.gui.knobs.knobs[i].value = knobsObj.knobs[i].value
									ShaderBoy.gui.knobs.knobs[i].active = knobsObj.knobs[i].active
									ShaderBoy.gui.knobs.toggle(i, false)
								}
							})
						}
						else
						{
							gdrive.createTextFile(gdrive.ID_DIR_SHADER, '_guiknobs.json', ShaderLib.shader['gui_knobs'], (file) =>
							{
								gdrive.ids_shaderFiles['_guiknobs.json'] = {}
								gdrive.ids_shaderFiles['_guiknobs.json']["name"] = file.name
								gdrive.ids_shaderFiles['_guiknobs.json']["id"] = file.id
								gdrive.ids_shaderFiles['_guiknobs.json']["content"] = ''
							})
						}

						if (gdrive.ids_shaderFiles['_guitimeline.json'] !== undefined)
						{
							const id = gdrive.ids_shaderFiles['_guitimeline.json'].id
							gdrive.getContentBody(id, (res) =>
							{
								let value = res.body
								if (!value)
								{
									value = ShaderLib.shader['gui_timeline']
								}
								const timelineObj = JSON.parse(value)
								gui_timeline.guidata = timelineObj
							})
						}
						else
						{
							gdrive.createTextFile(gdrive.ID_DIR_SHADER, '_guitimeline.json', ShaderLib.shader['gui_timeline'], (file) =>
							{
								gdrive.ids_shaderFiles['_guitimeline.json'] = {}
								gdrive.ids_shaderFiles['_guitimeline.json']["name"] = file.name
								gdrive.ids_shaderFiles['_guitimeline.json']["id"] = file.id
								gdrive.ids_shaderFiles['_guitimeline.json']["content"] = ''
							})
						}

						const configText = JSON.stringify(configObj, null, "\t")
						ShaderBoy.buffers['Config'].cm = CodeMirror.Doc(configText, 'x-shader/x-fragment')

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

						const bufferConfig = configObj.buffers
						if ('MainImage' in bufferConfig)
						{
							Object.defineProperty(bufferConfig, 'Image', Object.getOwnPropertyDescriptor(bufferConfig, 'MainImage'))
							delete bufferConfig['MainImage']
						}
						if (bufferConfig['Sound'] === undefined)
						{
							ShaderBoy.buffers['Sound'].active = false
							const defcon = JSON.parse(ShaderLib.shader['Config'])
							bufferConfig['Sound'] = defcon['Sound']
						}

						const setupBufferByConfig = (bufName, config) =>
						{
							ShaderBoy.buffers[bufName].active = config[bufName].active
							if (ShaderBoy.buffers[bufName].active === true)
							{
								const id = gdrive.ids_shaderFiles[ShaderBoy.io.fileNameByBufferName[bufName]].id
								gdrive.getContentBody(id, (res) =>
								{
									let value = res.body
									if (!value)
									{
										value = ShaderLib.shader[bufName]
									}
									ShaderBoy.buffers[bufName].cm = CodeMirror.Doc(value, 'x-shader/x-fragment')
									ShaderBoy.io.isLoaded(bufName)
								})
							}
						}
						setupBufferByConfig('Common', bufferConfig)
						setupBufferByConfig('BufferA', bufferConfig)
						setupBufferByConfig('BufferB', bufferConfig)
						setupBufferByConfig('BufferC', bufferConfig)
						setupBufferByConfig('BufferD', bufferConfig)
						setupBufferByConfig('Image', bufferConfig)

						if (gdrive.ids_shaderFiles['sound.fs'] === undefined)
						{
							gdrive.createTextFile(gdrive.ID_DIR_SHADER, 'sound.fs', ShaderLib.shader['Sound'], (file) =>
							{
								gdrive.ids_shaderFiles['sound.fs'] = {}
								gdrive.ids_shaderFiles['sound.fs']["name"] = file.name
								gdrive.ids_shaderFiles['sound.fs']["id"] = file.id
								gdrive.ids_shaderFiles['sound.fs']["content"] = ''
							})
						}
						else
						{
							setupBufferByConfig('Sound', bufferConfig)
						}
					})

				}
				)
			} else
			{
				ShaderBoy.gui_header.setStatus('error', shaderName + ' was not found.', 3000)
				ShaderBoy.io.newShader(shaderName)
			}
		})
	}
}