function createAlbumGraph(response, keyword){
	var options = {
		animationEnabled: true,  
		title:{
			text: "Number of Times \"" +keyword+ "\" is Used Per Album"
		},
		axisY: {
			title: "Number of Times \""+keyword+"\" is Used",
			valueFormatString: "",
			suffix: "",
			prefix: ""
		},
		axisX: {
			title: "Albums",
		},
		data: [{
			type: "area",
			markerSize: 5,
			dataPoints: []
		}]
	};
	for(var i = 0; i<Object.keys(response.album).length; i++){
		options.data[0].dataPoints[i] = {label: Object.keys(response.album)[i], y: response.album[Object.keys(response.album)[i]]};
	}
	$("#albumChartContainer").show(); 
	$("#albumChartContainer").CanvasJSChart(options); 	
}


function createYearGraph(response, keyword){
	var options = {
		animationEnabled: true,  
		title:{
			text: "Number of Times \"" +keyword+ "\" is Used Per Year"
		},
		axisY: {
			title: "Number of Times \""+keyword+"\" is Used",
			valueFormatString: "",
			suffix: "",
			prefix: ""
		},
		data: [{
			type: "area",
			markerSize: 5,
			xValueFormatString: "YYYY",
			yValueFormatString: "",
			dataPoints: []
		}]
	};
	for(var i = 0; i<Object.keys(response.years).length; i++){
		options.data[0].dataPoints[i] = {x: new Date(Object.keys(response.years)[i], 0), y: response.years[Object.keys(response.years)[i]]}
	} 
	$("#yearChartContainer").show();
	$("#yearChartContainer").CanvasJSChart(options);
}

function createTopTen(response){
	$('#topTen').empty();
	for(var i = 0; i<10; i++){
		$('#topTen').append("<li>"+Object.keys(response.songs[i])+": "+Object.values(response.songs[i])+"</li>");
	}
}

function showLyrics(response){
	$("#yearChartContainer").hide();
	$("#albumChartContainer").hide(); 
	$('#topTen').empty();
	if (response.error){
		$('#lyrics').text(response.error);
	}
	else{
		$('#lyrics').text(response.song);
	}
	$('#lyrics').show()
}

function updatePage(){
	keyword = $('#keyword').val();
	type = $('#type').val();
	$.post('/search', {keyword: keyword, type: type}, function(response){
		if (type == "Song"){
			showLyrics(response);
		}
		else{
			$('#lyrics').hide();
			createYearGraph(response, keyword);
			createAlbumGraph(response, keyword);
			createTopTen(response);
		}
	});
}


$('#search').click(updatePage);

$(document).keypress(function(e) {
    if(e.which == 13) {
        updatePage();
    }
});