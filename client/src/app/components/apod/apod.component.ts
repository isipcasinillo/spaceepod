import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-apod',
  templateUrl: './apod.component.html',
  styleUrls: ['./apod.component.css']
})
export class ApodComponent implements OnInit {
  youtubeId: any = '';
  inputDate: any = '';
  constructor() { }

  @Input() apodFetchData: any;
  @Output() newfetchEvent = new EventEmitter<any>();
  @Output() newChangeEvent = new EventEmitter<any>();
  ngOnInit(): void {
  }

  apodFetch(value: string) {
    this.newfetchEvent.emit(value);
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

}
