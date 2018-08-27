import flatten from 'lodash.flatten';

// finds uniforms with name starting with "ui",
// currently matches only float, vec2, vec3, vec4
const findUniforms = (shaderStr) => {
    const s = shaderStr.split('\n');
    let uni = [];

    let uiuni = [];
    for (let i = 0; i < s.length; i++) {
        if (s[i].split(' ')[0] === 'uniform') {
            uni[uni.length] = s[i];
        }
    }
    for (let i = 0; i < uni.length; i++) {
        let words = uni[i].split(' ');
        let isUI = (uni[i].split(' ui').length === 2);
        if (isUI === true) {
            let key = words[2].replace(/\;/g, '');
            uiuni[uiuni.length] = {
                type: words[1],
                key: key
            };
        }
    }
    console.log('Found ' + uiuni.length + ' uniforms for UI.');
    for (let i = 0; i < uiuni.length; i++) { console.log('✔ ' + uiuni[i].type, uiuni[i].key); }
    return uiuni;
};

// generates UI from shader string
const generateUI = (gui, shader, { remember } = { remember: true }) => {
    const uniforms = findUniforms(shader);
    const paramsStruct = uniforms.map(({ key, type }) => {
        if (type === 'float') {
            return [{ [`${key}`]: 0.01 }];
        }
        else if (type.startsWith('vec')) {
            return [
                { [`${key}.x`]: 0.01 },
                { [`${key}.y`]: 0.01 },
                { [`${key}.z`]: 0.01 },
                { [`${key}.w`]: 0.01 }
            ].slice(0, parseInt(type.replace('vec', '')));
        }
    });

    // output params
    let outParams = flatten(paramsStruct).reduce((memo, value) => Object.assign(memo, value), {});

    // remember state - especially helpful with localStorage set to true
    // NOT: this HAS to be called before any gui.add!
    if (remember) { gui.remember(outParams); }

    // add folders to DAT.GUI
    paramsStruct.forEach((params, i) => {
        // const folder = gui.addFolder(uniforms[i].key);
        params.forEach(params => {
            let slider = gui.add(outParams, Object.keys(params)[0], 0.0, 1.0);
        });

        // folder.open();
    });

    // return params
    return outParams;
};

// updates shader uniforms with params for glsl-toy
export const updateUIUniforms = (uniforms, params) => {
    const realParams = Array.from(Object.keys(params)
        .reduce((memo, key) => {
            if (key.indexOf('.') > 0) {
                const realKey = key.split('.')[0];
                memo.add(realKey);
            }
            else {
                memo.add(key);
            }

            return memo;
        }, new Set()));
    realParams.forEach(param => {
        if (params[param]) {
            let pname = param;
            eval("uniforms." + [param] + " = params[param];");
        }
        else {
            const value = ['x', 'y', 'z', 'w']
                .map(key => params[`${param}.${key}`])
                .filter(value => value !== undefined);
            eval("uniforms." + [param] + " = value;");
        }
    });
};
export default generateUI;
