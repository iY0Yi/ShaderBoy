//Shadertoy URL: https://www.shadertoy.com/view/XsXSWN

// Cheesy - @P_Malin
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//
// A very cheesy raytracing (not raymarching!) shader.
// Raytracing with CSG, bump mapping, shiny things and cheese!
// (I don't know why)
 
#define kIterations 2

float kFarClip=1000.0;
float kNearClip = 0.001;

vec2 GetWindowCoord( const in vec2 vUV );
vec3 GetCameraRayDir( const in vec2 vWindow, const in vec3 vCameraPos, const in vec3 vCameraTarget );
vec3 GetSceneColour( in vec3 vRayOrigin,  in vec3 vRayDir );
vec3 ApplyPostFX( const in vec2 vUV, const in vec3 vInput );

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 vUV = fragCoord.xy / iResolution.xy;

	vec2 vMouse = iMouse.xy / iResolution.xy;	

	if(iMouse.z <= 0.0)
	{
		vMouse = vec2(0.37, 0.56);
	}
	
	float fAngle = vMouse.x * 2.0 * 3.14;
	const float fDist = 14.0;
	vec3 vCameraPos = vec3(sin(fAngle) * fDist, vMouse.y * fDist - 1.5, cos(fAngle) * fDist);
	vec3 vCameraTarget = vec3(0.0, 0.0, 0.0);
	
	vec3 vRayOrigin = vCameraPos;
	vec3 vRayDir = GetCameraRayDir( GetWindowCoord(vUV), vCameraPos, vCameraTarget );
	
	vec3 vResult = GetSceneColour(vRayOrigin, vRayDir);
	
	vec3 vFinal = ApplyPostFX( vUV, vResult );
	
	// super contrast
	//vFinal = vFinal * 1.1 - 0.1;
	
	fragColor = vec4(vFinal, 1.0);
}

// CAMERA

vec2 GetWindowCoord( const in vec2 vUV )
{
	vec2 vWindow = vUV * 2.0 - 1.0;
	vWindow.x *= iResolution.x / iResolution.y;

	return vWindow;	
}

vec3 GetCameraRayDir( const in vec2 vWindow, const in vec3 vCameraPos, const in vec3 vCameraTarget )
{
	vec3 vForward = normalize(vCameraTarget - vCameraPos);
	vec3 vRight = normalize(cross(vec3(0.0, 1.0, 0.0), vForward));
	vec3 vUp = normalize(cross(vForward, vRight));
							  
	const float fFov = 3.0;
	vec3 vDir = normalize(vWindow.x * vRight + vWindow.y * vUp + vForward * fFov);

	return vDir;
}

// POSTFX

vec3 ApplyVignetting( const in vec2 vUV, const in vec3 vInput )
{
	vec2 vOffset = (vUV - 0.5) * sqrt(2.0);
	
	float fDist = dot(vOffset, vOffset);
	
	const float kStrength = 0.5;
	
	float fShade = mix( 1.0, 1.0 - kStrength, fDist );	

	return vInput * fShade;
}

vec3 ApplyTonemap( const in vec3 vLinear )
{
	const float kExposure = 1.0;
	
	return 1.0 - exp2(vLinear * -kExposure);	
}

vec3 ApplyGamma( const in vec3 vLinear )
{
	const float kGamma = 1.8;

	return pow(vLinear, vec3(1.0/kGamma));	
}

vec3 ApplyPostFX( const in vec2 vUV, const in vec3 vInput )
{
	vec3 vTemp = ApplyVignetting( vUV, vInput );	
	
	vTemp = ApplyTonemap(vTemp);
	
	return ApplyGamma(vTemp);		
}
	
// RAYTRACE

struct C_Intersection
{
	vec3 vPos;
	float fDist;	
	vec3 vNormal;
	vec3 vUVW;
	float fObjectId;
};

struct C_SpanIntersection
{
	vec3 vNormal;
	float fDist;	
	float fObjectId;
};
	
struct C_Span
{
	C_SpanIntersection iMin;
	C_SpanIntersection iMax;	
};
	
#define INVALID_SPAN( S ) (S.iMin.fDist >= S.iMax.fDist)

