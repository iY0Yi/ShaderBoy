// Shadertoy URL: https://www.shadertoy.com/view/Xs2cR1

const int
    DATA_UICONTEXT						= 0,	
	DATA_CHECKBOX_SHOW_IMAGE 			= 1,
	DATA_WINDOW_CONTROLS   				= 2,
	DATA_BACKGROUND_IMAGE				= 3,
	DATA_BACKGROUND_BRIGHTNESS			= 4,
	DATA_BACKGROUND_SCALE        		= 5,
	DATA_WINDOW_IMAGE_CONTROL			= 6,
	DATA_IMAGE_BRIGHTNESS 				= 7,
	DATA_WINDOW_IMAGEA					= 8,
	DATA_WINDOW_IMAGEB					= 9,
    DATA_BUTTONA						= 10,
    DATA_BG_COLOR						= 11,
    DATA_IMAGE_COLOR					= 12,
    DATA_WINDOW_EDIT_COLOR				= 13,
    DATA_EDIT_WHICH_COLOR				= 14,
    DATA_SCROLLBAR_PANEL				= 15;
    
const int
    IDC_CHECKBOX_SHOW_IMAGE 			= 0,
	IDC_WINDOW_CONTROLS      			= 1,
	IDC_CHECKBOX_BACKGROUND_IMAGE 		= 2,
	IDC_SLIDER_BACKGROUND_BRIGHTNESS	= 3,
	IDC_SLIDER_BACKGROUND_SCALE        	= 4,
	IDC_WINDOW_IMAGE_CONTROL			= 5,
	IDC_SLIDER_IMAGE_BRIGHTNESS			= 6,
	IDC_WINDOW_IMAGEA   				= 7,
	IDC_WINDOW_IMAGEB   				= 8,
    IDC_BUTTONA							= 9,
    IDC_BUTTONB							= 10,
    IDC_WINDOW_EDIT_COLOR       		= 11,
    IDC_COLOR_PICKER 					= 12,
    IDC_SCROLLBAR_PANEL					= 13;


// Super Shader GUI
// https://www.shadertoy.com/view/Xs2cR1
// Shadertoy UI framework - @P_Malin

// Todo: 
// * window stacking order?

#define iChannelUI 			iChannel0
#define iChannelKeyboard 	iChannel1
#define iChannelFont 		iChannel2

#define SHADOW_TEST

//#define NEW_THEME

#ifdef NEW_THEME
vec3 cCheckboxOutline = vec3(0.4);
vec3 cSliderLineCol = vec3(0.7);
vec3 cSliderHandleOutlineCol = vec3(0.5);
vec3 cButtonActive = vec3(0.6, 0.6, 0.9 );
vec3 cButtonInactive = vec3( 0.5 );
vec3 cWindowBorder = vec3(0.5, 0.5, 0.6 );
vec3 cActiveWindowBorder = vec3(0.3, 0.3, 0.5 );
vec3 cWindowBackgroundColor = vec3(0.9);
const vec3 cTitleBarA = vec3(0.7);
const vec3 cTitleBarB = cTitleBarA + 0.1;
vec3 cTitleBarAActive = cTitleBarA + 0.05;
vec3 cTitleBarBActive = cTitleBarB + 0.05; 
vec3 cWindowTitle = vec3(0.0);
vec3 cResize = vec3( 0.7 );
vec3 cResizeActive = vec3( 0.8 );
vec3 cScrollPanelCorner = vec3(0.6);
vec3 cScrollPanelCornerOutline = vec3(0.7);
#else
vec3 cWindowBackgroundColor = vec3(0.75);
const vec3 cTitleBarA = vec3(0.0, 0.0, 0.5);
const vec3 cTitleBarB = vec3(0.03, 0.5, 0.8);
vec3 cTitleBarAActive = cTitleBarA + 0.1;
vec3 cTitleBarBActive = cTitleBarB + 0.1; 
vec3 cWindowTitle = vec3(1.0);        
vec3 cResize = vec3( 0.6 );
vec3 cResizeActive = vec3( 0.8 );
vec3 cScrollPanelCorner = vec3(0.7);
#endif

///////////////////////////
// Data Storage
///////////////////////////

vec4 LoadVec4( sampler2D sampler, in ivec2 vAddr )
{
    return texelFetch( sampler, vAddr, 0 );
}

vec3 LoadVec3( sampler2D sampler, in ivec2 vAddr )
{
    return LoadVec4( sampler, vAddr ).xyz;
}

bool AtAddress( ivec2 p, ivec2 c ) { return all( equal( p, c ) ); }

void StoreVec4( in ivec2 vAddr, in vec4 vValue, inout vec4 fragColor, in ivec2 fragCoord )
{
    fragColor = AtAddress( fragCoord, vAddr ) ? vValue : fragColor;
}

void StoreVec3( in ivec2 vAddr, in vec3 vValue, inout vec4 fragColor, in ivec2 fragCoord )
{
    StoreVec4( vAddr, vec4( vValue, 0.0 ), fragColor, fragCoord);
}

///////////////////////////
// Rect
///////////////////////////

struct Rect
{
    vec2 vPos;
    vec2 vSize;
};      

bool Inside( vec2 vPos, vec2 vMin, vec2 vMax )
{
    return all( greaterThanEqual( vPos, vMin ) ) && all( lessThan( vPos, vMax ) );
}

bool Outside( vec2 vPos, vec2 vMin, vec2 vMax )
{
    return any( lessThan( vPos, vMin ) ) || any( greaterThanEqual( vPos, vMax ) );
}

bool Inside( vec2 vPos, Rect rect )
{
    return Inside( vPos, rect.vPos, rect.vPos + rect.vSize );
}
    
bool Outside( vec2 vPos, Rect rect )
{
    return Outside( vPos, rect.vPos, rect.vPos + rect.vSize );
}

void RectExpand( inout Rect region, vec2 vPadding )
{
    // Padding
    region.vPos -= vPadding;
    region.vSize += vPadding * 2.0;        
}

void RectShrink( inout Rect region, vec2 vPadding )
{
    RectExpand( region, -vPadding);
}

///////////////////////////
// Font
///////////////////////////

// Font printing based on https://www.shadertoy.com/view/ldfcDr

#define AUTO_FONT_SPACING
//#define HANDLE_EOL
//#define HANDLE_PRINT_STYLES

// Font characters
const uint
   	// HTML Entity Names
    
    _SP = 0x20u,		// ' '
    _EXCL = 0x21u, 		// '!' 
    _QUOT = 0x22u, 		// '"'
    _NUM = 0x23u,  		// '#'
    _DOLLAR = 0x24u, 	// '$'
    _PERCNT = 0x25u, 	// '%'
    _AMP = 0x26u, 		// '&'
    _APOS = 0x27u,		// '''    
    _LPAR = 0x28u, 		// '('
    _RPAR= 0x29u, 		// ')'
    _AST = 0x2Au,		// '*'
    _PLUS = 0x2Bu,		// '+'
    _COMMA = 0x2Cu,		// ','    
    _MINUS = 0x2Du,		// '-'
    _PERIOD = 0x2Eu,	// '.'
    _SOL = 0x2Fu,		// '/' 

    _0 = 0x30u, _1 = 0x31u, _2 = 0x32u, _3 = 0x33u, _4 = 0x34u, 
    _5 = 0x35u, _6 = 0x36u, _7 = 0x37u, _8 = 0x38u, _9 = 0x39u, 

    _COLON = 0x3Au,		// ':' 
    _SEMI = 0x3Bu,		// ';' 
    _LT = 0x3Cu,		// '<' 
    _EQUALS = 0x3Du,	// '=' 
    _GT = 0x3Eu,		// '>' 
    _QUEST = 0x3Fu,		// '?' 
    _COMAT = 0x40u,		// '@' 
    
    _A = 0x41u, _B = 0x42u, _C = 0x43u, _D = 0x44u, _E = 0x45u, 
    _F = 0x46u, _G = 0x47u, _H = 0x48u, _I = 0x49u, _J = 0x4Au,
    _K = 0x4Bu, _L = 0x4Cu, _M = 0x4Du, _N = 0x4Eu, _O = 0x4Fu,
    _P = 0x50u, _Q = 0x51u, _R = 0x52u, _S = 0x53u, _T = 0x54u,
    _U = 0x55u, _V = 0x56u, _W = 0x57u, _X = 0x58u, _Y = 0x59u,
    _Z = 0x5Au,

    _LSQB = 0x5Bu,		// '[' 
    _BSOL = 0x5Cu,		// '\'
    _RSQB = 0x5Du,		// ']' 
    _CIRC = 0x5Eu,		// '^' 
    _LOWBAR = 0x5Fu,	// '_' 
    _GRAVE = 0x60u,		// '`' 
    
    _a = 0x61u, _b = 0x62u, _c = 0x63u, _d = 0x64u, _e = 0x65u,
    _f = 0x66u, _g = 0x67u, _h = 0x68u, _i = 0x69u, _j = 0x6Au,
    _k = 0x6Bu, _l = 0x6Cu, _m = 0x6Du, _n = 0x6Eu, _o = 0x6Fu,
    _p = 0x70u, _q = 0x71u, _r = 0x72u, _s = 0x73u, _t = 0x74u,
    _u = 0x75u, _v = 0x76u, _w = 0x77u, _x = 0x78u, _y = 0x79u,
    _z = 0x7Au

	,_LCUB = 0x7Bu		// '{'
    ,_VERBAR = 0x7Cu	// '|'
    ,_RCUB = 0x7Du		// '}'
    ,_TILDE = 0x7Eu		// '~'
    
#ifdef HANDLE_EOL       
    ,_EOL = 0x1000u 	// End of Line - Carriage Return & Line Feed    
#endif    
#ifdef HANDLE_PRINT_STYLES    
    ,_BOLDON = 0x1001u	// Special
    ,_BOLDOFF = 0x1002u	// Special
    ,_ITALON = 0x1003u	// Special
    ,_ITALOFF = 0x1004u	// Special    
#endif    
;


vec4 SampleCharacterTex( uint iChar, vec2 vCharUV )
{
    uvec2 iChPos = uvec2( iChar % 16u, iChar / 16u );
    vec2 vUV = (vec2(iChPos) + vCharUV) / 16.0f;
    return textureLod( iChannelFont, vUV, 0.0 );
}
    
vec4 SampleCharacter( uint iChar, vec2 vCharUV )
{
    uvec2 iChPos = uvec2( iChar % 16u, iChar / 16u );
    vec2 vClampedCharUV = clamp(vCharUV, vec2(0.01), vec2(0.99));
    vec2 vUV = (vec2(iChPos) + vClampedCharUV) / 16.0f;

    vec4 vSample;
    
    float l = length( (vClampedCharUV - vCharUV) );

    // Skip texture sample when not in character boundary
    // Ok unless we have big font weight
    if ( l > 0.01f )
    {
        vSample.rgb = vec3(0);
		vSample.w = 2000000.0; 
    }
    else
    {
		vSample = textureLod( iChannelFont, vUV, 0.0 );    
        vSample.gb = vSample.gb * 2.0f - 1.0f;
        vSample.a -= 0.5f + 1.0/256.0;    
    }
        
    return vSample;
}


struct CharExtents
{
    float left;
    float width;
};
    
// Auto font spacing adapted from Klems shader: https://www.shadertoy.com/view/MsfyDN
float CharVerticalPos(uint iChar, vec2 vUV) 
{
    vec4 vSample = SampleCharacterTex(iChar, vUV);
    float dist = vSample.a - (127.0/255.0);
    dist *= vSample.g * 2.0 - 1.0;
    return vUV.x - dist;
}

CharExtents GetCharExtents( uint iChar )
{
    CharExtents result;

    result.left = CharVerticalPos( iChar, vec2(0.02, 0.5) );
    float right = CharVerticalPos( iChar, vec2(0.98, 0.5) );
    result.width = right - result.left;
    
    if ( iChar == _SP )
    {
        result.left = 0.3f;
        result.width = 0.4f;
    }
    return result;
}

struct PrintState
{
    vec2 vPixelPos;
    
    vec2 vLayoutStart;
    // print position
    vec2 vCursorPos;
    vec2 vPixelSize;

#ifdef HANDLE_EOL
    bool EOL;
#endif

    // result
    float fDistance;
};    

void MoveTo( inout PrintState state, vec2 vPos )
{
    state.vLayoutStart = vPos;
    state.vCursorPos = vPos;
#ifdef HANDLE_EOL
    state.EOL = false;
#endif
}

void ClearPrintResult( inout PrintState state )
{
    state.fDistance = 1000000.0;   
}

PrintState PrintState_InitCanvas( vec2 vCoords, vec2 vPixelSize )
{
    PrintState state;
    state.vPixelPos = vCoords;
    state.vPixelSize = vPixelSize;
    
    MoveTo( state, vec2(0) );

    ClearPrintResult( state );
    
    return state;
}

struct LayoutStyle
{
    vec2 vSize;
    float fLineGap;
    float fAdvancement;
#ifdef HANDLE_PRINT_STYLES    
    bool bItalic;
    bool bBold;  
#endif    
};
    
LayoutStyle LayoutStyle_Default()
{
    LayoutStyle style;
    style.vSize = vec2(24.0f, 32.0f);    
    style.fLineGap = 0.1f;
    style.fAdvancement = 0.1f;
#ifdef HANDLE_PRINT_STYLES    
    style.bItalic = false;
    style.bBold = false;       
#endif    
    return style;
}

