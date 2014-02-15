(function (){
    use = "strict";
    var converter = new Showdown.converter();

    var CommentBox = React.createClass({
        loadInitialData: function() {
            $.ajax({
                url: this.props.url,
                dataType: "json",
                success: function(data) {
                    this.setState({data: data});
                }.bind(this)
           });
        },

        updateData: function(comment) {
            if (this.state.data.map(function(item) {return item.Idx;}).indexOf(comment.Idx) === -1) {
                this.state.data.push(comment);
                this.setState({data: this.state.data});
            }
        },

        postComment: function(comment) {
            console.log("Post the comment to the backend" + comment);
            $.ajax({
                url: this.props.post_url,
                dataType: 'json',
                type: 'POST',
                data: comment,
                success: function(cmt) {
                    //this.setState({data: data});
                    this.updateData(cmt);
                }.bind(this)
            });
        },

        getInitialState: function(){
            return {data: [], source: new EventSource(this.props.eventsource_url)};
        },

        componentWillMount: function() {
            this.loadInitialData();
            this.state.source.addEventListener('comment', function(e) {
                var cmt = JSON.parse(e.data);
                this.updateData(cmt);
            }.bind(this), false);

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
            this.refs.author.getDOMNode().value = '';
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

    React.renderComponent(
        CommentBox({
            url: "/data/comments.json",
            post_url: "/comments",
            eventsource_url: "/eventsource",
        }),
        document.getElementById('content')
    );
})();
