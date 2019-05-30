class KeywordDictionary
{
    constructor(name)
    {
        this.name = name;
        this.renderWords = {};
    }

    search(renderWord)
    {
        let searchWord = renderWord.type + '_' + renderWord.name;
        return this.renderWords.hasOwnProperty(searchWord);// return in Boolean
    }

    filter(word)
    {
        let filteredKeys = Object.keys(this.renderWords).filter((item) =>
        {
            if (item !== undefined && word !== undefined)
            {
                let serachPos = item.indexOf('_') + 1;
                return (item.toUpperCase().indexOf(word.toUpperCase(), serachPos) === serachPos ? true : false) && (item.toUpperCase() !== word.toUpperCase());
            }
        });

        let filteredRenders = [];

        filteredKeys.forEach(element =>
        {
            filteredRenders.push(this.renderWords[element].getData());
        });

        return filteredRenders;
    }

    add(renderWord)
    {
        let key = renderWord.type + '_' + renderWord.name;
        this.renderWords[key] = renderWord;
    }

    remove(renderWord)
    {
        let key = renderWord.type + '_' + renderWord.name;
        delete this.renderWords[key];
    }
}

class Struct
{
    constructor(data)
    {
      this.name = (data.name) ? data.name : null;
      this.members = (data.members) ? data.members : null;
    }
}

class Keyword
{
    constructor(data)
    {
        this.type = (data.type) ? data.type : null;
        this.name = (data.name) ? data.name : null;
        this.render = (data.render) ? data.render : null;
        this.args = (data.args) ? data.args : null;
        this.members = (data.members) ? data.members : null;
    }

    getData()
    {
        return {
            type: this.type,
            name: this.name,
            render: this.render,
            args: this.args,
        }
    }

    isFunction()
    {
        return this.args !== null;
    }
  
    isStruct()
    {
        return this.members !== null;
    }
  
    isVariable()
    {
        return !this.isFunction() && !this.isStruct();
    }
}
let dict = new KeywordDictionary('Image');
let tmpDict = [];
let res;
console.log('----RAW CODE----------------------------------------------------------------------------------');
res=`
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
switch(expression) {

   case constant-expression  :
      statement(s);
      break; /* optional */
	
   case constant-expression  :
      statement(s);
      break; /* optional */
  
   /* you can have any number of case statements */
   default : /* Optional */
   statement(s);
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
}`;
// console.log(res);
console.log('----PARSED CODE------------------------------------------------------------------------------');
let shadertoyTypes = ("float vec2 vec3 vec4 int ivec2 ivec3 ivec4 bool bvec2 bvec3 bvec4 mat2 mat3 mat4 void").split(" ");
let shadertoyTypes_and_define = shadertoyTypes.concat(); // For detecting "#define" as type.
shadertoyTypes_and_define.push('#define');
let allTypes = shadertoyTypes_and_define.concat();

// Check if the word is a type.
let isType=(str)=>{
    for (let i = 0; i < allTypes.length; i++)
    {
        if (str === allTypes[i]) return true;
    }
    return false;
};

let getBetweenStr =(str, start, end)=>{
  let startPos = str.indexOf(start);
  let endPos = str.indexOf(end, startPos);
  let strComment = str.substr(startPos, endPos-startPos+end.length);
  return strComment;
};
let removeStr =(str, removeStr)=>{
  return str.replace(removeStr, '');
};
let removeAllBetween=(str, regexp, start, end)=>{
  let res=str+'';
  while(res.match(regexp))
  {
    let strComment = getBetweenStr(res, start, end);
    res = res.replace(strComment, '');
  }
  return res;
};
let removeAllNested=(str, regexp, start, end)=>{
  let res = str+'';
  let deepestStart = str.lastIndexOf(start);
  let deepestEnd = str.indexOf(end, deepestStart);
  while(res.match(regexp))
  {
    res = res.replace(res.substr(deepestStart, deepestEnd-deepestStart+1), '');
    deepestStart = res.lastIndexOf(start);
    deepestEnd = res.indexOf(end, deepestStart);
  }
  return res;
};

let removeBlockComment =(str)=>{
  let res=str+'';
  res = removeAllBetween(res, /\/\*/g, '/*', '*/');
  return res;
};

