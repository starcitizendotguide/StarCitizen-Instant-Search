// instant search <3

document.addEventListener('DOMContentLoaded', function() {
    M.Modal.init(document.querySelectorAll('.modal'), {
        onCloseStart: function (element) {
            // When video modal is closed stop playing the video
            document.getElementById('video-modal-content').innerHTML = '';
        }
    });
    M.Tooltip.init(document.querySelectorAll('.tooltipped'), {});
});

let search = instantsearch({
    appId: 'JXS80KHU8P',
    apiKey: 'ce0e3984181fb0fc71f26a20c56d9725',
    indexName: 'question_new_',
    advancedSyntax: true,
    hitsPerPage: 10,
    routing: {
        useHash: false,
        trackedParameters: ['query'],
        mapping: {
            'q': 'question'
        }
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
    let hash = window.location.hash.split('#')[1];
    window.location.hash = '';

    const element = document.getElementById(hash);
    if(element !== null) {
        element.scrollIntoView();
    }

});

// add a hits widget
search.addWidget(
    instantsearch.widgets.hits({
        container: '#results',
        hitsPerPage: 10,
        templates: {
            item: function(data) {

                var source = 'UNKOWN';
                var transcript = '';

                switch(data.type) {

                    case "youtube": {
                        source = '<a href="#video-modal{' + data.source + "{" + data.time + '">' + (data.title == null ? data.source : data.title)  + '</a>';

                        var parser = document.createElement('a');
                        parser.href = data.transcript;
                        transcript = '<a target="_blank" href="' + data.transcript + '" class="tooltipped right" data-tooltip="Transcribed by ' + parser.hostname + '"><i class="material-icons">description</i></a>';
                    }
                    break;

                    case "article": {
                        source = '<a target="_blank" href="' + data.source + '">' + data.title + '</a>';
                    }
                    break;

                }

                return "<div id=\"" + data.objectID + "\" class=\"col s12\"><div id=\"" + data.question + "\" class=\"card hoverable\"><div class=\"card-content\"><h5 class=\"title\">" + data.question + "</h5><blockquote>" + data.answer + "</blockquote><p class=\"grey-text text-darken-1\">- " + (data.hasOwnProperty('user') && data.user !== null ? " asked by " + data.user : "") + " in " + source + "<span class=\"tooltipped right\" data-tooltip=\"Object: " + data.objectID + "\"><i class=\"material-icons\">info_outline</i></span> " + transcript + " <a rel='modal:open' href=\"#" + data.objectID + "\" class=\"tooltipped right\" data-tooltip=\"Direct Link\"><i class=\"material-icons\">open_in_new</i></a></p></div></div></div>";
            },
            empty: function() {
                return "<div class=\"col s12\"><div class=\"card hoverable\"><div class=\"card-content\"><p class=\"grey-text text-darken-1\">No Results.</p></div></div></div>";
            }
        }
    })
);

(function() {
    document.addEventListener("click", function(event) {

        if (!(event.target.tagName.toLowerCase() === 'a')) {
            return;
        }

        var hash = event.target.hash;

        if (hash.match('^#video-modal')) {

            var parts = hash.split('{');

            // get the video id
            var videoID = parts[1].split('/')[3];

            // only time stuff - thank you, youtube... ;)
            var time = null;
            if(parts.length > 2) {

                time = parts[parts.length - 1];
            }

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
            const content = document.getElementById('video-modal-content');
            const youtubeUrl = 'https://www.youtube.com/embed/' + videoID + '?autoplay=1&amp;showinfo=0' + (offset === 0 ? '' : '&start=' + offset);
            //content.setAttribute('src', );
            content.innerHTML = '<iframe id="video-modal-content" width="853" height="480" src="' + youtubeUrl + '"\n' +
                'frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
            const instance = M.Modal.getInstance(document.getElementById('video-modal'));
            instance.open();

        }

    });

    document.getElementById('video-modal').addEventListener('click', function (event) {
        const element = document.getElementById('video-modal-content');
        element.innerHTML = '';
    });

    search.start();
})();