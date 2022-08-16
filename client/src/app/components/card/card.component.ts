import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import * as moment from 'moment';


@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  apiResponseData: any;
  inputDate: string = '';
  currentdate: string = '';
  date: string = '';
  media_type: string = '';
  copyright?: string;
  title: string = '';
  url: string = '';
  description: string = '';
  youtubeId: string | false = '';
  constructor(private apiService: ApiService) {
  }

  ngOnInit(): void {
    this.currentdate = moment().format('YYYY-MM-DD')
    console.log(this.currentdate)
    this.fetchDate(this.currentdate);
  } 

  getYoutubeId(url: string){
      var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      var match = url.match(regExp);
      var youtubeIdRegex = (match&&match[7].length==11)? match[7] : false;
      this.youtubeId = youtubeIdRegex;
  }

  fetchDate(fetchDate: string) {
    this.apiService.fetchApi(fetchDate)
    .subscribe((data: any) => {
      ;
      this.apiResponseData = data
      this.getYoutubeId(this.apiResponseData.url)
      this.date = this.apiResponseData.date;
      this.media_type = this.apiResponseData.media_type
      this.url = this.apiResponseData.url
      this.copyright = this.apiResponseData?.copyright
      this.title = this.apiResponseData.title
      this.description = this.apiResponseData.explanation
    })

  }

  onChangeFetch() {
    this.fetchDate(this.inputDate)
  }
}
