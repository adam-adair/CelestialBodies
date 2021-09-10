precision mediump float;
varying vec4 v_color;
varying float v_useTexture;
uniform sampler2D sampler0;
varying vec2 v_texCoord;
void main() {
  if(v_texCoord.y == -99.0) {
    gl_FragColor = vec4(0.0,0.5,0.5,0.5);
  } else {
    gl_FragColor =  v_color * texture2D(sampler0, v_texCoord);
  }
}