import ShaderBoy from './shaderboy';
import Hermite_class from 'hermite-resize';

export default ShaderBoy.gdrive = {


    init(callback)
    {
        let loadDiv = document.getElementById('cvr-loading');
        let authDiv = document.getElementById('div_authrise');
        // loadDiv.style.display = 'block';
        // authDiv.style.display = 'none';

        authDiv.classList.add('hide');

        this.CLIENT_ID = '98134852029-6pccdhcarbel0qfju1f2naj1992697qu.apps.googleusercontent.com';
        this.SCOPES = 'https://www.googleapis.com/auth/drive';

        this.ID_DIR_APP;
        this.ID_DIR_SHADER;
        this.ID_THUMB_SHADER = null;
        this.ids_shaderFiles = {};

        this.authedCallback = callback;
        this.hermite = new Hermite_class();

        window.setTimeout(this.checkAuth, 1);
    },

    /**
     * Check if the current user has authorized the application.
     */
    checkAuth()
    {
        gapi.auth.authorize({
            'client_id': ShaderBoy.gdrive.CLIENT_ID,
            'scope': ShaderBoy.gdrive.SCOPES,
            'immediate': true,
        },
            ShaderBoy.gdrive.handleAuthResult);
    },

    /**
     * Called when authorization server replies.
     * @param {Object} authResult Authorization result.
     */
    handleAuthResult(authResult)
    {
        let loadDiv = document.getElementById('cvr-loading');
        let authDiv = document.getElementById('div_authrise');
        let authContentDiv = document.getElementById('auth-content');
        let authNowButton = document.getElementById('btn_authrise_now');
        let authLaterButton = document.getElementById('btn_authrise_later');
        console.log('authResult: ', authResult);

        if (authResult && authResult.error === undefined)
        {
            // Access token has been successfully retrieved, requests can be sent to the API.
            authDiv.classList.add('hide');
            setTimeout(() =>
            {
                document.getElementById('div_authrise').classList.add('hidden');
            }, 400);

            ShaderBoy.gdrive.expireTime = parseInt(authResult.expires_in, 10) * 1000 + 2000;

            ShaderBoy.gdrive.regetAccessToken = function ()
            {
                setTimeout(
                    function ()
                    {
                        console.log('Retry getting access token...');
                        gapi.auth.authorize({
                            'client_id': ShaderBoy.gdrive.CLIENT_ID,
                            'scope': ShaderBoy.gdrive.SCOPES,
                            'immediate': true,
                        },
                            function (res)
                            {
                                console.log('Got a new access token: ', res);
                                ShaderBoy.gdrive.expireTime = parseInt(res.expires_in, 10) * 1000 + 2000;
                                ShaderBoy.gdrive.regetAccessToken();
                            }
                        );
                    }
                    , ShaderBoy.gdrive.expireTime);
            };
            ShaderBoy.gdrive.regetAccessToken();


            gapi.load("client", function ()
            {
                gapi.client.load("drive", "v3", function ()
                {
                    ShaderBoy.gdrive.getFolderByName('ShaderBoy', function (res)
                    {
                        ShaderBoy.gdrive.authedCallback();
                    });
                });
            });

        }
        else
        {
            // No access token could be retrieved, show the button to start the authorization flow.
            authDiv.classList.remove('hide');
            authContentDiv.classList.remove('hide');

            authNowButton.onclick = function ()
            {
                gapi.auth.authorize({
                    'client_id': ShaderBoy.gdrive.CLIENT_ID,
                    'scope': ShaderBoy.gdrive.SCOPES,
                    'immediate': false
                },
                    ShaderBoy.gdrive.handleAuthResult);
            };

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
        }
    },

    // File management
    loadFile(input)
    {
        let file = input.files[0];
        let url = URL.createObjectURL(file);
        loadImage(url);
    },

    loadImage(url)
    {
        let img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = function ()
        {
            console.log('An image was loaded.');
            // cvs.width = this.width;
            // cvs.height = this.height;
            // ctx.drawImage(this, 0, 0);
        };
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    createFile(folderId, nm, content, contentType, callback)
    {

        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        let metadata = {
            'name': nm,
            'mimeType': contentType,
            'parents': [folderId]
        };

        let base64Data = content;
        let multipartRequestBody = delimiter +
            'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' + base64Data + close_delim;

        let request = gapi.client.request({
            'path': '/upload/drive/v3/files',
            'method': 'POST',
            'params': {
                'uploadType': 'multipart'
            },
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody,
        });

        request.execute(callback);
    },

    createTextFile(folderId, nm, content, callback)
    {
        // from http://ecmanaut.blogspot.jp/2006/07/encoding-decoding-utf8-in-javascript.html
        let utf8_to_b64 = function (str) { return window.btoa(unescape(encodeURIComponent(str))); }
        this.createFile(folderId, nm, utf8_to_b64(content), 'text/plain', callback);
    },

    createImageFile(folderId, nm, canvas, callback)
    {
        let content = canvas.toDataURL("image/png").replace("data:image/png;base64,", "");
        ShaderBoy.gdrive.createFile(folderId, nm, content, 'image/png', function (res) { console.log(res); });
    },

    saveFile(nm, id, content, contentType, callback)
    {
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        let metadata = {
            'name': nm,
            'mimeType': contentType
        };

        let base64Data = content;
        let multipartRequestBody = delimiter +
            'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' + base64Data + close_delim;

        let request = gapi.client.request({
            'path': '/upload/drive/v3/files/' + id,
            'method': 'PATCH',
            'params': {
                'uploadType': 'multipart'
            },
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody,
        });
        request.execute(callback);
    },

    saveTextFile(nm, id, content, callback)
    {
        // from http://ecmanaut.blogspot.jp/2006/07/encoding-decoding-utf8-in-javascript.html
        let utf8_to_b64 = function (str) { return window.btoa(unescape(encodeURIComponent(str))); }
        this.saveFile(nm, id, utf8_to_b64(content), 'text/plain', callback);
    },

    saveImageFile(nm, id, canvas, callback)
    {
        let content = canvas.toDataURL("image/png").replace("data:image/jpeg;base64,", "");
        this.saveFile(nm, id, content, 'image/png', callback);
    },

    saveThumbFile(nm, canvas, callback)
    {
        this.getFileByName(nm, this.ID_DIR_SHADER, function (res)
        {
            console.log(res);
            let resamplecallback = null;

            // Create canvas for resizing
            ShaderBoy.gdrive.thumbData = {
                canvas: document.createElement("canvas"),
                name: nm,
                callback: callback
            };

            if (res.files.length === 0)
            {
                // Create a thumbnail.
                resamplecallback = function ()
                {
                    let data = ShaderBoy.gdrive.thumbData;
                    let content = data.canvas.toDataURL("image/png").replace("data:image/png;base64,", "");
                    ShaderBoy.gdrive.createFile(ShaderBoy.gdrive.ID_DIR_SHADER, data.name, content, 'image/png', data.callback);
                };
            }
            else
            {
                // Update a thumbnail.
                ShaderBoy.gdrive.thumbData.id = res.files[0].id;
                resamplecallback = function ()
                {
                    let data = ShaderBoy.gdrive.thumbData;
                    let content = data.canvas.toDataURL("image/png").replace("data:image/png;base64,", "");
                    ShaderBoy.gdrive.saveFile(data.name, data.id, content, 'image/png', data.callback);
                };
            }
            let offsetX = 0;
            let offsetY = 0;
            if (canvas.width / canvas.height > 16 / 9)
            {
                ShaderBoy.gdrive.thumbData.canvas.height = canvas.height;
                ShaderBoy.gdrive.thumbData.canvas.width = Math.floor(canvas.height * (16 / 9));;
                offsetX = (canvas.width - ShaderBoy.gdrive.thumbData.canvas.width) * 0.5;
            }
            else
            {
                ShaderBoy.gdrive.thumbData.canvas.width = canvas.width;
                ShaderBoy.gdrive.thumbData.canvas.height = Math.floor(canvas.width * (9 / 16));
                offsetY = (canvas.height - ShaderBoy.gdrive.thumbData.canvas.height) * 0.5;
            }

            let resizeCtx = ShaderBoy.gdrive.thumbData.canvas.getContext('2d');
            resizeCtx.drawImage(canvas, -offsetX, -offsetY);

            ShaderBoy.gdrive.hermite.resample(ShaderBoy.gdrive.thumbData.canvas, 320, 180, true, resamplecallback);
        });
    },

    createFolder(nm, parentId, callback)
    {
        let config = {
            name: nm,
            mimeType: 'application/vnd.google-apps.folder'
        };
        if (parentId !== 'root') config.parents = [parentId];

        const request = gapi.client.drive.files.create(config);
        request.execute(callback);
    },

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
        });
        request.execute(callback);
    },

    getFileByName(nm, id, callback)
    {
        const request = gapi.client.drive.files.list({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            pageSize: 1,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime)",
            q: "trashed=false and '" + id + "' in parents and name='" + nm + "'",
            spaces: "drive"
        });
        request.execute(callback);
    },

    getImageFileUrl(id)
    {
        gapi.client.drive.files.get({
            fileId: id, //id of the file you are looking for
            alt: 'media'
        }, {
                responseType: 'arraybuffer',
                encoding: null
            }, function (err, response)
            {
                if (err)
                {
                    console.log('error: ', err);

                    //handle the error
                } else
                {
                    var imageType = response.headers['content-type'];
                    var base64 = new Buffer(response.data, 'utf8').toString('base64');
                    var dataURI = 'data:' + imageType + ';base64,' + base64;
                    console.log('URL: ', dataURI);
                    // res.send(dataURI);
                }
            });
    },

    getFolders(callback)
    {
        const request = gapi.client.drive.files.list({
            pageSize: 100,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime)",
            q: "trashed=false and mimeType='application/vnd.google-apps.folder' and '" + this.ID_DIR_APP + "' in parents",
            spaces: "drive"
        });
        request.execute(callback);
    },

    getFilesInFolder(folderId, callback)
    {
        const request = gapi.client.drive.files.list({
            pageSize: 100,
            orderBy: "name, modifiedTime",
            fields: "files(id, name, kind, size, mimeType, modifiedTime, webContentLink)",
            q: "trashed=false and '" + folderId + "' in parents",
            spaces: "drive"
        });
        request.execute(callback);
    },

    getContentBody(id, callback)
    {
        const request = gapi.client.drive.files.get({
            fileId: id,
            alt: 'media'
        });
        request.then(callback);
    },

    createShaderFolder(nm, callback)
    {
        this.createFolder(nm, this.ID_DIR_APP, callback);
    }
}