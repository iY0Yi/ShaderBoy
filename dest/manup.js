// Manup.js - Enhanced version
var manUpObject;

// データオブジェクト
var validMetaValues = [
    { name: 'mobile-web-app-capable', manifestName: 'display' },
    { name: 'apple-mobile-web-app-capable', manifestName: 'display' },
    { name: 'apple-mobile-web-app-title', manifestName: 'short_name' },
    { name: 'application-name', manifestName: 'short_name' }
];

var validLinkValues = [
    { name: 'apple-touch-icon', manifestName: 'icons', imageSize: '152x152' },
    { name: 'apple-touch-icon', manifestName: 'icons', imageSize: '120x120' },
    { name: 'apple-touch-icon', manifestName: 'icons', imageSize: '76x76' },
    { name: 'apple-touch-icon', manifestName: 'icons', imageSize: '60x60' },
    { name: 'icon', manifestName: 'icons', imageSize: '192x192' },
    { name: 'icon', manifestName: 'icons', imageSize: '512x512' },
    { name: 'icon', manifestName: 'icons', imageSize: '620x300' }, // 新規
    { name: 'icon', manifestName: 'icons', imageSize: '1240x600' } // 新規
];

// タグの重複チェック
var isTagExists = function (tagName, attributeName, attributeValue) {
    const tags = document.querySelectorAll(`${tagName}[${attributeName}="${attributeValue}"]`);
    return tags.length > 0;
};

// メタデータ生成
var generateFullMetaData = function () {
    validMetaValues.forEach(meta => {
        if (manUpObject[meta.manifestName]) {
            if (meta.manifestName === 'display' && manUpObject.display === 'standalone') {
                meta.content = 'yes';
            } else {
                meta.content = manUpObject[meta.manifestName];
            }
        }
    });
    return validMetaValues;
};

// リンクデータ生成
var generateFullLinkData = function () {
    validLinkValues.forEach(link => {
        if (manUpObject[link.manifestName]) {
            if (link.manifestName === 'icons') {
                var imageArray = manUpObject.icons || [];
                imageArray.forEach(image => {
                    if (image.sizes === link.imageSize) {
                        link.content = image.src;
                        if (image.purpose) {
                            link.purpose = image.purpose; // purpose を追加
                        }
                    }
                });
            } else {
                link.content = manUpObject[link.manifestName];
            }
        }
    });
    return validLinkValues;
};

// メタタグ生成
var generateMetaArray = function () {
    var tempMetaArray = generateFullMetaData();
    var headTarget = document.getElementsByTagName('head')[0];
    tempMetaArray.forEach(meta => {
        if (!isTagExists('meta', 'name', meta.name)) {
            var metaTag = document.createElement('meta');
            metaTag.name = meta.name;
            metaTag.content = meta.content;
            headTarget.appendChild(metaTag);
        }
    });
};

// リンクタグ生成
var generateLinkArray = function () {
    var tempLinkArray = generateFullLinkData();
    var headTarget = document.getElementsByTagName('head')[0];
    tempLinkArray.forEach(link => {
        if (!isTagExists('link', 'rel', link.name)) {
            var linkTag = document.createElement('link');
            linkTag.setAttribute('rel', link.name);
            linkTag.setAttribute('sizes', link.imageSize);
            linkTag.setAttribute('href', link.content);
            if (link.purpose) {
                linkTag.setAttribute('purpose', link.purpose); // purpose 属性を追加
            }
            headTarget.appendChild(linkTag);
        }
    });
};

// Manifest のデータ生成
var generateObj = function (ajaxString) {
    manUpObject = JSON.parse(ajaxString);
    generateLinkArray();
    generateMetaArray();
};

// Ajax を fetch に置き換え
var makeAjax = function (url) {
    fetch(url)
        .then(response => {
            if (response.ok) return response.text();
            throw new Error('Failed to load manifest');
        })
        .then(generateObj)
        .catch(console.error);
};

// Manifest を取得
var collectManifestObj = function () {
    var links = document.getElementsByTagName('link');
    for (var i = 0; i < links.length; i++) {
        if (links[i].rel && links[i].rel === 'manifest') {
            makeAjax(links[i].href);
        }
    }
};

// PWA 対応ブラウザを判定して処理を実行
var isPWASupported = function () {
    return 'serviceWorker' in navigator && 'PushManager' in window;
};

if (!isPWASupported()) {
    collectManifestObj();
}
