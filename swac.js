//
// service worker application cache
//

var CACHE = 'v20220616132341';

var AUTO = [
    '404.html',
    'assets/images/favicon.png',
    'assets/javascripts/bundle.748e2769.min.js',
    'assets/javascripts/lunr/min/lunr.fr.min.js',
    'assets/javascripts/lunr/min/lunr.multi.min.js',
    'assets/javascripts/lunr/min/lunr.stemmer.support.min.js',
    'assets/javascripts/lunr/tinyseg.js',
    'assets/javascripts/lunr/wordcut.js',
    'assets/javascripts/workers/search.2a1c317c.min.js',
    'assets/stylesheets/main.8c5ef100.min.css',
    'assets/stylesheets/palette.9647289d.min.css',
    'awele.html',
    'c-cross.html',
    'carcassonne.html',
    'css/extra.css',
    'cubulus.html',
    'great-western-trail.html',
    'img/orleans23.jpg',
    'img/orleans45.jpg',
    'img/quoridor1.jpg',
    'img/quoridor2.jpg',
    'img/quoridor3.jpg',
    'index.html',
    'inside.html',
    'jaipur.html',
    'jarnac.html',
    'les-cites-perdues.html',
    'liens.html',
    'orleans.html',
    'project-l.html',
    'pylos.html',
    'quarto.html',
    'quivive.html',
    'quixo.html',
    'quoridor.html',
    'qwirkle.html',
    'search/search_index.json',
    'splendor.html',
    'zero.html',
];

// strip query parameters (and fragment)
function sqp (request) {
    var url = new URL (request.url);
    url.search = '';
    url.fragment = '';
    return(new Request (url));
}

// cache preload
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE)
            .then(function (cache) {
                cache.addAll(AUTO);
            })
            .then(self.skipWaiting())
    );
});

// cache cleanup
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (names) {
            return(Promise.all(
                names.filter(function (name) {
                    return(name !== CACHE);
                }).map(function (name) {
                    return(caches.delete(name));
                })
            ));
        })
    );
});

// intercept fetch requests: use cache then network
self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET')
        return;
    if (!event.request.url.startsWith(self.location.origin))
        return;
    var cleaned = sqp(event.request);
    event.respondWith(caches.match(cleaned).then(function (response) {
        if (response !== undefined) {
            return(response);
        } else {
            return(fetch(event.request).then(function (response) {
                if (response.ok && !response.headers['Cache-Control']) {
                    var cloned = response.clone();
                    caches.open(CACHE).then(function (cache) {
                        cache.put(cleaned, cloned);
                    });
                }
                return(response);
            }).catch(function () {
                return(new Response('404 - NOT FOUND', {
                    status: 404,
                    statusText: 'NOT FOUND',
                }));
            }));
        }
    }));
});
