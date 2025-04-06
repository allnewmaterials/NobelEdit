
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
    
    const kernel = generateGaussianKernel();
    
    const tempData = horizontalPass(src, width, height, kernel);
    const resultData = verticalPass(tempData, width, height, kernel);
    
    return new ImageData(resultData, width, height);
}

function generateGaussianKernel() {
    const sigma = filterIntensity.gaussBlurRadius / 3;
    const kernel = [];
    let sum = 0;
    
    
    for (let i = -filterIntensity.gaussBlurRadius; i <= filterIntensity.gaussBlurRadius; i++) {
        const value = Math.exp(-(i*i) / (2 * sigma * sigma));
        kernel.push(value);
        sum += value;
    }
    
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

function sobelFilter(imageData) {//??
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    let output = new Uint8ClampedArray(src.length);

    const Gx = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    const Gy = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    const maxMagnitude = Math.sqrt(1020 * 1020 + 1020 * 1020);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let GxSumR = 0, GxSumG = 0, GxSumB = 0;
            let GySumR = 0, GySumG = 0, GySumB = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    let neighborX = x + kx;
                    let neighborY = y + ky;
                    let index = (neighborY * width + neighborX) * 4;

                    GxSumR += src[index] * Gx[ky + 1][kx + 1];
                    GxSumG += src[index + 1] * Gx[ky + 1][kx + 1];
                    GxSumB += src[index + 2] * Gx[ky + 1][kx + 1];

                    GySumR += src[index] * Gy[ky + 1][kx + 1];
                    GySumG += src[index + 1] * Gy[ky + 1][kx + 1];
                    GySumB += src[index + 2] * Gy[ky + 1][kx + 1];
                }
            }

            let magnitudeR = Math.sqrt(GxSumR * GxSumR + GySumR * GySumR);
            let magnitudeG = Math.sqrt(GxSumG * GxSumG + GySumG * GySumG);
            let magnitudeB = Math.sqrt(GxSumB * GxSumB + GySumB * GySumB);

            let normalizedR = Math.min(255, Math.max(0, (magnitudeR / maxMagnitude) * 255));
            let normalizedG = Math.min(255, Math.max(0, (magnitudeG / maxMagnitude) * 255));
            let normalizedB = Math.min(255, Math.max(0, (magnitudeB / maxMagnitude) * 255));

            const outputIndex = (y * width + x) * 4;

            output[outputIndex] = normalizedR;
            output[outputIndex + 1] = normalizedG;
            output[outputIndex + 2] = normalizedB;
            output[outputIndex + 3] = src[outputIndex + 3];
        }
    }

    return new ImageData(output, width, height);
}

function laplacianFilter(imageData){//???
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    let output = new Uint8ClampedArray(src.length);

    const kernel = [
        [1, 1, 1],
        [1, -8, 1],
        [1, 1, 1]
    ];

    const maxMagnitude = 1020;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let sumR = 0, sumG = 0, sumB = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    let neighborX = x + kx;
                    let neighborY = y + ky;
                    let index = (neighborY * width + neighborX) * 4;
                    
                    sumR += kernel[ky + 1][kx + 1] * src[index];
                    sumG += kernel[ky + 1][kx + 1] * src[index + 1];
                    sumB += kernel[ky + 1][kx + 1] * src[index + 2];
                }
            }
            const outputIndex = (y * width + x) * 4;
            output[outputIndex] = Math.min(255, Math.max(0, (Math.abs(sumR) / maxMagnitude) * 255));
            output[outputIndex + 1] = Math.min(255, Math.max(0, (Math.abs(sumG) / maxMagnitude) * 255));
            output[outputIndex + 2] = Math.min(255, Math.max(0, (Math.abs(sumB) / maxMagnitude) * 255));
            output[outputIndex + 3] = src[outputIndex + 3];
            
        }
    }
    
    return new ImageData(output, width, height);

}

function sharpening(imageData){
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const intensity = filterIntensity.sharpen;

    const laplacianData = laplacianFilter(imageData).data;


    for (let i = 0; i < src.length; i += 4) {
        src[i] -= intensity*laplacianData[i];
        src[i + 1] -= intensity*laplacianData[i + 1];
        src[i + 2] -= intensity*laplacianData[i + 2];
        src[i + 3] = laplacianData[i+3];
    }

    return imageData;
}

function unsharpening(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    let blurredSrc = new ImageData(src,width,height);
    const intensity = filterIntensity.unsharpen / 100;

    blurredSrc = gaussianBlur(blurredSrc).data;

    for (let i = 0; i < src.length; i += 4) {
        blurredSrc[i] = src[i] - blurredSrc[i];
		src[i] += blurredSrc[i]*intensity;
		blurredSrc[i + 1] = src[i + 1] - blurredSrc[i + 1];
		src[i + 1] += blurredSrc[i + 1]*intensity;
		blurredSrc[i + 2] = src[i + 2] - blurredSrc[i + 2];
		src[i + 2] += blurredSrc[i + 2]*intensity;
    }

    return imageData;
}
