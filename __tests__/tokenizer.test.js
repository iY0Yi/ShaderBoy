'use strict'
const { promisify } = require('util')
const fs = require('fs')

import Tokenizer from '../src/js/workers/tokenizer'
const fileUrl = './__tests__/glsl/'

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function main()
{
    describe('Tokenizer', () =>
    {
        test('unit: getBetweenStr', () =>
        {
            expect(Tokenizer.getBetweenStr('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', '(', ')')).toBe('( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )')
        })
        test('unit: removeStr', () =>
        {
            expect(Tokenizer.removeStr('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', '(')).toBe('void TracePlane out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )')
        })
        test('unit: removeAllBetween', () =>
        {
            expect(Tokenizer.removeAllBetween('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', /\(/, /\)/, '(', ')')).toBe('void TracePlane')
            expect(Tokenizer.removeAllBetween('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', /\(/, /\)/, '(', ')')).toBe('void TracePlane')
        })
        test('unit: removeAllNested', () =>
        {
            expect(Tokenizer.removeAllNested('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', /\(/, '(', ')')).toBe('void TracePlane')
            expect(Tokenizer.removeAllNested('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, (float fObjectId) )', /\(/, '(', ')')).toBe('void TracePlane')
        })
        test('unit: removeBlockComment', () =>
        {
            expect(Tokenizer.removeBlockComment('void TracePlane( /*out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, */float fPlaneDist, float fObjectId )', /\(/, '(', ')')).toBe('void TracePlane( float fPlaneDist, float fObjectId )')
            expect(Tokenizer.removeBlockComment('void TracePlane(\n/**\n                * Return a transform matrix that will transform a ray from view space\n                * to world coordinates, given the eye point, the camera target, and an up vector.\n                *\n                * This assumes that the center of the camera is aligned with the negative z axis in\n                * view space when calculating the ray marching direction. See rayDirection.\n                */float fPlaneDist, float fObjectId )', /\(/, '(', ')')).toBe('void TracePlane(\nfloat fPlaneDist, float fObjectId )')
        })

        test('Function: Remove whitespaces & types qualifiers', () =>
        {
            const gl_TypesQualifiers = ['', 'inout']
            const gl_Const = ['', 'const']
            const whitespaces = [' ', '\t']
            const whitespaces_empty = ['', ' ', '\t']
            let line = ''
            const answer = Tokenizer.parseFunctionLine('float fncName(float var1){;')[0].getData().toString()

            for (const ws0 of whitespaces_empty)
            {
                for (const ws1 of whitespaces)
                {
                    for (const ws2 of whitespaces_empty)
                    {
                        for (const ws3 of whitespaces_empty)
                        {
                            for (const cnst of gl_Const)
                            {
                                for (const ws4 of whitespaces)
                                {
                                    for (const a1Tq of gl_TypesQualifiers)
                                    {
                                        for (const ws5 of whitespaces)
                                        {
                                            for (const ws6 of whitespaces)
                                            {
                                                for (const ws7 of whitespaces_empty)
                                                {
                                                    const line = ws0 + 'float' + ws1 + 'fncName' + ws2 + '(' + ws3 + cnst + ws4 + a1Tq + ws5 + 'float' + ws6 + 'var1' + ws7 + '){;'
                                                    // console.log(line)
                                                    expect(Tokenizer.parseFunctionLine(line)[0].getData().toString()).toBe(answer)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        test('Actual Shadertoy codes', async () =>
        {
            const filenames = await promisify(fs.readdir)(fileUrl)
            console.log(filenames)
            const exclusion = [
                // 'Cheesy.fs',
                'Clouds.fs',
                'Creation by Silexars.fs',
                'Elevated.bufA.fs',
                'Elevated.img.fs',
                'Find the Restroom.fs',
                'Flame.fs',
                'Meta CRT.bufA.fs',
                'Meta CRT.bufB.fs',
                'Meta CRT.bufC.fs',
                'Meta CRT.bufD.fs',
                'Meta CRT.cubeA.fs',
                'Meta CRT.img.fs',
                'Rainforest.bufA.fs',
                'Rainforest.img.fs',
                'Ray Marching- Part 6.fs',
                'Raymarching - Primitives.fs',
                'Seascape.fs',
                'Snail.fs',
                'Super Shader GUI 98.bufA.fs',
                'Super Shader GUI 98.img.fs',
                'Supershape 3D.fs',
                'Umbrellar.fs',
                'Volcanic.bufA.fs',
                'Volcanic.img.fs',
                'Wolfenstein 3D.fs',
                '[NV15] DIY Spaceman Cave.img.fs',
                '[NV15] DIY Spaceman Cave.snd.fs',
                'llamels.fs',
                'paxis2.img.fs',
                'paxis2.snd.fs'
            ]

            for (const filename of filenames)
            {
                if (exclusion.find(name => name === filename) === undefined)
                {
                    // console.log(filename)
                    const fullPath = fileUrl + filename
                    let str = await promisify(fs.readFile)(fullPath, 'utf-8')
                    str = Tokenizer.removeBlockComment(str)
                    str = Tokenizer.removeInlineComment(str)
                    str = Tokenizer.removePrecisions(str)
                    str = Tokenizer.removePreProcessor(str)

                    const isValidTypeName = (kw) =>
                    {
                        let res = true
                        res = res && kw.name !== null && kw.type !== null
                        res = res && kw.name.match(/[ ]/) === null
                        res = res && kw.type.match(/[^a-zA-Z0-9#_-]/) === null// && kw.type.match(/#define/) === null)
                        return res
                    }

                    let isPassedStructs = true
                    const structsRes = Tokenizer.parseStructs(str)
                    for (const struct of structsRes)
                    {
                        if (!isValidTypeName(struct))
                        {
                            console.log(filename, struct)
                        }
                        // console.log(filename, struct)

                        isPassedStructs = isPassedStructs && isValidTypeName(struct)
                        if (struct.members)
                        {
                            const members = struct.members
                            for (const member of members)
                            {
                                if (!isValidTypeName(member))
                                {
                                    console.log(filename, member)
                                }
                                isPassedStructs = isPassedStructs && isValidTypeName(member)
                            }
                        }
                    }

                    let isPassedMacrosFunctionsVariables = true
                    const mfvRes = Tokenizer.parseMacrosFunctionsVariables(str)

                    for (const mfv of mfvRes)
                    {
                        if (!isValidTypeName(mfv[0]))
                        {
                            console.log(filename, mfv[0])
                        }
                        isPassedMacrosFunctionsVariables = isPassedMacrosFunctionsVariables && isValidTypeName(mfv[0])
                        if (mfv[0].args)
                        {
                            const args = mfv[0].args
                            for (const arg of args)
                            {
                                if (!isValidTypeName(arg))
                                {
                                    console.log(filename, arg)
                                }
                                isPassedMacrosFunctionsVariables = isPassedMacrosFunctionsVariables && isValidTypeName(arg)
                            }
                        }
                    }

                    expect(isPassedStructs).toBeTruthy()
                    expect(isPassedMacrosFunctionsVariables).toBeTruthy()
                }
            }
        })
    })
}

main()