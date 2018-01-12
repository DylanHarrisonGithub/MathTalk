import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  //MathJax: any;
  posts = [];
  replies = [];

  newPostBody: String;
  newPostTitle: String;
  newReplyBody: String;
  newReplyTitle: String;

  selectedPost = -1;
  activeTarget = null;
  composePost = false;
  composeReply = false;

  constructor(
    private authService: AuthService,
    private flashMessagesService: FlashMessagesService
  ) { }

  ngOnInit() {
    
    this.authService.getLatestPosts().subscribe(latest => {
      if (latest.success) {
        this.posts = latest.posts;
        this.selectedPost = -1;
  
        // make timestamps human readable
        this.posts.forEach(post => {
          const date = new Date((Number(post.timeStamp)));
          post.timeStamp = date.toDateString() + ", " + date.toTimeString();
        });  
      } else {
        this.posts = [];
      }
    });

    this.composePost = false;
    this.composeReply = false;
  }

  selectPost(i, event) {

    // bubble up DOM Tree to button where click event occured
    var eventTarget = event.target;
    while (!eventTarget.attributes.role) {
      eventTarget = eventTarget.parentNode;
    }

    if (this.activeTarget) {
      this.activeTarget.className = "list-group-item btn btn-info";
      eventTarget.className = "list-group-item active";
    } else {
      eventTarget.className = "list-group-item active";
    }

    if (this.selectedPost == i) {
      this.selectedPost = -1;
      this.replies = [];
      eventTarget.className = "list-group-item btn btn-info"
      if (this.activeTarget) {
        this.activeTarget.className = "list-group-item btn btn-info";
        this.activeTarget = null;
      }
    } else {
      this.selectedPost = i;
      if (this.activeTarget) {
        this.activeTarget.className = "list-group-item btn btn-info";
      }
      eventTarget.className = "list-group-item active"
      this.activeTarget = eventTarget;
      if (this.posts) {
        if (this.posts[this.selectedPost]) {
          //console.log(this.posts[this.selectedPost]._id);
          this.authService.getPostRepliesByParentId(this.posts[this.selectedPost]._id.toString()).subscribe(postReplies => {          
            if (postReplies.success) {
              //console.log(postReplies);   
              this.replies = postReplies.replies;
  
              this.replies.forEach(post => {
                const date = new Date((Number(post.timeStamp)));
                post.timeStamp = date.toDateString() + ", " + date.toTimeString();
              }); 
            } else {
              //console.log('could not get replies: ' + postReplies.message);
              this.replies = [];
            }
          });
        }
      }
    }

  }

  newPost() {

    if (!this.authService.loggedIn()) {
      this.flashMessagesService.show('You must log in to create a new post!', { cssClass: 'alert-danger' });
    } else {
      if (this.newPostTitle == "") {
        this.flashMessagesService.show('You must provide a post title!', { cssClass: 'alert-danger' });
      } else {
        if (this.newPostBody == "") {
          this.flashMessagesService.show('You cannot create an empty post!', { cssClass: 'alert-danger' });
        } else {
          this.authService.getProfile().subscribe(profile => {

            //hashtag regex
            var hashRegEx = /\#(\S)*/g

            const post = {             
              username: profile.user.username,
              title: this.newPostTitle,
              body: this.newPostBody,
              meta: this.newPostBody.match(hashRegEx)
            }

            this.authService.submitNewPost(post).subscribe(res => {
              this.flashMessagesService.show('New post created!', { cssClass: 'alert-success' });
              this.authService.getLatestPosts().subscribe(latest => {
                if (latest.success) {
                  this.posts = latest.posts;
                  this.selectedPost = -1;
            
                  // make timestamps human readable
                  this.posts.forEach(post => {
                    const date = new Date((Number(post.timeStamp)));
                    post.timeStamp = date.toDateString() + ", " + date.toTimeString();
                  });  
                } else {
                  this.posts = [];
                }
              });
            });
            
          });       
        }
      }
    }

  }

  newReply() {

    if (!this.authService.loggedIn()) {
      this.flashMessagesService.show('You must log in to create a new post!', { cssClass: 'alert-danger' });
    } else {
      if (false) {
        //this.flashMessagesService.show('You must provide a post title!', { cssClass: 'alert-danger' });
      } else {
        if (this.newPostBody == "") {
          this.flashMessagesService.show('You cannot create an empty reply!', { cssClass: 'alert-danger' });
        } else {
          this.authService.getProfile().subscribe(profile => {

            //hashtag regex
            var hashRegEx = /\#(\S)*/g

            const post = {             
              username: profile.user.username,
              title: 'replied @' + this.posts[this.selectedPost].username,
              body: this.newReplyBody,
              parentID: this.posts[this.selectedPost]._id.toString(),
              meta: this.newPostBody.match(hashRegEx)
            }

            this.authService.submitNewPost(post).subscribe(res => {
              this.flashMessagesService.show('New post created!', { cssClass: 'alert-success' });
              this.authService.getLatestPosts().subscribe(latest => {
                if (latest.success) {
                  this.posts = latest.posts;
                  //this.selectedPost = -1;
                  this.newReplyBody = "";
            
                  // make timestamps human readable
                  this.posts.forEach(post => {
                    const date = new Date((Number(post.timeStamp)));
                    post.timeStamp = date.toDateString() + ", " + date.toTimeString();
                  });  
                } else {
                  this.posts = [];
                }
              });
            });
            
          });       
        }
      }
    }

  }

  isSelectedPost(i) {
    return this.selectedPost == i;
  }

  toggleNewPost() {
    this.composePost = !this.composePost;
  }

  toggleNewReply() {
    this.composeReply = !this.composeReply;
  }

  doSomething(e) {
    //console.log('you changed');
    //this.MathJax.Hub.Queue(["Typeset", this.MathJax.Hub, e]);
  }

}
