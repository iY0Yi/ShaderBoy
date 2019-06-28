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

import ShaderBoy from '../shaderboy'

export default ShaderBoy.gdrive = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    init()
    {
        this.CLIENT_ID = '98134852029-6pccdhcarbel0qfju1f2naj1992697qu.apps.googleusercontent.com'
        this.SCOPES = 'https://www.googleapis.com/auth/drive.file'
        this.AUTH_OPT = {
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            immediate: true
        }

        ShaderBoy.gui_header.setStatus('prgrs', `Authrizing...`, 0)
        setTimeout(() =>
        {
            gapi.auth.authorize({
                client_id: ShaderBoy.gdrive.CLIENT_ID,
                scope: ShaderBoy.gdrive.SCOPES,
                immediate: true
            }, ShaderBoy.gdrive.handleAuthResult)
        }, 1)
    },

    handleAuthResult(authResult)
    {
        console.log('authResult', authResult)


        if (authResult.error)
        {
            // No access token could be retrieved, show the button to start the authorization flow.
            console.log('No access token could be retrieved.')
            ShaderBoy.gui.showAuth()

            document.getElementById('btn_authrise_now').onclick = () =>
            {
                ShaderBoy.gui.hideAuth()
                gapi.auth.authorize({
                    client_id: ShaderBoy.gdrive.CLIENT_ID,
                    scope: ShaderBoy.gdrive.SCOPES,
                    immediate: false
                }, ShaderBoy.gdrive.handleAuthResult)
            }

            document.getElementById('btn_authrise_later').onclick = () =>
            {
                ShaderBoy.gui.hideAuth()
                ShaderBoy.runInDevMode = true
                ShaderBoy.io.init()
            }
        }
        else
        {
            // Access token has been successfully retrieved, requests can be sent to the API.
            console.log('Access token has been successfully retrieved.')
            ShaderBoy.gui_header.setStatus('gsuc', `Succeeded Authorizing.`, 3000)
            ShaderBoy.gui.hideAuth()
            ShaderBoy.gdrive.refreshAccessToken(authResult) // Start 

            gapi.load("client", () =>
            {
                gapi.client.load("drive", "v3", () =>
                {
                    ShaderBoy.io.loadGdrive()
                })
            })
        }
    },

    // auto refreshing the token
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async createFile(folderId, name, content, contentType, callback)
    {
        const boundary = '-------314159265358979323846'
        const delimiter = "\r\n--" + boundary + "\r\n"
        const close_delim = "\r\n--" + boundary + "--"

        const metadata = {
            'name': name,
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
                'Content-Type': `multipart/mixed; boundary='${boundary}'`
            },
            'body': multipartRequestBody,
        })

        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async createTextFile(folderId, name, content, callback)
    {
        // from http://ecmanaut.blogspot.jp/2006/07/encoding-decoding-utf8-in-javascript.html
        const utf8_to_b64 = (str) => { return window.btoa(unescape(encodeURIComponent(str))); }
        return this.createFile(folderId, name, utf8_to_b64(content), 'text/plain', callback)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    saveFile(name, id, content, contentType, callback)
    {
        const boundary = '-------314159265358979323846'
        const delimiter = "\r\n--" + boundary + "\r\n"
        const close_delim = "\r\n--" + boundary + "--"

        const metadata = {
            'name': name,
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
            'headers': { 'Content-Type': `multipart/mixed; boundary='${boundary}'` },
            'body': multipartRequestBody,
        })

        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async saveTextFile(name, id, content, callback)
    {
        // from http://ecmanaut.blogspot.jp/2006/07/encoding-decoding-utf8-in-javascript.html
        let utf8_to_b64 = (str) => { return window.btoa(unescape(encodeURIComponent(str))); }
        return this.saveFile(name, id, utf8_to_b64(content), 'text/plain', callback)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    createFolder(name, parentId, callback)
    {
        let config = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder'
        }
        if (parentId !== 'root') config.parents = [parentId]

        const request = gapi.client.drive.files.create(config)
        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFolderByName(name, callback)
    {
        const request = gapi.client.drive.files.list({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            pageSize: 1,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime)",
            q: `trashed=false and mimeType='application/vnd.google-apps.folder' and name='${name}'`,
            spaces: "drive"
        })
        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFolders(appFolderId, callback)
    {
        const request = gapi.client.drive.files.list({
            pageSize: 100,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime)",
            q: `trashed=false and mimeType='application/vnd.google-apps.folder' and '${appFolderId}' in parents`,
            spaces: "drive"
        })

        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFileInfoByName(name, folderId, callback)
    {
        const request = gapi.client.drive.files.list({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            pageSize: 1,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime)",
            q: `trashed=false and '${folderId}' in parents and name='${name}'`,
            spaces: "drive"
        })
        if (callback) { request.execute(callback) }
        return request
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFileIdsInFolder(folderId, callback)
    {
        const request = gapi.client.drive.files.list({
            pageSize: 100,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime, webContentLink)",
            q: `trashed=false and '${folderId}' in parents`,
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
    }
}