struct RenderStyle
{
    vec3 vFontColor;
    float fFontWeight;   
};

RenderStyle RenderStyle_Default( vec3 vFontColor )
{
    RenderStyle style;
    style.vFontColor = vFontColor;
    style.fFontWeight = 0.0f;  
    return style;
}

const float g_fFontDescent = 0.15f;
const float g_fFontAscent = 0.65f;

void PrintEndCurrentLine( inout PrintState state, const LayoutStyle style )
{
    // Apply CR
    state.vCursorPos.x = state.vLayoutStart.x;
    
    // advance Y position to bottom of descender based on current font size.
	state.vCursorPos.y += style.vSize.y * g_fFontDescent;    
}

void PrintBeginNextLine( inout PrintState state, const LayoutStyle style )
{
    // move Y position to baseline based on current font size
	state.vCursorPos.y += style.vSize.y * (g_fFontAscent + style.fLineGap);
}

#ifdef HANDLE_EOL
void PrintEOL( inout PrintState state, const LayoutStyle style )
{
    if ( state.EOL )
    {
        PrintBeginNextLine( state, style );
    }
    PrintEndCurrentLine( state, style );
    state.EOL = true;
}
#endif

void PrintCh( inout PrintState state, inout LayoutStyle style, const uint iChar )
{
#ifdef HANDLE_EOL
    if ( iChar == _EOL )
    {
        PrintEOL( state, style );
        return;
    }
    else
#endif
#ifdef HANDLE_PRINT_STYLES            
    if ( iChar == _BOLDON )
    {
        style.bBold = true;
        return;
    }
    else
    if ( iChar == _BOLDOFF )
    {
        style.bBold = false;
        return;
    }
    else
    if ( iChar == _ITALON )
    {
        style.bItalic = true;
        return;
    }
    else
    if ( iChar == _ITALOFF )
    {
        style.bItalic = false;
        return;
    }
#endif
    
#ifdef HANDLE_EOL
    if ( state.EOL )
    {
        PrintBeginNextLine( state, style );
		state.EOL = false;
    }
#endif
    
    vec2 vUV = ((state.vPixelPos - state.vCursorPos) / style.vSize);

    /*if ( (vUV.y > -0.1) && (vUV.y < 0.1) && (abs(vUV.x) < 0.02 || abs(vUV.x - CharWidth(iChar)) < 0.02) )
    {
        state.fDistance = -10.0;
    }*/
    
	CharExtents extents = GetCharExtents( iChar );    
    vUV.y += 0.8f; // Move baseline
    vUV.x += extents.left - style.fAdvancement;
    
#ifdef HANDLE_PRINT_STYLES    
    if ( style.bItalic )
    {
    	vUV.x += (1.0 - vUV.y) * -0.4f;
    }
#endif
    
    vec3 v = SampleCharacter( iChar, vUV ).agb;

#ifdef HANDLE_PRINT_STYLES    
    if ( style.bBold )
    {
    	v.x -= 0.025f;
    }
#endif    
    
    if ( v.x < state.fDistance )
    {
        state.fDistance = v.x;       
    }
    
    state.vCursorPos.x += style.vSize.x * (extents.width + style.fAdvancement);
}


Rect GetFontRect( PrintState state, LayoutStyle style, bool initialLineOffset )
{
    Rect rect;
    
    rect.vPos = state.vLayoutStart;
    if ( initialLineOffset )
    {
    	rect.vPos.y += style.vSize.y * (style.fLineGap + g_fFontAscent);
    }
	rect.vPos.y -= style.vSize.y * (g_fFontAscent);
    rect.vSize.x = state.vCursorPos.x - state.vLayoutStart.x;
    rect.vSize.y = style.vSize.y * ( g_fFontAscent + g_fFontDescent );
    
    return rect;
}

float GetFontBlend( PrintState state, LayoutStyle style, float size )
{
    float fFeatherDist = 1.0f * length(state.vPixelSize / style.vSize);    
    float f = clamp( (size-state.fDistance + fFeatherDist * 0.5f) / fFeatherDist, 0.0, 1.0);
    return f;
}

void RenderFont( PrintState state, LayoutStyle style, RenderStyle renderStyle, inout vec3 color )
{   
    float f = GetFontBlend( state, style, renderStyle.fFontWeight );

    vec3 vCol = renderStyle.vFontColor;
    
    color.rgb = mix( color.rgb, vCol, f);    
}

// Font print helpers

#define NO_UNROLL(X) (X + min(0,iFrame))
#define NO_UNROLLU(X) (X + uint(min(0,iFrame)))

#define ARRAY_PRINT( STATE, STYLE, CHAR_ARRAY ) { for (int i=0; i< NO_UNROLL( CHAR_ARRAY.length() ); i++) PrintCh( STATE, STYLE, CHAR_ARRAY[i] ); }

void Print( inout PrintState state, LayoutStyle style, uint value )
{
	uint place = 1000000000u;

    bool leadingZeros = true;
    while( place > NO_UNROLLU( 0u ) )
    {
        uint digit = (value / place) % 10u;
        if ( place == 1u || digit != 0u )
        {
            leadingZeros = false;
        }
        
        if (!leadingZeros)
        {
            PrintCh( state, style, _0 + digit );
        }
        place = place / 10u;
    }    
}

void Print( inout PrintState state, LayoutStyle style, int value )
{
    if ( value < 0 )
    {
        PrintCh( state, style, _MINUS );
        value = -value;
    }

    Print ( state, style, uint(value) );    
}

void Print( inout PrintState state, LayoutStyle style, float value, int decimalPlaces )
{
    if ( value < 0.0f )
    {
        PrintCh( state, style, _MINUS );
    }
    value = abs(value);
    
    int placeIndex = 10;
    
    bool leadingZeros = true;
    while( placeIndex >= NO_UNROLL( -decimalPlaces ) )
    {
        float place = pow(10.0f, float(placeIndex) );
        float digitValue = floor( value / place );
        value -= digitValue * place;
        
        
        uint digit = min( uint( digitValue ), 9u );
        
        if ( placeIndex == -1 )
        {
            PrintCh( state, style, _PERIOD );
        }
        
        if ( placeIndex == 0 || digit != 0u )
        {
            leadingZeros = false;
        }        
        
        if ( !leadingZeros )
        {
        	PrintCh( state, style, _0 + digit );
        }
                
        placeIndex--;
    }
}



///////////////////////////////////////////
// General 2d Drawing
///////////////////////////////////////////

void DrawRect( vec2 vCanvasPos, Rect rect, vec4 vColor, inout vec4 vOutColor )
{
	if ( Inside( vCanvasPos, rect ) )
    {
        vOutColor = vColor;
    }
}

void DrawLine( vec2 vCanvasPos, vec2 vA, vec2 vB, float fThickness, vec4 vColor, inout vec4 vOutColor )
{
    vec2 vDir = vB - vA;
    float l = length( vDir );
    vDir = normalize( vDir );

    vec2 vOffset = vCanvasPos - vA;
    float fDot = dot( vOffset, vDir );
    float fT = clamp( fDot, 0.0, l );

    vec2 vClosest = vA + vDir * fT;
    float fDist = length(vClosest - vCanvasPos) - fThickness;

    if ( fDist < 0.0 )
    {
        vOutColor = vColor;
    }    
}

void DrawBorderOutdent( vec2 vCanvasPos, Rect rect, inout vec4 vOutColor )
{    
    vec2 vThickness = vec2(1.0);
    
	if ( Inside( vCanvasPos, rect ) )
    {
        if ( any( lessThanEqual( vCanvasPos, rect.vPos + vThickness) ) )
        {
            vOutColor.rgb = vec3(0.85);
        }
        else
        if ( any( greaterThan( vCanvasPos, rect.vPos + rect.vSize - vThickness) ) )
        {
            vOutColor.rgb = vec3(0.0);
        }
        else
        if ( any( lessThanEqual( vCanvasPos, rect.vPos + vThickness * 2.0) ) )
        {
            vOutColor.rgb = vec3(1.0);
        }
        else
        if ( any( greaterThan( vCanvasPos, rect.vPos + rect.vSize - vThickness * 2.0) ) )
        {
            vOutColor.rgb = vec3(0.4);
        }
    }
}

void DrawBorderRect( vec2 vCanvasPos, Rect rect, vec3 vOutlineColor, inout vec4 vOutColor )
{ 
    vec2 vThickness = vec2(1.0);
    
	if ( Inside( vCanvasPos, rect ) )
    {        
        if ( any( lessThanEqual( vCanvasPos, rect.vPos + vThickness) ) )
        {
            vOutColor.rgb = vOutlineColor;
        }
        else
        if ( any( greaterThan( vCanvasPos, rect.vPos + rect.vSize - vThickness) ) )
        {
            vOutColor.rgb = vOutlineColor;
        }
        else
        if ( any( lessThanEqual( vCanvasPos, rect.vPos + vThickness * 2.0) ) )
        {
            vOutColor.rgb = vOutlineColor;
        }
        else
        if ( any( greaterThan( vCanvasPos, rect.vPos + rect.vSize - vThickness * 2.0) ) )
        {
            vOutColor.rgb = vOutlineColor;
        }
    }    
}

void DrawBorderIndent( vec2 vCanvasPos, Rect rect, inout vec4 vOutColor )
{    
    vec2 vThickness = vec2(1.0);
    
	if ( Inside( vCanvasPos, rect ) )
    {        
        if ( any( lessThanEqual( vCanvasPos, rect.vPos + vThickness) ) )
        {
            vOutColor.rgb = vec3(0.0);
        }
        else
        if ( any( greaterThan( vCanvasPos, rect.vPos + rect.vSize - vThickness) ) )
        {
            vOutColor.rgb = vec3(0.85);
        }
        else
        if ( any( lessThanEqual( vCanvasPos, rect.vPos + vThickness * 2.0) ) )
        {
            vOutColor.rgb = vec3(0.4);
        }
        else
        if ( any( greaterThan( vCanvasPos, rect.vPos + rect.vSize - vThickness * 2.0) ) )
        {
            vOutColor.rgb = vec3(1.0);
        }
    }
}
    
struct UIDrawContext
{        
    vec2 vCanvasSize;
    
    // position and size of unclipped viewport on the screen
    Rect viewport;
    
    // visible region of viewport on the screen
    Rect clip;
    
    // canvas co-ordinates at top-left corner of viewport
    vec2 vOffset;
};

vec2 UIDrawContext_ScreenPosToCanvasPos( UIDrawContext drawContext, vec2 vScreenPos )
{
    vec2 vViewPos = vScreenPos - drawContext.viewport.vPos;
    return vViewPos + drawContext.vOffset;
}

vec2 UIDrawContext_CanvasPosToScreenPos( UIDrawContext drawContext, vec2 vCanvasPos )
{
    return vCanvasPos - drawContext.vOffset + drawContext.viewport.vPos;
}

bool UIDrawContext_ScreenPosInView( UIDrawContext drawContext, vec2 vScreenPos )
{
    return Inside( vScreenPos, drawContext.clip );
}

bool UIDrawContext_ScreenPosInCanvasRect( UIDrawContext drawContext, vec2 vScreenPos, Rect canvasRect )
{
	vec2 vCanvasPos = UIDrawContext_ScreenPosToCanvasPos( drawContext, vScreenPos );    
    return Inside( vCanvasPos, canvasRect );
}

UIDrawContext UIDrawContext_SetupFromRect( Rect rect )
{
    UIDrawContext drawContext;
    drawContext.viewport = rect;
    drawContext.vOffset = vec2(0);
    drawContext.vCanvasSize = rect.vSize;
	return drawContext;
}


UIDrawContext UIDrawContext_TransformChild( UIDrawContext parentContext, UIDrawContext childContext )
{
    UIDrawContext result;
    
    // The child canvas size is unmodified
    result.vCanvasSize = childContext.vCanvasSize;

    // Child viewport positions are in the parent's canvas
    // Transform them to screen co-ordinates    
    result.viewport.vPos = UIDrawContext_CanvasPosToScreenPos( parentContext, childContext.viewport.vPos );
    vec2 vMax = childContext.viewport.vPos + childContext.viewport.vSize;
    vec2 vScreenMax = UIDrawContext_CanvasPosToScreenPos( parentContext, vMax );
    result.viewport.vSize = vScreenMax - result.viewport.vPos;
    result.vOffset = childContext.vOffset;
    
    // Now clip the view so that it is within the parent view
    vec2 vViewMin = max( result.viewport.vPos, parentContext.clip.vPos );
    vec2 vViewMax = min( result.viewport.vPos + result.viewport.vSize, parentContext.clip.vPos + parentContext.clip.vSize );

    // Clip view to current canvas
    vec2 vCanvasViewMin = result.viewport.vPos - result.vOffset;
    vec2 vCanvasViewMax = vCanvasViewMin + result.vCanvasSize;
    
    vViewMin = max( vViewMin, vCanvasViewMin );
	vViewMax = min( vViewMax, vCanvasViewMax );
    
    result.clip = Rect( vViewMin, vViewMax - vViewMin );
    
    return result;
}

float 	UIStyle_TitleBarHeight();
vec2 	UIStyle_WindowBorderSize();
vec2 	UIStyle_WindowContentPadding();
vec2 	UIStyle_ControlSpacing();
vec2 	UIStyle_FontPadding();
vec2 	UIStyle_CheckboxSize();
vec2 	UIStyle_SliderSize();
vec3 	UIStyle_ColorPickerSize();
float 	UIStyle_ScrollBarSize();
float   UIStyle_WindowTransparency();

