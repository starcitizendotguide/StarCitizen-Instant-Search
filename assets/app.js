// instant search <3
let search = instantsearch({
    appId: 'JXS80KHU8P',
    apiKey: 'ce0e3984181fb0fc71f26a20c56d9725',
    indexName: 'question_',
    advancedSyntax: true,
    hitsPerPage: 10,
    urlSync: {
        useHash: false,
        trackedParameters: ['query'],
        mapping: {
            'q': 'question'
        }
    },
    searchFunction(helper) {

        if (helper.state.query.length < 3) {
            return;
        }

        if (!(/^[a-z0-9-" ]+\??\:?\!?\.?([ ]+)?$/gi.test(helper.state.query))) {
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

search.on('render', function() {

    var hash = window.location.hash.split('#')[1];
    window.location.hash = '';
    
    var element = $('#' + hash);

    if(!(element.length === 0)) {
        $('html, body').animate({
                scrollTop: element.offset().top
        }, 2000);
    }

});

// add a hits widget
search.addWidget(
    instantsearch.widgets.hits({
        container: '#results',
        hitsPerPage: 10,
        templates: {
            item: function(data) {
                return `
                <div id="` + data.objectID + `" class="col s12">
    				<div id="` + data.question + `" class="card hoverable">
    					<div class="card-content">
    						<h5 class="title red-text text-lighten-2">` + data.question + `</h5>
    						<blockquote>` + data.answer + `</blockquote>
    						<p class="grey-text text-darken-1">
                            - ` + (data.hasOwnProperty('user') && data.user !== null ? ` asked by ` + data.user : '') + ` in <a href="#video-modal-` + data.source + '-' + data.time + `">` + (data.episode == null ? data.source : data.episode) + `</a> ` + (data.hasOwnProperty('time') ? `<span class="tooltipped right" data-tooltip="Time feature available (` + data.time + `)"><i class="material-icons">av_timer</i></span>` : ``) + `<span class="tooltipped right" data-tooltip="Object: ` + data.objectID + `"><i class="material-icons">info_outline</i></span><a href="http://imperialnews.network/" class="tooltipped right" data-tooltip="Transcribed by INN"><i class="material-icons">description</i></a><a href="#` + data.objectID + `" class="tooltipped right" data-tooltip="Direct Link"><i class="material-icons">open_in_new</i></a>
                            </p>
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
        autoHideContainer: false,
        templates: {
            body: function(data) {
                return `You have ` + data.nbHits + ` results, fetched in ` + data.processingTimeMS + `ms. <span class="ais-search-box--powered-by right">powered by <a class="ais-search-box--powered-by-link" href="https://www.algolia.com/" target="_blank">Algolia</a></span>`;
            }
        }
    })
);

// Tooltip
search.on('render', function() {
    $('.tooltipped').tooltip({});
});

// A $( document ).ready() block.
$(document).ready(function() {

    $(document).click(function(event) {

        if (!(event.target.tagName.toLowerCase() === 'a')) {
            return;
        }

        var hash = event.target.hash;

        if (hash.match('^#video-modal')) {

            var parts = hash.split('-');

            // get the video id
            var videoID = parts[2].split('/')[3];

            // only time stuff - thank you youtube...
            var time = (parts[3] == 'undefined' ? null : parts[3]);

            var minutes = 0;
            var seconds = 0;

            // If we even have a valid timestamp
            if(!(time === null)) {
                var mIndex = time.indexOf('m');
                var sIndex = time.indexOf('s');

                // if we have a timestamp with minutes AND seconds
                if(!(mIndex == -1) && !(sIndex == -1)) {

                    minutes = parseInt(time.substr(0, mIndex));
                    seconds = parseInt(time.substr(mIndex + 1, sIndex));

                } else if(!(mIndex == -1)) {

                    // only minutes given
                    minutes = parseInt(time.substr(0, mIndex));

                } else if(!(sIndex == -1)) {

                    // only seconds given
                    seconds = parseInt(time.substr(0, sIndex));

                }
            }

            var offset = (minutes * 60) + seconds;

            // set stuff
            var content = $('#video-modal-content');
            content.attr('src', 'https://www.youtube.com/embed/' + videoID + '?autoplay=1&amp;showinfo=0' + (offset === 0 ? '' : '&start=' + offset));

            $('#video-modal').openModal({
                complete: function() {
                    $('#video-modal-content').attr('src', $('#video-modal-content').attr('src').replace('autoplay=1&', ''));
                }
            });

        }

    });

    // Stop playing the video once the user closes the modal
    $('#video-modal-close').click(function() {
        $('#video-modal-content').attr('src', $('#video-modal-content').attr('src'));
    });

});



search.start();