void SetupNullSpan( out C_Span span )
{
	span.iMin.fDist = kFarClip;
	span.iMin.vNormal = vec3(0.0, 1.0, 0.0);
	span.iMin.fObjectId = 0.0;
	
	span.iMax.fDist = -kFarClip;
	span.iMax.vNormal = vec3(0.0, 1.0, 0.0);
	span.iMax.fObjectId = 0.0;		
}


void TraceFloor( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, const in float fFloorHeight, const in float fObjectId )
{
	SetupNullSpan(span);
		
	if(vRayDir.y < 0.0)
	{
		float fDh = vRayOrigin.y - fFloorHeight;
		float t = -fDh / vRayDir.y;
		
		span.iMin.fDist = t;
		span.iMin.vNormal = vec3(0.0, 1.0, 0.0);
		span.iMin.fObjectId = fObjectId;

		span.iMax.fDist = kFarClip;
		span.iMax.vNormal = vec3(0.0, -1.0, 0.0);
		span.iMax.fObjectId = fObjectId;		
	}
}

void TracePlane( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, vec3 vPlaneNormal, float fPlaneDist, float fObjectId )
{
	SetupNullSpan(span);

	float fStartDist = dot(vRayOrigin, vPlaneNormal) - fPlaneDist;
	float fDeltaDist = dot(vRayDir, vPlaneNormal);
	
	if(fStartDist > kNearClip)
	{
		// if looking towards the plane
		if(fDeltaDist < 0.0)
		{
			float t = -fStartDist / fDeltaDist;
			if(t > -kNearClip)
			{
				span.iMin.fDist = t;
				span.iMin.vNormal = vPlaneNormal;
				span.iMin.fObjectId = fObjectId;
				
				span.iMax.fDist = kFarClip;
				span.iMax.vNormal = vRayDir;
				span.iMax.fObjectId = fObjectId;		
			}
		}
	}
	else
	{		
		span.iMin.fDist = kNearClip;
		span.iMin.vNormal = -vRayDir;
		span.iMin.fObjectId = fObjectId;		
		
		span.iMax.fDist = kFarClip;
		span.iMax.vNormal = vRayDir;
		span.iMax.fObjectId = fObjectId;
		
		// if looking towards the plane		
		if(fDeltaDist > 0.0)
		{		
			float t = -fStartDist / fDeltaDist;
			
			if(t > -kNearClip)
			{
				span.iMin.fDist = kNearClip;
				span.iMin.vNormal = -vRayDir;
				span.iMin.fObjectId = fObjectId;					
				
				span.iMax.fDist = t;
				span.iMax.vNormal = -vPlaneNormal;
				span.iMax.fObjectId = fObjectId;	
			}		
		}		
	}
}

void TraceSphere( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, const in vec3 vSphereOrigin, const in float fSphereRadius, const in float fObjectId )
{	
	SetupNullSpan(span);
	
	vec3 vToOrigin = vSphereOrigin - vRayOrigin;
	float fProjection = dot(vToOrigin, vRayDir);
	vec3 vClosest = vRayOrigin + vRayDir * fProjection;
	
	vec3 vClosestToOrigin = vClosest - vSphereOrigin;
	float fClosestDist2 = dot(vClosestToOrigin, vClosestToOrigin);

	float fSphereRadius2 = fSphereRadius * fSphereRadius;
	
	if(fClosestDist2 < fSphereRadius2)
	{
		float fHCL = sqrt(fSphereRadius2 - fClosestDist2);

		float fMinDist = clamp(fProjection - fHCL, kNearClip, kFarClip);
		float fMaxDist = fProjection + fHCL;
		
		if(fMaxDist > fMinDist)
		{			
			span.iMin.fDist = fMinDist;
			vec3 vMinPos = vRayOrigin + vRayDir * span.iMin.fDist;
			span.iMin.vNormal = normalize(vMinPos - vSphereOrigin);
			span.iMin.fObjectId = fObjectId;
	
			span.iMax.fDist = fMaxDist;
			vec3 vMaxPos = vRayOrigin + vRayDir * span.iMax.fDist;
			span.iMax.vNormal = normalize(vMaxPos - vSphereOrigin);
			span.iMax.fObjectId = fObjectId;
		}
	}
}


vec3 Project( vec3 a, vec3 b )
{
	return a - b * dot(a, b);
}

