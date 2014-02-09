/** @jsx React.DOM */
var data = [
  {author:"Pete Hunt", text:"This is one comment"},
  {author: "Jordan Walke", text: "This is *another* comment"}
];


var converter = new Showdown.converter();
var CommentBox = React.createClass({
	render: function () {
		return (
			<div className="commentBox">
				Hello world! I am a <strong>commentbox</strong>.
				<CommentList data={this.props.data} />
				<CommentForm/>
			</div>
		)
	}	
});

var CommentList = React.createClass({
	render: function() {
        var commentNodes = this.props.data.map(function (item, index) {
            return <Comment key={index} author={item.author}>{item.text}</Comment>;
        });
		return (
			<div className="commentList">
				Hello, world! I am a <strong>CommentList</strong>.
                {commentNodes}
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
		var htmlComment = converter.makeHtml(this.props.children.toString());
        return (
                <div className="Comment">
                    <h2 className="commentAuthor">{this.props.author}</h2>
                    <span dangerouslySetInnerHTML={{__html:htmlComment}} />
                </div>
                        
            );
    }
});

React.renderComponent(
  CommentBox({data:data}),
  document.getElementById('content')
);
