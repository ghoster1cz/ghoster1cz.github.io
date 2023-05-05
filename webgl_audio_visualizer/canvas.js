import {getAudioAnalyzer} from "./audio.js";

var fps_temp = Date.now()

// Vao with associated data and shader variables
class VaoData {
    vao;
    positions;
    positions_config;
    indices;
    indices_length;
    params;


    constructor(vao, positions, positions_config, indices, params) {
        this.indices_length = indices.length;
        this.vao = vao;
        this.positions = positions;
        this.positions_config = positions_config;
        this.indices = indices;
        this.params = params
    }

    apply_params() {
        for (let param of this.params) {
            if(param.uniform_type === "vec4"){
                apply_vector(param.gl, param.program, param.value.vec, param.location);
            } else if (param.uniform_type === "mat4"){
                apply_matrix(param.gl, param.program, param.value.mat, param.location);
            }
        }
    }
}

// Used in VaoData as shader variables
class UniformParam {
    uniform_type;
    location;
    program;
    value;
    gl;


    constructor(gl, program, uniform_type, location, value) {
        this.uniform_type = uniform_type;
        this.location = location;
        this.program = program;
        this.value = value;
        this.gl = gl;
    }
}

class DrawParams {
    _number_of_circle = 100;
    _least_color = [0, 1, 0, 0]
    _most_color = [1, 0, 0, 1]
    _look_at_pos = [1000, 0, 100]
    _look_at_target = [0, 0, -300]
    _look_at_up = [0, 0, 1]


    get number_of_circle() {
        return this._number_of_circle;
    }

    set number_of_circle(value) {
        this._number_of_circle = value;
    }

    get least_color() {
        return this._least_color;
    }

    set least_color(value) {
        this._least_color = value;
    }

    get most_color() {
        return this._most_color;
    }

    set most_color(value) {
        this._most_color = value;
    }

    get look_at_pos() {
        return this._look_at_pos;
    }

    set look_at_pos(value) {
        this._look_at_pos = value;
    }

    get look_at_target() {
        return this._look_at_target;
    }

    set look_at_target(value) {
        this._look_at_target = value;
    }

    get look_at_up() {
        return this._look_at_up;
    }

    set look_at_up(value) {
        this._look_at_up = value;
    }
}

class vec4 {
    x;
    y;
    z;
    w;

    constructor(vec) {
        this.x = vec[0]
        this.y = vec[1]
        this.z = vec[2]
        this.w = vec[3]
    }

    get vec(){
        return [
            this.x,
            this.y,
            this.z,
            this.w,
        ]
    }
}

class mat4 {
    x1 = 1; y1 = 0; z1 = 0; w1 = 0;
    x2 = 0; y2 = 1; z2 = 0; w2 = 0;
    x3 = 0; y3 = 0; z3 = 1; w3 = 0;
    x4 = 0; y4 = 0; z4 = 0; w4 = 1;

    constructor(mat) {
        this.x1 = mat[0]
        this.y1 = mat[1]
        this.z1 = mat[2]
        this.w1 = mat[3]
        this.x2 = mat[4]
        this.y2 = mat[5]
        this.z2 = mat[6]
        this.w2 = mat[7]
        this.x3 = mat[8]
        this.y3 = mat[9]
        this.z3 = mat[10]
        this.w3 = mat[11]
        this.x4 = mat[12]
        this.y4 = mat[13]
        this.z4 = mat[14]
        this.w4 = mat[15]
    }

    get mat(){
        return [
            this.x1, this.y1, this.z1, this.w1,
            this.x2, this.y2, this.z2, this.w2,
            this.x3, this.y3, this.z3, this.w3,
            this.x4, this.y4, this.z4, this.w4,
        ]
    }
}

