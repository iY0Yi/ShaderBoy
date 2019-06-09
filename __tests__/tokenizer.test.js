'use strict'
const { promisify } = require('util')
const fs = require('fs')

import Tokenizer from '../src/js/workers/tokenizer'
const fileUrl = './__tests__/glsl/'

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
            expect(Tokenizer.removeAllBetween('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', /\(/, '(', ')')).toBe('void TracePlane')
            expect(Tokenizer.removeAllBetween('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', /\(/, '(', ')')).toBe('void TracePlane')
        })
        test('unit: removeAllNested', () =>
        {
            expect(Tokenizer.removeAllNested('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', /\(/, '(', ')')).toBe('void TracePlane')
            expect(Tokenizer.removeAllNested('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, (float fObjectId) )', /\(/, '(', ')')).toBe('void TracePlane')
        })
        test('unit: removeBlockComment', () =>
        {
            expect(Tokenizer.removeBlockComment('void TracePlane( /*out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, */float fPlaneDist, float fObjectId )', /\(/, '(', ')')).toBe('void TracePlane( float fPlaneDist, float fObjectId )')
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
            for (const filename of filenames)
            {
                const fullPath = fileUrl + filename
                let str = await promisify(fs.readFile)(fullPath, 'utf-8')
                str = Tokenizer.removePrecisions(str)
                str = Tokenizer.removePreProcessor(str)

                let isPassedStructs = true
                const structsRes = Tokenizer.parseStructs(str)
                for (const struct of structsRes)
                {
                    isPassedStructs = struct.name !== null && struct.type !== null
                    if (struct.name === null || struct.type === null) console.log(struct)
                    // console.log(struct)
                }

                let isPassedMacrosFunctionsVariables = true
                const mfvRes = Tokenizer.parseMacrosFunctionsVariables(str)
                for (const mfv of mfvRes)
                {
                    isPassedMacrosFunctionsVariables = mfv.name !== null && mfv.type !== null
                    if (mfv.name === null || mfv.type === null) console.log(mfv)
                }
                expect(isPassedStructs && isPassedMacrosFunctionsVariables).toBeTruthy()
            }
        })
    })
}

main()