struct UILayout
{
    float fTabPosition;
    vec2 vCursor;
    Rect controlRect;
    
    // Bounds of controls in current stack
    vec2 vControlMax;
    vec2 vControlMin;
};
    
UILayout UILayout_Reset()
{
    UILayout uiLayout;
    
    uiLayout.fTabPosition = 0.0;
    uiLayout.vCursor = vec2(0);
    uiLayout.controlRect = Rect( vec2(0), vec2(0) );
    uiLayout.vControlMax = vec2(0);
    uiLayout.vControlMin = vec2(0);
    
    return uiLayout;
}

Rect UILayout_GetStackedControlRect( inout UILayout uiLayout, vec2 vSize )
{
    return Rect( uiLayout.vCursor, vSize );
}

void UILayout_SetControlRect( inout UILayout uiLayout, Rect rect )
{
    uiLayout.controlRect = rect;
    
    uiLayout.vControlMax = max( uiLayout.vControlMax, rect.vPos + rect.vSize );
    uiLayout.vControlMin = max( uiLayout.vControlMin, rect.vPos );    
}

Rect UILayout_StackControlRect( inout UILayout uiLayout, vec2 vSize )
{
    Rect rect = UILayout_GetStackedControlRect( uiLayout, vSize );
    UILayout_SetControlRect( uiLayout, rect );
    return rect;
}

void UILayout_SetX( inout UILayout uiLayout, float xPos )
{
    uiLayout.vCursor.x = xPos;
    uiLayout.vControlMax.x = uiLayout.vCursor.x;
    uiLayout.vControlMin.x = uiLayout.vCursor.x;
}

void UILayout_StackRight( inout UILayout uiLayout )
{
    UILayout_SetX( uiLayout, uiLayout.vControlMax.x + UIStyle_ControlSpacing().x );
}

void UILayout_StackDown( inout UILayout uiLayout )
{
    uiLayout.vCursor.x = uiLayout.fTabPosition;
    uiLayout.vCursor.y = uiLayout.vControlMax.y + UIStyle_ControlSpacing().y;    
    uiLayout.vControlMax.x = uiLayout.vCursor.x;
    uiLayout.vControlMin.x = uiLayout.vCursor.x;
    uiLayout.vControlMax.y = uiLayout.vCursor.y;
    uiLayout.vControlMin.y = uiLayout.vCursor.y;
}

#define IDC_NONE            -1

struct UIContext
{
    vec2 vPixelPos;
    
    vec2 vMousePos;
    bool bMouseDown;
    bool bMouseWasDown;
    bool bHandledClick;
    
    ivec2 vFragCoord;
    vec4 vOutColor;
    float fBlendRemaining;

    vec4 vOutData;
    
    int iActiveControl;
    vec2 vActivePos;

    UIDrawContext drawContext;
    bool bPixelInView; // derived from drawContext
    vec2 vPixelCanvasPos; // derived from drawContext
    bool bMouseInView; // derived from drawContext
    vec2 vMouseCanvasPos; // derived from drawContext

    vec4 vWindowOutColor; // Output for current window draw pass
#ifdef SHADOW_TEST
    float fShadow;
    float fOutShadow;
#endif    
};

void UI_SetDrawContext( inout UIContext uiContext, UIDrawContext drawContext )
{
    uiContext.drawContext = drawContext;
    
    uiContext.vPixelCanvasPos = UIDrawContext_ScreenPosToCanvasPos( drawContext, uiContext.vPixelPos );
    uiContext.bPixelInView = UIDrawContext_ScreenPosInView( drawContext, uiContext.vPixelPos );

    uiContext.vMouseCanvasPos = UIDrawContext_ScreenPosToCanvasPos( drawContext, uiContext.vMousePos );
    uiContext.bMouseInView = UIDrawContext_ScreenPosInView( drawContext, uiContext.vMousePos );
}    

UIContext UI_GetContext( vec2 fragCoord, int iData )
{
    UIContext uiContext;
    
    uiContext.vPixelPos = fragCoord;
    uiContext.vPixelPos.y = iResolution.y - uiContext.vPixelPos.y;
    uiContext.vMousePos = iMouse.xy;
    uiContext.vMousePos.y = iResolution.y - uiContext.vMousePos.y;
    uiContext.bMouseDown = iMouse.z > 0.0;       
    
    vec4 vData0 = LoadVec4( iChannelUI, ivec2(iData,0) );
    
    uiContext.bMouseWasDown = (vData0.x > 0.0);
    
    uiContext.vFragCoord = ivec2(fragCoord);
    uiContext.vOutColor = vec4(0.0);
#ifdef SHADOW_TEST    
    uiContext.fShadow = 1.0;
    uiContext.fOutShadow = 1.0f;
#endif    
    uiContext.fBlendRemaining = 1.0;
    
    uiContext.vOutData = vec4(0.0);
    if ( int(uiContext.vFragCoord.y) < 2 )
    {
        // Initialize data with previous value
	    uiContext.vOutData = texelFetch( iChannelUI, uiContext.vFragCoord, 0 );     
    }
    uiContext.bHandledClick = false;
    
    uiContext.iActiveControl = int(vData0.y);
    uiContext.vActivePos = vec2(vData0.zw);
        
    
    UIDrawContext rootContext;
    
    rootContext.vCanvasSize = iResolution.xy;
    rootContext.vOffset = vec2(0);
    rootContext.viewport = Rect( vec2(0), vec2(iResolution.xy) );
    rootContext.clip = rootContext.viewport;

    UI_SetDrawContext( uiContext, rootContext );
    
    uiContext.vWindowOutColor = vec4(0);    
        
    if ( iFrame == 0 )
    {
        uiContext.bMouseWasDown = false;
        uiContext.iActiveControl = IDC_NONE;
    }
    
    return uiContext;
}///

void UI_StoreContext( inout UIContext uiContext, int iData )
{
    vec4 vData0 = vec4( uiContext.bMouseDown ? 1.0 : 0.0, float(uiContext.iActiveControl), uiContext.vActivePos.x, uiContext.vActivePos.y );
    StoreVec4( ivec2(iData,0), vData0, uiContext.vOutData, ivec2(uiContext.vFragCoord) );
}

vec4 UI_GetFinalColor( UIContext uiContext )
{
    if ( int(uiContext.vFragCoord.y) < 2 )
    {
        return uiContext.vOutData;
    }
    
    if ( uiContext.vOutColor.a >= 0.0 )
    {
        // Apply premultiplied alpha.
        uiContext.vOutColor.rgb *= uiContext.vOutColor.a;
  
#ifdef SHADOW_TEST
        // Shadow composite for premultiplied alpha.
        // Don't even ask how this works - I'm not sure I know
        uiContext.vOutColor.rgb *= uiContext.fOutShadow;
        uiContext.vOutColor.a = 1.0 - ((1.0 - uiContext.vOutColor.a) * uiContext.fOutShadow);
#endif 	
    }
    else
    {
#ifdef SHADOW_TEST
        uiContext.vOutColor.a = -1.0 -uiContext.fOutShadow;
#else
        uiContext.vOutColor.a = -2.0;
#endif 
    }
    
    return uiContext.vOutColor;
}

void UI_ComposeWindowLayer( inout UIContext uiContext, float fTransparency, Rect windowRect )
{
#ifdef SHADOW_TEST   
  	if ( !uiContext.bPixelInView )
    {
        return;
    }

#if 1
    // cull window?
    Rect boundsRect = windowRect;
    RectExpand( boundsRect, vec2( 16.0 ) );
    if ( !Inside( uiContext.vPixelPos, boundsRect ) )
    {
        return;
    }
#endif
    
    // We need to compose in the parent drawContext for this to work...
    float fPrevShadow = uiContext.fShadow;
    
    vec2 vShadowOffset = vec2( 5.0, 8.0 );
    float fShadowInner = 3.0;
	float fShadowOuter = 12.0;
    
    Rect shadowRect = windowRect;
    RectShrink( shadowRect, vec2( fShadowInner ) );
    
    vec2 vShadowTestPos = uiContext.vPixelPos - vShadowOffset;
    vec2 vWindowClosest = clamp( vShadowTestPos, shadowRect.vPos, shadowRect.vPos + shadowRect.vSize );

    float fWindowDist = length( vWindowClosest - vShadowTestPos );
    
    float fCurrentShadow = clamp( (fWindowDist) / (fShadowOuter + fShadowInner), 0.0, 1.0 );
    fCurrentShadow = sqrt( fCurrentShadow );
    float fShadowTransparency = 0.5;
	uiContext.fShadow *= fCurrentShadow * (1.0 - fShadowTransparency) + fShadowTransparency; 
#endif    

  	if ( !Inside( uiContext.vPixelPos, windowRect ) )
    {
        return;
    }

    float fBlend = uiContext.fBlendRemaining * (1.0f - fTransparency);

#ifdef SHADOW_TEST
    uiContext.fOutShadow *= fPrevShadow * (fBlend) + (1.0 - fBlend);
#endif
    
    // never blend under "ID" window
    if ( uiContext.vOutColor.a < 0.0 )
    {
        return;
    }
    
    if ( uiContext.vWindowOutColor.a < 0.0 )
    {
        if ( uiContext.fBlendRemaining == 1.0f )
        {
            // Ouput ID without blending
            uiContext.vOutColor = uiContext.vWindowOutColor;
            uiContext.fBlendRemaining = 0.0f;
            return;
        }
        else
        {
            // blending id under existing color - blend in grey instead of ID
            uiContext.vWindowOutColor = vec4(0.75, 0.75, 0.75, 1.0);
        }
    }

    uiContext.vOutColor += uiContext.vWindowOutColor * fBlend;
    
    uiContext.fBlendRemaining *= fTransparency;
}

///////////////////////////
// UI Data
///////////////////////////

#define DIRTY_DATA_MAGIC			123.456

// from HSV and HSL by iq - https://www.shadertoy.com/view/lsS3Wc
const float eps = 0.0000001;

vec3 hsv2rgb( in vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    return c.z * mix( vec3(1.0), rgb, c.y);
}

vec3 rgb2hsv( in vec3 c)
{
    vec4 k = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    vec4 p = mix(vec4(c.zy, k.wz), vec4(c.yz, k.xy), (c.z<c.y) ? 1.0 : 0.0);
    vec4 q = mix(vec4(p.xyw, c.x), vec4(c.x, p.yzx), (p.x<c.x) ? 1.0 : 0.0);
    float d = q.x - min(q.w, q.y);
    return vec3(abs(q.z + (q.w - q.y) / (6.0*d+eps)), d / (q.x+eps), q.x);
}

struct UIData_Bool
{
    bool bValue;
};
    
UIData_Bool UI_GetDataBool( int iData, bool bDefault )  
{
    UIData_Bool dataBool;
        
	vec4 vData0 = LoadVec4( iChannelUI, ivec2(iData,0) );
    
    if ( iFrame == 0 )
    {
        dataBool.bValue = bDefault;
    }
    else
    {
        dataBool.bValue =  vData0.x > 0.5;
    }
    
    return dataBool;
}

void UI_StoreDataBool( inout UIContext uiContext, UIData_Bool dataBool, int iData )
{
    vec4 vData0 = vec4(0);
    vData0.x = dataBool.bValue ? 1.0 : 0.0;
    StoreVec4( ivec2(iData,0), vData0, uiContext.vOutData, ivec2(uiContext.vFragCoord) );            
}


struct UIData_Value
{
    float fValue;
    float fRangeMin;
    float fRangeMax;
};

UIData_Value UI_GetDataValue( int iData, float fDefaultValue, float fRangeMin, float fRangeMax )  
{
    UIData_Value dataValue;
    
    vec4 vData0 = LoadVec4( iChannelUI, ivec2(iData,0) );
    
    if ( iFrame == 0 )
    {
        dataValue.fValue = fDefaultValue;
    }
    else
    {
        dataValue.fValue = vData0.x;
    }
    
    dataValue.fRangeMin = fRangeMin;
    dataValue.fRangeMax = fRangeMax;
    
    return dataValue;
}

void UI_StoreDataValue( inout UIContext uiContext, UIData_Value dataValue, int iData )
{
    vec4 vData0 = vec4(0);
    vData0.x = dataValue.fValue;
    StoreVec4( ivec2(iData,0), vData0, uiContext.vOutData, ivec2(uiContext.vFragCoord) );            
}

struct UIData_Color
{    
    vec3 vHSV;
};

UIData_Color UI_GetDataColor( int iData, vec3 cDefaultRGB )  
{
    UIData_Color dataColor;
    
    vec4 vData1 = LoadVec4( iChannelUI, ivec2(iData,1) );
    
    if ( iFrame == 0 )
    {
        dataColor.vHSV = rgb2hsv( cDefaultRGB );
    }
    else
    {
        dataColor.vHSV = vData1.rgb;
    }
    
    return dataColor;
}

void UI_StoreDataColor( inout UIContext uiContext, UIData_Color dataColor, int iData )
{
    vec4 vData0 = vec4(0);
    vData0.rgb = hsv2rgb( dataColor.vHSV );
        
    StoreVec4( ivec2(iData,0), vData0, uiContext.vOutData, ivec2(uiContext.vFragCoord) );            

    vec4 vData1 = vec4(0);
    vData1.rgb = dataColor.vHSV;
        
    StoreVec4( ivec2(iData,1), vData1, uiContext.vOutData, ivec2(uiContext.vFragCoord) );            
}