// Util for creating matrices
class matrix_util {
    static normalize(v){
        let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (length !== 0) {
            return [v[0] / length, v[1] / length, v[2] / length];
        } else {
            return [0, 0, 0];
        }
    }
    static subtract_vectors(v1, v2){
        return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
    }
    static cross(v1, v2){
        return [v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]];
    }
    static inverse(mat){
        let dst = [];
        let mat00 = mat[0];
        let mat01 = mat[1];
        let mat02 = mat[2];
        let mat03 = mat[3];
        let mat10 = mat[4];
        let mat11 = mat[5];
        let mat12 = mat[6];
        let mat13 = mat[7];
        let mat20 = mat[8];
        let mat21 = mat[9];
        let mat22 = mat[10];
        let mat23 = mat[11];
        let mat30 = mat[12];
        let mat31 = mat[13];
        let mat32 = mat[14];
        let mat33 = mat[15];
        let tmatp_0  = mat22 * mat33;
        let tmatp_1  = mat32 * mat23;
        let tmatp_2  = mat12 * mat33;
        let tmatp_3  = mat32 * mat13;
        let tmatp_4  = mat12 * mat23;
        let tmatp_5  = mat22 * mat13;
        let tmatp_6  = mat02 * mat33;
        let tmatp_7  = mat32 * mat03;
        let tmatp_8  = mat02 * mat23;
        let tmatp_9  = mat22 * mat03;
        let tmatp_10 = mat02 * mat13;
        let tmatp_11 = mat12 * mat03;
        let tmatp_12 = mat20 * mat31;
        let tmatp_13 = mat30 * mat21;
        let tmatp_14 = mat10 * mat31;
        let tmatp_15 = mat30 * mat11;
        let tmatp_16 = mat10 * mat21;
        let tmatp_17 = mat20 * mat11;
        let tmatp_18 = mat00 * mat31;
        let tmatp_19 = mat30 * mat01;
        let tmatp_20 = mat00 * mat21;
        let tmatp_21 = mat20 * mat01;
        let tmatp_22 = mat00 * mat11;
        let tmatp_23 = mat10 * mat01;

        let t0 = (tmatp_0 * mat11 + tmatp_3 * mat21 + tmatp_4 * mat31) -
            (tmatp_1 * mat11 + tmatp_2 * mat21 + tmatp_5 * mat31);
        let t1 = (tmatp_1 * mat01 + tmatp_6 * mat21 + tmatp_9 * mat31) -
            (tmatp_0 * mat01 + tmatp_7 * mat21 + tmatp_8 * mat31);
        let t2 = (tmatp_2 * mat01 + tmatp_7 * mat11 + tmatp_10 * mat31) -
            (tmatp_3 * mat01 + tmatp_6 * mat11 + tmatp_11 * mat31);
        let t3 = (tmatp_5 * mat01 + tmatp_8 * mat11 + tmatp_11 * mat21) -
            (tmatp_4 * mat01 + tmatp_9 * mat11 + tmatp_10 * mat21);

        let d = 1.0 / (mat00 * t0 + mat10 * t1 + mat20 * t2 + mat30 * t3);

        dst[0] = d * t0;
        dst[1] = d * t1;
        dst[2] = d * t2;
        dst[3] = d * t3;
        dst[4] = d * ((tmatp_1 * mat10 + tmatp_2 * mat20 + tmatp_5 * mat30) -
            (tmatp_0 * mat10 + tmatp_3 * mat20 + tmatp_4 * mat30));
        dst[5] = d * ((tmatp_0 * mat00 + tmatp_7 * mat20 + tmatp_8 * mat30) -
            (tmatp_1 * mat00 + tmatp_6 * mat20 + tmatp_9 * mat30));
        dst[6] = d * ((tmatp_3 * mat00 + tmatp_6 * mat10 + tmatp_11 * mat30) -
            (tmatp_2 * mat00 + tmatp_7 * mat10 + tmatp_10 * mat30));
        dst[7] = d * ((tmatp_4 * mat00 + tmatp_9 * mat10 + tmatp_10 * mat20) -
            (tmatp_5 * mat00 + tmatp_8 * mat10 + tmatp_11 * mat20));
        dst[8] = d * ((tmatp_12 * mat13 + tmatp_15 * mat23 + tmatp_16 * mat33) -
            (tmatp_13 * mat13 + tmatp_14 * mat23 + tmatp_17 * mat33));
        dst[9] = d * ((tmatp_13 * mat03 + tmatp_18 * mat23 + tmatp_21 * mat33) -
            (tmatp_12 * mat03 + tmatp_19 * mat23 + tmatp_20 * mat33));
        dst[10] = d * ((tmatp_14 * mat03 + tmatp_19 * mat13 + tmatp_22 * mat33) -
            (tmatp_15 * mat03 + tmatp_18 * mat13 + tmatp_23 * mat33));
        dst[11] = d * ((tmatp_17 * mat03 + tmatp_20 * mat13 + tmatp_23 * mat23) -
            (tmatp_16 * mat03 + tmatp_21 * mat13 + tmatp_22 * mat23));
        dst[12] = d * ((tmatp_14 * mat22 + tmatp_17 * mat32 + tmatp_13 * mat12) -
            (tmatp_16 * mat32 + tmatp_12 * mat12 + tmatp_15 * mat22));
        dst[13] = d * ((tmatp_20 * mat32 + tmatp_12 * mat02 + tmatp_19 * mat22) -
            (tmatp_18 * mat22 + tmatp_21 * mat32 + tmatp_13 * mat02));
        dst[14] = d * ((tmatp_18 * mat12 + tmatp_23 * mat32 + tmatp_15 * mat02) -
            (tmatp_22 * mat32 + tmatp_14 * mat02 + tmatp_19 * mat12));
        dst[15] = d * ((tmatp_22 * mat22 + tmatp_16 * mat02 + tmatp_21 * mat12) -
            (tmatp_20 * mat12 + tmatp_23 * mat22 + tmatp_17 * mat02));

        return dst;
    }

    static create_perspective(fov, aspect, near, far) {
        let f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        let rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }
    static create_z_scaling(z_factor){
        return [
            1, 0, 0, 0,
            0, 1, 0 ,0,
            0, 0, 1*z_factor, 0,
            0, 0, 0, 1
        ]
    }
    static create_transform(x, y, z){
        return [
            x,
            y,
            z,
            1,
        ]
    }
    static create_rotation_x(rad){
        return [
            1, 0, 0, 0,
            0, Math.cos(rad), -Math.sin(rad), 0,
            0, Math.sin(rad), Math.cos(rad), 0,
            0, 0, 0, 1
        ];
    }
    static create_rotation_y(rad){
        return [
            Math.cos(rad), 0, Math.sin(rad), 0,
            0, 1, 0, 0,
            -Math.sin(rad), 0, Math.cos(rad), 0,
            0, 0, 0, 1
        ]
    }
    static create_rotation_z(rad){
        return [
            Math.cos(rad), -Math.sin(rad), 0, 0,
            Math.sin(rad), Math.cos(rad), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    }
    static create_look_at(cameraPosition, target, up){
        let zAxis = matrix_util.normalize(
            matrix_util.subtract_vectors(cameraPosition, target));
        let xAxis = matrix_util.normalize(matrix_util.cross(up, zAxis));
        let yAxis = matrix_util.normalize(matrix_util.cross(zAxis, xAxis));

        return this.inverse([
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            cameraPosition[0],
            cameraPosition[1],
            cameraPosition[2],
            1,
        ]);
    }
}

