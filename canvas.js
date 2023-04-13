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

    apply_params = function (){
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
const matrix_util = {
    create_perspective: function (fov, aspect, near, far) {
        let f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        let rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },
    create_z_scaling: function (z_factor){
        return [
            1, 0, 0, 0,
            0, 1, 0 ,0,
            0, 0, 1*z_factor, 0,
            0, 0, 0, 1
        ]
    },
    create_transform: function (x, y, z){
        return [
            x,
            y,
            z,
            1,
        ]
    },
    create_rotation_x: function (rad){
        return [
            1, 0, 0, 0,
            0, Math.cos(rad), -Math.sin(rad), 0,
            0, Math.sin(rad), Math.cos(rad), 0,
            0, 0, 0, 1
        ];
    },
    create_rotation_y: function (rad){
        return [
            Math.cos(rad), 0, Math.sin(rad), 0,
            0, 1, 0, 0,
            -Math.sin(rad), 0, Math.cos(rad), 0,
            0, 0, 0, 1
        ]
    },
    create_rotation_z: function (rad){
        return [
            Math.cos(rad), -Math.sin(rad), 0, 0,
            Math.sin(rad), Math.cos(rad), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    },
}

// Load and setup shaders
async function get_vert_shader(){
    let response = await fetch("http://localhost:8080/webgl/vert.glsl");
    const file = await response.text();

    return file;

}
async function get_frag_shader(){
    let response = await fetch("http://localhost:8080/webgl/frag.glsl");
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
function setup_default_params(gl, program){
    let transform_z = -6;
    let z_factor = 10;
    apply_vector(gl, program, [1, 1, 1, 1], "u_most_color");
    apply_vector(gl, program, [0, 0, -z_factor + transform_z, 0], "u_furthest_point")
    apply_vector(gl, program, [0, 0, transform_z, 0], "u_closest_point")
    apply_vector(gl, program, matrix_util.create_transform(0, 0, transform_z), "u_transform")
    apply_matrix(gl, program, matrix_util.create_z_scaling(z_factor), "u_scaling")
    apply_matrix(gl, program, matrix_util.create_perspective(1, gl.canvas.clientWidth/gl.canvas.clientHeight, 1, 1000), "u_perspective")
    apply_matrix(gl, program, matrix_util.create_rotation_x(0), "u_pre_rotation")
    apply_matrix(gl, program, matrix_util.create_rotation_x(0), "u_post_rotation")
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
function setup_draw(gl, program){
    resize_canvas(gl)
    clear_viewport(gl, program)
    setup_default_params(gl, program)

    let position_data, indices_data;
    let position_config = [
        3,
        gl.FLOAT,
        false,
        0,
        0,
    ];

    [position_data, indices_data] = create_pipe_vertices_and_indices(50, 1);
    let circle_1_params = [
        new UniformParam(gl, program, "vec4", "u_most_color", new vec4([1, 0, 0, 1])),
        new UniformParam(gl, program, "mat4", "u_pre_rotation", new mat4(matrix_util.create_rotation_y(1)))
    ]
    let circle_1 = new VaoData(gl.createVertexArray(), position_data, position_config, indices_data, circle_1_params);
    append_pos_and_elem_to_vao(gl, program, circle_1.vao, circle_1.positions, circle_1.positions_config, circle_1.indices);

    [position_data, indices_data] = create_pipe_vertices_and_indices(50, 2);
    let circle_2_params = [
        new UniformParam(gl, program, "vec4", "u_most_color", new vec4([0, 1, 0, 1])),
        new UniformParam(gl, program, "mat4", "u_pre_rotation", new mat4(matrix_util.create_rotation_y(-1)))
    ]
    let circle_2 = new VaoData(gl.createVertexArray(), position_data, position_config, indices_data, circle_2_params);
    append_pos_and_elem_to_vao(gl, program, circle_2.vao, circle_2.positions, circle_2.positions_config, circle_2.indices);

    [position_data, indices_data] = create_pipe_vertices_and_indices(50, 3);
    let circle_3_params = [
        new UniformParam(gl, program, "vec4", "u_most_color", new vec4([0, 0, 1, 1])),
        new UniformParam(gl, program, "mat4", "u_pre_rotation", new mat4(matrix_util.create_rotation_x(-1)))
    ]
    let circle_3 = new VaoData(gl.createVertexArray(), position_data, position_config, indices_data, circle_3_params);
    append_pos_and_elem_to_vao(gl, program, circle_3.vao, circle_3.positions, circle_3.positions_config, circle_3.indices);

    gl.useProgram(program)

    draw(gl, program, [circle_1, circle_2, circle_3])
}

// Drawing loop
function draw(gl, program, vao_data){
    for (let vao of vao_data) {
        setup_default_params(gl, program);
        vao.apply_params();
        draw_vao(gl, program, vao.vao, vao.indices_length)
    }

    requestAnimationFrame(() => draw(gl, program, vao_data))
}

// Get canvas and call setup_draw
function main(){
    let canvas = document.querySelector("#main-canvas");
    let ctx = canvas.getContext("webgl2", {depth: true, antialias: true, premultipliedAlpha: false});

    setup_shader(ctx).then(program => {
        setup_draw(ctx, program)
    });
}

main();