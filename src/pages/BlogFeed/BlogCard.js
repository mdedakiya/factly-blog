import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

//UI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Collapse from '@material-ui/core/Collapse';
import Input from '@material-ui/core/Input';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';

//other
import { apiGetCall, apiPostCall } from './../../services/network';

class BlogCard extends Component {
	constructor(props) {
		super(props);
		var likedByUser = false
		if(props.auth.user && props.blog.likes.find(x => x.user === props.auth.user._id))
			likedByUser = true
		this.state ={
			commentOpen: false,
			newComment: "",
			comments: [],
			liked: likedByUser
		}
	}
	postComment(){
		var successCallback = function(data){
			var commentsCopy = this.state.comments
			commentsCopy.push({
				'text': this.state.newComment,
				'user': this.props.auth.user._id,
				'createdAt': Date.now(),
				'author': this.props.auth.user
			})
			this.setState({
				newComment: "",
				comments: commentsCopy
			})
		}.bind(this)
		
		var errorCallback = function(data){
			console.log("ERROR")
		}
		var sendData = {
			'text': this.state.newComment
		}
		apiPostCall('/blog/'+this.props.blog._id+'/comment', sendData, this.props.auth.token, successCallback, errorCallback)
	}
	getAllComments(){
		this.setState({
			commentOpen: true
		})
		var successCallback = function(data){
			this.setState({ 
				comments: data.comments
			});
		}.bind(this)
		
		var errorCallback = function(data){
			console.log("ERROR")
		}
		
		apiGetCall('/blog/'+this.props.blog._id+'/comment', successCallback, errorCallback)
	}
	likeUnlike(actionType){
		var successCallback = function(data){
			this.setState({
				liked: actionType
			})
		}.bind(this)
		
		var errorCallback = function(data){
			console.log("ERROR")
		}
		var whichURL = actionType ? '/like' : '/unlike'
		apiPostCall('/blog/'+ this.props.blog._id + whichURL , {}, this.props.auth.token, successCallback, errorCallback)
	}
	
	handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };
	
	render() {
		const { comments } = this.state
		var commentList = []
		for(var i = 0; i < comments.length; i++){
			commentList.push(
				<ListItem key={this.props.blog._id + "comment" + i}>
					<Avatar>
						<ImageIcon />
					</Avatar>
					<ListItemText primary={comments[i].text} secondary={"By " + comments[i].user.name} />
				</ListItem>
			)
		}
		return (
      <div className="each-blog">
				<Card  className="blog-card">
					<CardContent>
						<Typography variant="overline" gutterBottom>In {this.props.blog.category} by {this.props.blog.author.name}</Typography>
						<Typography variant="h5" component="h2">{this.props.blog.title}</Typography>
						<Typography component="p">{this.props.blog.desc}</Typography>
					</CardContent>
					<CardActions>
						{
							this.state.liked ? (
								<Button size="small" color="secondary" onClick={() => this.likeUnlike(false)}>UNLIKE</Button>
							) : (
								<Button size="small" onClick={() => this.likeUnlike(true)}>LIKE</Button>
							)
						}
						<Button size="small" onClick={()=>{this.getAllComments()}}>COMMENT</Button>
						<Button component={Link} to={"/blog/"+this.props.blog._id} size="small">FULL ARTICLE</Button>
					</CardActions>
					<Collapse in={this.state.commentOpen} timeout="auto">
						<CardContent>
							<Typography>Comments</Typography>
							<div>
							{
								this.props.auth.user ? (
								<Grid container spacing={8}>	
									<Grid item xs={10}>
										<Input
											fullWidth
											value={this.state.newComment}
											onChange={this.handleChange('newComment')}
											placeholder="Write A Comment"
											inputProps={{
												'aria-label': 'Comment',
											}}
										/>
									</Grid>
									<Grid item xs={2}>
										<Button fullWidth variant="contained" color="primary" disabled={this.state.newComment === ""} onClick={() => {this.postComment()}}>POST</Button>
									</Grid>
								</Grid>
								) : (
									<Typography component="p">Please login to post comment</Typography>
								)
							}
							</div>
							<div>
								<List>
								{
									commentList.length === 0 ? (
										<Typography component="p">Be the first one to comment</Typography>
									) : commentList 
								}
								</List>
							</div>
						</CardContent>
					</Collapse>
				</Card>
			</div>
    );
  }
}

function mapStateToProps(state) {
    const { auth } = state;
    return {
        auth
    };
}

const connectedBlogCard = connect(mapStateToProps)(BlogCard);
export default connectedBlogCard;