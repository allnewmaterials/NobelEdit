let image = document.getElementById('sourceImage');

let canvas = document.getElementById('editor-canvas');

let context = canvas.getContext('2d');

let archive = [];

// Heigth in width za spreminjanje velikosti slike
const maxWidth = 800;  
const maxHeight = 600; 