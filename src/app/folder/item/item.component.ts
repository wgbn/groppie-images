import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FilesService } from '../files.service';

@Component({
  selector: 'one-item',
  templateUrl: './item.component.html',
  styleUrls: [ './item.component.scss' ],
})
export class ItemComponent implements OnInit {

  @Input() item: any = null;
  @Input() folder: string = null;
  @Input() showName = false;
  @Input() select = false;
  @Output() onChecked = new EventEmitter<boolean>();
  @Output() onSelected = new EventEmitter<boolean>();

  constructor(private router: Router, public files: FilesService) { }

  ngOnInit() {}

  onCheck(evt) {
    this.onChecked.emit(evt.detail.checked);
  }

  onClick() {
    if (this.select) this.onChecked.emit(!this.item.checked);
    else {
      console.log(this.folder);
      const route = `/folder/${(this.folder || '').split('/').join('~')}~${this.item.name}`;
      if (!this.item.isFile) this.router.navigate([ route ]);
      else this.onSelected.emit(true);
    }
  }

}
