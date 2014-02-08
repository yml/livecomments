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
                    children: "This is an other comment"})
                ));
    }
});

var Comment = React.createClass({
    render : function() {
        return (
            React.DOM.div({
                    className: "comment",
                },
                React.DOM.h2({
                    className: "commentAuthor",
                },
                this.props.author),
                this.props.children));
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
