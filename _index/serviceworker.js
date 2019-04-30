self.addEventListener('install', function (event)
{
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open('static').then(function (cache)
        {
            cache.addAll(['/app/',
                '/app/index.html',
                '/app/js/main.min.js', 
                '/app/js/gif.worker.js',
                '/app/js/CCapture.all.min.js',
                '/app/shader/_common.vs',
                '/app/shader/_commonfooter.fs',
                '/app/shader/_config.json',
                '/app/shader/_guiknobs.json',
                '/app/shader/_guitimeline.json',
                '/app/shader/_setting.json',
                '/app/shader/_uniform.fs',
                '/app/shader/_util.fs',
                '/app/shader/buf_a.fs',
                '/app/shader/buf_b.fs',
                '/app/shader/buf_c.fs',
                '/app/shader/buf_d.fs',
                '/app/shader/common.fs',
                '/app/shader/commonfooter.fs',
                '/app/shader/image.fs',
                '/app/shader/screen.fs',
                '/app/shader/shaderlist.js',
                '/app/shader/writetest.fs',
                '/app/manifest.json']);
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