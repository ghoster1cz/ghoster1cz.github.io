class Drawing_record {
    #_scaling_loc;
    #_scaling_matrix;

    #_transform_loc;
    #_transform_matrix;

    #_perspective_loc;
    #_perspective_matrix;

    #_vao;

    #_program;


    constructor(scaling_loc, scaling_matrix, transform_loc, transform_matrix, perspective_loc, perspective_matrix, vao, program) {
        this._scaling_loc = scaling_loc;
        this._scaling_matrix = scaling_matrix;
        this._transform_loc = transform_loc;
        this._transform_matrix = transform_matrix;
        this._perspective_loc = perspective_loc;
        this._perspective_matrix = perspective_matrix;
        this._vao = vao;
        this._program = program
    }

    get scaling_loc() {
        return this.#_scaling_loc;
    }

    set scaling_loc(value) {
        this.#_scaling_loc = value;
    }

    get scaling_matrix() {
        return this.#_scaling_matrix;
    }

    set scaling_matrix(value) {
        this.#_scaling_matrix = value;
    }

    get transform_loc() {
        return this.#_transform_loc;
    }

    set transform_loc(value) {
        this.#_transform_loc = value;
    }

    get transform_matrix() {
        return this.#_transform_matrix;
    }

    set transform_matrix(value) {
        this.#_transform_matrix = value;
    }

    get perspective_loc() {
        return this.#_perspective_loc;
    }

    set perspective_loc(value) {
        this.#_perspective_loc = value;
    }

    get perspective_matrix() {
        return this.#_perspective_matrix;
    }

    set perspective_matrix(value) {
        this.#_perspective_matrix = value;
    }

    get vao() {
        return this.#_vao;
    }

    set vao(value) {
        this.#_vao = value;
    }


    get program() {
        return this._program;
    }

    set program(value) {
        this._program = value;
    }
}

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
    }
}

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

async function setup_shader(gl) {
    let vert_source = await get_vert_shader();
    let frag_source = await get_frag_shader();

    let vert_shader = create_shader(gl, gl.VERTEX_SHADER, vert_source)
    let frag_shader = create_shader(gl, gl.FRAGMENT_SHADER, frag_source)

    let program = create_program(gl, vert_shader, frag_shader)

    return program;
}

function resize_canvas(gl){
    gl.canvas.width = 1920;
    gl.canvas.height = 1080;
}

function clear_viewport(gl, program) {
    gl.useProgram(program)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE)
}

function setup_position(gl, program, position_data, position_config){
    let position_loc = gl.getAttribLocation(program, "a_position")
    let position_buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position_data), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(position_loc)
    gl.vertexAttribPointer(position_loc, ...position_config)
}
function setup_indices(gl, program, indices_data){
    let indices_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices_buffer);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices_buffer);
}
function setup_color(gl, program, color_data, color_config){
    let color_loc = gl.getAttribLocation(program, "a_color")
    let color_buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_data), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(color_loc)
    gl.vertexAttribPointer(color_loc, ...color_config)
}

function apply_matrix(gl, program, matrix, uniform_location){
    let matrix_loc = gl.getUniformLocation(program, uniform_location);

    gl.uniformMatrix4fv(matrix_loc, false, matrix)
}
function apply_vector(gl, program, vector, uniform_location){
    let vector_loc = gl.getUniformLocation(program, uniform_location);

    gl.uniform4fv(vector_loc, vector)
}

function setup_draw(gl, program, x){
    resize_canvas(gl)
    clear_viewport(gl, program)
    
    let position_data = [
        -100, -100,  100,
         100, -100,  100,
         100,  100,  100,
        -100,  100,  100,

        -100, -100, -100,
         100, -100, -100,
         100,  100, -100,
        -100,  100, -100,
    ];
    let position_config = [
        3,
        gl.FLOAT,
        false,
        0,
        0,
    ];

    let color_data = [
      0, 1, 0, 1,
      0, 0, 1, 1,
      1, 0, 0, 1,
      0, 1, 0, 1,

      0, 1, 0, 1,
      0, 0, 1, 1,
      1, 0, 0, 1,
      0, 1, 0, 1,
    ];
    let color_config = [
        4,
        gl.FLOAT,
        false,
        0,
        0,
    ]

    let indices_data = [
        //FRONT
        0, 1, 2,
        0, 2, 3,

        // //BOTTOM
        0, 1, 5,
        0, 5, 4,

        // //BACK
        6, 5, 4,
        7, 6, 4,
        //
        // //TOP
        3, 2, 6,
        3, 6, 7,
        //
        // //LEFT
        4, 0, 3,
        4, 3, 7,
        //
        // //RIGHT
        1, 5, 6,
        1, 6, 2,
    ];

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao)

    setup_position(gl, program, position_data, position_config)
    setup_color(gl, program, color_data, color_config)
    setup_indices(gl, program, indices_data)

    gl.useProgram(program)

    apply_vector(gl, program, matrix_util.create_transform(0, 0, -400), "u_transform")
    apply_matrix(gl, program, matrix_util.create_z_scaling(1), "u_scaling")
    apply_matrix(gl, program, matrix_util.create_perspective(1.6, gl.canvas.clientWidth/gl.canvas.clientHeight, 0, 1000), "u_perspective")
    apply_matrix(gl, program, matrix_util.create_rotation_y(x), "u_rotation")


    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    x += 0.01

    requestAnimationFrame(() => setup_draw(gl, program, x))
}

function main(){
    let canvas = document.querySelector("#main-canvas");
    let ctx = canvas.getContext("webgl2", {depth: true, antialias: true});

    setup_shader(ctx).then(program => {
        setup_draw(ctx, program, 0)
    });
}

main();