var converter = new Showdown.converter();
var CommentBox = React.createClass({
    render: function () {
        return (
            React.DOM.div(
                {
                    className: "CommentBox",
                },
                "Hello, world! I am a ",
                React.DOM.strong(null, "commentbox"),
                CommentList({}),
                CommentForm({})));
    }
});

var CommentList = React.createClass({
    render: function() {
        return (
            React.DOM.div({
                    className: "commentList",
                },
                "Hello, world! I am a ",
                React.DOM.strong(null, "CommentList"),
                Comment({
                    author:"Pete Hunt",
                    children: "This is one comment"}),
                Comment({
                    author:"Jordan Walke",
                    children: "This is *another* comment"})
                ));
    }
});

var Comment = React.createClass({
    render : function() {
        var htmlComment = converter.makeHtml(this.props.children.toString());
        return (
            React.DOM.div({
                    className: "comment",
                },
                React.DOM.h2({
                        className: "commentAuthor",
                    },
                    this.props.author),
                    React.DOM.span({
                            dangerouslySetInnerHTML:{__html:htmlComment}
                        })));
    }
});

var CommentForm = React.createClass({
    render: function() {
        return (
            React.DOM.div({
                    className: "commentBox",
                },
                "Hello, world! I am a ",
                React.DOM.strong(null, "CommentForm")
                ));
    }
});

React.renderComponent(
  CommentBox({}),
  document.getElementById('content')
);
