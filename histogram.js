let graph = new Chart("histogram-canvas", {
	type: "bar",
	data: {
		labels: ["0-50", "51-100", "101-150", "151-200", "201-255"],
		datasets: [{
			label: "Red",
			backgroundColor: "red"
		},
		{
			label: "Green",
			backgroundColor: "lime"
		},
		{
			label: "Blue",
			backgroundColor: "blue"
		}]
	},
	options: {
		legend: { display: false },
	}
});

function updateChart(){
	let imgData = context.getImageData(0, 0, canvas.width, canvas.height);
	let src = imgData.data;

	values = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0]
	]

	for(let i = 0; i < src.length; i += 4){
		for(let b = 0; b < 3; b++){
			if(src[i+b] < 51) {
				values[b][0]++;
			}
			else if(src[i + b] < 101) {
				values[b][1]++;
			}
			else if(src[i + b] < 151) {
				values[b][2]++;
			}
			else if(src[i + b] < 201) {
				values[b][3]++;
			}
			else {
				values[b][4]++;
			}
		}
	}
	
	for(let b = 0; b < 3; b++){
		graph.data.datasets[b].data = values[b];
	}
	
	graph.update();
}