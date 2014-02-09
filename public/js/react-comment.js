var converter = new Showdown.converter();

var CommentBox = React.createClass({
    loadComments: function() {
		var instance = this;
        $.ajax({
            url: this.props.url,
            dataType: "json",
            success: function(data) {
                instance.setState({data: data});
            }
       });
    },
	getInitialState: function(){
		return {data: []};
	},
    componentWillMount: function() {
        this.loadComments();
        setInterval(this.loadComments, this.props.pollInterval);
    },
	render: function () {
		return (
			React.DOM.div(
				{
					className: "CommentBox",
				},
				"Hello, world! I am a ",
				React.DOM.strong(null, "commentbox"),
				CommentList({data: this.state.data}),
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
    CommentBox({
        url: "/data/comments.json",
        pollInterval: 5000
    }),
    document.getElementById('content')
);
