//   ___                         _          
//  (  _`\                      (_ )        
//  | ( (_)   _      _      __   | |    __  
//  | |___  /'_`\  /'_`\  /'_ `\ | |  /'__`\
//  | (_, )( (_) )( (_) )( (_) | | | (  ___/
//  (____/'`\___/'`\___/'`\__  |(___)`\____)
//                       ( )_) |            
//                        \___/'            
//   ___                                    
//  (  _`\        _                         
//  | | ) | _ __ (_) _   _    __            
//  | | | )( '__)| |( ) ( ) /'__`\          
//  | |_) || |   | || \_/ |(  ___/          
//  (____/'(_)   (_)`\___/'`\____)          
//                                          

import ShaderBoy from './shaderboy'
import Hermite_class from 'hermite-resize'

export default ShaderBoy.gdrive = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async init()
    {
        this.CLIENT_ID = '98134852029-6pccdhcarbel0qfju1f2naj1992697qu.apps.googleusercontent.com'
        this.SCOPES = 'https://www.googleapis.com/auth/drive.file'
        this.AUTH_OPT = {
            'client_id': this.CLIENT_ID,
            'scope': this.SCOPES,
            'immediate': true
        }

        this.ID_DIR_APP

        document.getElementById('btn_authrise_now').onclick = () =>
        {
            gapi.auth.authorize(this.AUTH_OPT, this.handleAuthResult)
        }

        document.getElementById('btn_authrise_later').onclick = () =>
        {
            document.getElementById('div_authrise').classList.add('hide')
            setTimeout(() =>
            {
                document.getElementById('div_authrise').classList.add('hidden')
            }, 400)
            ShaderBoy.runInDevMode = true
            ShaderBoy.io.init()
        }

        const response = await new Promise((resolve, reject) =>
        {
            gapi.auth.authorize(this.AUTH_OPT, (res) =>
            {
                if (res.error) { reject(res) }
                else { resolve(res) }
            })
        })
        return this.handleAuthResult(response)
    },

    /**
     * Called when authorization server replies.
     * @param {Object} authResult Authorization result.
     */
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async handleAuthResult(res)
    {
        console.log('handleAuthResult: ', res)
        if (res.error)
        {
            // No access token could be retrieved, show the button to start the authorization flow.
            document.getElementById('div_authrise').classList.remove('hide')
            document.getElementById('auth-content').classList.remove('hide')
            return Promise.resolve()
        }
        else
        {
            // Access token has been successfully retrieved, requests can be sent to the API.
            this.refreshAccessToken(res)
            await new Promise((resolve, reject) => { gapi.load("client", resolve) })
            await new Promise((resolve, reject) => { gapi.client.load("drive", "v3", resolve) })
            await this.getFolderByName('ShaderBoy')
            return Promise.resolve()
        }
    },

    /**
     * Check if the current user has authorized the application.
     */
    async refreshAccessToken(res)
    {
        const expireTime = parseInt(res.expires_in, 10) * 1000 + 2000
        setTimeout(() =>
        {
            console.log('Retry getting access token...')
            gapi.auth.authorize(this.AUTH_OPT, (res) =>
            {
                console.log('Got a new access token: ', res)
                this.refreshAccessToken(res)
            }
            )
        }, expireTime)
    },

    // File management
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async createFile(folderId, nm, content, contentType, callback)
    {
        const boundary = '-------314159265358979323846'
        const delimiter = "\r\n--" + boundary + "\r\n"
        const close_delim = "\r\n--" + boundary + "--"

        const metadata = {
            'name': nm,
            'mimeType': contentType,
            'parents': [folderId]
        }

        const base64Data = content
        const multipartRequestBody = delimiter +
            'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' + base64Data + close_delim

        const request = gapi.client.request({
            'path': '/upload/drive/v3/files',
            'method': 'POST',
            'params': {
                'uploadType': 'multipart'
            },
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody,
        })

        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async createTextFile(folderId, nm, content, callback)
    {
        // from http://ecmanaut.blogspot.jp/2006/07/encoding-decoding-utf8-in-javascript.html
        const utf8_to_b64 = (str) => { return window.btoa(unescape(encodeURIComponent(str))); }
        return this.createFile(folderId, nm, utf8_to_b64(content), 'text/plain', callback)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    saveFile(nm, id, content, contentType, callback)
    {
        const boundary = '-------314159265358979323846'
        const delimiter = "\r\n--" + boundary + "\r\n"
        const close_delim = "\r\n--" + boundary + "--"

        const metadata = {
            'name': nm,
            'mimeType': contentType
        }

        const base64Data = content
        const multipartRequestBody = delimiter +
            'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' + base64Data + close_delim

        const request = gapi.client.request({
            'path': '/upload/drive/v3/files/' + id,
            'method': 'PATCH',
            'params': { 'uploadType': 'multipart' },
            'headers': { 'Content-Type': 'multipart/mixed; boundary="' + boundary + '"' },
            'body': multipartRequestBody,
        })

        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async saveTextFile(nm, id, content, callback)
    {
        // from http://ecmanaut.blogspot.jp/2006/07/encoding-decoding-utf8-in-javascript.html
        let utf8_to_b64 = (str) => { return window.btoa(unescape(encodeURIComponent(str))); }
        return this.saveFile(nm, id, utf8_to_b64(content), 'text/plain', callback)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async saveThumbFile(nm, mainCanvas, folderId)
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

        let response = await this.getFileInfoByName(nm, folderId, null)
        const res = response.result
        if (res.files.length === 0)
        {
            this.createFile(folderId, nm, content, 'image/png', null).then(() =>
            {
                return Promise.resolve()
            }).catch((error) =>
            {
                return Promise.reject()
            })
        }
        else
        {
            this.saveFile(nm, res.files[0].id, content, 'image/png', null).then(() =>
            {
                return Promise.resolve()
            }).catch((error) =>
            {
                return Promise.reject()
            })
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    createFolder(nm, parentId, callback)
    {
        let config = {
            name: nm,
            mimeType: 'application/vnd.google-apps.folder'
        }
        if (parentId !== 'root') config.parents = [parentId]

        const request = gapi.client.drive.files.create(config)
        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFolderByName(nm, callback)
    {
        const request = gapi.client.drive.files.list({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            pageSize: 1,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime)",
            q: "trashed=false and mimeType='application/vnd.google-apps.folder' and name='" + nm + "'",
            spaces: "drive"
        })
        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFolderByNamePromise(name)
    {
        const request = gapi.client.drive.files.list({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            pageSize: 1,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime)",
            q: "trashed=false and mimeType='application/vnd.google-apps.folder' and name='" + name + "'",
            spaces: "drive"
        })
        return request.getPromise()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFileInfoByName(nm, id, callback)
    {
        const request = gapi.client.drive.files.list({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            pageSize: 1,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime)",
            q: "trashed=false and '" + id + "' in parents and name='" + nm + "'",
            spaces: "drive"
        })
        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFileInfoByNamePromise(name, id)
    {
        const request = gapi.client.drive.files.list({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            pageSize: 1,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime)",
            q: "trashed=false and '" + id + "' in parents and name='" + name + "'",
            spaces: "drive"
        })
        return request.getPromise()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFolders(appFolderId, callback)
    {
        const request = gapi.client.drive.files.list({
            pageSize: 100,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime)",
            q: "trashed=false and mimeType='application/vnd.google-apps.folder' and '" + appFolderId + "' in parents",
            spaces: "drive"
        })

        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFilesInFolder(folderId, callback)
    {
        const request = gapi.client.drive.files.list({
            pageSize: 100,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime, webContentLink)",
            q: "trashed=false and '" + folderId + "' in parents",
            spaces: "drive"
        })

        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getContentBody(id, callback)
    {
        const request = gapi.client.drive.files.get({
            fileId: id,
            alt: 'media'
        })
        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    createShaderFolder(name, appFolderId, callback)
    {
        return this.createFolder(name, appFolderId, callback)
    }
}