void TraceCylinder( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, const in vec3 vCylinderOrigin, const in vec3 vCylinderDir, const in float fCylinderRadius, const in float fObjectId )
{	
	SetupNullSpan(span);
	
	vec3 vOffset = vCylinderOrigin - vRayOrigin;
	
	vec3 vProjOffset = Project(vOffset, vCylinderDir);
	vec3 vProjDir = Project(vRayDir, vCylinderDir);
	float fProjScale = length(vProjDir);
	vProjDir /= fProjScale;
	
	// intersect circle in projected space
	
	float fTClosest = dot(vProjOffset, vProjDir);
	
	vec3 vClosest = vProjDir * fTClosest;
	float fDistClosest = length(vClosest - vProjOffset);
	if(fDistClosest < fCylinderRadius)
	{		
		float fHalfChordLength = sqrt(fCylinderRadius * fCylinderRadius - fDistClosest * fDistClosest);
		float fTIntersectMin = clamp((fTClosest - fHalfChordLength) / fProjScale, kNearClip, kFarClip);
		float fTIntersectMax = (fTClosest + fHalfChordLength) / fProjScale;	
		
		if(fTIntersectMax > fTIntersectMin)
		{	
			span.iMin.fDist = fTIntersectMin;
			span.iMin.vNormal = normalize(vProjDir * (fTClosest - fHalfChordLength) - vProjOffset );
			span.iMin.fObjectId = fObjectId;
	
			span.iMax.fDist = fTIntersectMax;
			span.iMax.vNormal = normalize(vProjDir * (fTClosest + fHalfChordLength) - vProjOffset );
			span.iMax.fObjectId = fObjectId;						
		}		
	}
}

void SpanUnion(out C_Span resultSpan, const in C_Span spanA, const in C_Span spanB)
{	
	// B is invalid
	if(INVALID_SPAN(spanB))
	{
		if(INVALID_SPAN(spanA))
		{
			SetupNullSpan(resultSpan);
		}
		else
		{
			resultSpan = spanA;
		}
	}
	else
	// A is invalid
	if(spanA.iMin.fDist >= spanA.iMax.fDist)
	{
		resultSpan = spanB;
	}
	else
	{
		if(spanA.iMin.fDist < spanB.iMin.fDist)
		{
			resultSpan.iMin = spanA.iMin;
		}
		else
		{
			resultSpan.iMin = spanB.iMin;
		}
		
		if(spanA.iMax.fDist > spanB.iMax.fDist)
		{
			resultSpan.iMax = spanA.iMax;
		}	
		else
		{
			resultSpan.iMax = spanB.iMax;			
		}
	}
}

void SpanIntersect(out C_Span resultSpan, const in C_Span spanA, const in C_Span spanB)
{	
	SetupNullSpan( resultSpan );
	
	if(spanA.iMin.fDist > spanB.iMin.fDist)
	{
		resultSpan.iMin = spanA.iMin;
	}
	else
	{
		resultSpan.iMin = spanB.iMin;
	}

	if(spanA.iMax.fDist < spanB.iMax.fDist)
	{
		resultSpan.iMax = spanA.iMax;
	}
	else
	{
		resultSpan.iMax = spanB.iMax;
	}
}

void SpanSubtract(out C_Span resultSpan, const in C_Span spanA, const in C_Span spanB)
{	
	SetupNullSpan( resultSpan );

	// a is invalid
	if(INVALID_SPAN(spanA))
	{
		return;
	}	

	// b is invalid
	if(INVALID_SPAN(spanB))
	{
		resultSpan = spanA;
		return;
	}
	
	{						
		// if we enter A before B
		if(spanA.iMin.fDist < spanB.iMin.fDist)
		{
			// if A completely infront of B
			if(spanA.iMax.fDist < spanB.iMin.fDist)
			{
				// AAAAA 
				//        BBBB
				// RRRRR
				resultSpan = spanA;
				
			}
			else
			{
				if(spanA.iMax.fDist < spanB.iMax.fDist)
				{
					// AAAAA
					//    BBBBBBB
					// RRR				
					resultSpan.iMin = spanA.iMin;
					resultSpan.iMax = spanB.iMin;
					resultSpan.iMax.vNormal = -resultSpan.iMax.vNormal;
				}
				else
				{
					// AAAAAAAAAAAAA
					//    BBBBBBB
					// RRR		 RRR
					
					resultSpan.iMin = spanA.iMin;
					// we need to choose the result here, really we should produce two spans
					if(false)
					{
						resultSpan.iMax = spanA.iMax;
					}
					else
					{
						resultSpan.iMax = spanB.iMin;
						resultSpan.iMax.vNormal = -resultSpan.iMax.vNormal;
					}
				}
			}				
		}
		// else we enter B before A
		else		
		// if B completely infront of A
		if(spanB.iMax.fDist < spanA.iMin.fDist)
		{
			//   		   AAAAAA
			//   BBBBBBB
			//		       RRRRRR
			resultSpan = spanA;			
		}
		else
		// if we leave B before A, select B max
		if(spanB.iMax.fDist < spanA.iMax.fDist)
		{
			//        AAAAAA
			//    BBBBBBB
			//		     RRR
			resultSpan.iMin = spanB.iMax;
			// negate normal
			resultSpan.iMin.vNormal = -resultSpan.iMin.vNormal;
			
			resultSpan.iMax = spanA.iMax;
		}
		// else we leave A before B
		else
		{
			//        AAAAAA
			//    BBBBBBBBBBBB
			//		    
		}
	}	
}


