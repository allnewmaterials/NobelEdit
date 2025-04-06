document.getElementById('grayscale-slider').addEventListener('input', (e) => {
    filterIntensity.grayscale = e.target.value / 100;
    applyFilters();
});
  
document.getElementById('brightness-slider').addEventListener('input', (e) => {
    filterIntensity.brightness = parseInt(e.target.value);
    applyFilters();
});
  
document.getElementById('threshold-slider').addEventListener('input', (e) => {
    filterIntensity.threshold = parseInt(e.target.value);
    applyFilters();
});

document.getElementById('boxblur-slider').addEventListener('input', (e) => {
    filterIntensity.boxBlurRadius = parseInt(e.target.value);
    applyFilters();
});

document.getElementById('gauss-slider').addEventListener('input', (e) => {
    filterIntensity.gaussBlurRadius = parseInt(e.target.value);
    applyFilters();
});

document.getElementById('red-slider').addEventListener('input', (e) => {
    filterIntensity.red = parseInt(e.target.value) / 100;
    applyFilters();
});

document.getElementById('green-slider').addEventListener('input', (e) => {
    filterIntensity.green = parseInt(e.target.value) / 100;
    applyFilters();
});

document.getElementById('blue-slider').addEventListener('input', (e) => {
    filterIntensity.blue = parseInt(e.target.value) / 100;
    applyFilters();
});

document.getElementById('sobel-operator').addEventListener('click',() => {
    if(filterIntensity.sobel == 0)
        filterIntensity.sobel = 1;
    else filterIntensity.sobel = 0;
    applyFilters();
});

document.getElementById('laplacian-operator').addEventListener('click',() => {
    if(filterIntensity.laplacian == 0)
        filterIntensity.laplacian = 1;
    else filterIntensity.laplacian = 0;
    applyFilters();
});

document.getElementById('sharpening-slider').addEventListener('click',(e) => {
    filterIntensity.sharpen = parseInt(e.target.value);
    applyFilters();
});

document.getElementById('unsharpening-slider').addEventListener('click',(e) => {
    filterIntensity.unsharpen = parseInt(e.target.value);
    applyFilters();
});

document.getElementById('brush-size').addEventListener('click',(e) => {
    filterIntensity.brushSize = parseInt(e.target.value);
});

document.getElementById('brush-color').addEventListener('input',(e) => {
    filterIntensity.brushColor = e.target.value;
});

canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawBall(x, y, filterIntensity.brushSize, filterIntensity.brushColor); // Draw the ball
});

canvas.addEventListener('mousemove', (e) => {
    if (mouseDown) {
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        drawBall(x, y, filterIntensity.brushSize, filterIntensity.brushColor);
    }
});

canvas.addEventListener('mouseup', () => {
    mouseDown = false;
});

function drawBall(x, y, brushSize, brushColor) {
    context.beginPath();
    context.arc(x, y, brushSize, 0, Math.PI * 2);
    context.fillStyle = brushColor;
    context.fill();
    context.closePath();
}