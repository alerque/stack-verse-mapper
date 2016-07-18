/*eslint-env browser, jquery */
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "search|displayresults" }]*/

var search = require( '../src/search.js' );

// Display the results of a search
function displayresults( query, result )
{
	var sitePath = 'http://hermeneutics.stackexchange.com/';
	var resultsHTML = '<h3>' + query.search + '</h3>';

	$.each( result, function()
	{
		// Get Number of Hits
		var hitCnt = 0;
		$.each( this.refs, function()
		{
			hitCnt += this.count;
		});

		// Result wrapper
		var open = '<div class="svm-result" \
		data-svm-ID="' + this.id + '" \
		data-svm-TYPE="' + this.type + '" \
		data-svm-PARENT="' + this.parent + '" \
		data-svm-SPEC="' + this.SPEC + '" \
		data-svm-APS="' + this.APS + '" \
		data-svm-TDRHP="' + this.TDRHP + '" \
		data-svm-TDRHS="' + this.TDRHS + '" \
		data-svm-TAG="' + this.TAG + '" \
		data-svm-QTH="' + this.QTH + '" \
		data-svm-FPS="' + this.FPS + '" \
		data-svm-HITS="' + hitCnt + '" \
		>';
		var close = '</div>';

		// Basic Info (Link)
		var type = '<span class="svm-type" data-svm-type="' + this.type + '">' + this.type.toUpperCase() + ': </span>';
		var linkPath = sitePath + this.type + '/' + this.id;

		var link = '<a class="svm-link" data-svm-title="' + this.title + '" data-svm-id="' + this.id + '" href="' + linkPath + '">' + type + this.title + '</a>';

		// Rank Info
		var rankPercent = '<span class="svm-relativepercent" data-svm-desc="(Score [FPS] / Max Score [FPS = ' + query.maxFPS + '])" tabindex="0">Relative: ' + Math.round((this.FPS / query.maxFPS) * 100) + '%</span>';
		var score = '<span class="svm-score" data-svm-desc="The Final Post Score (FPS) Value" data-svm-FPS="' + this.FPS + '" tabindex="0">Score: ' + this.FPS + '</span>';
		var totalCount = '<span class="svm-hit-count noPopoverLink" data-svm-desc="The total number of hits on the reference in the post" data-svm-count="' + hitCnt  + '" tabindex="0">Ref. Hits: ' + hitCnt  + ' </span>';
		var rankGroup = '<div class="svm-rank-group">' + rankPercent + score + totalCount + '</div>';

		// Full Details Info
		var fullDetails = '<div class="svm-details"> \
		<span class="noPopoverLink" data-svm-desc="Q or A ID Number" tabindex="0">ID: ' + this.id + '</span> \
		<span data-svm-desc="Specificity Score (Raw value)" tabindex="0">SPEC: ' + this.SPEC + '</span> \
		<span data-svm-desc="Adjusted Post Score" tabindex="0">APS: ' + this.APS + '</span> \
		<span data-svm-desc="Total Distinct References Hit in Post (bonus to APS)" tabindex="0">TDRHP: ' + this.TDRHP + '</span> \
		<span data-svm-desc="Total Distinct References Hit in Set (bonus to APS)" tabindex="0">TDRHS: ' + this.TDRHS + '</span> \
		<span data-svm-desc="Tag match (bonus to APS)" tabindex="0">TAG: ' + this.TAG + '</span> \
		<span data-svm-desc="Question Title Hit (bonus to APS for Questions only)" tabindex="0">QTH: ' + this.QTH + '</span> \
		<span data-svm-desc="Final Post Score (All bonuses included)" tabindex="0">FPS: ' + this.FPS + '</span> \
		</div>';

		// Build Result
		resultsHTML += open + link + rankGroup + fullDetails + close;
	});
	$('.svm-resultslist').html(resultsHTML);

	// Display selection
	$('.svm-select-display .dropdown-item').click(function()
	{
		$('.svm-results').removeClass('svm-view-basic svm-view-rank svm-view-full').addClass('svm-view-' + $(this).data('set-value'));
		$(this).parents('.svm-select-display').find('.btn').html($(this).text());
	});

	// Set up Popovers
	$('body').popover({
		/* popovers need tabindex='0' set to avoid bug in not showing */
		selector: '[data-svm-desc]',
		container: 'body',
		template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><span class="popover-content"></span></div>',
		content: function()
		{
			var innerWrapStart = '';
			var innerWrapEnd = '';
			if ( !$(this).hasClass('noPopoverLink') )
			{
				innerWrapStart = '<a href="https://github.com/alerque/stack-verse-mapper/wiki/Ranking-algorithm" target="_blank">';
				innerWrapEnd = '</a>';
			}
			return (innerWrapStart + $(this).attr('data-svm-desc') + innerWrapEnd);
		},
		html: true,
		trigger: 'focus',
		placement: 'top',
	});

	// Provide Sortability
	$('.svm-select-sort').on('click', '.dropdown-item', function()
	{
		// define a function to call the sort and append
		var sortItems = function()
		{
			items.sort(function(a,b)
			{
				var aData = a.getAttribute(sortByData);
				var bData = b.getAttribute(sortByData);

				if(aData > bData)
				{
					return ascending;
				}
				if(aData < bData)
				{
					return (-1 * ascending);
				}
				return 0;
			});
			items.detach().appendTo(list);
		};

		// get the results container and grouping value
		var list = $('.svm-resultslist');
		var group = list.attr('data-svm-grouping');

		// get the results
		var items = list.children('.svm-result');

		// get data value to switch sort by
		var sortBy = $(this).attr('data-set-value');

		// set prefix that has suffix added to determine what value is sorted on
		var sortByData = 'data-svm-';

		// used to control if a particular sort is expected to be in ascending (1) or descending order (-1)
		var ascending = 1;

		// reset the button display list data value for selection
		$(this).parents('.svm-select-sort').find('.btn').html($(this).text());
		list.attr('data-svm-sortedby', sortBy);

		// select the type of sort and set parameters for that
		switch (sortBy)
		{
			case 'Hits':
				sortByData += 'HITS';
				ascending = -1;
				break;
			case 'Oldest':
				sortByData += 'SPEC';
				ascending = -1;
				break;
			default: // Rank, which is FPS
				sortByData += 'FPS';
				ascending = -1;
		}

		// sort the items and append them
		sortItems();

		// check for and group the items
		if (group !== 'No Grouping')
		{
			// reset sortby
			sortByData = 'data-svm-TYPE';
			// reset direction
			switch (group)
			{
				case 'Q then A':
					ascending = -1;
					sortItems();
					break;
				case 'A then Q':
					ascending = 1;
					sortItems();
					break;
				default: // Keep No Grouping
			}
		}
	});

	$('.svm-select-sortGroup').on('click', '.dropdown-item', function()
	{
		// get the list, data value to group by, and current sort routine
		var list = $('.svm-resultslist');
		var groupBy = $(this).data('set-value');
		var sortBy = list.attr('data-svm-sortedby');

		// reset the results container's grouping value and sort Group selection button's value
		list.attr('data-svm-grouping', groupBy);
		$(this).parents('.svm-select-sortGroup').find('.btn').html($(this).text());

		// call the active sort routine to resort and regroup appropriately
		$('.svm-select-sort .dropdown-item[data-set-value="'+sortBy+'"]').click();
	});
}
