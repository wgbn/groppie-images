import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ImageCropperModule } from 'ngx-image-cropper';

import { FolderPageRoutingModule } from './folder-routing.module';

import { FolderPage } from './folder.page';
import { ItemComponent } from './item/item.component';
import { ListFoldersComponent } from './list-folders/list-folders.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageCropperModule,
    FolderPageRoutingModule
  ],
  declarations: [
    FolderPage,
    ItemComponent,
    ListFoldersComponent
  ]
})
export class FolderPageModule {}
