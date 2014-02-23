(function (){
    use = "strict";

    // getJSON fetch JSON data from the provided URL
    var getJSON = function(url, successHandler, errorHandler) {
        var xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        xhr.responseType = 'json';
        xhr.onload = function() {
            var status = xhr.status;
            if (status == 200 && successHandler) {
                successHandler(xhr.response);
            } else if (errorHandler) {
                errorHandler(status);
            }
        };
        xhr.send();
    };

    var converter = new Showdown.converter();

    var channelBox = React.createClass({
        loadData: function() {
            getJSON(
                "/channels",
                function(data){
                    this.setState({data: data});
                }.bind(this),
                function(status){
                    console.log(status);
                });
        },

        getInitialState: function() {
            var url = "/channels";
            return {data:[], url: url};
        },

        componentDidMount: function() {
            window.setInterval(this.loadData, 5000);
        },

        render: function() {
            return (
                React.DOM.div(
                {className:"channelBox"},
                ChannelList({data: this.state.data})
                )
            );
        }
    });

    var ChannelList = React.createClass({
        render: function() {
            var channelNodes = this.props.data.map(function(item, index) {
                return Channel({channelName: item});
            });
            return React.DOM.ul({className: "channelList"}, channelNodes);
        }
    });

    var Channel = React.createClass({
        render: function() {
            return React.DOM.li(
                {className: "channel"},
                React.DOM.a(
                    {href: document.location.pathname +"#"+this.props.channelName},
                    this.props.channelName
                )
            );
        }
    });

    var CommentBox = React.createClass({
        loadInitialData: function(url) {
            console.log("loadInitialData");
            getJSON(
                url ? url : this.state.url,
                function(data) {
                    this.setState({data: data});
                }.bind(this),
                function(status) {
                    console.log("error", status);
                }
            );
        },

        updateData: function(comment) {
            if (this.state.data.map(function(item) {return item.Idx;}).indexOf(comment.Idx) === -1) {
                this.state.data.push(comment);
                this.setState({data: this.state.data});
            }
        },


        postComment: function(comment) {
            console.log("postComment" + comment);
            var xhr = new XMLHttpRequest();
            xhr.open("post", this.state.url, true);
            xhr.responseType = 'json';
            xhr.onload = function() { 
                if (xhr.status === 200) {
                    this.updateData(xhr.response);
                }
            }.bind(this);
            // Build the formData
            var fd = new FormData();
            for (var key in comment) {
                fd.append(key, comment[key]);
            }
            // Send the FormData
            xhr.send(fd);
        },

        sourceAddEventListener: function(url) {
            console.log("source.addEventListener");
            var eventsource_url = url ? url : this.state.url;
            eventsource_url += "/eventsource";
            this.source = new EventSource(eventsource_url);
            this.source.addEventListener('comment', function(e) {
                var cmt = JSON.parse(e.data);
                this.updateData(cmt);
            }.bind(this), false);
        },

        getInitialState: function(){
            var url;
            if (document.location.hash === "") {
                // set the URL to the default channel
                url = "/" + this.props.default_channel;
            } else {
                url = document.location.hash.replace('#', '/');
            }
            return {data: [], url: url};
        },

        componentDidMount: function() {
            console.log("componentDidMount");
            this.loadInitialData();
            this.sourceAddEventListener();

            window.addEventListener(
                "hashchange",
                function() {
                    console.log("hash changed " + document.location.hash);
                    var url = document.location.hash.replace('#', '/');
                    this.setState({url: url, data:[]});
                    this.loadInitialData(url);
                    this.sourceAddEventListener(url);
                }.bind(this),
                false);
        },

        render: function () {
            return (
                React.DOM.div(
                    {className: "CommentBox"},
                    CommentList({data: this.state.data}),
                    CommentForm({postComment: this.postComment})
                )
            );
        }
    });

    var CommentList = React.createClass({
        render: function() {
            var commentNodes = this.props.data.map(function (item, index) {
                return Comment({key: index, author: item.Author, children: item.Text});
            });
            return (React.DOM.div({className: "commentList"}, commentNodes));
        }
    });

    var Comment = React.createClass({
        render : function() {
            var htmlComment = converter.makeHtml(this.props.children.toString());
            return (
                React.DOM.div(
                    {className: "comment"},
                    React.DOM.h2(
                        { className: "commentAuthor"},
                        this.props.author),
                    React.DOM.span({dangerouslySetInnerHTML:{__html:htmlComment}})
                )
            );
        }
    });

    var CommentForm = React.createClass({
        handleSubmit: function(event) {
            var author = this.refs.author.getDOMNode().value.trim();
            var text = this.refs.text.getDOMNode().value.trim();
            if (!author || !text){
                return event.preventDefault();
            }
            this.props.postComment({author: author, text: text});
            this.refs.text.getDOMNode().value = '';
            return event.preventDefault();
        },
        render: function() {
            return (
                React.DOM.form(
                    {className: "commentBox", onSubmit: this.handleSubmit},
                    React.DOM.input({type: "text", placeholder: "Your name", ref: "author"}),
                    React.DOM.input({type: "text", placeholder: "Say something", ref: "text"}),
                    React.DOM.input({type: "submit", value: "Post"})
                )
            );
        }
    });

    React.renderComponent(channelBox(), document.getElementById('nav'));
    React.renderComponent(
        CommentBox({default_channel: "sample"}),
        document.getElementById('content'));

})();
