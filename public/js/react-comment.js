var data = [
  {author:"Pete Hunt", text:"This is one comment"},
  {author: "Jordan Walke", text: "This is *another* comment"}
];

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
                CommentList({data: this.props.data}),
                CommentForm({})));
    }
});

var CommentList = React.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function (item, index) {
            return Comment({key: index, author: item.author, children: item.text});
        });
        return (
            React.DOM.div({
                    className: "commentList",
                },
                "Hello, world! I am a ",
                React.DOM.strong(null, "CommentList"),
                commentNodes
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
  CommentBox({data: data}),
  document.getElementById('content')
);
