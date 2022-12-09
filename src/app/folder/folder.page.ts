import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { FilesService } from './files.service';
import { ListFoldersComponent } from './list-folders/list-folders.component';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: [ './folder.page.scss' ],
})
export class FolderPage implements OnInit {
  @ViewChild('popover') popover;

  folder: string;
  folderContents: any[] = [];
  path = '';
  selectedPic: any = {};
  showBar = false;
  showName = false;
  edit = false;
  free = false;
  select = false;
  isPopoverOpen = false;
  croppedImage: any = '';
  canvasRotation = 0;
  selectTotal = 0;
  object = Object;

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private modal: ModalController,
    private loadingCtrl: LoadingController,
    public files: FilesService) {
    console.log('$ folder');
  }

  async ngOnInit() {
    await new Promise(r => setTimeout(() => r(true), 500));
    this.activatedRoute.params.subscribe(params => {
      console.log('$ params', params.id ? params.id.split('~').join('/') : null);
      this.folder = params.id ? params.id.split('~').join('/') : null;
      this.readFolder().then(() => null).catch(() => null);
    });
  }

  async readFolder() {
    this.path = `${this.files.source}${this.folder ? '/' + this.folder : ''}`;
    this.folderContents = await this.files.readFolder(this.path);
  }

  onCheck(evt: boolean, item) {
    this.folderContents[item.index].checked = evt;
    this.calcTotal();
  }

  onClick(evt: boolean, index: number) {
    if (evt) this.selectedPic = this.folderContents[index];
  }

  async saveFile() {
    await this.files.saveFile(this.selectedPic, this.croppedImage);
    this.edit = false;
    if (this.folderContents[this.selectedPic.index + 1]) {
      this.next();
    } else {
      this.selectedPic = null;
      this.showBar = false;
    }
    this.croppedImage = null;
  }

  deleteFile() {
    this.files.deleteFile(this.selectedPic).then(() => {
      if (this.folderContents[this.selectedPic.index + 1]) {
        this.next();
      } else {
        this.selectedPic = null;
        this.showBar = false;
        this.folderContents = [];
        this.readFolder().then(() => null).catch(() => null);
      }
    });
  }

  setTags(e) {
    this.popover.event = e;
    this.isPopoverOpen = true;
  }

  setTag(tag) {
    for (const item of this.folderContents.filter(f => f.checked && !f.tag)) {
      this.folderContents[item.index].tag = tag;
      this.folderContents[item.index].checked = false;
    }
    this.isPopoverOpen = false;
  }

  setSelect() {
    this.select = !this.select;
    if (!this.select) this.clearSelects();
  }

  async saveFolder() {
    const name = await this.openSelectFolderModal();
    if (name) {
      const loading = await this.loadingCtrl.create({ message: 'A gravar...' });
      loading.present();
      await this.files.saveFolder(name, this.folderContents).then(() => {
        this.readFolder();
      });
      loading.dismiss();
    }
  }

  back() {
    const route = this.folder.split('/');
    route.pop();
    console.log(route);
    this.location.back();
  }

  next() {
    if (this.folderContents[this.selectedPic.index + 1]) {
      this.canvasRotation = 0;
      this.selectedPic = this.folderContents[this.selectedPic.index + 1];
    }
  }

  prev() {
    if (this.folderContents[this.selectedPic.index - 1]) {
      this.canvasRotation = 0;
      this.selectedPic = this.folderContents[this.selectedPic.index - 1];
    }
  }

  rotate() {
    this.canvasRotation--;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  async openSelectFolderModal() {
    const modal = await this.modal.create({
      component: ListFoldersComponent,
    });
    modal.present();

    const { data } = await modal.onWillDismiss();

    return data;
  }

  private calcTotal() {
    this.selectTotal = this.folderContents.filter(f => f.checked).length;
  }

  private clearSelects() {
    this.folderContents = this.folderContents.map(f => ({ ...f, checked: false }));
  }

}
