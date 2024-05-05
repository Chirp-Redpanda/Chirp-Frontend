import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GetChirrupsService } from '../../services/get-chirrups.service';
import { Chirrup, Comment, Content } from '../../../core/models/chirrup';
import { CommentService } from 'src/app/features/chirrup/services/comment.service';
import { SharedService } from 'src/app/features/chirrup/services/shared.service';

@Component({
  selector: 'app-chirrup-list',
  templateUrl: './chirrup-list.component.html',
  styleUrls: ['./chirrup-list.component.sass', '../chirrup-card/chirrup-card.component.sass']
})
export class ChirrupListComponent implements OnInit, OnDestroy {
  news: Chirrup[] = [];
  newCommentText: string = '';
  private refreshSubscription: Subscription;

  constructor(
    private getChirrupsService: GetChirrupsService,
    private commentService: CommentService,
    private sharedService: SharedService
  ) { this.refreshSubscription = new Subscription(); }

  ngOnInit() {
    this.loadChirrups();
    // 订阅共享服务的刷新通知
    this.refreshSubscription = this.sharedService.getChirrupListRefreshNotifier().subscribe(() => {
      this.loadChirrups(); // 收到通知后刷新数据
    });

    this.getChirrupsService.getNews().subscribe({
      next: (data: Chirrup[]) => {
        this.news = data.map((item: Chirrup) => ({
          ...item,
          islike: false,
          showComments: false,
        }));
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  ngOnDestroy() {
    this.refreshSubscription.unsubscribe();
  }


  loadChirrups() {
    this.getChirrupsService.getNews().subscribe({
      next: (data: Chirrup[]) => {
        // 先按照时间顺序从近到远排列
        // data.sort((a, b) => new Date(b.publishedTime).getTime() - new Date(a.publishedTime).getTime());
        // 更新 news 数组
        this.news = data.map((item: Chirrup) => ({
          ...item,
          islike: false,
          showComments: false,
        }));
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  toggleHeartIcon(chirrup: Chirrup) {
    chirrup.islike = !chirrup.islike;
  };

  toggleCommentIcon(chirrup: Chirrup) {
    chirrup.showComments = !chirrup.showComments;
  }
  onSubmit(chirrup: Chirrup) {
    const newComment: Comment = {
      _id: '', // This will be generated by the backend
      publisherName: '', // Assuming default publisherName is 'Anon'
      content: {
        image: '', // Add image if available
        video: '', // Add video if available
        text: this.newCommentText, // Use the input text for the comment content
        _id: ''
      },
      publishedTime: new Date().toISOString() // Use current timestamp
    };

    this.commentService.addComment(chirrup._id || '', newComment).subscribe({
      next: _resp => {
        console.log("Comment post successfully");
        this.newCommentText = '';

        // After posting the comment, fetch the updated chirrups to display the new comment
        this.getChirrupsService.getNews().subscribe({
          next: (data: Chirrup[]) => {
            this.news = data.map((item: Chirrup) => ({
              ...item,
              islike: false,
              showComments: false,
            }));
          },
          error: (error) => {
            console.error('There was an error fetching chirrups!', error);
          }
        });
      },
      error: _err => console.log("Error posing new comment:", _err)
    });
  }
}
