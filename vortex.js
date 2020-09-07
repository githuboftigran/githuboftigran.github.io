const deleteIcon = 'https://www.pinclipart.com/picdir/big/88-882904_mermaiden-crystal-dress-up-game-white-x-icon.png';

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

const drawPattern = (center, size, corners, lineWidth, quantity, angle, fraction, colors, context) => {
    context.save();
    context.lineWidth = lineWidth;
    const {cx, cy} = center;
    for(let i = 0; i < quantity; i += 1) {
        const alpha = Math.floor(255 - 255 * i / quantity);

        const color = interpolateColor(colors, i / quantity);
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

    const rotationInput = document.getElementById('rotationInput');
    const rotationValue = document.getElementById('rotationValue');
    const cornersInput = document.getElementById('cornersInput');
    const cornersValue = document.getElementById('cornersValue');
    const lineWidthInput = document.getElementById('lineWidthInput');
    const lineWidthValue = document.getElementById('lineWidthValue');
    const angleInput = document.getElementById('angleInput');
    const angleValue = document.getElementById('angleValue');
    const fractionInput = document.getElementById('fractionInput');
    const fractionValue = document.getElementById('fractionValue');
    const quantityInput = document.getElementById('quantityInput');
    const quantityValue = document.getElementById('quantityValue');

    const colorsList = document.getElementById('colorsList');

    const copyButton = document.getElementById('copyButton');
    const addColorButton = document.getElementById('addColorButton');

    const context = canvas.getContext('2d');
    const { width, height } = canvas;

    let rotation = 0;
    let corners = cornersInput.value;
    let lineWidth = lineWidthInput.value;
    let angle = angleInput.value;
    let fraction = fractionInput.value;
    let quantity = quantityInput.value;
    const colors = [];

    const redraw = () => {
        context.fillStyle = 'black';
        context.lineJoin = 'round';
        context.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        context.save();
        context.translate(cx, cy);
        context.rotate(rotation);
        context.translate(-cx, -cy);

        const center = { cx, cy };
        drawPattern(center, 350, corners, lineWidth, quantity, angle, fraction, colors, context);
        context.restore();
    };

    rotationInput.addEventListener('input', ({ target }) => {
        rotationValue.textContent = target.value;
        rotation = target.value * Math.PI / 180;
        redraw();
    });

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

    quantityInput.addEventListener('input', ({ target }) => {
        quantityValue.textContent = target.value;
        quantity = target.value;
        redraw();
    });

    copyButton.addEventListener('click', () => {
        canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})]));
        const allColors = [];
        for (let i = 0; i < 9; i+= 1) {
            const color = interpolateColor([0x9000ff, 0x0000ff, 0x00ffff], i / 8 );
            const r = (color >> 16) & 0xff;
            const g = (color >> 8) & 0xff;
            const b = color & 0xff;
            allColors[11-i] = `${r}\t${g}\t${b}`;
        }

        for (let i = 0; i < 8; i+= 1) {
            const color = interpolateColor([0x9000ff, 0x0000ff, 0x00ffff], i / 7 );
            const r = (color >> 16) & 0xff;
            const g = (color >> 8) & 0xff;
            const b = color & 0xff;
            allColors[(11 + i) % 15] = `${r}\t${g}\t${b}`;
        }
        allColors.forEach((color, index) => console.log(`${index}\t${color}`));
        console.log('===========================');
        for (let i = 0; i < 10; i+= 1) {
            const color = interpolateColor([0x6000ff, 0x0000ff, 0x00ffff], i / 9 );
            const r = (color >> 16) & 0xff;
            const g = (color >> 8) & 0xff;
            const b = color & 0xff;
            console.log(`${i}\t${r}\t${g}\t${b}`);
        }
    });

    const addColor = color => {
        const colorInputContainer = document.createElement('div');

        const colorInput = document.createElement('input');
        colorInput.setAttribute('type', 'color');
        colorInput.setAttribute('value', color);
        colorInput.addEventListener('input', ({ target }) => {
            const index = Array.prototype.indexOf.call(colorsList.children, colorInputContainer);
            colors[index] = parseInt(target.value.substr(1), 16);
            redraw();
        });

        const deleteColor = document.createElement('img');
        deleteColor.setAttribute('src', deleteIcon);
        deleteColor.addEventListener('click', ({ target }) => {
            const index = Array.prototype.indexOf.call(colorsList.children, colorInputContainer);
            console.log(index)
            colorsList.removeChild(colorInputContainer);
            colors.splice(index, 1);
            redraw();
        });

        colorInputContainer.appendChild(colorInput);
        colorInputContainer.appendChild(deleteColor);

        colorsList.appendChild(colorInputContainer);
        colors.push(parseInt(color.substr(1), 16));
        redraw();
    }

    addColorButton.addEventListener('click', () => {
        addColor('#ffffff');
    });

    addColor('#0066ff');
    addColor('#00ffff');

    redraw();
};
