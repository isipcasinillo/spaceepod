import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-apod',
  templateUrl: './apod.component.html',
  styleUrls: ['./apod.component.css']
})
export class ApodComponent implements OnInit {
  youtubeId: any = '';
  constructor() { }

  @Input() apodFetchData: any;
  @Output() newfetchEvent = new EventEmitter<any>();

  ngOnInit(): void {
  }

  apodFetch(value: string) {
    console.log(value)
    this.newfetchEvent.emit(value);
  }
  getYoutubeId(url: string){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    var youtubeIdRegex = (match&&match[7].length==11)? match[7] : false;
    this.youtubeId = youtubeIdRegex;
    return this.youtubeId
  }

}