// Load and setup shaders
async function get_vert_shader(){
    let response = await fetch("https://ghoster1cz.github.io/webgl_audio_visualizer/webgl/vert.glsl");
    const file = await response.text();

    return file;

}
async function get_frag_shader(){
    let response = await fetch("https://ghoster1cz.github.io/webgl_audio_visualizer/webgl/frag.glsl");
    const file = await response.text();

    return file;
}
async function setup_shader(gl) {
    let vert_source = await get_vert_shader();
    let frag_source = await get_frag_shader();

    let vert_shader = create_shader(gl, gl.VERTEX_SHADER, vert_source)
    let frag_shader = create_shader(gl, gl.FRAGMENT_SHADER, frag_source)

    let program = create_program(gl, vert_shader, frag_shader)

    return program;
}


// Create shaders and program
function create_shader(gl, type, source){
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    return shader;
}
function create_program(gl, vert_shader, frag_shader){
    let program = gl.createProgram();

    gl.attachShader(program, vert_shader);
    gl.attachShader(program, frag_shader);
    gl.linkProgram(program)

    return program
}

// Clear and resize canvas
function resize_canvas(gl){
    gl.canvas.width = 1920;
    gl.canvas.height = 1080;
}
function clear_viewport(gl, program) {
    gl.useProgram(program)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

// Setup and apply position buffer a element buffer;
function setup_indices(gl, program, indices_data){
    let indices_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices_buffer);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices_buffer);
}
function setup_position(gl, program, position_data, position_config){
    let position_loc = gl.getAttribLocation(program, "a_position")
    let position_buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position_data), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(position_loc)
    gl.vertexAttribPointer(position_loc, ...position_config)
}

// Set default shader uniform values
function setup_repeated_default_params(gl, program){
    let transform_z = 0;
    let z_factor = 255;
    apply_vector(gl, program, matrix_util.create_transform(0, 0, transform_z), "u_transform")
    apply_matrix(gl, program, matrix_util.create_z_scaling(z_factor), "u_scaling")
}
function setup_once_default_params(gl, program, draw_params){
    let transform_z = -10;
    let z_factor = 225*5;
    let look_at_pos = [1000, 0, 100]
    apply_vector(gl, program, draw_params.most_color, "u_most_color");
    apply_vector(gl, program, draw_params.least_color, "u_least_color");
    apply_vector(gl, program, [0, 0, -z_factor + transform_z, 0], "u_furthest_point")
    apply_vector(gl, program, [0, 0, transform_z, 0], "u_closest_point")
    apply_matrix(gl, program, matrix_util.create_perspective(1.6, gl.canvas.clientWidth/gl.canvas.clientHeight, 1, 10000), "u_perspective")
    apply_matrix(gl, program, matrix_util.create_look_at(draw_params.look_at_pos, draw_params.look_at_target, draw_params.look_at_up), "u_look_at");

}

