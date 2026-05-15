export const postVert = `
precision mediump float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
void main(){
  vTexCoord = aTexCoord;
  gl_Position = vec4(aPosition,1.0);
}`;

export const postFrag = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 resolution;
uniform float time;

vec3 chroma(vec2 uv){
  float shift = 0.0025;
  float r = texture2D(tex0, uv + vec2(shift, 0.0)).r;
  float g = texture2D(tex0, uv).g;
  float b = texture2D(tex0, uv - vec2(shift, 0.0)).b;
  return vec3(r,g,b);
}

void main(){
  vec2 uv = vTexCoord;
  vec2 center = uv - .5;
  float v = smoothstep(.95,.2,length(center));
  vec2 distort = uv + center * 0.016 * sin(time * 1.8 + uv.yx * 25.0);
  vec3 col = chroma(distort);
  vec3 bloom = col * 1.55;
  gl_FragColor = vec4(mix(col, bloom, 0.45) * v, 1.0);
}`;