PrintState UI_PrintState_Init( inout UIContext uiContext, LayoutStyle style, vec2 vPosition )
{
    vec2 vCanvasPos = uiContext.vPixelCanvasPos;
    
    PrintState state = PrintState_InitCanvas( vCanvasPos, vec2(1.0) );
    MoveTo( state, vPosition + UIStyle_FontPadding() );
	PrintBeginNextLine(state, style);

	return state;
}

Rect UI_GetFontRect( PrintState state, LayoutStyle style )
{
    Rect rect;
    rect = GetFontRect( state, style, true );
    vec2 vExpand = UIStyle_FontPadding();
    vExpand.y += style.vSize.y * style.fLineGap;
    RectExpand( rect, vExpand );
	return rect;
}

void UI_RenderFont( inout UIContext uiContext, PrintState state, LayoutStyle style, RenderStyle renderStyle )
{
    if( uiContext.bPixelInView )
    {
        RenderFont( state, style, renderStyle, uiContext.vWindowOutColor.rgb );
    }
}

void UILayout_SetControlRectFromText( inout UILayout uiLayout, PrintState state, LayoutStyle style )
{
    UILayout_SetControlRect( uiLayout, UI_GetFontRect( state, style ) );
}

struct UIPanelState
{
    UIDrawContext parentDrawContext;
	vec4 vParentWindowColor;
};
    
void UI_PanelBegin( inout UIContext uiContext, inout UIPanelState panelState )
{
    panelState.parentDrawContext = uiContext.drawContext;
    panelState.vParentWindowColor = uiContext.vWindowOutColor;
}

void UI_PanelEnd( inout UIContext uiContext, inout UIPanelState panelState )
{
    if ( !uiContext.bPixelInView )
    {
        // Restore parent window color if outside view
	    uiContext.vWindowOutColor = panelState.vParentWindowColor;    
    }

    UI_SetDrawContext( uiContext, panelState.parentDrawContext );
}

#define FLAG_SET(X,F) (( X & F ) != 0u)
    
const uint	WINDOW_CONTROL_FLAG_CLOSE_BOX 		= 1u,
			WINDOW_CONTROL_FLAG_MINIMIZE_BOX	= 2u,
			WINDOW_CONTROL_FLAG_RESIZE_WIDGET 	= 4u,
			WINDOW_CONTROL_FLAG_TITLE_BAR 		= 8u;
    
struct UIWindowDesc
{
    Rect initialRect;
    bool bStartMinimized;
    bool bStartClosed;
    
    uint uControlFlags;    
    vec2 vMaxSize;
};


struct UIWindowState
{
    UIPanelState panelState;

    Rect rect;
    bool bMinimized;
    bool bClosed;
    
    uint uControlFlags;    
    vec2 vMaxSize;
    int iControlId;

    Rect drawRect;
};


UIWindowState UI_GetWindowState( UIContext uiContext, int iControlId, int iData, UIWindowDesc desc )
{
    UIWindowState window;    
    
    vec4 vData0 = LoadVec4( iChannelUI, ivec2(iData,0) );
        
    window.rect = Rect( vData0.xy, vData0.zw );
    
    vec4 vData1 = LoadVec4( iChannelUI, ivec2(iData,1) );
    
    window.bMinimized = (vData1.x > 0.0);    
    window.bClosed = (vData1.y > 0.0);    
    
    // Clamp window position so title bar is always on canvas
	vec2 vSafeMin = vec2(24.0);        
	vec2 vSafeMax = vec2(32.0);        
    vec2 vPosMin = vec2( -window.rect.vSize.x + vSafeMin.x, -vSafeMin.y);//vec2( -window.rect.vSize.x, 0.0) + 24.0, -24.0 );
    vec2 vPosMax = uiContext.drawContext.vCanvasSize - vSafeMax;
    window.rect.vPos = clamp( window.rect.vPos, vPosMin, vPosMax );
    
    if ( iFrame == 0 || vData1.z != DIRTY_DATA_MAGIC)
    {
        window.rect = desc.initialRect;
        window.bMinimized = desc.bStartMinimized;
	    window.bClosed = desc.bStartClosed;
    }       
    
    window.uControlFlags = desc.uControlFlags;
    window.vMaxSize = desc.vMaxSize;
    
    window.iControlId = iControlId;
        
    return window;
}

void UI_StoreWindowState( inout UIContext uiContext, UIWindowState window, int iData )
{    
    vec4 vData0;
    vData0.xy = window.rect.vPos;
    vData0.zw = window.rect.vSize;
    
    StoreVec4( ivec2(iData,0), vData0, uiContext.vOutData, ivec2(uiContext.vFragCoord) );        

    vec4 vData1;
    
    vData1.x = window.bMinimized ? 1.0f : 0.0f;
    vData1.y = window.bClosed ? 1.0f : 0.0f;
    vData1.z = DIRTY_DATA_MAGIC;
    vData1.w = 0.0f;

    StoreVec4( ivec2(iData,1), vData1, uiContext.vOutData, ivec2(uiContext.vFragCoord) );        
}

void UI_WriteCanvasPos( inout UIContext uiContext, int iControlId )        
{
	if (!uiContext.bPixelInView)
        return;
    Rect rect = Rect( vec2(0), uiContext.drawContext.vCanvasSize );
    DrawRect( uiContext.vPixelCanvasPos, rect, vec4(uiContext.vPixelCanvasPos, float(iControlId), -1.0 ), uiContext.vWindowOutColor );
}    

void UI_WriteCanvasUV( inout UIContext uiContext, int iControlId )        
{
	if (!uiContext.bPixelInView)
        return;
    Rect rect = Rect( vec2(0), uiContext.drawContext.vCanvasSize );
    DrawRect( uiContext.vPixelCanvasPos, rect, vec4(uiContext.vPixelCanvasPos / uiContext.drawContext.vCanvasSize, float(iControlId), -1.0 ), uiContext.vWindowOutColor );
}

void UI_DrawButton( inout UIContext uiContext, bool bActive, bool bMouseOver, Rect buttonRect )
{
	if (!uiContext.bPixelInView)
        return;
    
    if ( bActive && bMouseOver )
    {
#ifdef NEW_THEME
    	DrawBorderRect( uiContext.vPixelCanvasPos, buttonRect, cButtonActive, uiContext.vWindowOutColor );
#else
    	DrawBorderIndent( uiContext.vPixelCanvasPos, buttonRect, uiContext.vWindowOutColor );
#endif        
    }
    else
    {
#ifdef NEW_THEME
    	DrawBorderRect( uiContext.vPixelCanvasPos, buttonRect, cButtonInactive, uiContext.vWindowOutColor );
#else
    	DrawBorderOutdent( uiContext.vPixelCanvasPos, buttonRect, uiContext.vWindowOutColor );
#endif        
    }
}

bool UI_ProcessButton( inout UIContext uiContext, int iControlId, Rect buttonRect )
{    
    bool bMouseOver = Inside( uiContext.vMouseCanvasPos, buttonRect ) && uiContext.bMouseInView;
    
    bool bButtonPressed = false;
    
    if ( uiContext.iActiveControl == IDC_NONE )
    {
        if ( uiContext.bMouseDown && (!uiContext.bMouseWasDown) && bMouseOver && !uiContext.bHandledClick )
        {
            uiContext.iActiveControl = iControlId;
            uiContext.bHandledClick = true;
        }
    }
    else
    if ( uiContext.iActiveControl == iControlId )
    {
        if ( !uiContext.bMouseDown )
        {
            uiContext.iActiveControl = IDC_NONE;
            if ( bMouseOver )
            {
                bButtonPressed = true;
            }
        }
    }

    bool bActive = (uiContext.iActiveControl == iControlId);
    
    UI_DrawButton( uiContext, bActive, bMouseOver, buttonRect );    
        
    return bButtonPressed;
}

void UI_DrawCheckbox( inout UIContext uiContext, bool bActive, bool bMouseOver, bool bChecked, Rect checkBoxRect )
{
	if (!uiContext.bPixelInView || Outside( uiContext.vPixelCanvasPos, checkBoxRect ))
        return;
    
    uiContext.vWindowOutColor = vec4(1.0);
    
    if ( bActive && bMouseOver )
    {
        uiContext.vWindowOutColor = vec4(0.85,0.85,0.85,1.0);
    }

#ifdef NEW_THEME
    DrawBorderRect( uiContext.vPixelCanvasPos, checkBoxRect, cCheckboxOutline, uiContext.vWindowOutColor );
#else    
    DrawBorderIndent( uiContext.vPixelCanvasPos, checkBoxRect, uiContext.vWindowOutColor );
#endif    

    Rect smallerRect = checkBoxRect;
    RectShrink( smallerRect, vec2(6.0));

    if ( bChecked )
    {
        vec4 vCheckColor = vec4(0.0, 0.0, 0.0, 1.0);
        DrawLine( uiContext.vPixelCanvasPos, smallerRect.vPos+ smallerRect.vSize * vec2(0.0, 0.75), smallerRect.vPos+ smallerRect.vSize * vec2(0.25, 1.0), 2.0f, vCheckColor, uiContext.vWindowOutColor );
        DrawLine( uiContext.vPixelCanvasPos, smallerRect.vPos+ smallerRect.vSize * vec2(0.25, 1.0), smallerRect.vPos+ smallerRect.vSize * vec2(1.0, 0.25), 2.0f, vCheckColor, uiContext.vWindowOutColor );
    }
}

void UI_ProcessCheckbox( inout UIContext uiContext, int iControlId, inout UIData_Bool data, Rect checkBoxRect )
{    
    bool bMouseOver = Inside( uiContext.vMouseCanvasPos, checkBoxRect ) && uiContext.bMouseInView;
    
    if ( uiContext.iActiveControl == IDC_NONE )
    {
        if ( uiContext.bMouseDown && (!uiContext.bMouseWasDown) && bMouseOver && !uiContext.bHandledClick )
        {
            uiContext.iActiveControl = iControlId;
            uiContext.bHandledClick = true;
        }
    }
    else
    if ( uiContext.iActiveControl == iControlId )
    {
        if ( !uiContext.bMouseDown )
        {
            uiContext.iActiveControl = IDC_NONE;
            if ( bMouseOver )
            {
                data.bValue = !data.bValue;
            }
        }
    }
    
    bool bActive = (uiContext.iActiveControl == iControlId);
    
    UI_DrawCheckbox( uiContext, bActive, bMouseOver, data.bValue, checkBoxRect );    
}

void UI_DrawSliderX( inout UIContext uiContext, bool bActive, bool bMouseOver, float fPosition, Rect sliderRect, float fHandleSize, bool scrollbarStyle )
{
	if (!uiContext.bPixelInView || Outside( uiContext.vPixelCanvasPos, sliderRect ))
        return;
    
    Rect horizLineRect;
    
    horizLineRect = sliderRect;
    if (!scrollbarStyle)
    {
	    float fMid = sliderRect.vPos.y + sliderRect.vSize.y * 0.5;
    	horizLineRect.vPos.y = fMid - 2.0;
    	horizLineRect.vSize.y = 4.0;
    }

#ifdef NEW_THEME    
    DrawBorderRect( uiContext.vPixelCanvasPos, horizLineRect, cSliderLineCol, uiContext.vWindowOutColor );
#else    
    DrawBorderIndent( uiContext.vPixelCanvasPos, horizLineRect, uiContext.vWindowOutColor );
#endif

    float fSlideMin = sliderRect.vPos.x + fHandleSize * 0.5f;
    float fSlideMax = sliderRect.vPos.x + sliderRect.vSize.x - fHandleSize * 0.5f;

    float fDistSlider = (fSlideMin + (fSlideMax-fSlideMin) * fPosition);

    Rect handleRect;

    handleRect = sliderRect;
    handleRect.vPos.x = fDistSlider - fHandleSize * 0.5f;
    handleRect.vSize.x = fHandleSize;

    vec4 handleColor = vec4(0.75, 0.75, 0.75, 1.0);
    if ( bActive )
    {
        handleColor.rgb += 0.1;
    }       
    
    // highlight
#ifdef NEW_THEME     
    if ( (uiContext.vPixelCanvasPos.y - handleRect.vPos.y) < handleRect.vSize.y * 0.3 )
    {
        handleColor.rgb += 0.05;
    }
#endif    

    DrawRect( uiContext.vPixelCanvasPos, handleRect, handleColor, uiContext.vWindowOutColor );

#ifdef NEW_THEME   
    DrawBorderRect( uiContext.vPixelCanvasPos, handleRect, cSliderHandleOutlineCol, uiContext.vWindowOutColor );
#else    
    DrawBorderOutdent( uiContext.vPixelCanvasPos, handleRect, uiContext.vWindowOutColor );
#endif    
}

