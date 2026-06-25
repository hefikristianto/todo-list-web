const canvas = document.getElementById('lightning-bg');

const hue = 245;
const xoffset = 0;
const speed = 0.65;
const intensity = 0.28;
const size = 0.9;

if (canvas) {
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
    });

    if (!gl) {
        console.error('WebGL not supported');
    } else {
        console.log('WebGL supported');

        const vertexShaderSource = `
            attribute vec2 a_position;

            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;

            uniform vec2 iResolution;
            uniform float iTime;
            uniform float uHue;
            uniform float uXOffset;
            uniform float uSpeed;
            uniform float uIntensity;
            uniform float uSize;

            #define OCTAVE_COUNT 10

            vec3 hsv2rgb(vec3 c) {
                vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
                return c.z * mix(vec3(1.0), rgb, c.y);
            }

            float hash11(float p) {
                p = fract(p * .1031);
                p *= p + 33.33;
                p *= p + p;
                return fract(p);
            }

            float hash12(vec2 p) {
                vec3 p3 = fract(vec3(p.xyx) * .1031);
                p3 += dot(p3, p3.yzx + 33.33);
                return fract((p3.x + p3.y) * p3.z);
            }

            mat2 rotate2d(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat2(c, -s, s, c);
            }

            float noise(vec2 p) {
                vec2 ip = floor(p);
                vec2 fp = fract(p);

                float a = hash12(ip);
                float b = hash12(ip + vec2(1.0, 0.0));
                float c = hash12(ip + vec2(0.0, 1.0));
                float d = hash12(ip + vec2(1.0, 1.0));

                vec2 t = smoothstep(0.0, 1.0, fp);

                return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
            }

            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;

                for (int i = 0; i < OCTAVE_COUNT; ++i) {
                    value += amplitude * noise(p);
                    p *= rotate2d(0.45);
                    p *= 2.0;
                    amplitude *= 0.5;
                }

                return value;
            }

            void mainImage(out vec4 fragColor, in vec2 fragCoord) {
                vec2 uv = fragCoord / iResolution.xy;
                uv = 2.0 * uv - 1.0;
                uv.x *= iResolution.x / iResolution.y;
                uv.x += uXOffset;

                uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;

                vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.95));

                float bolt1 = pow(mix(0.0, 0.07, hash11(iTime * uSpeed + 1.0)) / abs(uv.x), 1.0);
                float bolt2 = pow(mix(0.0, 0.025, hash11(iTime * uSpeed + 5.0)) / abs(uv.x - 1.2), 1.0);
                float bolt3 = pow(mix(0.0, 0.025, hash11(iTime * uSpeed + 9.0)) / abs(uv.x + 1.2), 1.0);

                vec3 col = baseColor * (bolt1 + bolt2 + bolt3) * uIntensity;

                float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);

                fragColor = vec4(col, a);
            }

            void main() {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
        `;

        function compileShader(gl, source, type) {
            const shader = gl.createShader(type);

            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        }

        const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) {
            console.error('Shader failed');
        } else {
            const program = gl.createProgram();

            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Program linking error:', gl.getProgramInfoLog(program));
            }

            gl.useProgram(program);

            const vertices = new Float32Array([
                -1, -1,
                 1, -1,
                -1,  1,
                -1,  1,
                 1, -1,
                 1,  1
            ]);

            const vertexBuffer = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            const aPosition = gl.getAttribLocation(program, 'a_position');

            gl.enableVertexAttribArray(aPosition);
            gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

            const iResolution = gl.getUniformLocation(program, 'iResolution');
            const iTime = gl.getUniformLocation(program, 'iTime');
            const uHue = gl.getUniformLocation(program, 'uHue');
            const uXOffset = gl.getUniformLocation(program, 'uXOffset');
            const uSpeed = gl.getUniformLocation(program, 'uSpeed');
            const uIntensity = gl.getUniformLocation(program, 'uIntensity');
            const uSize = gl.getUniformLocation(program, 'uSize');

            const startTime = performance.now();

            function render() {
                const currentTime = performance.now();
                const elapsedTime = (currentTime - startTime) / 1000.0;

                gl.viewport(0, 0, canvas.width, canvas.height);

                gl.uniform2f(iResolution, canvas.width, canvas.height);
                gl.uniform1f(iTime, elapsedTime);
                gl.uniform1f(uHue, hue);
                gl.uniform1f(uXOffset, xoffset);
                gl.uniform1f(uSpeed, speed);
                gl.uniform1f(uIntensity, intensity);
                gl.uniform1f(uSize, size);

                gl.drawArrays(gl.TRIANGLES, 0, 6);

                requestAnimationFrame(render);
            }

            render();
        }
    }
}