void TraceCappedCylinder( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir, const in vec3 vPos, const in float fRadius, const in float fObjectId )
{
	const vec3 vUp = vec3(0.0, 1.0, 0.0);
	
	C_Span cylinderSpan;
	TraceCylinder( cylinderSpan, vRayOrigin, vRayDir, vPos, vUp, fRadius, fObjectId );

	C_Span planeSpan;
	TracePlane( planeSpan, vRayOrigin, vRayDir, vUp, vPos.y, fObjectId );
	
	SpanIntersect(span, cylinderSpan, planeSpan);
}

const vec3 vCheesePointA = vec3(0.0, -0.8, -2.0);
const vec3 vCheesePointA1 = vec3(0.0, 1.5, -2.0);
const vec3 vCheesePointB = vec3(1.5, 1.5, 2.0);
const vec3 vCheesePointC = vec3(-1.5, 1.5, 2.0);

void TraceCheese( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir )
{
	const float fCheeseObjectId = 3.0;
	const float fRindObjectId = 4.0;	

	vec3 vPlaneANormal = normalize(cross(vCheesePointA1 - vCheesePointA, vCheesePointB - vCheesePointA));
	float fPlaneADist = dot(vCheesePointA, vPlaneANormal);
	
	vec3 vPlaneBNormal = -normalize(cross(vCheesePointA1 - vCheesePointA, vCheesePointC - vCheesePointA));
	float fPlaneBDist = dot(vCheesePointA, vPlaneBNormal);
	
	C_Span planeASpan;
	TracePlane( planeASpan, vRayOrigin, vRayDir, vPlaneANormal, fPlaneADist, fCheeseObjectId );

	C_Span planeBSpan;
	TracePlane( planeBSpan, vRayOrigin, vRayDir, vPlaneBNormal, fPlaneBDist, fCheeseObjectId );
	SpanIntersect(span, planeASpan, planeBSpan);

	C_Span planeTopSpan;
	TracePlane( planeTopSpan, vRayOrigin, vRayDir, vec3(0.0, 1.0, 0.0), vCheesePointA1.y, fCheeseObjectId );	
	SpanIntersect(span, span, planeTopSpan);
	
	vec3 vSphereCentre = (vCheesePointA + vCheesePointA1) * 0.5;
	float fSphereRadius = length(vCheesePointA - vCheesePointB);
	C_Span sphereSpan;
	TraceSphere( sphereSpan, vRayOrigin, vRayDir, vSphereCentre, fSphereRadius, fRindObjectId );
	SpanIntersect(span, span, sphereSpan);	
	
	//if(false)
	{
		const float fRepeat = 1.0;
		vec3 vPos = vRayOrigin + vRayDir * span.iMin.fDist;
		vec3 vHoleFract = mod(vPos, fRepeat);
		vec3 vHoleDiv = vPos - vHoleFract;
		float fRandom = fract(sin(vHoleDiv.x * 123.45 + vHoleDiv.y * 234.56 + vHoleDiv.z * 345.67));
		float fHoleSize = 0.1 + fRandom * 0.2;
		vec3 vRandomOffset = 0.5 + vec3(sin(fRandom * 12.34), sin(fRandom * 23.45), sin(fRandom * 34.56)) * 0.5;
		vec3 vHolePos = vHoleDiv + (fHoleSize + vRandomOffset * (1.0 - fHoleSize * 2.0)) * fRepeat;

		// no holes near rind
		if(length(vHolePos - vSphereCentre) < (fSphereRadius - fHoleSize * fRepeat))
		{		
			C_Span holeSpan;
			TraceSphere( holeSpan, vRayOrigin,  vRayDir, vHolePos, fHoleSize * fRepeat, fCheeseObjectId);	
			
			SpanSubtract( span, span, holeSpan );
		}
	}
}