void UI_DrawSliderY( inout UIContext uiContext, bool bActive, bool bMouseOver, float fPosition, Rect sliderRect, float fHandleSize, bool scrollbarStyle )
{
	if (!uiContext.bPixelInView || Outside( uiContext.vPixelCanvasPos, sliderRect ))
        return;
    
    Rect horizLineRect;
    
    horizLineRect = sliderRect;
    if (!scrollbarStyle)
    {
	    float fMid = sliderRect.vPos.x + sliderRect.vSize.x * 0.5;
    	horizLineRect.vPos.x = fMid - 2.0;
    	horizLineRect.vSize.x = 4.0;
    }

#ifdef NEW_THEME    
    DrawBorderRect( uiContext.vPixelCanvasPos, horizLineRect, cSliderLineCol, uiContext.vWindowOutColor );
#else    
    DrawBorderIndent( uiContext.vPixelCanvasPos, horizLineRect, uiContext.vWindowOutColor );
#endif    

    float fSlideMin = sliderRect.vPos.y + fHandleSize * 0.5f;
    float fSlideMax = sliderRect.vPos.y + sliderRect.vSize.y - fHandleSize * 0.5f;

    float fDistSlider = (fSlideMin + (fSlideMax-fSlideMin) * fPosition);

    Rect handleRect;

    handleRect = sliderRect;
    handleRect.vPos.y = fDistSlider - fHandleSize * 0.5f;
    handleRect.vSize.y = fHandleSize;

    vec4 handleColor = vec4(0.75, 0.75, 0.75, 1.0);
    if ( bActive )
    {
        handleColor.rgb += 0.1;
    }
    
    // highlight
#ifdef NEW_THEME     
    if ( (uiContext.vPixelCanvasPos.y - handleRect.vPos.y) < handleRect.vSize.y * 0.3 )
    {
        handleColor.rgb += 0.05;
    }
#endif    

    DrawRect( uiContext.vPixelCanvasPos, handleRect, handleColor, uiContext.vWindowOutColor );
#ifdef NEW_THEME   
    DrawBorderRect( uiContext.vPixelCanvasPos, handleRect, cSliderHandleOutlineCol, uiContext.vWindowOutColor );
#else     
    DrawBorderOutdent( uiContext.vPixelCanvasPos, handleRect, uiContext.vWindowOutColor );
#endif    
}

void UI_ProcessSlider( inout UIContext uiContext, int iControlId, inout UIData_Value data, Rect sliderRect )
{    
    float fHandleSize = 8.0;
    
    bool bMouseOver = Inside( uiContext.vMouseCanvasPos, sliderRect ) && uiContext.bMouseInView;
    
    if ( uiContext.iActiveControl == IDC_NONE )
    {
        if ( uiContext.bMouseDown && (!uiContext.bMouseWasDown) && bMouseOver && !uiContext.bHandledClick )
        {
            uiContext.iActiveControl = iControlId;
            uiContext.bHandledClick = true;
        }
    }
    else
    if ( uiContext.iActiveControl == iControlId )
    {
        float fSlidePosMin = sliderRect.vPos.x + fHandleSize * 0.5f;
        float fSlidePosMax = sliderRect.vPos.x + sliderRect.vSize.x - fHandleSize * 0.5f;
        float fPosition = (uiContext.vMouseCanvasPos.x - fSlidePosMin) / (fSlidePosMax - fSlidePosMin);
        fPosition = clamp( fPosition, 0.0f, 1.0f );
        data.fValue = data.fRangeMin + fPosition * (data.fRangeMax - data.fRangeMin);
        if ( !uiContext.bMouseDown )
        {
            uiContext.iActiveControl = IDC_NONE;
        }
    }
        
    bool bActive = (uiContext.iActiveControl == iControlId);
    float fPosition = (data.fValue - data.fRangeMin) / (data.fRangeMax - data.fRangeMin);
    
    UI_DrawSliderX( uiContext, bActive, bMouseOver, fPosition, sliderRect, fHandleSize, false );    
}

void UI_ProcessScrollbarX( inout UIContext uiContext, int iControlId, inout UIData_Value data, Rect sliderRect, float fHandleSize )
{    
    bool bMouseOver = Inside( uiContext.vMouseCanvasPos, sliderRect ) && uiContext.bMouseInView;
        
    if ( uiContext.iActiveControl == IDC_NONE )
    {
        if ( uiContext.bMouseDown && (!uiContext.bMouseWasDown) && bMouseOver && !uiContext.bHandledClick )
        {
            uiContext.iActiveControl = iControlId;
            uiContext.bHandledClick = true;
        }
    }
    else
    if ( uiContext.iActiveControl == iControlId )
    {
        float fSlidePosMin = sliderRect.vPos.x + fHandleSize * 0.5f;
        float fSlidePosMax = sliderRect.vPos.x + sliderRect.vSize.x - fHandleSize * 0.5f;
        float fPosition = (uiContext.vMouseCanvasPos.x - fSlidePosMin) / (fSlidePosMax - fSlidePosMin);
        fPosition = clamp( fPosition, 0.0f, 1.0f );
        data.fValue = data.fRangeMin + fPosition * (data.fRangeMax - data.fRangeMin);
        if ( !uiContext.bMouseDown )
        {
            uiContext.iActiveControl = IDC_NONE;
        }
    }
        
    bool bActive = (uiContext.iActiveControl == iControlId);
    float fPosition = (data.fValue - data.fRangeMin) / (data.fRangeMax - data.fRangeMin);
    
    UI_DrawSliderX( uiContext, bActive, bMouseOver, fPosition, sliderRect, fHandleSize, true );    
}

void UI_ProcessScrollbarY( inout UIContext uiContext, int iControlId, inout UIData_Value data, Rect sliderRect, float fHandleSize )
{    
    bool bMouseOver = Inside( uiContext.vMouseCanvasPos, sliderRect ) && uiContext.bMouseInView;
    
    if ( uiContext.iActiveControl == IDC_NONE )
    {
        if ( uiContext.bMouseDown && (!uiContext.bMouseWasDown) && bMouseOver && !uiContext.bHandledClick )
        {
            uiContext.iActiveControl = iControlId;
            uiContext.bHandledClick = true;
        }
    }
    else
    if ( uiContext.iActiveControl == iControlId )
    {
        float fSlidePosMin = sliderRect.vPos.y + fHandleSize * 0.5f;
        float fSlidePosMax = sliderRect.vPos.y + sliderRect.vSize.y - fHandleSize * 0.5f;
        float fPosition = (uiContext.vMouseCanvasPos.y - fSlidePosMin) / (fSlidePosMax - fSlidePosMin);
        fPosition = clamp( fPosition, 0.0f, 1.0f );
        data.fValue = data.fRangeMin + fPosition * (data.fRangeMax - data.fRangeMin);
        if ( !uiContext.bMouseDown )
        {
            uiContext.iActiveControl = IDC_NONE;
        }
    }
        
    bool bActive = (uiContext.iActiveControl == iControlId);
    float fPosition = (data.fValue - data.fRangeMin) / (data.fRangeMax - data.fRangeMin);
    
    UI_DrawSliderY( uiContext, bActive, bMouseOver, fPosition, sliderRect, fHandleSize, true );    
}

void UI_DrawColorPickerSV( inout UIContext uiContext, bool bActive, vec3 vHSV, Rect pickerRect )
{
	if (!uiContext.bPixelInView || Outside( uiContext.vPixelCanvasPos, pickerRect ))
        return;
    
    vec2 vCurrPixelPos = (uiContext.vPixelCanvasPos - pickerRect.vPos) / pickerRect.vSize;
    vCurrPixelPos.y = 1.0f - vCurrPixelPos.y;
    vec3 vHSVCurr = vHSV;
    vHSVCurr.yz = vCurrPixelPos;

    uiContext.vWindowOutColor = vec4( hsv2rgb( vHSVCurr ), 1.0 );
    
    vec2 vSelectedPos = vHSV.yz;
    vSelectedPos.y = 1.0f - vSelectedPos.y;
    vSelectedPos = vSelectedPos * pickerRect.vSize + pickerRect.vPos;
        
    float l = length( vSelectedPos - uiContext.vPixelCanvasPos );
    float d = l - 3.0;
    d = min(d, 5.0 - l);
    if ( bActive )
    {
        float d2 = l - 5.0;
    	d2 = min(d2, 7.0 - l);
	    d = max(d, d2);
    }
    
    float fBlend = clamp(d, 0.0, 1.0);
    
    uiContext.vWindowOutColor.rgb = mix(uiContext.vWindowOutColor.rgb, vec3(1.0) - uiContext.vWindowOutColor.rgb, fBlend);
}

void UI_ProcessColorPickerSV( inout UIContext uiContext, int iControlId, inout UIData_Color data, Rect pickerRect )
{
    bool bMouseOver = Inside( uiContext.vMouseCanvasPos, pickerRect ) && uiContext.bMouseInView;
    
    vec3 vHSV = data.vHSV;
    
    if ( uiContext.iActiveControl == IDC_NONE )
    {
        if ( uiContext.bMouseDown && (!uiContext.bMouseWasDown) && bMouseOver && !uiContext.bHandledClick )
        {
            uiContext.iActiveControl = iControlId;
            uiContext.bHandledClick = true;
        }
    }
    else
    if ( uiContext.iActiveControl == iControlId )
    {
        vec2 vPos = (uiContext.vMouseCanvasPos - pickerRect.vPos) / pickerRect.vSize;
        vPos = clamp( vPos, vec2(0), vec2(1) );
        
        vHSV.yz = vPos;
        vHSV.z = 1.0f - vHSV.z;
        
        if ( !uiContext.bMouseDown )
        {
            uiContext.iActiveControl = IDC_NONE;
        }
    }
    
    data.vHSV = vHSV;
    
    bool bActive = (uiContext.iActiveControl == iControlId);
    
    UI_DrawColorPickerSV( uiContext, bActive, vHSV, pickerRect );    
}

void UI_DrawColorPickerH( inout UIContext uiContext, bool bActive, vec3 vHSV, Rect pickerRect )
{
	if (!uiContext.bPixelInView || Outside( uiContext.vPixelCanvasPos, pickerRect ))
        return;
    
    vec2 vCurrPixelPos = (uiContext.vPixelCanvasPos - pickerRect.vPos) / pickerRect.vSize;
    vec3 vHSVCurr = vHSV;
    vHSVCurr.x = vCurrPixelPos.y;
    vHSVCurr.yz = vec2(1.0, 1.0);
    
    float fSelectedPos = vHSV.x * pickerRect.vSize.y + pickerRect.vPos.y;

	uiContext.vWindowOutColor = vec4( hsv2rgb( vHSVCurr ), 1.0 );
        
    float l = length( fSelectedPos - uiContext.vPixelCanvasPos.y );
    float d = l - 1.0;
    d = min(d, 5.0 - l);
    if ( bActive )
    {
        float d2 = l - 4.0;
    	d2 = min(d2, 6.0 - l);
	    d = max(d, d2);
    }
    
    float fBlend = clamp(d, 0.0, 1.0);
    
    uiContext.vWindowOutColor.rgb = mix(uiContext.vWindowOutColor.rgb, vec3(0.5), fBlend);    
}

void UI_ProcessColorPickerH( inout UIContext uiContext, int iControlId, inout UIData_Color data, Rect pickerRect )
{
    bool bMouseOver = Inside( uiContext.vMouseCanvasPos, pickerRect ) && uiContext.bMouseInView;
    
    vec3 vHSV = data.vHSV;
    
    if ( uiContext.iActiveControl == IDC_NONE )
    {
        if ( uiContext.bMouseDown && (!uiContext.bMouseWasDown) && bMouseOver && !uiContext.bHandledClick )
        {
            uiContext.iActiveControl = iControlId;
            uiContext.bHandledClick = true;
        }
    }
    else
    if ( uiContext.iActiveControl == iControlId )
    {
        float fPos = (uiContext.vMouseCanvasPos.y - pickerRect.vPos.y) / pickerRect.vSize.y;
        fPos = clamp( fPos, 0.0f, 1.0f );
        
        vHSV.x = fPos;
        
        if ( !uiContext.bMouseDown )
        {
            uiContext.iActiveControl = IDC_NONE;
        }
    }
    
    data.vHSV = vHSV;
    
    bool bActive = (uiContext.iActiveControl == iControlId);
    
    UI_DrawColorPickerH( uiContext, bActive, vHSV, pickerRect );
}

bool UI_DrawWindowCloseBox( inout UIContext uiContext, Rect closeBoxRect )
{
	if (!uiContext.bPixelInView || !Inside( uiContext.vPixelCanvasPos, closeBoxRect ))
        return false;
    
    vec2 vCrossPos = closeBoxRect.vPos + closeBoxRect.vSize * 0.5;        
    vec2 vCrossSize = closeBoxRect.vSize * 0.5 * 0.4;
    vec4 crossColor = vec4(0.0, 0.0, 0.0, 1.0);

    vec2 vCrossSizeFlip = vCrossSize * vec2(1.0, -1.0);
    
    DrawLine( uiContext.vPixelCanvasPos, vCrossPos - vCrossSize, vCrossPos + vCrossSize, 2.0f, crossColor, uiContext.vWindowOutColor );
    DrawLine( uiContext.vPixelCanvasPos, vCrossPos - vCrossSizeFlip, vCrossPos + vCrossSizeFlip, 2.0f, crossColor, uiContext.vWindowOutColor );
    
    return true;
}

bool UI_ProcessWindowCloseBox( inout UIContext uiContext, inout UIWindowState window, int iControlId, Rect closeBoxRect )
{
    bool bPressed = UI_ProcessButton( uiContext, iControlId, closeBoxRect );
    
    if ( bPressed )
    {
 		window.bClosed = true;
    }

    bool bActive = (uiContext.iActiveControl == iControlId);
    
    return UI_DrawWindowCloseBox( uiContext, closeBoxRect );
}
    