// Create vertices and indices of pipe
function create_pipe_vertices_and_indices(lod, scaling_factor){
    let vertices = [], indices = [];

    let spacing = (2 * Math.PI) / lod;
    for (let i = 0; i < lod; i++) {
        vertices.push(Math.cos(spacing * i)*scaling_factor, Math.sin(spacing * i)*scaling_factor, 0)
        vertices.push(Math.cos(spacing * i)*scaling_factor, Math.sin(spacing * i)*scaling_factor, -1)

        indices.push(i*2 + 0, i*2 + 1, i*2 + 2)
        indices.push(i*2 + 1, i*2 + 3, i*2 + 2)
    }

    let temp = [indices[indices.length-6], indices[indices.length-5], 0, indices[indices.length-5], 1, 0]
    indices = indices.slice(0, -6)
    indices.push(...temp)


    return [vertices, indices]
}

// Bind position buffer and element buffer to vao
function append_pos_and_elem_to_vao(gl, program, vao, pos, pos_config, indices){
    gl.bindVertexArray(vao)
    setup_position(gl, program, pos, pos_config)
    setup_indices(gl, program, indices)
}

// Draw triangles from data bind to vao
function draw_vao(gl, program, vao, number_of_indices){
    gl.bindVertexArray(vao)


    gl.drawElements(gl.TRIANGLES, number_of_indices, gl.UNSIGNED_SHORT, 0);
}

// Change values of uniforms in shader
function apply_matrix(gl, program, matrix, uniform_location){
    let matrix_loc = gl.getUniformLocation(program, uniform_location);

    gl.uniformMatrix4fv(matrix_loc, false, matrix)
}
function apply_vector(gl, program, vector, uniform_location){
    let vector_loc = gl.getUniformLocation(program, uniform_location);

    gl.uniform4fv(vector_loc, vector)
}

// Setup model, vaos, etc before calling drawing loop
function setup_draw(gl, program, draw_params){
    resize_canvas(gl)
    clear_viewport(gl, program)
    setup_repeated_default_params(gl, program)

    let position_data, indices_data;
    let position_config = [
        3,
        gl.FLOAT,
        false,
        0,
        0,
    ];

    let number_of_circles = 100;
    let circles = [];
    let circles_params = [
        new UniformParam(gl, program, "vec4", "u_transform", new vec4([0, 0, -10, 0])),
        new UniformParam(gl, program, "mat4", "u_scaling", new mat4(matrix_util.create_z_scaling(0)))
    ];

    setup_once_default_params(gl, program, draw_params)



    for (let i = 0; i < number_of_circles; i++) {
        let lod = 80;
        if(i < 50){lod -= i}
        [position_data, indices_data] = create_pipe_vertices_and_indices(lod, i**1.5);

        circles.push(new VaoData(gl.createVertexArray(), position_data, position_config, indices_data, circles_params));
        append_pos_and_elem_to_vao(gl, program, circles[i].vao, circles[i].positions, circles[i].positions_config, circles[i].indices);
    }

    gl.useProgram(program)

    return [program, circles]
}

function get_fps(){
    let now = Date.now();
    let fps = 1000 / (now - fps_temp)
    fps_temp = now;
    document.querySelector("#fps").textContent = fps;
}

function draw(gl, program, vao_data, audio_analyzer){
    let furthest_point = -255*5;
    let z_factor, z_transform;
    let circle = 0

    for (let vao of vao_data) {
        setup_repeated_default_params(gl, program);
        vao.apply_params();


        z_factor = audio_analyzer.get_altered_sum_between_range(circle * (25000/vao_data.length), (circle + 1) * (25000/vao_data.length)) * 5
        z_transform = furthest_point + z_factor;

        circle += 0.2;

        vao.params[0].value.z = z_transform
        vao.params[1].value.z3 = z_factor

        draw_vao(gl, program, vao.vao, vao.indices_length)
    }

    get_fps()
    requestAnimationFrame(() => draw(gl, program, vao_data, audio_analyzer))
}
// Drawing loop

export {DrawParams, setup_draw, setup_shader, draw};
