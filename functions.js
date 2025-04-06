let canvas = document.getElementById('editor-canvas');
let context = canvas.getContext('2d');

let originalImage = new Image;
let originalImageData = context.getImageData(0, 0, canvas.width, canvas.height);

let brightnessSlider = document.getElementById('brightness-slider');
let grayscaleSlider = document.getElementById('grayscale-slider');
let thresholdSlider = document.getElementById('treshold-slider');

let filterIntensity ={
    grayscale: 0,
    brightness: 0,
    threshold: 0,
    red: 1,
    green: 1,
    blue: 1,
    boxBlurRadius: 0,
    gaussBlurRadius: 0
};

let archive = [];

// Heigth in width za spreminjanje velikosti slike
const maxWidth = 800;  
const maxHeight = 600; 
let displayWidth = canvas.width;
let displayHeight = canvas.height;


/********* 
 * CORE FUNCTIONALITY STUFF
 **********/ 

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

    filterIntensity.brightness = 0;
    filterIntensity.grayscale = 0;
    filterIntensity.threshold = 0;
    filterIntensity.boxBlurRadius = 0;
    filterIntensity.red = 1;
    filterIntensity.green = 1;
    filterIntensity.blue = 1;

    applyFilters();
}

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


/********** 
 * FILTER FUNCTIONS
 * ***********/

function changeBrightness(imageData){
    const src = imageData.data;
    
    for (let i = 0; i < src.length; i += 4) {
      src[i] += filterIntensity.brightness;     
      src[i + 1] += filterIntensity.brightness; 
      src[i + 2] += filterIntensity.brightness; 
    }

    return imageData;
}
function changeGrayscale(imageData){
    const src = imageData.data;
    
    for (let i = 0; i < src.length; i += 4) {
      const r = src[i];
      const g = src[i+1];
      const b = src[i+2];
      
      const graysc = 0.299 * r + 0.587 * g + 0.114 * b;

      src[i] = r * (1 - filterIntensity.grayscale) + graysc*filterIntensity.grayscale;
      src[i + 1] = g * (1 - filterIntensity.grayscale) + graysc*filterIntensity.grayscale;
      src[i + 2] = b * (1 - filterIntensity.grayscale) + graysc*filterIntensity.grayscale;
    }

    return imageData;
}
function changeThreshold(imageData) {
    const src = imageData.data;
    
    for (let i = 0; i < src.length; i += 4) {
      const r = src[i];
      const g = src[i+1];
      const b = src[i+2];
      
      // thresholding the current value
      const v = (0.2126*r + 0.7152*g + 0.0722*b >= filterIntensity.threshold) ? 255 : 0;
      
      src[i] = src[i+1] = src[i+2] = v;
    }
    return imageData;
}

function boxBlur(imageData) {//hvala gpt
    const src = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const radius = filterIntensity.boxBlurRadius;
    const diameter = radius * 2 + 1;
    const area = diameter * diameter;
    
    const temp = new Uint8ClampedArray(src.length);
    const result = new Uint8ClampedArray(src.length);
    
    // Horizontal pass
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sumR = 0, sumG = 0, sumB = 0;
            let count = 0;
            
            for (let nx = -radius; nx <= radius; nx++) {
                const cx = Math.max(0, Math.min(width - 1, x + nx));
                const idx = (y * width + cx) * 4;
                sumR += src[idx];
                sumG += src[idx + 1];
                sumB += src[idx + 2];
                count++;
            }
            
            const outIdx = (y * width + x) * 4;
            temp[outIdx] = sumR / count;
            temp[outIdx + 1] = sumG / count;
            temp[outIdx + 2] = sumB / count;
            temp[outIdx + 3] = src[outIdx + 3]; 
        }
    }
    
    // Vertical pass
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let sumR = 0, sumG = 0, sumB = 0;
            let count = 0;
            
            for (let ny = -radius; ny <= radius; ny++) {
                const cy = Math.max(0, Math.min(height - 1, y + ny));
                const idx = (cy * width + x) * 4;
                sumR += temp[idx];
                sumG += temp[idx + 1];
                sumB += temp[idx + 2];
                count++;
            }
            
            const outIdx = (y * width + x) * 4;
            result[outIdx] = sumR / count;
            result[outIdx + 1] = sumG / count;
            result[outIdx + 2] = sumB / count;
            result[outIdx + 3] = src[outIdx + 3]; 
        }
    }
    
    return new ImageData(result, width, height);
}

function gaussianBlur(imageData) {
    const src = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Generate Gaussian kernel
    const kernel = generateGaussianKernel();
    
    // Apply separable Gaussian blur (horizontal then vertical)
    const tempData = horizontalPass(src, width, height, kernel);
    const resultData = verticalPass(tempData, width, height, kernel);
    
    return new ImageData(resultData, width, height);
}

function generateGaussianKernel() {
    const sigma = filterIntensity.gaussBlurRadius / 3; // Standard deviation
    const kernel = [];
    let sum = 0;
    
    // Create kernel values
    for (let i = -filterIntensity.gaussBlurRadius; i <= filterIntensity.gaussBlurRadius; i++) {
        const value = Math.exp(-(i*i) / (2 * sigma * sigma));
        kernel.push(value);
        sum += value;
    }
    
    // Normalize kernel
    return kernel.map(v => v / sum);
}

// Horizontal blur pass
function horizontalPass(src, width, height, kernel) {
    const temp = new Uint8ClampedArray(src.length);
    const radius = (kernel.length - 1) / 2;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            
            for (let k = -radius; k <= radius; k++) {
                const px = Math.max(0, Math.min(width - 1, x + k));
                const idx = (y * width + px) * 4;
                const weight = kernel[k + radius];
                
                r += src[idx] * weight;
                g += src[idx + 1] * weight;
                b += src[idx + 2] * weight;
                a = src[idx + 3]; // Preserve alpha
            }
            
            const outIdx = (y * width + x) * 4;
            temp[outIdx] = r;
            temp[outIdx + 1] = g;
            temp[outIdx + 2] = b;
            temp[outIdx + 3] = a;
        }
    }
    
    return temp;
}

// Vertical blur pass
function verticalPass(src, width, height, kernel) {
    const result = new Uint8ClampedArray(src.length);
    const radius = (kernel.length - 1) / 2;
    
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let r = 0, g = 0, b = 0, a = 0;
            
            for (let k = -radius; k <= radius; k++) {
                const py = Math.max(0, Math.min(height - 1, y + k));
                const idx = (py * width + x) * 4;
                const weight = kernel[k + radius];
                
                r += src[idx] * weight;
                g += src[idx + 1] * weight;
                b += src[idx + 2] * weight;
                a = src[idx + 3]; // Preserve alpha
            }
            
            const outIdx = (y * width + x) * 4;
            result[outIdx] = r;
            result[outIdx + 1] = g;
            result[outIdx + 2] = b;
            result[outIdx + 3] = a;
        }
    }
    
    return result;
}

function changeRGB(imageData){
    const src = imageData.data;
    
    for (let i = 0; i < src.length; i += 4) {
      const r = src[i];
      const g = src[i+1];
      const b = src[i+2];
      
      
      src[i] = r - (r * (1 - filterIntensity.red)); 
      src[i+1] = g - (g * (1- filterIntensity.green));
      src[i+2] = b - (b * (1 - filterIntensity.blue));
    }
    return imageData;
}

function saveImage(){
    let link =  document.createElement('a');
    link.download = 'krejzi_image.png';
    link.href = document.getElementById('editor-canvas').toDataURL();
    link.click();
}