bool UI_DrawWindowMinimizeWidget( inout UIContext uiContext, bool bMinimized, Rect minimizeBoxRect )
{
	if (!uiContext.bPixelInView || !Inside( uiContext.vPixelCanvasPos, minimizeBoxRect ))
        return false;
    
    vec2 vArrowPos = minimizeBoxRect.vPos + minimizeBoxRect.vSize * 0.5;        
    vec2 vArrowSize = minimizeBoxRect.vSize * 0.25;
    vec4 arrowColor = vec4(0.0, 0.0, 0.0, 1.0);
    if ( !bMinimized )
    {
        DrawLine( uiContext.vPixelCanvasPos, vArrowPos + vec2(-1.0, -0.5) * vArrowSize, vArrowPos + vec2(0.0, 0.5) * vArrowSize, 2.0f, arrowColor, uiContext.vWindowOutColor );
        DrawLine( uiContext.vPixelCanvasPos, vArrowPos + vec2( 1.0, -0.5) * vArrowSize, vArrowPos + vec2(0.0, 0.5) * vArrowSize, 2.0f, arrowColor, uiContext.vWindowOutColor );
    }
    else
    {
        DrawLine( uiContext.vPixelCanvasPos, vArrowPos + vec2( 0.5, 0.0 )* vArrowSize, vArrowPos + vec2(-0.5, -1.0) * vArrowSize, 2.0f, arrowColor, uiContext.vWindowOutColor );
        DrawLine( uiContext.vPixelCanvasPos, vArrowPos + vec2( 0.5, 0.0 )* vArrowSize, vArrowPos + vec2(-0.5,  1.0) * vArrowSize, 2.0f, arrowColor, uiContext.vWindowOutColor );
    }    
    
    return true;
}

bool UI_ProcessWindowMinimizeWidget( inout UIContext uiContext, inout UIWindowState window, int iControlId, Rect minimizeBoxRect )
{    
    bool bPressed = UI_ProcessButton( uiContext, iControlId, minimizeBoxRect );
    
    if ( bPressed )
    {
 		window.bMinimized = !window.bMinimized;        
    }

    bool bActive = (uiContext.iActiveControl == iControlId);
    
    return UI_DrawWindowMinimizeWidget( uiContext, window.bMinimized, minimizeBoxRect );
}

void UI_ProcessScrollbarPanelBegin( inout UIContext uiContext, inout UIPanelState scrollbarState, int iControlId, int iData, Rect scrollbarPanelRect, vec2 vScrollbarCanvasSize )
{
    float styleSize = UIStyle_ScrollBarSize();
    
	bool bScrollbarHorizontal = (scrollbarPanelRect.vSize.x < vScrollbarCanvasSize.x);
    if ( bScrollbarHorizontal )
    {        
        scrollbarPanelRect.vSize.y -= styleSize;
    }

    bool bScrollbarVertical = (scrollbarPanelRect.vSize.y < vScrollbarCanvasSize.y);
    if ( bScrollbarVertical )
    {
        scrollbarPanelRect.vSize.x -= styleSize;
    }

    // Adding a vertical scrollbar may mean we now need a horizontal one
    if ( !bScrollbarHorizontal )
    {
        bScrollbarHorizontal = (scrollbarPanelRect.vSize.x < vScrollbarCanvasSize.x);
        if ( bScrollbarHorizontal )
        {        
            scrollbarPanelRect.vSize.y -= styleSize;
        }
    }
    
    // Todo : Force enable or disable ?

	vec4 vData0 = LoadVec4( iChannelUI, ivec2(iData,0) );   
        
    UIData_Value scrollValueX;
    scrollValueX.fRangeMin = 0.0;
    scrollValueX.fRangeMax = max(0.0, vScrollbarCanvasSize.x - scrollbarPanelRect.vSize.x);
        
    UIData_Value scrollValueY;
    scrollValueY.fRangeMin = 0.0;
    scrollValueY.fRangeMax = max(0.0, vScrollbarCanvasSize.y - scrollbarPanelRect.vSize.y);
    
    if ( iFrame == 0 || vData0.z != DIRTY_DATA_MAGIC )
    {
        scrollValueX.fValue = 0.0;
        scrollValueY.fValue = 0.0;
    }
    else
    {
        scrollValueX.fValue = vData0.x;
        scrollValueY.fValue = vData0.y;
    }    
    
    scrollValueX.fValue = clamp( scrollValueX.fValue, scrollValueX.fRangeMin, scrollValueX.fRangeMax );
    scrollValueY.fValue = clamp( scrollValueY.fValue, scrollValueY.fRangeMin, scrollValueY.fRangeMax );
    
    if ( bScrollbarHorizontal )
    {
        Rect scrollbarRect;
        scrollbarRect.vPos = scrollbarPanelRect.vPos;
        scrollbarRect.vPos.y += scrollbarPanelRect.vSize.y;
        scrollbarRect.vSize.x = scrollbarPanelRect.vSize.x;
        scrollbarRect.vSize.y = styleSize;
        
        float fHandleSize = scrollbarRect.vSize.x * (scrollbarPanelRect.vSize.x / vScrollbarCanvasSize.x);

        if ( uiContext.bPixelInView ) 
        {
	        DrawRect( uiContext.vPixelCanvasPos, scrollbarRect, vec4(0.6, 0.6, 0.6, 1.0), uiContext.vWindowOutColor );
        }        
        UI_ProcessScrollbarX( uiContext, iControlId, scrollValueX, scrollbarRect, fHandleSize );
    }
        
    if ( bScrollbarVertical )
    {        
        Rect scrollbarRect;
        scrollbarRect.vPos = scrollbarPanelRect.vPos;
        scrollbarRect.vPos.x += scrollbarPanelRect.vSize.x;
        scrollbarRect.vSize.x = styleSize;
        scrollbarRect.vSize.y = scrollbarPanelRect.vSize.y;
        
        float fHandleSize = scrollbarRect.vSize.y * (scrollbarPanelRect.vSize.y / vScrollbarCanvasSize.y);
        
        if ( uiContext.bPixelInView ) 
        {
	        DrawRect( uiContext.vPixelCanvasPos, scrollbarRect, vec4(0.6, 0.6, 0.6, 1.0), uiContext.vWindowOutColor );
        }
        
        UI_ProcessScrollbarY( uiContext, iControlId + 1000, scrollValueY, scrollbarRect, fHandleSize );
    }
    
    if ( bScrollbarHorizontal && bScrollbarVertical ) 
    {
        Rect cornerRect;
        cornerRect.vPos = scrollbarPanelRect.vPos;
        cornerRect.vPos += scrollbarPanelRect.vSize;
        cornerRect.vSize = vec2(styleSize);
        
        if ( uiContext.bPixelInView ) 
        {
            DrawRect( uiContext.vPixelCanvasPos, cornerRect, vec4(cScrollPanelCorner, 1.0), uiContext.vWindowOutColor );
#ifdef NEW_THEME  
        	DrawBorderRect( uiContext.vPixelCanvasPos, cornerRect, cScrollPanelCornerOutline, uiContext.vWindowOutColor );
#else            
        	DrawBorderIndent( uiContext.vPixelCanvasPos, cornerRect, uiContext.vWindowOutColor );
#endif            
        }
    }

    UI_PanelBegin( uiContext, scrollbarState );    
    
    vData0.x = scrollValueX.fValue;
    vData0.y = scrollValueY.fValue;
    vData0.z = DIRTY_DATA_MAGIC;
    StoreVec4( ivec2(iData,0), vData0, uiContext.vOutData, ivec2(uiContext.vFragCoord) );    
        
            
    UIDrawContext scrollbarPanelContextDesc = UIDrawContext_SetupFromRect( scrollbarPanelRect );
    scrollbarPanelContextDesc.vCanvasSize = vScrollbarCanvasSize;
    scrollbarPanelContextDesc.vOffset = vec2(scrollValueX.fValue, scrollValueY.fValue);

    UIDrawContext scrollbarPanelContext = UIDrawContext_TransformChild( scrollbarState.parentDrawContext, scrollbarPanelContextDesc );
    UI_SetDrawContext( uiContext, scrollbarPanelContext );
}

void UI_ProcessScrollbarPanelEnd( inout UIContext uiContext, inout UIPanelState scrollbarState )
{
    UI_PanelEnd( uiContext, scrollbarState );    
}


void UIStyle_GetFontStyleTitle( inout LayoutStyle style, inout RenderStyle renderStyle );
void PrintWindowTitle( inout PrintState state, LayoutStyle style, int controlId );

vec2 UI_WindowGetTitleBarSize( UIContext uiContext, inout UIWindowState window )
{
    return vec2(window.drawRect.vSize.x - UIStyle_WindowBorderSize().x * 2.0, UIStyle_TitleBarHeight() );
}

void UI_DrawWindowTitleBar( inout UIContext uiContext, bool bActive, Rect titleBarRect, inout UIWindowState window )
{   
	if (!uiContext.bPixelInView || Outside( uiContext.vPixelCanvasPos, titleBarRect ))
        return;
    
    vec4 colorA = vec4(cTitleBarA, 1.0);
    vec4 colorB = vec4(cTitleBarB, 1.0);
       
    if ( bActive )
    {
        colorA.rgb = cTitleBarAActive;
        colorB.rgb = cTitleBarBActive;
    }

    float t = (uiContext.vPixelCanvasPos.x - titleBarRect.vPos.x) / 512.0;
    t = clamp( t, 0.0f, 1.0f );
    uiContext.vWindowOutColor = mix( colorA, colorB, t );
    
    {
        LayoutStyle style;
        RenderStyle renderStyle;
        UIStyle_GetFontStyleTitle( style, renderStyle );

        vec2 vTextOrigin = vec2(0);
        if ( FLAG_SET(window.uControlFlags, WINDOW_CONTROL_FLAG_MINIMIZE_BOX) )
        {
        	vTextOrigin.x += titleBarRect.vSize.y;
        }
        
        PrintState state = UI_PrintState_Init( uiContext, style, vTextOrigin );    
        PrintWindowTitle( state, style, window.iControlId );    
        RenderFont( state, style, renderStyle, uiContext.vWindowOutColor.rgb );
    }
}

bool UI_ProcessWindowTitleBar( inout UIContext uiContext, inout UIWindowState window )
{
    int iWindowTitleBarControlId = window.iControlId;
    int iWindowMinimizeControlId = window.iControlId + 1000;
    int iWindowCloseControlId = window.iControlId + 3000;
    Rect titleBarRect = Rect( vec2(0.0), UI_WindowGetTitleBarSize( uiContext, window ) );
    
    bool bRenderedWidget = false;
    if ( FLAG_SET(window.uControlFlags, WINDOW_CONTROL_FLAG_MINIMIZE_BOX) )
    {
        Rect minimizeBoxRect = Rect( vec2(0.0), vec2(titleBarRect.vSize.y) );
        RectShrink( minimizeBoxRect, vec2(4.0) );
        
    	bRenderedWidget = UI_ProcessWindowMinimizeWidget( uiContext, window, iWindowMinimizeControlId, minimizeBoxRect );
    }

    if ( FLAG_SET(window.uControlFlags, WINDOW_CONTROL_FLAG_CLOSE_BOX) )
    {
        Rect closeBoxRect = Rect( vec2(0.0), vec2(titleBarRect.vSize.y) ); 
        closeBoxRect.vPos.x = titleBarRect.vSize.x - closeBoxRect.vSize.x;
        RectShrink( closeBoxRect, vec2(4.0) );
        
        if( UI_ProcessWindowCloseBox( uiContext, window, iWindowCloseControlId, closeBoxRect ) )
        {
            bRenderedWidget = true;
        }
    }
            
    bool bMouseOver = Inside( uiContext.vMouseCanvasPos, titleBarRect ) && uiContext.bMouseInView;
        
    if ( uiContext.iActiveControl == IDC_NONE )
    {
        if ( uiContext.bMouseDown && (!uiContext.bMouseWasDown) && bMouseOver && !uiContext.bHandledClick )
        {
            uiContext.iActiveControl = iWindowTitleBarControlId;
            uiContext.vActivePos = window.rect.vPos - uiContext.vMousePos;
            uiContext.bHandledClick = true;
        }
    }
    else
    if ( uiContext.iActiveControl == iWindowTitleBarControlId )
    {
        if ( !uiContext.bMouseDown )
        {
            uiContext.iActiveControl = IDC_NONE;
        }
    }    
    
    bool bActive = (uiContext.iActiveControl == iWindowTitleBarControlId);
    
    if ( bActive )
    {
        window.rect.vPos = uiContext.vMousePos + uiContext.vActivePos;
    }   
    
    if (!bRenderedWidget)
    {
    	UI_DrawWindowTitleBar( uiContext, bActive, titleBarRect, window );
    }
    
    return Inside( uiContext.vPixelCanvasPos, titleBarRect );
}

bool ScreenPosInResizeWidget( inout UIContext uiContext, vec2 vCorner, float fControlSize, vec2 vTestPos )
{
    vec2 vTestCanvasPos = UIDrawContext_ScreenPosToCanvasPos( uiContext.drawContext, vTestPos );
    vec2 vOffset = vTestCanvasPos - vCorner + vec2( fControlSize, 0.0 );
    bool bInCorner = (vOffset.x + vOffset.y) > 0.0;
    
    return bInCorner;
}

