import Tokenizer from '../src/js/workers/tokenizer';

describe('Tokenizer', () =>
{
    test('getBetweenStr', () =>
    {
        expect(Tokenizer.getBetweenStr('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', '(', ')')).toBe('( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )')
    })
    test('removeStr', () =>
    {
        expect(Tokenizer.removeStr('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', '(')).toBe('void TracePlane out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )')
    })
    test('removeAllBetween', () =>
    {
        expect(Tokenizer.removeAllBetween('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', /\(/, '(', ')')).toBe('void TracePlane')
        expect(Tokenizer.removeAllBetween('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', /\(/, '(', ')')).toBe('void TracePlane')
    })
    test('removeAllNested', () =>
    {
        expect(Tokenizer.removeAllNested('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )', /\(/, '(', ')')).toBe('void TracePlane')
        expect(Tokenizer.removeAllNested('void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, (float fObjectId) )', /\(/, '(', ')')).toBe('void TracePlane')
    })
    test('removeBlockComment', () =>
    {
        expect(Tokenizer.removeBlockComment('void TracePlane( /*out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, */float fPlaneDist, float fObjectId )', /\(/, '(', ')')).toBe('void TracePlane( float fPlaneDist, float fObjectId )')
    })
})