import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { FilesService } from '../files.service';

@Component({
  selector: 'app-list-folders',
  templateUrl: './list-folders.component.html',
  styleUrls: [ './list-folders.component.scss' ],
})
export class ListFoldersComponent implements OnInit {

  folders: any[] = [];
  name = '';

  private rawNames: any[] = [];

  constructor(private files: FilesService,
              private modal: ModalController,
              private loadingCtrl: LoadingController) { }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ message: 'A carregar...' });
    loading.present();
    this.rawNames = (await this.files.readFolder(this.files.destination)).filter(f => !f.isFile);
    this.folders = [...this.rawNames];
    loading.dismiss();
  }

  setName(name?) {
    if (name || this.name) this.modal.dismiss(name || this.name);
  }

  filterNames(evt) {
    this.folders = this.rawNames.filter(r => r.name.toLowerCase().indexOf(this.name.toLowerCase()) > -1);
    if (!this.name) this.folders = [...this.rawNames];
  }

}
