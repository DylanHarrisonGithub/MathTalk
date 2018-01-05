import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  posts = [];
  replies = [];
  selectedPost = -1;

  constructor(
    private authService: AuthService
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
  }

  selectPost(i) {

    if (this.selectedPost = i) {
      this.selectedPost = -1;
      this.replies = [];
    } else {
      this.selectedPost = i;
    
      if (this.posts) {
        if (this.posts[this.selectedPost]) {
          //console.log(this.posts[this.selectedPost]._id);
          this.authService.getPostRepliesByParentId(this.posts[this.selectedPost]._id.toString()).subscribe(postReplies => {          
            if (postReplies.success) {
              console.log(postReplies);   
              this.replies = postReplies.replies;
  
              this.replies.forEach(post => {
                const date = new Date((Number(post.timeStamp)));
                post.timeStamp = date.toDateString() + ", " + date.toTimeString();
              }); 
            } else {
              console.log('could not get replies: ' + postReplies.message);
              this.replies = [];
            }
          });
        }
      }
    }

  }

  isSelectedPost(i) {
    return this.selectedPost == i;
  }

}