void TraceTray( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir )
{
	const vec3 vPos = vec3(0.0, -0.8, 0.0);
	const float fRadius = 5.0;
	const vec3 vUp = vec3(0.0, 1.0, 0.0);
	
	C_Span cylinderSpan;
	TraceCylinder( cylinderSpan, vRayOrigin, vRayDir, vPos, vUp, fRadius, 5.0 );

	C_Span planeSpan;
	TracePlane( planeSpan, vRayOrigin, vRayDir, vUp, vPos.y, 5.0 );
	SpanIntersect(span, cylinderSpan, planeSpan);
}

void TraceCloche( out C_Span span, const in vec3 vRayOrigin, const in vec3 vRayDir )
{
	SetupNullSpan(span);

	float fBlend = clamp((iTime - 3.0) * 0.5, 0.0, 1.0);
	
	if(iTime==10.0) fBlend = 0.0;
	
	const vec3 vSphereOrigin1 = vec3(-5.5, -2.0, 5.0);
	const vec3 vSphereOrigin2 = vec3(0.0, -1.8, 0.0);
	const float fSphereRadius = 4.5;
	const float fSphereRadius2 = 0.3;
	
	vec3 vSphereOrigin = mix(vSphereOrigin2, vSphereOrigin1, sqrt(fBlend));
	vSphereOrigin.y += (fBlend * fBlend - fBlend) * -18.0;
	vec3 vDir = normalize(vSphereOrigin + vec3(0.0, 50.0, 0.0));
	
	C_Span sphereSpan;
	TraceSphere( sphereSpan, vRayOrigin,  vRayDir, vSphereOrigin, fSphereRadius, 5.0);	
	SpanUnion( span, span, sphereSpan );

	TraceSphere( sphereSpan, vRayOrigin,  vRayDir, vSphereOrigin - vDir * 0.1, fSphereRadius + 0.02, 5.0);	
	SpanSubtract( span, span, sphereSpan );

	TraceSphere( sphereSpan, vRayOrigin,  vRayDir, vSphereOrigin + vDir * (fSphereRadius + fSphereRadius2), fSphereRadius2, 5.0);	
	SpanUnion( span, span, sphereSpan );
	
}

void TraceScene( out C_Intersection outIntersection, const in vec3 vRayOrigin,  const in vec3 vRayDir )
{
	C_Span span;
	
	SetupNullSpan(span);
	
	C_Span pedistalSpan;
	TraceCappedCylinder( pedistalSpan, vRayOrigin, vRayDir, vec3(0.0, -1.0, 0.0), 8.0, 1.0 );
	SpanUnion( span, span, pedistalSpan );
	
	
	C_Span boardSpan;
	TraceTray( boardSpan, vRayOrigin, vRayDir );
	//TraceCappedCylinder( boardSpan, vRayOrigin, vRayDir, vec3(0.0, -0.8, 0.0), 5.0, 5.0 );	
	SpanUnion( span, span, boardSpan );	
	
	C_Span cheeseSpan;
	TraceCheese( cheeseSpan, vRayOrigin, vRayDir );
	SpanUnion( span, span, cheeseSpan );
	
	C_Span clocheSpan;
	TraceCloche( clocheSpan, vRayOrigin,  vRayDir );	
	SpanUnion( span, span, clocheSpan );
		
	outIntersection.vPos = vRayOrigin + vRayDir * span.iMin.fDist;
	outIntersection.fDist = span.iMin.fDist;
	outIntersection.vNormal = span.iMin.vNormal;
	if(abs(outIntersection.vNormal.y) > 0.3)
	{
		outIntersection.vUVW = outIntersection.vPos.xzy;
	}
	else
	{
		outIntersection.vUVW = outIntersection.vPos.xyx;
	}
	outIntersection.fObjectId = span.iMin.fObjectId;
}

