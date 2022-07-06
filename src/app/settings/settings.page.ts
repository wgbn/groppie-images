import { Component, OnInit } from '@angular/core';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  setting: any = {};
  newTag: any = {};

  constructor(private store: StorageService) { }

  ngOnInit() {
    this.setting = this.store.get('settings') || {
      source: '',
      destination: '',
      tags: [{ tag: 'família', emoji: '👪' }]
    };
  }

  async saveSettings() {
    this.store.set('settings', this.setting);
  }

  addTag() {
    this.setting.tags.push(this.newTag);
    this.newTag = {};
  }

  removeTag(index: number) {
    this.setting.tags.splice(index, 1);
  }

}
