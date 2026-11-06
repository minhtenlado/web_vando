/** Original generative signal surface. No product geometry or external assets. */
export function createSignalField(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  const dispose = () => {
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
  };
  try {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Shader unavailable');
      shaders.push(shader);
      gl.shaderSource(shader, source); gl.compileShader(shader);
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, `
      attribute vec2 aPosition;
      uniform float uTime; uniform float uAspect; uniform vec2 uPointer;
      varying float vHeight; varying float vDepth;
      void main() {
        vec2 p = aPosition;
        float r = length(p * vec2(.8, 1.0));
        float envelope = exp(-r * r * .055);
        float wave = sin(p.x * 1.35 + p.y * .65 - uTime * .7)
          + .48 * cos(p.y * 1.8 - p.x * .5 + uTime * .4);
        float h = wave * envelope * .75;
        h += exp(-length(p - uPointer * 3.0) * .7) * .85;
        float yaw = -.28 + uPointer.x * .12;
        float x = p.x * cos(yaw) - p.y * sin(yaw);
        float z = p.x * sin(yaw) + p.y * cos(yaw);
        float y = h * .88 - z * .39;
        float depth = 9.0 + z * .6;
        gl_Position = vec4(x * 1.65 / uAspect, y * 1.65 + .1, 0.0, depth);
        gl_PointSize = 1.5;
        vHeight = h; vDepth = clamp(1.0 - (z + 5.0) * .055, .15, 1.0);
      }
    `);
    const fragment = compile(gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform vec3 uBlue; uniform vec3 uLime;
      varying float vHeight; varying float vDepth;
      void main() {
        float peak = smoothstep(.3, 1.25, vHeight);
        vec3 color = mix(uBlue, uLime, peak);
        gl_FragColor = vec4(color, vDepth * (.28 + peak * .65));
      }
    `);
    program = gl.createProgram();
    if (!program) throw new Error('Program unavailable');
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Signal shader unavailable');
    gl.useProgram(program);
    const positions: number[] = [];
    // Two families of lines, one draw call. Smaller mesh on narrow screens.
    const columns = canvas.clientWidth < 600 ? 64 : 100;
    const rows = canvas.clientWidth < 600 ? 32 : 50;
    for (let row = 0; row <= rows; row++) for (let col = 0; col < columns; col++) {
      const x = -7 + col / columns * 14, y = -5 + row / rows * 10;
      positions.push(x, y, x + 14 / columns, y);
    }
    for (let col = 0; col <= columns; col++) for (let row = 0; row < rows; row++) {
      const x = -7 + col / columns * 14, y = -5 + row / rows * 10;
      positions.push(x, y, x, y + 10 / rows);
    }
    buffer = gl.createBuffer();
    if (!buffer) throw new Error('Buffer unavailable');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    const time = gl.getUniformLocation(program, 'uTime');
    const aspect = gl.getUniformLocation(program, 'uAspect');
    const pointer = gl.getUniformLocation(program, 'uPointer');
    const blue = gl.getUniformLocation(program, 'uBlue');
    const lime = gl.getUniformLocation(program, 'uLime');
    // Palette comes from centralized CSS tokens; GLSL has no independent palette.
    const style = getComputedStyle(canvas);
    const rgb = (name: string) => (style.getPropertyValue(name).trim().match(/[\d.]+/g) || ['0', '0', '0']).map(Number).map((v) => v / 255);
    gl.uniform3fv(blue, rgb('--signal-blue-rgb')); gl.uniform3fv(lime, rgb('--signal-lime-rgb'));
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    let x = 0, y = 0;
    return {
      draw(seconds: number, pointerX: number, pointerY: number) {
        const dpr = Math.min(devicePixelRatio || 1, canvas.clientWidth < 600 ? 1 : 1.5);
        const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
        const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; gl.viewport(0, 0, width, height); }
        x += (pointerX - x) * .08; y += (pointerY - y) * .08;
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(time, seconds); gl.uniform1f(aspect, width / height); gl.uniform2f(pointer, x, y);
        gl.drawArrays(gl.LINES, 0, positions.length / 2);
      },
      dispose,
    };
  } catch { dispose(); return null; }
}
