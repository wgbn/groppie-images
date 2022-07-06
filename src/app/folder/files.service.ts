import { Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { StorageService } from '../storage.service';

const allowedExt = str => str.toLowerCase().includes('.gif') || str.toLowerCase().includes('.png') || str.toLowerCase().includes('.jpg') || str.toLowerCase().includes('.jpeg');

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  folderImage = '/assets/icon/folder.webp'; // 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/OneDrive_Folder_Icon.svg/480px-OneDrive_Folder_Icon.svg.png';
  fileImage = '/assets/icon/image.webp'; // 'https://freeiconshop.com/wp-content/uploads/edd/image-outline.png';

  private exts = ['.gif', '.png', '.jpg', '.jpeg', '.webm'];

  constructor(private store: StorageService) { }

  get source() {
    const sett = this.store.get('settings');
    return sett ? sett.source || '' : '';
  }

  get destination() {
    const sett = this.store.get('settings');
    return sett ? sett.destination || '' : '';
  }

  get tags() {
    const sett = this.store.get('settings');
    return sett ? sett.tags || [] : [];
  }

  async readFolder(path) {
    const contents = await Filesystem.readdir({ path, directory: Directory.ExternalStorage });

    const folderContents: any[] = contents.files.filter(f => allowedExt(f) || !f.includes('.')).sort().map((file, i) => {
      if (allowedExt(file)) {
        Filesystem.getUri({
          path: `${path}/${file}`,
          directory: Directory.ExternalStorage
        }).then(res => {
          folderContents[i].uri = (window as any).Ionic.WebView.convertFileSrc(res.uri) + `?t=${new Date().getTime()}`;
          folderContents[i].path = res.uri;
        });
      }
      return {
        index: i,
        name: file,
        isFile: file.includes('.'),
        uri: allowedExt(file) ? this.fileImage : this.folderImage
      };
    });

    return folderContents;
  }

  async saveFolder(folderName: string, files: any[]) {
    if (files.filter(f => f.tag).length) {
      // const folderName = prompt('Nome:');
      if (folderName) {
        const newFolder = `${this.destination}/${folderName}`;
        const photos = files.filter(f => f.tag && f.tag.tag === 'pic');
        const bikini = files.filter(f => f.tag && f.tag.tag === 'bikini');
        const videos = files.filter(f => f.tag && f.tag.tag === 'videos');
        const closeup = files.filter(f => f.tag && f.tag.tag === 'closeup');

        try {
          await Filesystem.mkdir({ path: newFolder, directory: Directory.ExternalStorage });
        } catch (e) {
          if (e.message.toLowerCase().indexOf('exists') === -1) return;
        }

        await this.copyFiles(newFolder, '', photos);

        if (bikini.length) await this.copyFiles(newFolder, 'bikini', bikini);
        if (videos.length) await this.copyFiles(newFolder, 'videos', videos);
        if (closeup.length) await this.copyFiles(newFolder, 'closeup', closeup);

        await this.deleteFiles(files.filter(f => f.tag));
      }
    }
  }

  async deleteFile(file) {
    await Filesystem.deleteFile({
      path: file.path.replace('file:///storage/emulated/0/', ''),
      directory: Directory.ExternalStorage
    });
  }

  async saveFile(file, base64) {
    await Filesystem.writeFile({
      path: file.path.replace('file:///storage/emulated/0/', ''),
      directory: Directory.ExternalStorage,
      data: base64,
    });
  }

  private async copyFiles(path, subPath, files) {
    const newFolder = `${path}/${subPath}`;

    try {
      if (subPath) await Filesystem.mkdir({ path: newFolder, directory: Directory.ExternalStorage });
    } catch (e) {
      if (e.message.toLowerCase().indexOf('exists') === -1) return;
    }
    const promises = [];

    for (const file of files) {
      promises.push(Filesystem.copy({
        from: file.path.replace('file:///storage/emulated/0/', ''),
        to: `${newFolder}/${file.name}`,
        directory: Directory.ExternalStorage,
        toDirectory: Directory.ExternalStorage
      }));
    }

    await Promise.all(promises);
  }

  private async deleteFiles(files) {
    if (files.length) {
      const promises = [];
      for (const file of files) {
        promises.push(Filesystem.deleteFile({
          path: file.path.replace('file:///storage/emulated/0/', ''),
          directory: Directory.ExternalStorage
        }));
      }

      await Promise.all(promises);
    }
  }
}
