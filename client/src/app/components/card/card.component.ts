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

  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    this.fetchDate(moment().format('YYYY-MM-DD'));
  }

  fetchDate(fetchDate: any) {
    this.apiService.fetchApi(fetchDate)
    .subscribe((data: any) => {
      this.apiResponseData = data;
    })
  }

  newfetchEventParent(currentDateCarousel: string) {
    this.fetchDate(currentDateCarousel)
  }
}