float TraceShadow( const in vec3 vOrigin, const in vec3 vDir, const in float fDist )
{
	C_Intersection shadowIntersection;
	TraceScene(shadowIntersection, vOrigin, vDir);
	if(shadowIntersection.fObjectId != 0.0)
	{
		if(shadowIntersection.fDist < fDist)
		{
			return 0.0;		
		}
	}
	
	return 1.0;
}

// LIGHTING

void AddLighting(inout vec3 vDiffuseLight, inout vec3 vSpecularLight, const in vec3 vViewDir, const in vec3 vLightDir, const in vec3 vNormal, const in float fSmoothness, const in vec3 vLightColour)
{
	float fNDotL = clamp(dot(vLightDir, vNormal), 0.0, 1.0);
	
	vDiffuseLight += vLightColour * fNDotL;
	
	vec3 vHalfAngle = normalize(-vViewDir + vLightDir);
	float fSpecularPower = exp2(4.0 + 6.0 * fSmoothness);
	float fSpecularIntensity = (fSpecularPower + 2.0) * 0.125;
	vSpecularLight += vLightColour * fSpecularIntensity * clamp(pow(dot(vHalfAngle, vNormal), fSpecularPower), 0.0, 1.0) * fNDotL;
}

void AddPointLight(inout vec3 vDiffuseLight, inout vec3 vSpecularLight, const in vec3 vViewDir, const in vec3 vPos, const in vec3 vNormal, const in float fSmoothness, const in vec3 vLightPos, const in vec3 vLightColour)
{
	vec3 vToLight = vLightPos - vPos;	
	float fDistance2 = dot(vToLight, vToLight);
	float fAttenuation = 100.0 / (fDistance2);
	vec3 vLightDir = normalize(vToLight);
	
	vec3 vShadowRayDir = vLightDir;
	vec3 vShadowRayOrigin = vPos + vShadowRayDir * 0.01;

	float fShadowFactor = TraceShadow(vShadowRayOrigin, vShadowRayDir, length(vToLight));
	
	AddLighting(vDiffuseLight, vSpecularLight, vViewDir, vLightDir, vNormal, fSmoothness, vLightColour * fShadowFactor * fAttenuation);
}

void AddPointLightFlare(inout vec3 vEmissiveGlow, const in vec3 vRayOrigin, const in vec3 vRayDir, const in float fIntersectDistance, const in vec3 vLightPos, const in vec3 vLightColour, const in float fInvSpread)
{
    vec3 vToLight = vLightPos - vRayOrigin;
    float fPointDot = dot(vToLight, vRayDir);
    fPointDot = clamp(fPointDot / (max(fInvSpread,0.01)), 0.0, fIntersectDistance);

    vec3 vClosestPoint = vRayOrigin + vRayDir * fPointDot;
    float fDist = length(vClosestPoint - vLightPos);
	vEmissiveGlow += (vLightColour * 1.0 / (fDist * fDist));
}

void AddDirectionalLight(inout vec3 vDiffuseLight, inout vec3 vSpecularLight, const in vec3 vViewDir, const in vec3 vPos, const in vec3 vNormal, const in float fSmoothness, const in vec3 vLightDir, const in vec3 vLightColour)
{	
	const float fAttenuation = 1.0;

	vec3 vShadowRayDir = -vLightDir;
	vec3 vShadowRayOrigin = vPos + vShadowRayDir * 0.01;

	float fShadowFactor = TraceShadow(vShadowRayOrigin, vShadowRayDir, 10.0);
	
	AddLighting(vDiffuseLight, vSpecularLight, vViewDir, -vLightDir, vNormal, fSmoothness, vLightColour * fShadowFactor * fAttenuation);	
}

void AddDirectionalLightFlareToFog(inout vec3 vFogColour, const in vec3 vRayDir, const in vec3 vLightDir, const in vec3 vLightColour)
{
	float fDirDot = clamp(dot(-vLightDir, vRayDir), 0.0, 1.0);
	const float kSpreadPower = 4.0;
	vFogColour += vLightColour * pow(fDirDot, kSpreadPower) * 4.0;	
}

// SCENE MATERIALS

