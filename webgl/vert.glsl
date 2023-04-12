#version 300 es

precision highp float;
in vec4 a_position;
in vec4 a_color;

uniform vec4 u_transform;
uniform mat4 u_perspective;
uniform mat4 u_scaling;
uniform mat4 u_rotation;

out vec4 v_color;


void main() {
    v_color = a_color;
    gl_Position = u_perspective * (u_transform + u_rotation * u_scaling * a_position);
}
