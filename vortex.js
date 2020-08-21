//const COLORS = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x00ff00, 0x99ccff, 0x99ccff, 0x0000ff, 0x0000ff, 0x0000ff, 0xcc00ff, 0xcc00ff, 0xcc00ff, 0xcc00ff, 0xcc00ff, 0xcc00ff, ];
//const COLORS = [0x00afff, 0x0000ff, 0xff0000, 0xff0000];
//const COLORS = [0xff0000, 0x0000ff, 0x00ffff];
//const COLORS = [0x0000ff, 0xff0000];
//const COLORS = [0x4444ff, 0xff4444];
//const COLORS = [0x6600ff, 0x0000ff];
const COLORS = [0x0066ff, 0x00ffff];

const interpolateColor = (colors, position) => {
    const scaledPosition = position * (colors.length - 1);
    const startColor = colors[Math.floor(scaledPosition)];
    const endColor = colors[Math.ceil(scaledPosition)];
    const fraction = scaledPosition - Math.floor(scaledPosition);
    const sRed = (startColor >>> 16) & 0xff;
    const sGreen = (startColor >>> 8) & 0xff;
    const sBlue = startColor & 0xff;

    const eRed = (endColor >>> 16) & 0xff;
    const eGreen = (endColor >>> 8) & 0xff;
    const eBlue = endColor & 0xff;

    const rRed = Math.round(sRed + (eRed - sRed) * fraction);
    const rGreen = Math.round(sGreen + (eGreen - sGreen) * fraction);
    const rBlue = Math.round(sBlue + (eBlue - sBlue) * fraction);

    return (rRed << 16) | (rGreen << 8) | rBlue;
};

const drawPolygon = (size, center, corners, color, context) => {
    const {cx, cy} = center;
    context.beginPath();
    context.strokeStyle = color;
    context.moveTo(cx + size, cy);
    for(let i = 0; i < corners; i+=1) {
        const angle = i * 2 * Math.PI / corners;
        const dx = Math.cos(angle) * size;
        const dy = Math.sin(angle) * size;
        context.lineTo(cx + dx, cy + dy);
    }
    context.closePath();
    context.stroke();
};

const drawPattern = (center, size, corners, lineWidth, count, angle, fraction, context) => {
    context.save();
    context.lineWidth = lineWidth;
    const {cx, cy} = center;
    for(let i = 0; i < count; i += 1) {
        const alpha = Math.floor(255 - 255 * i / count);

        const color = interpolateColor(COLORS, i / count);
        const colorStr = color.toString(16);
        let colorWithAlpha = `${colorStr}${alpha < 16 ? '0' : ''}${alpha.toString(16)}`;
        if (colorWithAlpha.length < 8) {
            colorWithAlpha = '0'.repeat(8 - colorWithAlpha.length) + colorWithAlpha;
        }
        drawPolygon(size, center, corners, `#${colorWithAlpha}`, context);
        context.translate(cx, cy);
        context.rotate(angle * Math.PI / 180);
        context.translate(-cx, -cy);
        size *= fraction;
    }
    context.restore();
};

window.onload = function() {
    const canvas = document.getElementById('mainDrawingCanvas');
    const cornersInput = document.getElementById('cornersInput');
    const cornersValue = document.getElementById('cornersValue');
    const lineWidthInput = document.getElementById('lineWidthInput');
    const lineWidthValue = document.getElementById('lineWidthValue');
    const angleInput = document.getElementById('angleInput');
    const angleValue = document.getElementById('angleValue');
    const fractionInput = document.getElementById('fractionInput');
    const fractionValue = document.getElementById('fractionValue');
    const countInput = document.getElementById('countInput');
    const countValue = document.getElementById('countValue');

    const copyButton = document.getElementById('copyButton');

    const context = canvas.getContext('2d');
    const { width, height } = canvas;

    let corners = cornersInput.value;
    let lineWidth = lineWidthInput.value;
    let angle = angleInput.value;
    let fraction = fractionInput.value;
    let count = countInput.value;

    const redraw = () => {
        context.fillStyle = 'black';
        context.lineJoin = 'round';
        context.fillRect(0, 0, width, height);

        const center = { cx: width / 2, cy: height / 2 };
        drawPattern(center, 350, corners, lineWidth, count, angle, fraction, context);
    };

    cornersInput.addEventListener('input', ({ target }) => {
        cornersValue.textContent = target.value;
        corners = target.value;
        redraw();
    });

    lineWidthInput.addEventListener('input', ({ target }) => {
        lineWidthValue.textContent = target.value;
        lineWidth = target.value;
        redraw();
    });

    angleInput.addEventListener('input', ({ target }) => {
        angleValue.textContent = target.value;
        angle = target.value;
        redraw();
    });

    fractionInput.addEventListener('input', ({ target }) => {
        fractionValue.textContent = target.value;
        fraction = target.value;
        redraw();
    });

    countInput.addEventListener('input', ({ target }) => {
        countValue.textContent = target.value;
        count = target.value;
        redraw();
    });

    copyButton.addEventListener('click', () => {
        canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})]));
    });

    redraw();
};