void UI_ProcessWindowResizeWidget( inout UIContext uiContext, inout UIWindowState window, int iControlId )
{
    vec2 vCorner = uiContext.drawContext.vCanvasSize;
    float fControlSize = 24.0;
    
    bool bMouseOver = ScreenPosInResizeWidget( uiContext, vCorner, fControlSize, uiContext.vMousePos )
        && uiContext.bMouseInView;
        
    if ( uiContext.iActiveControl == IDC_NONE )
    {
        if ( uiContext.bMouseDown && (!uiContext.bMouseWasDown) && bMouseOver && !uiContext.bHandledClick)
        {
            uiContext.iActiveControl = iControlId;
            
            uiContext.vActivePos = window.rect.vSize - uiContext.vMousePos;
            
            uiContext.bHandledClick = true;
        }
    }
    else
    if ( uiContext.iActiveControl == iControlId )
    {
        if ( !uiContext.bMouseDown )
        {
            uiContext.iActiveControl = IDC_NONE;
        }
    }
        
    bool bActive = (uiContext.iActiveControl == iControlId);        
    
    if ( bActive )
    {
        window.rect.vSize = uiContext.vMousePos + uiContext.vActivePos;
        vec2 vMinWindowSize = vec2( 96.0, 64.0 );
        window.rect.vSize = max( vMinWindowSize, window.rect.vSize );
        window.rect.vSize = min( window.vMaxSize, window.rect.vSize );
    }
    
    
    if ( uiContext.bPixelInView &&
        ScreenPosInResizeWidget( uiContext, vCorner, fControlSize, uiContext.vPixelPos ) )
    {
        vec4 vColor = vec4(cResize, 1.0);
        
        if( bActive )
        {
            vColor = vec4(cResizeActive, 1.0);
        }
        uiContext.vWindowOutColor = vColor;
    }    
}

vec2 UI_GetWindowSizeForContent( vec2 vContentSize )
{
    return vContentSize 
        + vec2( 0.0, UIStyle_TitleBarHeight() )
    	+ UIStyle_WindowBorderSize() * 2.0
    	+ UIStyle_WindowContentPadding() * 2.0;
}

UIWindowState UI_ProcessWindowCommonBegin( inout UIContext uiContext, int iControlId, int iData, UIWindowDesc desc )
{   
    UIWindowState window = UI_GetWindowState( uiContext, iControlId, iData, desc );
        
    if ( window.bClosed )
    {
        return window;
    }
    
    UI_PanelBegin( uiContext, window.panelState );
    
    uiContext.vWindowOutColor.rgba = vec4( cWindowBackgroundColor, 1.0 );
    
    window.drawRect = window.rect;
    
    Rect contextRect = window.drawRect;    
    RectShrink( contextRect, UIStyle_WindowBorderSize() );
    
    vec2 vTitleBarSize = UI_WindowGetTitleBarSize( uiContext, window );
    if ( window.bMinimized )
    {
	    window.drawRect.vSize.y = vTitleBarSize.y + UIStyle_WindowBorderSize().y * 2.0;
    }
    
    // Get window main panel view
    Rect panelRect = contextRect;
    
    panelRect.vPos.y += vTitleBarSize.y;
    panelRect.vSize.y -= vTitleBarSize.y;
    
    if ( window.bMinimized )
    {
        panelRect.vSize.y = 0.0;
    }           
    
    
    UIDrawContext panelDesc = UIDrawContext_SetupFromRect( panelRect );
    UIDrawContext panelContext = UIDrawContext_TransformChild( window.panelState.parentDrawContext, panelDesc );
    UI_SetDrawContext( uiContext, panelContext );
    
    if ( FLAG_SET(window.uControlFlags, WINDOW_CONTROL_FLAG_RESIZE_WIDGET) )
    {
        int iWindowResizeControlId = window.iControlId + 2000; // hack        
    	UI_ProcessWindowResizeWidget( uiContext, window, iWindowResizeControlId );
    }
            
    // Get window content panel view
    UIDrawContext contentPanelDesc;
    contentPanelDesc.viewport = Rect( vec2(0.0), uiContext.drawContext.viewport.vSize );
    RectShrink( contentPanelDesc.viewport, UIStyle_WindowContentPadding() );
    contentPanelDesc.vOffset = vec2(0);
    contentPanelDesc.vCanvasSize = contentPanelDesc.viewport.vSize;

    UI_SetDrawContext( uiContext, UIDrawContext_TransformChild( panelContext, contentPanelDesc ) ); 
    
    return window;
}

void UI_ProcessWindowCommonEnd( inout UIContext uiContext, inout UIWindowState window, int iData )
{    
    bool bPixelInPanel = uiContext.bPixelInView;
    
    Rect contextRect = window.drawRect;    
    RectShrink( contextRect, UIStyle_WindowBorderSize() );
    
    UIDrawContext windowContextDesc = UIDrawContext_SetupFromRect( contextRect );
    UIDrawContext windowContext = UIDrawContext_TransformChild( window.panelState.parentDrawContext, windowContextDesc );
	UI_SetDrawContext( uiContext, windowContext );
    
    bool inTitleBar = false;
    if (  FLAG_SET(window.uControlFlags, WINDOW_CONTROL_FLAG_TITLE_BAR)  )
    {
    	inTitleBar = UI_ProcessWindowTitleBar( uiContext, window );
    }
    
    UIDrawContext windowBackgroundContextDesc = UIDrawContext_SetupFromRect( window.drawRect );
    UIDrawContext windowBackgroundContext = UIDrawContext_TransformChild( window.panelState.parentDrawContext, windowBackgroundContextDesc );    

    UI_SetDrawContext( uiContext, windowBackgroundContext );
    if ( !bPixelInPanel && !inTitleBar )
    {
        Rect rect = Rect( vec2(0), window.drawRect.vSize );
#ifdef NEW_THEME        
	    DrawBorderRect( uiContext.vPixelCanvasPos, rect, cWindowBorder, uiContext.vWindowOutColor );                            
#else        
	    DrawBorderOutdent( uiContext.vPixelCanvasPos, rect, uiContext.vWindowOutColor );                    
#endif
        
    }    
    
    if ( uiContext.bMouseDown && uiContext.bMouseInView && !uiContext.bHandledClick )
    {
        uiContext.bHandledClick = true;
    }
    
    Rect windowRect = uiContext.drawContext.clip;

    UI_PanelEnd( uiContext, window.panelState );
    UI_ComposeWindowLayer( uiContext, UIStyle_WindowTransparency(), windowRect );
    
    UI_StoreWindowState( uiContext, window, iData );    
}


////////////////////////////////////////////////////////////////////////
// Client Code Below Here
////////////////////////////////////////////////////////////////////////

//#define MAIN_WINDOW_ONLY

float 	UIStyle_TitleBarHeight() 		{ return 32.0; }
vec2 	UIStyle_WindowBorderSize() 		{ return vec2(6.0); }
vec2 	UIStyle_WindowContentPadding() 	{ return vec2(16.0, 8.0); }
vec2 	UIStyle_ControlSpacing() 		{ return  vec2(6.0); }
vec2 	UIStyle_FontPadding() 			{ return vec2(8.0, 2.0); }
vec2 	UIStyle_CheckboxSize() 			{ return vec2(24.0); }
vec2 	UIStyle_SliderSize()			{ return vec2(128.0, 32.0f); }
vec3 	UIStyle_ColorPickerSize()		{ return vec3(128.0, 128.0, 32.0); }
float 	UIStyle_ScrollBarSize() 		{ return 24.0; }
float   UIStyle_WindowTransparency() 	{ return 0.025f; }

void UIStyle_GetFontStyleWindowText( inout LayoutStyle style, inout RenderStyle renderStyle )
{
    style = LayoutStyle_Default();
	renderStyle = RenderStyle_Default( vec3(0.0) );
}

void UIStyle_GetFontStyleTitle( inout LayoutStyle style, inout RenderStyle renderStyle )
{
    style = LayoutStyle_Default();
	renderStyle = RenderStyle_Default( cWindowTitle );
}

void PrintWindowTitle( inout PrintState state, LayoutStyle style, int controlId )
{
    if ( controlId == IDC_WINDOW_CONTROLS )
    {
        uint strA[] = uint[] ( _C, _o, _n, _t, _r, _o, _l, _s );
        ARRAY_PRINT(state, style, strA);
    }
    if ( controlId == IDC_WINDOW_IMAGE_CONTROL )
    {
        uint strA[] = uint[] ( _I, _m, _g, _SP, _C, _o, _n, _t, _r, _o, _l );
        ARRAY_PRINT(state, style, strA);
    }
    if ( controlId == IDC_WINDOW_IMAGEA )
    {
        uint strA[] = uint[] ( _I, _m, _a, _g, _e, _SP, _A );
        ARRAY_PRINT(state, style, strA);
    }
    if ( controlId == IDC_WINDOW_IMAGEB )
    {
        uint strA[] = uint[] ( _I, _m, _a, _g, _e, _SP, _B );
        ARRAY_PRINT(state, style, strA);
    }
    if ( controlId == IDC_WINDOW_EDIT_COLOR )
    {
        uint strA[] = uint[] ( _C, _o, _l, _o, _r );
        ARRAY_PRINT(state, style, strA);
    }
}

struct UIData
{
    UIData_Bool backgroundImage;
    UIData_Bool showImageWindow;
    UIData_Bool buttonA;
    
    UIData_Value backgroundBrightness;
    UIData_Value backgroundScale;
    UIData_Value imageBrightness;

    UIData_Value editWhichColor;
    UIData_Color bgColor;
    UIData_Color imgColor;
};    

    
UIData UI_GetControlData()
{
    UIData data;
    
    data.backgroundImage = UI_GetDataBool( DATA_BACKGROUND_IMAGE, false );
    data.showImageWindow = UI_GetDataBool( DATA_CHECKBOX_SHOW_IMAGE, true );
    data.buttonA = UI_GetDataBool( DATA_BUTTONA, false );
    
    data.backgroundBrightness = UI_GetDataValue( DATA_BACKGROUND_BRIGHTNESS, 0.5, 0.0, 1.0 );
    data.backgroundScale = UI_GetDataValue( DATA_BACKGROUND_SCALE, 10.0, 1.0, 10.0 );
    data.imageBrightness = UI_GetDataValue( DATA_IMAGE_BRIGHTNESS, 1.0, 0.0, 1.0 );
    
    data.editWhichColor = UI_GetDataValue( DATA_EDIT_WHICH_COLOR, -1.0, -1.0, 100.0 );
    data.bgColor = UI_GetDataColor( DATA_BG_COLOR, vec3(0, 0.5, 0.5) );
    data.imgColor = UI_GetDataColor( DATA_IMAGE_COLOR, vec3(1.0, 1.0, 1.0) );
    
    return data;
}

void UI_StoreControlData( inout UIContext uiContext, UIData data )
{
    UI_StoreDataBool( uiContext, data.backgroundImage, DATA_BACKGROUND_IMAGE );
    UI_StoreDataBool( uiContext, data.showImageWindow, DATA_CHECKBOX_SHOW_IMAGE );
    UI_StoreDataBool( uiContext, data.buttonA, DATA_BUTTONA );

    UI_StoreDataValue( uiContext, data.backgroundBrightness, DATA_BACKGROUND_BRIGHTNESS );
    UI_StoreDataValue( uiContext, data.backgroundScale, DATA_BACKGROUND_SCALE );
    UI_StoreDataValue( uiContext, data.imageBrightness, DATA_IMAGE_BRIGHTNESS );
    
    UI_StoreDataValue( uiContext, data.editWhichColor, DATA_EDIT_WHICH_COLOR );
    UI_StoreDataColor( uiContext, data.bgColor, DATA_BG_COLOR );
    UI_StoreDataColor( uiContext, data.imgColor, DATA_IMAGE_COLOR );
}

void UI_ProcessWindowImageControl( inout UIContext uiContext, inout UIData uiData, int iControlId, int iData )
{
    UIWindowDesc desc;
    
    desc.initialRect = Rect( vec2(280, 24), vec2(180, 100) );
    desc.uControlFlags = WINDOW_CONTROL_FLAG_TITLE_BAR;
    desc.bStartClosed = false;
    desc.bStartMinimized = false;
    desc.vMaxSize = vec2(100000.0);

    UIWindowState window = UI_ProcessWindowCommonBegin( uiContext, iControlId, iData, desc );
        
    // Controls...
    if ( !window.bMinimized )
    {
		UILayout uiLayout = UILayout_Reset();
        
		UILayout_StackControlRect( uiLayout, UIStyle_SliderSize() );
        UI_ProcessSlider( uiContext, IDC_SLIDER_IMAGE_BRIGHTNESS, uiData.imageBrightness, uiLayout.controlRect );
    }
    
    UI_ProcessWindowCommonEnd( uiContext, window, iData );
}


void UI_ProcessWindowImageB( inout UIContext uiContext, inout UIData uiData, int iControlId, int iData )
{
    UIWindowDesc desc;
    
    desc.initialRect = Rect( vec2(32, 8), vec2(192, 192) );
    desc.bStartMinimized = false;
    desc.bStartClosed = false;
    desc.uControlFlags = WINDOW_CONTROL_FLAG_TITLE_BAR | WINDOW_CONTROL_FLAG_MINIMIZE_BOX | WINDOW_CONTROL_FLAG_RESIZE_WIDGET;
	desc.vMaxSize = vec2(100000.0);

    UIWindowState window = UI_ProcessWindowCommonBegin( uiContext, iControlId, iData, desc );
    
    // Controls...
    if ( !window.bMinimized )
    {    
        UI_WriteCanvasUV( uiContext, iControlId );
    }

    UI_ProcessWindowCommonEnd( uiContext, window, iData );
}

