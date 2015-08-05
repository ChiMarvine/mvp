$(document).ready(function () {
	// Begin data retrieval by invoking summonerLookUp
	$('#vs').on('click', function(){
		summonerLookUp();
		$('#summOne').val('');
		$('#summTwo').val('');
	});

	 $('#list').click(function() {
        $('.list').fadeToggle("fast");    
    });

    $('#summTwo').keypress(function (e) {
     var key = e.which;
     if(key === 13){
		 summonerLookUp();
		 $('#summOne').val('');
		 $('#summTwo').val('');
     }
    });   

	var summonerLookUp = function () {
		// set uri
		var nameUri = 'https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/';
		var statUri = 'https://na.api.pvp.net/api/lol/na/v1.3/stats/by-summoner/';
		var statEnd = '/ranked?season=SEASON2015&';
		// expose API Key for demo purposes
		var apiKey 	= 'api_key=0c38d23b-70d8-4684-9d6e-0d5e5f0ab906';
	
		// grab summoner names according to expected api format;
		var summOne = $('#summOne').val().split(' ').join('').toLowerCase();
		var summTwo = $('#summTwo').val().split(' ').join('').toLowerCase();
	
		// declare divIds that need to be modified later w/ text prefix
		var divIds = {
			summoner 			  	 : '',
			totalChampionKills	 : 'Champion Kills: ',
			totalDeathsPerSession : 'Death Total: ',
			totalAssists 		  	 : 'Assist Total: ',
			kda					  	 : 'Avg KDA: ', 
			totalSessionsWon 	  	 : 'Wins: ',
			totalSessionsLost     : 'Losses: ',
			totalMinionKills	  	 : 'Minion Kills: ',
			totalTurretsKilled	 : 'Turret Kills: ',
			winRatio					 : 'Win Percentage: '
		};

		// declare general errorhandler
		var errorHandler = function () {
			alert('Sorry, please try again.');
		};

		// first ajax call to fetch summoner data
		var fetchSummonerStats = function (summoner) {
			$.ajax({
				url: nameUri + summoner + '?' + apiKey,
				type: 'GET',
				success: function (summData) {
					summData = summData[summoner];
					// Attach summoner property to summData for divIds later
					summData.summoner = summData.name;
					fetchDetail(summData);
				},
				error: errorHandler
			});
		};
		// secondary ajax call to fetch stats
		// provide summoner name and data to attach
		var fetchDetail = function (summoner) {
			$.ajax({
				url: statUri + summoner.id + statEnd + apiKey,
				type: 'GET',
				success: function (summStats) {
					summStats.summoner 	= summoner.summoner;
				
					// initiate stats to zero to calculate
					var stats = {
						totalChampionKills 	 : 0,
						totalDeathsPerSession : 0,
						totalAssists 		  	 : 0,
						totalSessionsWon 	  	 : 0,
						totalSessionsLost 	 : 0,
						totalMinionKills	  	 : 0,
						totalTurretsKilled	 : 0
					};
					// grab specific data according to needed statistics
					var champions = summStats.champions;

					for(var i = 0; i < champions.length; i++) {
						var champ = champions[i].stats;

						for(var stat in stats) {
							if(champ[stat]){
								stats[stat] += champ[stat];
							}
						}
					}
					// additional statistic to calculate
					var ratio = {
						kills   : Math.round(stats.totalChampionKills / champions.length),				
						deaths  : Math.round(stats.totalDeathsPerSession / champions.length),
						assists : Math.round(stats.totalAssists / champions.length),
						kda 	  : function(){
							return { kda: this.kills + '/' + this.assists + '/' + this.deaths };
						},
						percent : Math.floor((stats.totalSessionsWon / (stats.totalSessionsWon + stats.totalSessionsLost))*100),
						winRatio: function(){
							return { winRatio: this.percent + '%' };
						},
					};
					// merge the contents of objects together 
					$.extend(true, summStats, stats, ratio.kda(), ratio.winRatio());
					attachStats(summStats);
				},
				error: errorHandler
			});
		};
		var attachStats = function(summStats) {
			var summNumber;
			 	// attach a 1 or 2 based on summoner name;
				// if summStats.summoner === xkouki,
				// summNumber = 1 else it must be summTwo
			if (summStats.summoner.toLowerCase().split(' ').join('') === summOne) {
				summNumber = 1;
			} else if (summStats.summoner.toLowerCase().split(' ').join('') === summTwo) {
				summNumber = 2;
			} else {
				return errorHandler();
			}

			for (var divId in divIds) {
				// if divId === summoner
				// val = 'xkouki'
				var val = summStats[divId];		 
				// Add summonerNumber to the current key in divIds
				// if divId === summoner
				// and summNumber === 1
				// id = summoner1
				var id = '#' + divId + summNumber;
				// Display information for user to see
				$(id).html(divIds[divId] + val);
			}
		};
		// make sure both values exist
		if (!summOne || !summTwo) {
			alert('Please make sure you have an entry for summoner one & two');
			return;
		} else {
			// loop through this array using forEach and invoke fetchSummonerStats
			[summOne, summTwo].forEach(function (summoner) {
				fetchSummonerStats(summoner);
			});
		}
	};
});