void GetSurfaceInfo(out vec3 vOutAlbedo, out vec3 vOutR0, out float fOutSmoothness, out vec3 vOutBumpNormal, const in C_Intersection intersection )
{
	vOutBumpNormal = intersection.vNormal;
	
	if(intersection.fObjectId == 1.0)
	{
		vec2 vUV = intersection.vUVW.xy*0.1;// + vec2(iTime * 0.5, 0.0);
		vOutAlbedo = texture(iChannel0, vUV).rgb;
		float fBumpScale = 1.0;
		
		vec2 vRes = iChannelResolution[0].xy;
		vec2 vDU = vec2(1.0, 0.0) / vRes;
		vec2 vDV = vec2(0.0, 1.0) / vRes;
		
		float fSampleW = texture(iChannel0, vUV - vDU).r;
		float fSampleE = texture(iChannel0, vUV + vDU).r;
		float fSampleN = texture(iChannel0, vUV - vDV).r;
		float fSampleS = texture(iChannel0, vUV + vDV).r;
		
		vec3 vNormalDelta = vec3(0.0);
		vNormalDelta.x += 
			( fSampleW * fSampleW
			 - fSampleE * fSampleE) * fBumpScale;
		vNormalDelta.z += 
			(fSampleN * fSampleN
			 - fSampleS * fSampleS) * fBumpScale;
		
		vOutBumpNormal = normalize(vOutBumpNormal + vNormalDelta);

		vOutAlbedo = vOutAlbedo * vOutAlbedo;	

		fOutSmoothness = vOutAlbedo.r * 0.7;//
		
		vOutR0 = vec3(0.25) * vOutAlbedo.r;
	}
	else if(intersection.fObjectId == 3.0)
	{
		vOutAlbedo = vec3(0.7, 0.6, 0.3);
		fOutSmoothness = 0.05;	
		vOutR0 = vec3(0.01);
	}
	else if(intersection.fObjectId == 4.0)
	{
		vOutAlbedo = vec3(0.7, 0.6, 0.3);
		fOutSmoothness = 0.0;	
		vOutR0 = vec3(0.01);
	}
	else if(intersection.fObjectId == 5.0)
	{
		vOutAlbedo = vec3(0.1);
		fOutSmoothness = 0.9;	
		vOutR0 = vec3(0.25, 0.28, 0.3);
	}
}

vec3 GetSkyColour( const in vec3 vDir, const in float fInvSpread )
{
	vec3 vResult = vec3(0.0);
	
	if(false)
	{
		vResult = mix(vec3(1.5, 2.5, 4.0), vec3(3.0, 5.0, 8.0), abs(vDir.y));
	}
	else
	{
		float kEnvmapExposure = 0.5;		
		
		vec3 vEnvMap = textureLod(iChannel2, vDir, 0.0).rgb;
		vEnvMap = vEnvMap * vEnvMap;
		vEnvMap = log2(1.0 - min(vEnvMap, 0.99)) / -kEnvmapExposure;

		vec3 vEnvMap2 = textureLod(iChannel3, vDir, 0.0).rgb;
		vEnvMap2 = vEnvMap2 * vEnvMap2;
		vEnvMap2 = log2(1.0 - min(vEnvMap2, 0.99)) / -kEnvmapExposure;
		
		vResult = mix(vEnvMap2, vEnvMap, fInvSpread);
	}
	
	return vResult;	
}

float GetFogFactor(const in float fDist)
{
	const float kFogDensity = 0.0005;
	return exp(fDist * -kFogDensity);	
}

vec3 GetFogColour(const in vec3 vDir)
{
	const vec3 vResult = vec3(0.4);
	
	return vResult;		
}

const vec3 vSunLightColour = vec3(1.0, 0.9, 0.6) * 2.0;
vec3 vSunLightDir = normalize(vec3(0.4, -0.3, 0.05));

const vec3 vLightPos = vec3(5.0, 2.5, 3.0);			
const vec3 vLightColour = vec3(0.6, 0.8, 1.0);

void ApplyAtmosphere(inout vec3 vColour, const in float fDist, const in vec3 vRayOrigin, const in vec3 vRayDir, const in float fInvSpread)
{		
	float fFogFactor = GetFogFactor(fDist);
	vec3 vFogColour = GetFogColour(vRayDir);			
	AddDirectionalLightFlareToFog(vFogColour, vRayDir, vSunLightDir, vSunLightColour);
	
	vec3 vGlow = vec3(0.0);
	AddPointLightFlare(vGlow, vRayOrigin, vRayDir, fDist, vLightPos, vLightColour, fInvSpread);					
	
	vColour = mix(vFogColour, vColour, fFogFactor) + vGlow;	
}

