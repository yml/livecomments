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
                React.DOM.strong(null, "CommentList")
                ));
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
