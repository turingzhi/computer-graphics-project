#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(location = 0) in vec3 fragPos;
layout(location = 1) in vec3 fragNorm;
layout(location = 2) in vec2 fragUV;

layout(location = 0) out vec4 outColor;

layout(binding = 1, set = 1) uniform sampler2D tex;
layout(binding = 2, set = 1) uniform sampler2D detail;

layout(binding = 0, set = 0) uniform GlobalUniformBufferObject {
    vec3 lightDir1;
    vec4 lightColor1;
    vec3 lightDir2;
    vec4 lightColor2;
    vec3 lightDir3;
    vec4 lightColor3;
    vec3 lightDir4;
    vec4 lightColor4;
    vec3 lightDir5;
    vec4 lightColor5;
    vec3 lightDir6;
    vec4 lightColor6;

    vec3 pointLightPos;
    vec4 pointLightColor;

    vec3 spotLightPos;      // 聚光灯位置
    vec3 spotLightDir;      // 聚光灯方向（已归一化）
    vec4 spotLightColor;    // 光颜色
    float innerCutoff;      // 内角cos值（如 cos(radians(12.5))）
    float outerCutoff;      // 外角cos值（如 cos(radians(17.5))）

    vec3 eyePos;
    vec3 ambLightColor;
} gubo;


const float PI = 3.14159265359;

// Normal Distribution function --------------------------------------
float D_GGX(float dotNH, float roughness)
{
    float alpha = roughness * roughness;
    float alpha2 = alpha * alpha;
    float denom = dotNH * dotNH * (alpha2 - 1.0f) + 1.0f;
    return (alpha2)/(PI * denom*denom);
}

// Geometric Shadowing function --------------------------------------
float G_SchlicksmithGGX(float dotNL, float dotNV, float roughness)
{
    float r = (roughness + 1.0f);
    float k = (r*r) / 8.0f;
    float GL = dotNL / (dotNL * (1.0f - k) + k);
    float GV = dotNV / (dotNV * (1.0f - k) + k);
    return GL * GV;
}

// Fresnel function ----------------------------------------------------
vec3 F_Schlick(float cosTheta, float metallic, vec3 materialcolor)
{
    vec3 F0 = mix(vec3(0.04f), materialcolor, metallic); // * material.specular
    vec3 F = F0 + (vec3(1.0f) - F0) * pow(1.0f - cosTheta, 5.0f);
    return F;
}

// Specular BRDF composition --------------------------------------------

vec3 BRDF(vec3 L, vec3 V, vec3 N, float metallic, float roughness, vec3 materialcolor)
{
    // Precalculate vectors and dot products
    vec3 H = normalize (V + L);
    float dotNV = clamp(dot(N, V), 0.0f, 1.0f);
    float dotNL = clamp(dot(N, L), 0.0f, 1.0f);
    float dotLH = clamp(dot(L, H), 0.0f, 1.0f);
    float dotNH = clamp(dot(N, H), 0.0f, 1.0f);

    vec3 color = vec3(0.0f);

    if (dotNL > 0.0f)
    {
        float rroughness = max(0.05f, roughness);
        // D = Normal distribution (Distribution of the microfacets)
        float D = D_GGX(dotNH, roughness);
        // G = Geometric shadowing term (Microfacets shadowing)
        float G = G_SchlicksmithGGX(dotNL, dotNV, rroughness);
        // F = Fresnel factor (Reflectance depending on angle of incidence)
        vec3 F = F_Schlick(dotNV, metallic, materialcolor);

        vec3 spec = D * F * G / (4.0f * dotNV);

        color += spec;
    }

    return color;
}

