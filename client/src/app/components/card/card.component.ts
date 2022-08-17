import { Component,  OnInit } from '@angular/core';
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
  inputDatexxx: string = '';
  inputDay: string = '';
  currentdate: string = '';
  date: string = '';
  media_type: string = '';
  copyright?: string;
  title: string = '';
  url: string = '';
  description: string = '';
  youtubeId: any  = '';
  data: Array<any>= [];
  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    this.currentdate = moment().format('YYYY-MM-DD')
    this.fetchDate(this.currentdate);
  }

  fetchDate(fetchDate: string) {
    this.apiService.fetchApi(fetchDate)
    .subscribe((data: any) => {
      ;
      this.apiResponseData = data;
      this.inputDate = this.apiResponseData.date
    })

  }

  onChangeFetch() {
    this.fetchDate(this.inputDate)
  }

  newfetchEventParent(currentDateCarousel: string) {
    this.fetchDate(currentDateCarousel)
  }
}
