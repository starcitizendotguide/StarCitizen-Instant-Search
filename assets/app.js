// instant search <3

document.addEventListener('DOMContentLoaded', function() {
    M.Modal.init(document.querySelectorAll('.modal'), {
        onCloseStart: function (element) {
            // When video modal is closed stop playing the video
            document.getElementById('video-modal-content').innerHTML = '';
        }
    });
});

const searchClient = algoliasearch(
    'JXS80KHU8P',
    'ce0e3984181fb0fc71f26a20c56d9725'
);

const search = instantsearch({
    indexName: 'question_new_',
    searchClient,
    routing: {
        stateMapping: instantsearch.stateMappings.singleIndex('question_new_'),
        router: instantsearch.routers.history({
            createURL({ qsModule, routeState, location }) {
                const baseUrl = location.origin;
                if(routeState.hasOwnProperty('query'))
                {
                    const question = encodeURIComponent(routeState.query);
                    return `${baseUrl}?question=${question}`;
                }
                return `${baseUrl}`;
            },

            parseURL({ qsModule, location }) {
                const { question } = qsModule.parse(location.search.slice(1));
                if(typeof question === 'undefined')
                {
                    return {
                        query: decodeURIComponent('')
                    };
                }
                return {
                    query: decodeURIComponent(question),
                };
            }
        }),
    }
});

search.addWidgets([
    instantsearch.widgets.searchBox({
        autofocus: true,
        container: '#search',
        placeholder: 'What is your question?',
        searchAsYouType: true,
        showReset: false,
        showSubmit: false,
        cssClasses: {
            input: 'search-box'
        }
    }),
    instantsearch.widgets.poweredBy({
        container: '.powered-by-algolia',
    }),
    instantsearch.widgets.hits({
        container: '#results',
        templates: {
            list: 'test',
            item: function(data) {
                var source = 'UNKNOWN';
                var transcript = '';

                switch(data.type) {

                    case "youtube": {
                        const title = (data.title == null ? data.source : data.title);
                        if(typeof data.time === 'undefined')
                        {
                            source = `<a class="video-modal-link" data-source="${data.source}">${title}</a>`;
                        }
                        else
                        {
                            source = `<a class="video-modal-link" data-source="${data.source}" data-time="${data.time}">${title}</a>`;
                        }

                        var parser = document.createElement('a');
                        parser.href = data.transcript;
                        transcript = `<a target="_blank" href="${data.transcript}" class="tooltipped right" data-tooltip="Transcribed by ${parser.hostname}"><i class="material-icons">description</i></a>`;
                    } break;

                    case "spectrum":
                    case "article": {
                        source = `<a target="_blank" href="${data.source}">${data.title}</a>`;
                    } break;
                }


                return `
                <div id="${data.objectID}">
                    <div class="card hoverable">
                        <div class="card-content">
                            <h5 class="title">${data.question}</h5>
                            <blockquote>${data.answer}</blockquote>
                            <p class="grey-text text-darken-1">
                                -  asked ${data.user ? ('by ' + data.user) : ''} in ${source}
                                <span class="tooltipped right" data-tooltip="Object: ${data.objectID}"><i class="material-icons">info_outline</i></span>
                                ${transcript}
                                <a href="#${data.objectID}" class="tooltipped right" data-tooltip="Direct Link"><i class="material-icons">open_in_new</i></a>
                        </div>
                    </div>
                </div>            
            `;

            },
            empty: `
            <div class="col s12">
                <div class="card hoverable">
                    <div class="card-content">
                        <p class="grey-text text-darken-1">No Results.</p>
                    </div>
                </div>
            </div>
            `
        }
    })
]);


search.on('render', function() {
    //---
    M.Tooltip.init(document.querySelectorAll('.tooltipped'), {});

    //---
    {
        let hash = window.location.hash.split('#')[1];
        //window.location.hash = '';
        const element = document.getElementById(hash);
        if(element !== null) {
            element.scrollIntoView();
        }
    }

    updateVideoModals();
});

function updateVideoModals()
{
    const elements = document.getElementsByClassName('video-modal-link');
    for(let i = 0; i < elements.length; i++)
    {
        const element = elements[i];
        element.addEventListener("click", function(event) {
    
            if (true || event.target.hash.match('^#video-modal')) {
    
                // get the video id
                var videoID = event.target.getAttribute('data-source').split('/')[3]; 
    
                // only time stuff - thank you, youtube... ;)
                var minutes = 0;
                var seconds = 0;
                if(event.target.hasAttribute('data-time')) {
    
                    const time = event.target.getAttribute('data-time');
    
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
    
                const offset = (minutes * 60) + seconds;
    
                // set stuff
                const content = document.getElementById('video-modal-content');
                const youtubeUrl = `https://www.youtube.com/embed/${videoID}?autoplay=1&amp;showinfo=0` + (offset === 0 ? '' : '&start=' + offset);
                content.innerHTML = `<iframe id="video-modal-content" width="853" height="480" src="${youtubeUrl}"` +
                    'frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
                const instance = M.Modal.getInstance(document.getElementById('video-modal'));
                instance.open();
    
            }
    
        });

        
    }

}

(function() {
    document.getElementById('video-modal').addEventListener('click', function (event) {
        const element = document.getElementById('video-modal-content');
        element.innerHTML = '';
    }); 
})();

search.start();
