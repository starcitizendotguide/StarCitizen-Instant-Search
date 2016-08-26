let search = instantsearch({
  appId: 'JXS80KHU8P',
  apiKey: 'ce0e3984181fb0fc71f26a20c56d9725',
  indexName: 'question_',
  searchFunction(helper) {

	if(helper.state.query.length < 6) {
		return;
	}

	helper.search();
  }
});

// add a searchBox widget
search.addWidget(
  instantsearch.widgets.searchBox({
	autofocus: true,
	container: '#search',
	placeholder: 'What is your question?'
  })
);

// add a hits widget
search.addWidget(
  instantsearch.widgets.hits({
	container: '#results',
	hitsPerPage: 500,
	templates: {
		item: function(data) {
			return `
			<div class="col s12">
				<div class="card hoverable">
					<div class="card-content">
						<h5 class="title red-text text-lighten-2">` + data.question + `</h5>
						<blockquote>` + data.answer + `</blockquote>
						<p class="grey-text text-darken-1">- asked by ` + data.user + `</p>
					</div>
				</div>
			</div>
			`;
		}
	}
  })
);

search.addWidget(
  instantsearch.widgets.stats({
	container: '#stats',
	templates: {
	  body: function(data) {
		return `You have ` + data.nbHits + ` results, fetched in ` + data.processingTimeMS + `ms. <span class="ais-search-box--powered-by right">Search by <a class="ais-search-box--powered-by-link" href="https://www.algolia.com/" target="_blank">Algolia</a></span>`
	  }
	}
  })
);

// start
search.start();
