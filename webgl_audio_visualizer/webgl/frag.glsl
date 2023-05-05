#version 300 es

precision highp float;
in vec4 pos_color;

out vec4 out_color;

void main() {
    out_color = pos_color;
    out_color.rgb *= out_color.a;
}
