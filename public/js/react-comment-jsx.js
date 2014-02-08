/** @jsx React.DOM */
var CommentBox = React.createClass({
	render: function () {
		return (
			<div className="commentBox">
				Hello world! I am a <strong>commentbox</strong>.
				<CommentList/>
				<CommentForm/>
			</div>
		)
	}	
});

var CommentList = React.createClass({
	render: function() {
		return (
			<div className="commentList">
				Hello, world! I am a <strong>CommentList</strong>.
			</div>
		);
	}
});


var CommentForm = React.createClass({
 	render: function() {
    	return (
      		<div className="commentForm">
        		Hello, world! I am a <strong>CommentForm</strong>.
      		</div>
    	);
  }
});

React.renderComponent(
  CommentBox({}),
  document.getElementById('content')
);