void main() {


    vec3 Norm = normalize(fragNorm);
    vec3 EyeDir = normalize(gubo.eyePos - fragPos);

    vec3 albedo = texture(tex, fragUV).rgb * (3.0 + texture(detail, fragPos.xz)).rgb / 4.0;

    // 第一束光
    vec3 L1 = normalize(gubo.lightDir1);
    float NdotL1 = clamp(dot(Norm, L1), 0.0f, 1.0f);
    vec3 Diffuse1 = albedo * NdotL1;
    vec3 Specular1 = BRDF(L1, EyeDir, Norm, 0.9f, 0.2f, albedo);
    vec3 color1 = (Diffuse1 + Specular1) * gubo.lightColor1.rgb;

    // 第二束光
    vec3 L2 = normalize(gubo.lightDir2);
    float NdotL2 = clamp(dot(Norm, L2), 0.0f, 1.0f);
    vec3 Diffuse2 = albedo * NdotL2;
    vec3 Specular2 = BRDF(L2, EyeDir, Norm, 0.9f, 0.2f, albedo);
    vec3 color2 = (Diffuse2 + Specular2) * gubo.lightColor2.rgb;

    // 第三束光
    vec3 L3 = normalize(gubo.lightDir3);
    float NdotL3 = clamp(dot(Norm, L3), 0.0f, 1.0f);
    vec3 Diffuse3 = albedo * NdotL3;
    vec3 Specular3 = BRDF(L3, EyeDir, Norm, 0.9f, 0.2f, albedo);
    vec3 color3 = (Diffuse3 + Specular3) * gubo.lightColor3.rgb;

    // 第四束光
    vec3 L4 = normalize(gubo.lightDir4);
    float NdotL4 = clamp(dot(Norm, L4), 0.0f, 1.0f);
    vec3 Diffuse4 = albedo * NdotL4;
    vec3 Specular4 = BRDF(L4, EyeDir, Norm, 0.9f, 0.2f, albedo);
    vec3 color4 = (Diffuse4 + Specular4) * gubo.lightColor4.rgb;

    // 第五束光
    vec3 L5 = normalize(gubo.lightDir5);
    float NdotL5 = clamp(dot(Norm, L5), 0.0f, 1.0f);
    vec3 Diffuse5 = albedo * NdotL5;
    vec3 Specular5 = BRDF(L5, EyeDir, Norm, 0.9f, 0.2f, albedo);
    vec3 color5 = (Diffuse5 + Specular5) * gubo.lightColor5.rgb;

    // 第六束光
    vec3 L6 = normalize(gubo.lightDir6);
    float NdotL6 = clamp(dot(Norm, L6), 0.0f, 1.0f);
    vec3 Diffuse6 = albedo * NdotL6;
    vec3 Specular6 = BRDF(L6, EyeDir, Norm, 0.9f, 0.2f, albedo);
    vec3 color6 = (Diffuse6 + Specular6) * gubo.lightColor6.rgb;

    // 点光源计算
    vec3 pointLightDir = normalize(gubo.pointLightPos - fragPos);
    float pointDistance = length(gubo.pointLightPos - fragPos);
    float attenuation = 1.0 / (pointDistance * pointDistance); // 可调节

    float NdotPL = max(dot(Norm, pointLightDir), 0.0);
    vec3 DiffuseP = albedo * NdotPL;
    vec3 SpecularP = BRDF(pointLightDir, EyeDir, Norm, 0.9, 0.2, albedo);

    vec3 colorP = (DiffuseP + SpecularP) * gubo.pointLightColor.rgb * attenuation;

    // 聚光灯光照方向
    vec3 lightToFrag = normalize(fragPos - gubo.spotLightPos);
    float theta = dot(lightToFrag, normalize(-gubo.spotLightDir));

    // 判断是否在聚光锥内
    float epsilon = gubo.innerCutoff - gubo.outerCutoff;
    float intensity = clamp((theta - gubo.outerCutoff) / epsilon, 0.0, 1.0);

    // 衰减
    float distance = length(gubo.spotLightPos - fragPos);
    float attenuationSpot = 1.0 / (distance * distance); // 可加常数调节

    // Diffuse + Specular
    float NdotS = max(dot(Norm, -lightToFrag), 0.0);
    vec3 DiffuseS = albedo * NdotS;
    vec3 SpecularS = BRDF(-lightToFrag, EyeDir, Norm, 0.9, 0.2, albedo);

    // 聚光灯颜色乘以强度和衰减
    vec3 colorSpot = (DiffuseS + SpecularS) * gubo.spotLightColor.rgb * intensity * attenuationSpot;

    // 环境光（CPU 和 shader 自定义）
    vec3 ambientFromCPU = gubo.ambLightColor * albedo;

    const vec3 cxp = vec3(1.0,0.5,0.5) * 0.15;
    const vec3 cxn = vec3(0.9,0.6,0.4) * 0.15;
    const vec3 cyp = vec3(0.3,1.0,1.0) * 0.15;
    const vec3 cyn = vec3(0.5,0.5,0.5) * 0.15;
    const vec3 czp = vec3(0.8,0.2,0.4) * 0.15;
    const vec3 czn = vec3(0.3,0.6,0.7) * 0.15;

    vec3 ambientCustom = ((Norm.x > 0 ? cxp : cxn) * (Norm.x * Norm.x) +
    (Norm.y > 0 ? cyp : cyn) * (Norm.y * Norm.y) +
    (Norm.z > 0 ? czp : czn) * (Norm.z * Norm.z)) * albedo;

    vec3 Ambient = ambientFromCPU + ambientCustom;

    // 最终颜色组合
    //	vec3 col = color1 + color2 + color3 + color4 + color5 + color6 + colorP + colorSpot + Ambient;
    vec3 col = color1 + color2 + color3 + color4 + color5 + color6 + Ambient;
    outColor = vec4(col, 1.0f);
}