let canvas = document.getElementById('editor-canvas');
let context = canvas.getContext('2d');

let originalImage = new Image;
let originalImageData = context.getImageData(0, 0, canvas.width, canvas.height);

let brightnessSlider = document.getElementById('brightness-slider');
let grayscaleSlider = document.getElementById('grayscale-slider');
let thresholdSlider = document.getElementById('treshold-slider');

let mouseX = 0;
let mouseY = 0;
let mouseDown = false;

let filterIntensity ={
    grayscale: 0,
    brightness: 0,
    threshold: 0,
    red: 1,
    green: 1,
    blue: 1,
    boxBlurRadius: 0,
    gaussBlurRadius: 0,
    sobel: 0,
    laplacian: 0,
    sharpen: 0,
    unsharpen: 0,
    brushSize: 0
};

let archive = [];

// Heigth in width za spreminjanje velikosti slike
const maxWidth = 800;  
const maxHeight = 600; 
let displayWidth = canvas.width;
let displayHeight = canvas.height;

function uploadImage(event) {

    const img = new Image();
    img.src = URL.createObjectURL(event.target.files[0]);

    img.onload = function() {
        
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
        }

        if (height > maxHeight) {
            const ratio = maxHeight / height;
            height = maxHeight;
            width = width * ratio;
        }

        canvas.width = width;
        displayWidth = width;
        canvas.height = height;
        displayHeight = height;

        context.drawImage(img, 0, 0, width, height);
        originalImageData = context.getImageData(0, 0, canvas.width, canvas.height);
        originalImage = img;
        
        URL.revokeObjectURL(img.src);
    };
    applyFilters();
};

function applyFilters(){
    let processedImageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
      );

    processedImageData = changeRGB(processedImageData);

    if (filterIntensity.grayscale > 0) 
        processedImageData = changeGrayscale(processedImageData);
    
    if (filterIntensity.brightness > 0) 
        processedImageData = changeBrightness(processedImageData);
    
    if (filterIntensity.threshold > 0) 
        processedImageData = changeThreshold(processedImageData);
    
    if(filterIntensity.boxBlurRadius > 0)
        processedImageData = boxBlur(processedImageData);

    if(filterIntensity.gaussBlurRadius > 0)
        processedImageData = gaussianBlur(processedImageData);

    if(filterIntensity.sobel == 1)
        processedImageData = sobelFilter(processedImageData);

    if(filterIntensity.laplacian == 1)
        processedImageData = laplacianFilter(processedImageData);

    if(filterIntensity.sharpen > 0)
        processedImageData = sharpening(processedImageData);

    if(filterIntensity.unsharpen > 0)
        processedImageData = unsharpening(processedImageData);

    if(filterIntensity.brushSize > 0 && mouseDown == true){
        processedImageData = drawBrush(processedImageData);
    }
    
    updateChart();

    context.putImageData(processedImageData, 0, 0);
}

function resetFilters(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(originalImage, 0, 0 , canvas.width, canvas.height);

    document.getElementById('brightness-slider').value = 0;
    document.getElementById('grayscale-slider').value = 0;
    document.getElementById('threshold-slider').value = 0;
    document.getElementById('boxblur-slider').value = 0;
    document.getElementById('gauss-slider').value = 0;
    document.getElementById('red-slider').value = 100;
    document.getElementById('green-slider').value = 100;
    document.getElementById('blue-slider').value = 100;
    document.getElementById('sharpening-slider').value = 0;
    document.getElementById('unsharpening-slider').value = 0;

    filterIntensity.brightness = 0;
    filterIntensity.grayscale = 0;
    filterIntensity.threshold = 128;
    filterIntensity.boxBlurRadius = 0;
    filterIntensity.red = 1;
    filterIntensity.green = 1;
    filterIntensity.blue = 1;
    filterIntensity.sobel = 0;
    filterIntensity.laplacian = 0;
    filterIntensity.sharpen = 0;
    filterIntensity.unsharpen = 0;

    applyFilters();
}

function saveImage(){
    let link =  document.createElement('a');
    link.download = 'krejzi_image.png';
    link.href = document.getElementById('editor-canvas').toDataURL();
    link.click();
}

function undo() {
    if (archive.length > 0) {
        context.putImageData(archive.pop(), 0, 0);
    } else {
        alert('No more undos available!');
    }
}
function saveImageToArchive() {
    archive.push(context.getImageData(0, 0, canvas.width, canvas.height));
}

