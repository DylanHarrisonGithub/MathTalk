import { Component, HostListener, Directive, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { DOCUMENT } from "@angular/platform-browser";

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
  queryString: '';

  selectedPost = -1;
  activeTarget = null;
  composePost = false;
  composeReply = false;
  
  // this will break someday when timestamps exceed max_safe_int
  oldestTimeStamp = Number.MAX_SAFE_INTEGER;

  constructor(
    private authService: AuthService,
    private flashMessagesService: FlashMessagesService
  ) { }

  // detect scroll to bottom of page for infinite wall effect
  @HostListener('window:scroll', ['$event']) onScrollEvent($event) {

    // cross-browser compatible position of top of window over document
    const verticalOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;    
    // cross-browser compatible max vertical offset
    const limit = Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight ) - window.innerHeight;

    if ((limit - verticalOffset) == 0) {
      //console.log('scrolled to bottom of page!');
      this.getNextTenPostsByTimeStampAndQuery(this.oldestTimeStamp, this.queryString);
    }
  } 

  ngOnInit() {
    this.getNextTenPostsByTimeStampAndQuery(this.oldestTimeStamp, this.queryString);
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
      this.getRepliesToSelectedPost();
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
              this.oldestTimeStamp = Number.MAX_SAFE_INTEGER;
              this.posts = [];
              this.getNextTenPostsByTimeStampAndQuery(this.oldestTimeStamp, this.queryString);
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
              meta: this.newReplyBody.match(hashRegEx)
            }

            this.authService.submitNewPost(post).subscribe(res => {
              this.flashMessagesService.show('New post created!', { cssClass: 'alert-success' });
              this.getRepliesToSelectedPost();
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

  getNextTenPostsByTimeStampAndQuery(timestamp, query) {

    this.authService.getLatestOlderThanTimeStampWithQuery(timestamp, query).subscribe(res => {
      if (res.success) {
        // save oldest timestamp
        if (res.posts.length > 0) {
          this.oldestTimeStamp = res.posts[res.posts.length - 1].timeStamp;
        }

        // make human readable
        res.posts.forEach(post => {
          const date = new Date((Number(post.timeStamp)));
          post.timeStamp = date.toDateString() + ", " + date.toTimeString();
        });

        // append to posts
        this.posts = this.posts.concat(res.posts);
        console.log('success', res.posts);       
      } else {
        console.log('Error retrieving posts', res);
      }
    });

  }

  getRepliesToSelectedPost() {
    if (this.posts) {
      if (this.posts[this.selectedPost]) {
        this.authService.getPostRepliesByParentId(this.posts[this.selectedPost]._id.toString()).subscribe(postReplies => {          
          if (postReplies.success) { 
            this.replies = postReplies.replies;

            // make timestamps readable
            this.replies.forEach(post => {
              const date = new Date((Number(post.timeStamp)));
              post.timeStamp = date.toDateString() + ", " + date.toTimeString();
            }); 
          } else {
            this.replies = [];
          }
        });
      }
    }    
  }

  query() {
    this.oldestTimeStamp = Number.MAX_SAFE_INTEGER;
    this.posts = [];
    this.getNextTenPostsByTimeStampAndQuery(this.oldestTimeStamp, this.queryString);
  }

}