void UI_ProcessWindowImageA( inout UIContext uiContext, inout UIData uiData, int iControlId, int iData )
{
    UIWindowDesc desc;
    
    vec2 vWindowIdealSize = UI_GetWindowSizeForContent( vec2(512, 512) );
    desc.initialRect = Rect( vec2(96, 48 - 32), vec2( vWindowIdealSize.x, 350 ) );
    desc.bStartMinimized = false;
    desc.bStartClosed = false;
    desc.uControlFlags = WINDOW_CONTROL_FLAG_TITLE_BAR | WINDOW_CONTROL_FLAG_MINIMIZE_BOX | WINDOW_CONTROL_FLAG_RESIZE_WIDGET;

    desc.vMaxSize = vWindowIdealSize;

    UIWindowState window = UI_ProcessWindowCommonBegin( uiContext, iControlId, iData, desc );
        
    // Controls...
    if ( !window.bMinimized )
    {        
        Rect scrollbarPanelRect;

        #if 0
        // ScrollBar panel in fixed location
        scrollbarPanelRect = Rect( vec2(10, 32), vec2(256) );
        #else
        // ScrollBar panel with parent window size        	
        scrollbarPanelRect = Rect( vec2(0), uiContext.drawContext.vCanvasSize );
        #endif

        vec2 vScrollbarCanvasSize = vec2(512);

        UIPanelState scrollbarPanelState;            
        UI_ProcessScrollbarPanelBegin( uiContext, scrollbarPanelState, IDC_SCROLLBAR_PANEL, DATA_SCROLLBAR_PANEL, scrollbarPanelRect, vScrollbarCanvasSize );

        // Controls...
        {
            UI_ProcessWindowImageControl( uiContext, uiData, IDC_WINDOW_IMAGE_CONTROL, DATA_WINDOW_IMAGE_CONTROL );
            UI_ProcessWindowImageB( uiContext, uiData, IDC_WINDOW_IMAGEB, DATA_WINDOW_IMAGEB );

            UI_WriteCanvasPos( uiContext, iControlId );
        }

        UI_ProcessScrollbarPanelEnd(uiContext, scrollbarPanelState);
    }
    
    UI_ProcessWindowCommonEnd( uiContext, window, iData );
}

void PrintRGB( inout PrintState state, LayoutStyle style, vec3 vRGB )
{
    PrintCh( state, style, _R );
    PrintCh( state, style, _COLON );

    Print(state, style, vRGB.r, 2 );

    PrintCh( state, style, _SP );
    PrintCh( state, style, _G );
    PrintCh( state, style, _COLON );

    Print(state, style, vRGB.g, 2 );

    PrintCh( state, style, _SP );
    PrintCh( state, style, _B );
    PrintCh( state, style, _COLON );

    Print(state, style, vRGB.b, 2 );    
}

void UI_ProcessWindowEditColor( inout UIContext uiContext, inout UIData uiData, int iControlId, int iData )
{
    UIWindowDesc desc;
    
    desc.initialRect = Rect( vec2(256, 48), vec2(210, 260) );
    desc.bStartMinimized = false;
    desc.bStartClosed = false;
    desc.uControlFlags = WINDOW_CONTROL_FLAG_TITLE_BAR | WINDOW_CONTROL_FLAG_CLOSE_BOX;
    desc.vMaxSize = vec2(100000.0);

    UIWindowState window = UI_ProcessWindowCommonBegin( uiContext, iControlId, iData, desc );
    
    bool closeButtonPressed = false;
    
    // Controls...
    if ( !window.bMinimized )
    {    
		UILayout uiLayout = UILayout_Reset();
        
        LayoutStyle style;
        RenderStyle renderStyle;             
        UIStyle_GetFontStyleWindowText( style, renderStyle );
        
        UIData_Color dataColor;
        
        if ( uiData.editWhichColor.fValue == 0.0 )
        {
            dataColor = uiData.bgColor;
        }
        else
        if ( uiData.editWhichColor.fValue == 1.0 )
        {
            dataColor = uiData.imgColor;
        }
        
		UILayout_StackControlRect( uiLayout, UIStyle_ColorPickerSize().xy );                
        UI_ProcessColorPickerSV( uiContext, IDC_COLOR_PICKER, dataColor, uiLayout.controlRect );
        UILayout_StackRight( uiLayout );
		UILayout_StackControlRect( uiLayout, UIStyle_ColorPickerSize().zy );        
        UI_ProcessColorPickerH( uiContext, IDC_COLOR_PICKER+1000, dataColor, uiLayout.controlRect );
        UILayout_StackDown( uiLayout );        
        
        {
            style.vSize *= 0.6;

            PrintState state = UI_PrintState_Init( uiContext, style, uiLayout.vCursor );        

            vec3 vRGB = hsv2rgb(dataColor.vHSV);
            PrintRGB( state, style, vRGB );
                
            UI_RenderFont( uiContext, state, style, renderStyle );
                        
			UILayout_SetControlRectFromText( uiLayout, state, style );
	        UILayout_StackDown( uiLayout );            

            style.vSize /= 0.6;            
        }
        
        if ( uiData.editWhichColor.fValue == 0.0 )
        {
            uiData.bgColor = dataColor;
        }
        else
        if ( uiData.editWhichColor.fValue == 1.0 )
        {
            uiData.imgColor = dataColor;
        }
    
        {
            PrintState state = UI_PrintState_Init( uiContext, style, uiLayout.vCursor );        
            uint strA[] = uint[] ( _O, _k );
            ARRAY_PRINT(state, style, strA);
            UI_RenderFont( uiContext, state, style, renderStyle );
			UILayout_SetControlRectFromText( uiLayout, state, style );

            bool buttonPressed = UI_ProcessButton( uiContext, IDC_COLOR_PICKER + 2000, uiLayout.controlRect ); // Use text for button rect
            if ( buttonPressed )
            {
                closeButtonPressed = true;
            }
	        UILayout_StackDown( uiLayout );                  
        }        
    }
    
    window.bClosed = false;
    
    UI_ProcessWindowCommonEnd( uiContext, window, iData );
    
    if ( closeButtonPressed )
    {
        uiData.editWhichColor.fValue = -1.0;
        uiData.backgroundImage.bValue = false;
    }    
}

void UI_ProcessWindowMain( inout UIContext uiContext, inout UIData uiData, int iControlId, int iData )
{
    UIWindowDesc desc;
    
    desc.initialRect = Rect( vec2(32, 128), vec2(380, 180) );
    desc.bStartMinimized = false;
    desc.bStartClosed = false;
    desc.uControlFlags = WINDOW_CONTROL_FLAG_TITLE_BAR | WINDOW_CONTROL_FLAG_MINIMIZE_BOX | WINDOW_CONTROL_FLAG_RESIZE_WIDGET;    
    desc.vMaxSize = vec2(100000.0);

    UIWindowState window = UI_ProcessWindowCommonBegin( uiContext, iControlId, iData, desc );
    
    if ( !window.bMinimized )
    {
        // Controls...

        UILayout uiLayout = UILayout_Reset();
               
        LayoutStyle style;
        RenderStyle renderStyle;             
        UIStyle_GetFontStyleWindowText( style, renderStyle );       
        
		UILayout_StackControlRect( uiLayout, UIStyle_CheckboxSize() );                
        UI_ProcessCheckbox( uiContext, IDC_CHECKBOX_BACKGROUND_IMAGE, uiData.backgroundImage, uiLayout.controlRect );
        UILayout_StackRight( uiLayout );
        //UILayout_StackDown( uiContext.uiLayout );
        
		UILayout_StackControlRect( uiLayout, UIStyle_SliderSize() );                
        UI_ProcessSlider( uiContext, IDC_SLIDER_BACKGROUND_BRIGHTNESS, uiData.backgroundBrightness, uiLayout.controlRect );
        UILayout_StackRight( uiLayout );

        {
        	PrintState state = UI_PrintState_Init( uiContext, style, uiLayout.vCursor );        
            uint strA[] = uint[] ( _V, _a, _l, _u, _e, _COLON, _SP );

            ARRAY_PRINT(state, style, strA);

            Print(state, style, uiData.backgroundBrightness.fValue, 2 );

            UI_RenderFont( uiContext, state, style, renderStyle );
            
			UILayout_SetControlRectFromText( uiLayout, state, style );
        }
        
        UILayout_StackDown( uiLayout );    

		UILayout_StackControlRect( uiLayout, UIStyle_SliderSize() );                
        UI_ProcessSlider( uiContext, IDC_SLIDER_BACKGROUND_SCALE, uiData.backgroundScale, uiLayout.controlRect );       
        //UILayout_StackDown( uiContext.uiLayout );    
        UILayout_StackRight( uiLayout );

        {
            PrintState state = UI_PrintState_Init( uiContext, style, uiLayout.vCursor );        
            uint strA[] = uint[] ( _V, _a, _l, _u, _e, _COLON, _SP );
            ARRAY_PRINT(state, style, strA);
            Print(state, style, uiData.backgroundScale.fValue, 1 );
            UI_RenderFont( uiContext, state, style, renderStyle );
			UILayout_SetControlRectFromText( uiLayout, state, style );
        }
        UILayout_StackDown( uiLayout );
                        
        {
            // Draw color swatch
            vec2 vSwatchSize = vec2( uiLayout.controlRect.vSize.y);
			UILayout_StackControlRect( uiLayout, vSwatchSize );
            if (uiContext.bPixelInView)
            {
                DrawRect( uiContext.vPixelCanvasPos, uiLayout.controlRect, vec4(hsv2rgb(uiData.bgColor.vHSV), 1.0), uiContext.vWindowOutColor );
            }
        }
        
        bool buttonAPressed = UI_ProcessButton( uiContext, IDC_BUTTONA, uiLayout.controlRect ); // Get button position from prev control
        uiData.buttonA.bValue = buttonAPressed; // Only need to do this if we use it in another buffer
        
        if ( buttonAPressed )
        {
            uiData.editWhichColor.fValue = 0.0;
        }        
        
        UILayout_StackRight( uiLayout );        
        {
            PrintState state = UI_PrintState_Init( uiContext, style, uiLayout.vCursor );
            uint strA[] = uint[] ( _B, _G, _SP, _C, _o, _l );
            ARRAY_PRINT(state, style, strA);
			UILayout_SetControlRectFromText( uiLayout, state, style );            
            UI_RenderFont( uiContext, state, style, renderStyle );
             
        }
                
        UILayout_StackRight( uiLayout );        
        
        {
            // Draw color swatch
            vec2 vSwatchSize = vec2(uiLayout.controlRect.vSize.y);
			UILayout_StackControlRect( uiLayout, vSwatchSize );
            if (uiContext.bPixelInView)
            {
                DrawRect( uiContext.vPixelCanvasPos, uiLayout.controlRect, vec4(hsv2rgb(uiData.imgColor.vHSV), 1.0), uiContext.vWindowOutColor );
            }
        }

        bool buttonBPressed = UI_ProcessButton( uiContext, IDC_BUTTONB, uiLayout.controlRect );        
        
        if ( buttonBPressed )
        {
            uiData.editWhichColor.fValue = 1.0;
        }        

        UILayout_StackRight( uiLayout );        
        
        {
            PrintState state = UI_PrintState_Init( uiContext, style, uiLayout.vCursor );                    
            uint strA[] = uint[] ( _I, _M, _G, _SP, _B, _SP, _C, _o, _l );
            ARRAY_PRINT(state, style, strA);			            
			UILayout_SetControlRectFromText( uiLayout, state, style );            
            UI_RenderFont( uiContext, state, style, renderStyle );            
        }
        
        UILayout_StackDown( uiLayout );        
        
        #if 1
        // Debug state
        {
            PrintState state = UI_PrintState_Init( uiContext, style, uiLayout.vCursor );
            uint strA[] = uint[] ( _C, _t, _r, _l, _COLON );
            ARRAY_PRINT(state, style, strA);

            Print(state, style, uiContext.iActiveControl );
            UI_RenderFont( uiContext, state, style, renderStyle );

            UILayout_SetControlRectFromText( uiLayout, state, style );            
        }        
        #endif
    }    
    
    UI_ProcessWindowCommonEnd( uiContext, window, iData );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    UIContext uiContext = UI_GetContext( fragCoord, DATA_UICONTEXT );
    UIData uiData = UI_GetControlData();
        
    // Content...
    if ( uiData.editWhichColor.fValue >= 0.0 )
    {
	    UI_ProcessWindowEditColor( uiContext, uiData, IDC_WINDOW_EDIT_COLOR, DATA_WINDOW_EDIT_COLOR );
    }
    
    UI_ProcessWindowMain( uiContext, uiData, IDC_WINDOW_CONTROLS, DATA_WINDOW_CONTROLS );

#ifndef MAIN_WINDOW_ONLY    
    
    if ( uiData.showImageWindow.bValue )
    {
        UI_ProcessWindowImageA( uiContext, uiData, IDC_WINDOW_IMAGEA, DATA_WINDOW_IMAGEA );
    }
    
    // Desktop Controls...
    
    UILayout uiLayout = UILayout_Reset();
    
	UILayout_StackControlRect( uiLayout, UIStyle_CheckboxSize() );                
    UI_ProcessCheckbox( uiContext, IDC_CHECKBOX_SHOW_IMAGE, uiData.showImageWindow, uiLayout.controlRect );         
    UILayout_StackDown( uiLayout );
#endif    
    
    Rect composeRect = uiContext.drawContext.clip;
    UI_ComposeWindowLayer( uiContext, 0.0f, composeRect );

    UI_StoreControlData( uiContext, uiData );
    
    UI_StoreContext( uiContext, DATA_UICONTEXT );
    
    fragColor = UI_GetFinalColor( uiContext );    
}
