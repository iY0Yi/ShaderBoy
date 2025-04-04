import key from 'keymaster'
import ShaderBoy from '../shaderboy'

let panelEl = null
let btns = []
let list_local = []
let shadernum = 0
let sortBy = 'date'

export default ShaderBoy.gui_panel_shaderlist = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setup(list)
    {
        console.log('gui_panel_shaderlist.setup(list)')

        shadernum = 0
        panelEl = document.getElementById('gp-shader-list')
        if (list === undefined)
        {
            shadernum = 12
        }
        else
        {
            while (panelEl.hasChildNodes())
            {
                panelEl.removeChild(panelEl.lastChild)
            }
            shadernum = list.length
            list_local = list
            btns = []
        }
    },

    addThumbBtn(shader)
    {
        const btnEl = document.createElement('div')
        btnEl.className = 'btn'
        btnEl.setAttribute('name', shader.name)

        if (shader.folderId) {
            btnEl.setAttribute('folderId', shader.folderId)
        }

        const btn_thumb = document.createElement('div')
        btn_thumb.className = 'btn-thumb'

        // 初期プレースホルダー画像（またはロード中インジケータ）
        if (shader.thumb) {
            btn_thumb.style.backgroundImage = shader.thumb
        } else {
            // プレースホルダーのサムネイル画像
            btn_thumb.style.backgroundImage = 'url("/img/loading-thumbnail.svg")'
        }

        const btn_name = document.createElement('div')
        btn_name.className = 'btn-name'
        btn_name.textContent = shader.name

        btnEl.appendChild(btn_thumb)
        btnEl.appendChild(btn_name)

        btnEl.onclick = (e) =>
        {
            e.stopPropagation()
            const targetBtn = e.target.closest('.btn')
            const name = targetBtn.getAttribute('name')
            const btnNum = btns.length;
            for (let i = 0; i < btnNum; i++)
            {
                if (btns[i].el == e.target.parentElement)
                {
                    btns[i].el.classList.toggle('btn-activate')

                    setTimeout(() =>
                    {
                        btns[i].el.classList.toggle('btn-activate')
                    }, Math.floor(1000 * 0.8))
                }
                else
                {
                    btns[i].el.classList.toggle('btn-hide')
                    setTimeout(() =>
                    {
                        btns[i].el.classList.toggle('btn-hide')
                    }, Math.floor(1000 * 0.8))
                }
            }

            const containerEl = document.getElementById('gui-panel')
            const gpbaseEl = document.getElementById('gp-base')
            containerEl.classList.toggle("gp-container-appear")
            gpbaseEl.classList.toggle("gp-appear")
            containerEl.classList.toggle("gp-container-hide")
            gpbaseEl.classList.toggle("gp-hide")

            setTimeout(() =>
            {
                containerEl.classList.toggle("gp-container-hide")
                gpbaseEl.classList.toggle("gp-hide")
                containerEl.classList.toggle("gp-container-hidden")
                gpbaseEl.classList.toggle("gp-hidden")
            }, Math.floor(1000 * 0.8))

            key.unbind('d', 'default')
            key.unbind('n', 'default')
            key.unbind('esc', 'default')

            ShaderBoy.io.loadShaderFiles(name)
        }

        btnEl.onmouseenter = (e) =>
        {
            if (e.target.classList.contains('hover') !== true)
            {
                e.target.classList.toggle("hover")
            }
        }

        btnEl.onmouseleave = (e) =>
        {
            if (e.target.classList.contains('hover'))
            {
                e.target.classList.remove("hover")
            }

            if (e.target.classList.contains('pre-active'))
            {
                e.target.classList.remove("pre-active")
                e.target.classList.toggle("active")
            }
        }
        panelEl.appendChild(btnEl)

        btns.push({
            el: btnEl,
            name: shader.name,
            modifiedTime: shader.modifiedTime
        })
    },

    createShaderBtn(shader)
    {
        console.log('gui_panel_shaderlist.createShaderBtn(shader)')
        console.log(shader)
        const btn = document.createElement('div')
        const btn_thumb = document.createElement('div')
        const btn_detector = document.createElement('div')
        const btn_base = document.createElement('div')
        const btn_hover = document.createElement('div')

        const name_base = document.createElement('span')
        const name_hover = document.createElement('span')

        name_base.textContent = shader.name
        name_hover.textContent = shader.name
        btn_base.appendChild(name_base)
        btn_hover.appendChild(name_hover)

        btn.classList.add('btn')
        btn.classList.add('show')
        btn_thumb.classList.add('btn-thumb')
        btn_thumb.style.backgroundImage = 'url("data:image/svg+xml;charset=utf8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%2214.43px%22%20height%3D%2214.43px%22%20viewBox%3D%220%200%2014.43%2014.43%22%20style%3D%22enable-background%3Anew%200%200%2014.43%2014.43%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%20.st0%7Bfill-rule%3Aevenodd%3Bclip-rule%3Aevenodd%3Bfill%3A%23D8D5C4%3B%7D%3C%2Fstyle%3E%3Cdefs%3E%3C%2Fdefs%3E%3Cg%3E%20%3Cg%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M7.21%2C0C3.23%2C0%2C0%2C3.23%2C0%2C7.21s3.23%2C7.21%2C7.21%2C7.21s7.21-3.23%2C7.21-7.21S11.2%2C0%2C7.21%2C0z%20M4.21%2C8.21%20c-0.55%2C0-1-0.45-1-1s0.45-1%2C1-1s1%2C0.45%2C1%2C1S4.77%2C8.21%2C4.21%2C8.21z%20M7.21%2C8.21c-0.55%2C0-1-0.45-1-1s0.45-1%2C1-1s1%2C0.45%2C1%2C1%20S7.77%2C8.21%2C7.21%2C8.21z%20M10.21%2C8.21c-0.55%2C0-1-0.45-1-1s0.45-1%2C1-1s1%2C0.45%2C1%2C1S10.77%2C8.21%2C10.21%2C8.21z%22%2F%3E%20%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E")'
        btn_thumb.style.backgroundSize = '16px 16px'
        btn_thumb.style.backgroundRepeat = 'no-repeat'
        btn_detector.classList.add('btn-detector')
        btn_base.classList.add('btn__base')
        btn_hover.classList.add('btn__hover')
        btn.appendChild(btn_thumb)
        btn.appendChild(btn_base)
        btn.appendChild(btn_hover)
        btn.appendChild(btn_detector)
        if (shader.thumb !== '')
        {
            btn_thumb.style.backgroundImage = shader.thumb
            btn_thumb.style.backgroundSize = '100% 100%'
        }

        return btn
    },

    sort()
    {
        console.log('sort(): ', sortBy)

        const btns = Array.from(panelEl.children)

        if(sortBy==='date')
        {
            btns.sort((a, b) =>
            {
                const timeA = new Date(a.getAttribute('modifiedTime'))
                const timeB = new Date(b.getAttribute('modifiedTime'))
                return timeB - timeA
            })
        }
        else if(sortBy==='name')
        {
            btns.sort((a, b) => {
                const nameA = a.getAttribute('name').toLowerCase()
                const nameB = b.getAttribute('name').toLowerCase()
                return nameA.localeCompare(nameB)
            })
        }

        while (panelEl.firstChild) {
            panelEl.removeChild(panelEl.firstChild)
        }
        btns.forEach(btn => {
            panelEl.appendChild(btn)
        })
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    show()
    {
        let textformEl = document.getElementById('gp-textarea')
        let shaderlistEl = document.getElementById('gp-shader-list')
        if (!textformEl.classList.contains('hide')) textformEl.classList.add('hide')
        if (shaderlistEl.classList.contains('hide')) shaderlistEl.classList.remove('hide')

        const containerEl = document.getElementById('gui-panel')
        const gpbaseEl = document.getElementById('gp-base')
        containerEl.classList.toggle("gp-container-appear")
        gpbaseEl.classList.toggle("gp-appear")
        containerEl.classList.toggle("gp-container-hidden")
        gpbaseEl.classList.toggle("gp-hidden")

        this.sort()
    },

    // サムネイル更新用の新しいメソッド
    updateThumb(folderId, thumbUrl) {
        const btnEl = panelEl.querySelector(`.btn[folderId="${folderId}"]`);
        if (btnEl) {
            const thumbEl = btnEl.querySelector('.btn-thumb');
            if (thumbEl) {
                thumbEl.style.backgroundImage = thumbUrl;
            }
        }
    },

    // 可視サムネイルの読み込み優先処理
    loadVisibleThumbnailsFirst() {
        // すでにリストに表示されているフォルダID一覧を取得
        const visibleFolderIds = [];
        const viewportHeight = window.innerHeight;
        const panelRect = panelEl.getBoundingClientRect();

        // 画面内または近い位置にあるボタンのみを選択
        btns.forEach(btn => {
            const btnRect = btn.el.getBoundingClientRect();
            // 要素が画面内か、画面から200px以内にある場合
            if (btnRect.bottom >= -200 && btnRect.top <= viewportHeight + 200) {
                const folderId = btn.el.getAttribute('folderId');
                if (folderId) {
                    visibleFolderIds.push({
                        id: folderId,
                        name: btn.name,
                        distance: Math.abs(btnRect.top - (viewportHeight/2)) // 画面中央からの距離
                    });
                }
            }
        });

        // 画面中央に近い順にソート
        visibleFolderIds.sort((a, b) => a.distance - b.distance);

        // この順序をio.jsに渡して優先的に読み込めるようにする
        return visibleFolderIds;
    },

    // スクロールイベントリスナーを設定
    setupScrollListener() {
        let scrollTimeout;
        panelEl.addEventListener('scroll', () => {
            // スクロール中は連続して呼ばれないようにデバウンス
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const visibleIds = this.loadVisibleThumbnailsFirst();
                if (visibleIds.length > 0 && typeof ShaderBoy.io.prioritizeThumbnails === 'function') {
                    ShaderBoy.io.prioritizeThumbnails(visibleIds);
                }
            }, 100);
        });
    }
}