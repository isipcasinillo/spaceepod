import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
@Component({
  selector: 'app-apod',
  templateUrl: './apod.component.html',
  styleUrls: ['./apod.component.css']
})
export class ApodComponent implements OnInit {
  tdate: string = moment().format('YYYY-MM-DD');
  youtubeId: any = '';
  inputDate: any = '';
  dateValue: string = '';
  constructor() { }

  @Input() apodFetchData: any;
  @Output() newfetchEvent = new EventEmitter<any>();
  @Output() newChangeEvent = new EventEmitter<any>();
  ngOnInit(): void {
  }

  apodFetch(value: string) {
    this.newfetchEvent.emit(value);
    this.tdate = value;
  }
  apodDate(value: string) {
    this.newChangeEvent.emit(value);
  }
  getYoutubeId(url: string){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    var youtubeIdRegex = (match&&match[7].length==11)? match[7] : false;
    this.youtubeId = youtubeIdRegex;
    return this.youtubeId
  }
  fetchDateOnBlur() {
    this.apodFetch(this.tdate)
  }
}
