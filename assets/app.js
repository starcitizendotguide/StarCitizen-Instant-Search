// instant search <3
let search = instantsearch({
    appId: 'JXS80KHU8P',
    apiKey: 'ce0e3984181fb0fc71f26a20c56d9725',
    indexName: 'question_',
    searchFunction(helper) {

        if (helper.state.query.length < 4) {
            return;
        }

        if(!(/^[a-z0-9 ]+\??\:?\!?\.?([ ]+)?$/gi.test(helper.state.query))) {
            console.log("not alpa")    
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
        hitsPerPage: 10,
        templates: {
            item: function (data) {
                var highlighting = $('#textHighlighting').is(':checked');
                return `
			<div class="col s12">
				<div class="card hoverable">
					<div class="card-content">
						<h5 class="title red-text text-lighten-2">` + (highlighting ? data._highlightResult.question.value : data.question) + `</h5>
						<blockquote>` + (highlighting ? data._highlightResult.answer.value : data.answer) + `</blockquote>
						<p class="grey-text text-darken-1">- asked by ` + data.user + ` in <a href="` + (data.source.startsWith('http') ? data.source : '#') + `">` + (data.episode == null ? data.source : data.episode) + `</a></p>
					</div>
				</div>
			</div>
			`;
            },
            empty: function() {
                return `
			<div class="col s12">
				<div class="card hoverable">
					<div class="card-content">
						<p class="grey-text text-darken-1">No Results.</p>
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
search.start();
