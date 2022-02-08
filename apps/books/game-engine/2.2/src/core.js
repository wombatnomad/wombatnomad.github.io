"use strict";

/** @type {WebGL2RenderingContext} */
let mGL;

/**
 * @param {string} htmlCanvasID
 */
function initWebGL(htmlCanvasID) {
    let canvas =  /** @type {HTMLCanvasElement} */ (document.getElementById(htmlCanvasID));
    const gl = canvas.getContext('webgl2');

    if (gl === null) {
        document.write('<br /><b>WebGL 2 is not supported</b>');
        return;
    }

    mGL = gl;
    mGL.clearColor(0.0, 0.8, 0.0, 1.0);
}

function clearCanvas() {
    mGL.clear(mGL.COLOR_BUFFER_BIT);
}

window.onload = () => {
    initWebGL('canvas');
    clearCanvas();
};
