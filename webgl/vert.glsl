#version 300 es

precision highp float;
in vec4 a_position;

uniform vec4 u_most_color;
uniform vec4 u_least_color;

uniform vec4 u_furthest_point;
uniform vec4 u_closest_point;

uniform mat4 u_scaling;
uniform vec4 u_transform;
uniform mat4 u_perspective;
uniform mat4 u_look_at;

out vec4 pos_color;

vec4 color(vec4 position) {
    vec4 output_value = vec4(0,0,0,0);

//    output_value.x = ((u_most_color.x - u_least_color.x) * ((position.z - u_closest_point.z)/(u_furthest_point.z - u_closest_point.z))) + u_least_color.x;
//    output_value.y = ((u_most_color.y - u_least_color.y) * ((position.z - u_closest_point.z)/(u_furthest_point.z - u_closest_point.z))) + u_least_color.y;
//    output_value.z = ((u_most_color.z - u_least_color.z) * ((position.z - u_closest_point.z)/(u_furthest_point.z - u_closest_point.z))) + u_least_color.z;
//    output_value.w = ((u_most_color.w - u_least_color.w) * ((position.z - u_closest_point.z)/(u_furthest_point.z - u_closest_point.z))) + u_least_color.w;

    output_value = u_least_color + (u_most_color * (1.0 - ((position.z - u_closest_point.z)/(u_furthest_point.z - u_closest_point.z))));

    return output_value;
}

void main() {
    vec4 temp = (u_transform + u_scaling * a_position);
    pos_color = color(temp);
    gl_Position = u_perspective * u_look_at * temp;
}