let sanitizeLinesForStructs = (str)=>{
  let res = '';
  res = removeBlockComment(str);
  res = str.replace(/(?=[ ]+)\,/g, ',');
  res = res.replace(/\t/g, '');
  
  let tmp = res+'';
  res='';
  
  tmp.split(/\r\n|\r|\n/).forEach(element =>
      {
          element = element.split(/\/\//g)[0].trim();
          element = element.replace(/ const |\(const |\,const /g, ',');
          if (element !== '')
          {
              res += element;
          }
      });
  return res;
};
let analizeStructs = (str, dict)=>{
  str = sanitizeLinesForStructs(str);
  let isContainStruct = str.match(/struct/g);
  if(!isContainStruct)
  {
    return str;
  }
  else
  {
    let strStructs = [];
    while(str.match(/struct/g))
    {
      strStructs.push(getBetweenStr(str, 'struct', '}'));
      let strFull = strStructs[strStructs.length-1];
      str = removeStr(str, strFull);

      let strMembers = getBetweenStr(strFull, '{', '}');
      strFull = removeStr(strFull, strMembers);
      strMembers = removeStr(strMembers, /\{|\}/g);
      strMembers = strMembers.replace(/; |;| ;/g, ';');
      strMembers = strMembers.replace(/[ ]+/g, ' ');

      let arrMembers = strMembers.split(';');
      let members = [];
      for(let i=0; i<arrMembers.length; i++)
      {
        if(arrMembers[i]!=='')
        {
          let typeName = arrMembers[i].split(' ');
          members.push(new Keyword({type: typeName[0], name:typeName[1]}));
        }
      }
      
      let typeName = strFull.split(' ');
      dict.push(new Keyword({type:typeName[0], name:typeName[1], members:members}));
    }
    return str;
  }
};

let sanitizeLinesForMacroFunctionsVariables = (str)=>{
  let res = '';
  str = removeAllBetween(str, /struct/g, 'struct', '}');
  
  str.split(/\r\n|\r|\n/g).forEach(element =>
  {
      element = element.replace(/\{/g, '{;');
      element = element.replace(/\}/g, '');
      if (element.match(/#define/g))
      {
          element += ';';
      }
      if (element !== '')
      {
          res += element;
      }
  });
  return res;
};
let analizeMacroLine = (str, dict)=>{
    str = removeAllBetween(str, /\(/g, '(', ')').trim();
    let typeName = str.split(' ');
    dict.push(new Keyword({type:typeName[0], name:typeName[1]}));
};
let analizeFunctionLine = (str, dict)=>{
    // args
    let args = [];
    let strArgs = getBetweenStr(str, '(', ')');
    strArgs = strArgs.replace(/ ,|, |,/g, ',');
    strArgs = removeStr(strArgs, / in |\(in |\,in /g);
    strArgs = removeStr(strArgs, / out |\(out |\,out /g);
    strArgs = removeStr(strArgs, / inout |\(inout |\,inout /g);
    strArgs = strArgs.replace(/[ ]+/g, ' ');
    strArgs = removeStr(strArgs, /[()]/g);
    strArgs = strArgs.split(',');
    for(let i=0; i<strArgs.length; i++)
    {
        let arg = strArgs[i].split(/ /g);
        args.push(new Keyword({type:arg[0], name:arg[1]}));
    }

    // type/name
    let typeName = str.split(/[ (]/g);
    dict.push(new Keyword({type:typeName[0], name:typeName[1], args:args}));
};
let analizeVariables = (str, dict)=>{
    //#1: remove brackets
    str = removeAllNested(str, /\(|\)/g, '(', ')');
  
    //#2: remove initializing 
    let eqPos = str.indexOf('=');
    let cmPos = str.indexOf(/,/g);
    cmPos = (cmPos===-1)?str.length : cmPos;
    while(str.match('='))
    {
        str = str.replace(str.substr(eqPos, cmPos-eqPos+1), '');
        eqPos = str.indexOf('=');
        cmPos = str.indexOf(/,/g);
        cmPos = (cmPos===-1)?str.length:cmPos;
    }
    str = str.replace(/ ,|, |,/g, ',');
  
    let typeNames =str.split(/[ ,]/g);
    let type = typeNames[0];
    for(let j=1; j<typeNames.length; j++)
    {
      if(typeNames[j]!=='')
        {
          dict.push(new Keyword({type:type, name:typeNames[j]}));
        }
    }
};
let getLinesArray=(str)=>{
  let array=[];
  str.split(';').forEach(element =>{
     if(!element.match(/if|else|switch|for|return/g))
       {
         array.push(element);
       }
  });
  return array;
};
let analyzeMacroFuctionsVariables = (str, dict) =>{
  str = sanitizeLinesForMacroFunctionsVariables(str);
  let array = getLinesArray(str);
  
  for(let i=0; i<array.length; i++)
  {
    let lineStr = array[i].trim();
    let isMacro = lineStr.match(/#define/g);
    let isFunction = lineStr.match(/{/g);
    let isDefinition = isType(lineStr.split(' ')[0]);

    if(!isDefinition) continue;

    if(isMacro)
    {
      analizeMacroLine(lineStr, dict);
    }
    else
    if(isFunction)
    {
      analizeFunctionLine(lineStr, dict);
    }
    else
    {
      analizeVariables(lineStr, dict);
    }
  }
};

analizeStructs(res, tmpDict);
analyzeMacroFuctionsVariables(res, tmpDict);

tmpDict.forEach(el=>{
  console.log(el);
})
// for(let key in dict.renderWords){
//   console.log(dict.renderWords[key]);
// };