// TRACING LOOP

vec3 GetSceneColour( in vec3 vRayOrigin,  in vec3 vRayDir )
{
	vec3 vColour = vec3(0.0);
	vec3 vRemaining = vec3(1.0);
	
	float fInvSpread = 1.0;	
	
	for(int i=0; i<kIterations; i++)
	{	
		float fShouldApply = 1.0;
		vec3 vCurrRemaining = vRemaining;
		
		C_Intersection intersection;
		TraceScene( intersection, vRayOrigin, vRayDir );

		vec3 vResult = vec3(0.0);
		vec3 vBlendFactor = vec3(0.0);
						
		if(intersection.fObjectId == 0.0)
		{
			vBlendFactor = vec3(1.0);
			fShouldApply = 0.0;
		}
		else
		{		
			vec3 vAlbedo;
			vec3 vR0;
			float fSmoothness;
			vec3 vBumpNormal;
			
			GetSurfaceInfo( vAlbedo, vR0, fSmoothness, vBumpNormal, intersection );			
		
			vec3 vDiffuseLight = vec3(0.0);
			vec3 vSpecularLight = vec3(0.0);

			AddPointLight(vDiffuseLight, vSpecularLight, vRayDir, intersection.vPos, vBumpNormal, fSmoothness, vLightPos, vLightColour);								

			AddDirectionalLight(vDiffuseLight, vSpecularLight, vRayDir, intersection.vPos, vBumpNormal, fSmoothness, vSunLightDir, vSunLightColour);								
						
			if(intersection.fObjectId == 3.0)
			{
				// healthy cheese glow
				vec3 vCheesePointA = vec3(0.0, -0.8, -2.0);			
				vec3 vCheesePlane = normalize(cross(vCheesePointA1 - vCheesePointA, vCheesePointC - vCheesePointA));
				float dist = clamp(dot(intersection.vPos - vCheesePointA, vCheesePlane), 0.0, kFarClip);
				vDiffuseLight += clamp(vBumpNormal.y * 0.25 + 0.75, 0.0, 1.0) * vec3(0.5, 0.4, 0.2) * (exp2(-dist * 0.25) * 2.0 + 0.4);
			}

			vec3 vReflect = normalize(reflect(vRayDir, vBumpNormal));
			vec3 vHalf = normalize(vReflect + -vRayDir);
			float fSmoothFactor = fSmoothness * 0.9 + 0.1;
			vec3 vFresnel = vR0 + (1.0 - vR0) * pow(1.0 - dot(vHalf, -vRayDir), 5.0) * fSmoothFactor;
						
			vResult = mix(vAlbedo * vDiffuseLight, vSpecularLight, vFresnel);		
			vBlendFactor = vFresnel;
			
			ApplyAtmosphere(vResult, intersection.fDist, vRayOrigin, vRayDir, fInvSpread);
			
			vRemaining *= vBlendFactor;				
			vRayDir = vReflect;
			vRayOrigin = intersection.vPos;
			
			fInvSpread *= fSmoothness * fSmoothness;			
		}			

		vColour +=vResult * vCurrRemaining * fShouldApply;
	}
	
	vec3 vSkyColor = GetSkyColour(vRayDir, fInvSpread);
	ApplyAtmosphere(vSkyColor, kFarClip, vRayOrigin, vRayDir, fInvSpread);

	vColour += vSkyColor * vRemaining;
	
	return vColour;
}

void mainVR( out vec4 fragColor, in vec2 fragCoord, in vec3 fragRayOri, in vec3 fragRayDir )
{   
    fragRayOri *= 20.0;
    
    fragRayOri.z *= -1.0;
    fragRayDir.z *= -1.0;
    
    fragRayOri.x += 2.5;
    fragRayOri.z -= 5.0;
    
    fragRayOri.y += 8.0;
    
	vec3 vResult = GetSceneColour(fragRayOri, fragRayDir);
	
	vec3 vFinal = ApplyPostFX( vec2(0.5), vResult );
	
	fragColor = vec4(vFinal, 1.0);
}