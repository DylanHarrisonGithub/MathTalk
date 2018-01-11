var targets = [];

function mathtalkInit() {

    MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});

    $(document).on('DOMNodeInserted', function(event) {

        //console.log(event.target.lastElementChild);
        if (event.target.lastElementChild) {
            if (event.target.lastElementChild.id == 'mathtalk-preview-output') {
            //console.log('it happened');
            $('#mathtalk-preview-input').on('change keyup paste', function(event2) {
                //document.getElementById('mathtalk-preview-output').innerHTML = mathtalkRender(document.getElementById('mathtalk-preview-input').value);
                document.getElementById('mathtalk-preview-output').innerHTML = '';
                document.getElementById('mathtalk-preview-output').appendChild(mathtalkRender(document.getElementById('mathtalk-preview-input').value));
                MathJax.Hub.Queue(["Typeset", MathJax.Hub], document.getElementById('mathtalk-preview-output'));
            });
            } else {
                if (event.target.lastElementChild.id == 'mathtalk-reply-preview-output') {
                    $('#mathtalk-reply-preview-input').on('change keyup paste', function(event2) {
                    //document.getElementById('mathtalk-reply-preview-output').innerHTML = mathTalkRender(document.getElementById('mathtalk-reply-preview-input').value);
                    document.getElementById('mathtalk-reply-preview-output').innerHTML = '';
                    document.getElementById('mathtalk-reply-preview-output').appendChild(mathTalkRender(document.getElementById('mathtalk-reply-preview-input').value));
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub], document.getElementById('mathtalk-reply-preview-output'));
                    });
                }            
            }
        }

        if (document.getElementById('mathtalk-post-body')) {
            if (!($('#mathtalk-post-body').hasClass('mathtalk-finished-rendering'))) {
                $('#mathtalk-post-body').addClass('mathtalk-finished-rendering');
                //console.log('found mathtalk-post-body');
                //let the browser finish rendering
                setTimeout(function() {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub], document.getElementById('mathtalk-post-body'));
                }, 500);           
            }
        }
    });
}

function mathtalkRender(post) {

    var reg = /\\plot\[[^\]]*\]/g;
    var plots = post.match(/\\plot\[[^\]]*\]/g);

    if (plots) {
        // delete \plot
        //console.log(plots);
        for (var i = 0; i < plots.length; i++) {
        plots[i] = plots[i].substring(5).replace(/\n/g, "");
        }

        //parse json
        try {
        plots = JSON.parse(plots);
        } catch(error) {
        console.log('could not parse');
        }
    /*           post=post.replace(/\\plot\[[^\]]*\]/g,function(x,y){
        var html = '<span id="mathtalkGraph';
        html += Date.now().toString() + y.toString();
        html += '>test</span><h1>heading</h1>outer';
        return html;
        }); */
        
    }
    post = post.split(/\\plot\[[^\]]*\]/g);
    var htmlDiv = document.createElement('div');
    var plotDiv;
    var thisPlot
    for (var i = 0; i < post.length; i++) {
        var paragraph = document.createElement('p');
        paragraph.textContent = post[i];
        htmlDiv.appendChild(paragraph);
        if (plots) {
            if (plots[i]) {
                plotDiv = document.createElement('div');
                //plotDiv.classList.add('text-center');
                plotDiv.id = "mathtalkPlot" + Date.now().toString() + i.toString();
                plotDiv.style = "width: 200px; height: 200px;";
                plotCanvas = document.createElement('canvas');
                plotDiv.appendChild(plotCanvas);
                htmlDiv.appendChild(plotDiv);
                thisPlot = new Plot(plotCanvas);
                thisPlot.plots.push({
                    'function': math.compile('3*x+1'),
                    'color': 'black' //CSS_COLOR_NAMES[myPlane.plots.length]
                });
                thisPlot.render();
                //htmlDiv.appendChild(thisPlot);
                
            }
        }
    }
    console.log(htmlDiv.innerHTML);
    return htmlDiv;
}
   