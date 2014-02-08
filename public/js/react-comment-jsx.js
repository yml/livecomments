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
                <Comment author="Pete Hunt">This is one comment</Comment>
                <Comment author="Jordan Walke">This is *another* comment</Comment>
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


var Comment = React.createClass({
    render: function(){
        return (
                <div className="Comment">
                    <h2 className="commentAuthor">{this.props.author}</h2>
                    {this.props.children}
                </div>
                        
            );
    }
});

React.renderComponent(
  CommentBox({}),
  document.getElementById('content')
);
