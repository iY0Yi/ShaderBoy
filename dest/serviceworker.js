self.addEventListener('install', function (event)
{
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open('static').then(function (cache)
        {
            cache.addAll(['/',
                '/index.html',
                '/js/main.min.js', 
                '/js/gif.worker.js',
                '/js/CCapture.all.min.js',
                '/shader/_common.vs',
                '/shader/_commonfooter.fs',
                '/shader/_config.json',
                '/shader/_guiknobs.json',
                '/shader/_guitimeline.json',
                '/shader/_setting.json',
                '/shader/_uniform.fs',
                '/shader/_util.fs',
                '/shader/buf_a.fs',
                '/shader/buf_b.fs',
                '/shader/buf_c.fs',
                '/shader/buf_d.fs',
                '/shader/common.fs',
                '/shader/commonfooter.fs',
                '/shader/image.fs',
                '/shader/screen.fs',
                '/shader/shaderlist.js',
                '/shader/writetest.fs',
                '/manifest.json']);
        })
    );
});

self.addEventListener('activate', function (event)
{
    console.log('[Service Worker] Activating Service Worker ....', event);
});

self.addEventListener('fetch', function (event)
{
    event.respondWith(
        caches.match(event.request).then(function (response)
        {
            if (response)
            {
                return response;
            } else
            {
                return fetch(event.request).then(function (res)
                {
                    return caches.open('dynamic').then(function (cache)
                    {
                        cache.put(event.request.url, res.clone());
                        return res;
                    });
                });
            }
        })
    );
});