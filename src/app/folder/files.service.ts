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
    // console.log('## PATH ' + path);
    let contents: any = { files: [] };
    const options: any = { path };
    if (!path.startsWith('file:///')) options.directory = Directory.ExternalStorage;

    try {
      // contents = await Filesystem.readdir({ path, directory: Directory.ExternalStorage });
      contents = await Filesystem.readdir(options);
    } catch (e) {
      console.log('## ERR ' + e.message);
    }

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

    // console.log('## =>' + folderContents.filter(f => !f.isFile).map(f => f.name).join(','));
    return folderContents;
  }

  async saveFolder(folderName: string, files: any[]) {
    // console.log('## saveIn ' + folderName);
    if (files.filter(f => f.tag).length) {
      if (folderName) {
        const newFolder = `${this.destination}/${folderName}`;
        const folders: any = {};

        for (const f of files) {
          if (f.tag && f.tag.tag) {
            folders[f.tag.tag] = folders[f.tag.tag] || [];
            folders[f.tag.tag].push(f);
          }
        }

        const options: any = {
          path: newFolder
        };
        if (!newFolder.startsWith('file:///')) options.directory = Directory.ExternalStorage;

        try {
          await Filesystem.mkdir(options);
        } catch (e) {
          if (e.message.toLowerCase().indexOf('exists') === -1) return;
        }

        if (folders.pic && folders.pic.length) await this.copyFiles(newFolder, '', folders.pic);

        for (const folder in folders) {
          if (folder !== 'pic') await this.copyFiles(newFolder, folder, folders[folder]);
        }

        await this.deleteFiles(files.filter(f => f.tag));
      }
    }
  }

  async deleteFile(file) {
    const options: any = {
      path: file.path,
    };
    if (!options.path.startsWith('file:///')) options.directory = Directory.ExternalStorage;
    await Filesystem.deleteFile(options);
  }

  async saveFile(file, base64) {
    const options: any = {
      path: file.path,
      data: base64,
    };
    if (!options.path.startsWith('file:///')) options.directory = Directory.ExternalStorage;
    await Filesystem.writeFile(options).then(ok => console.log('# OK')).catch(e => console.log('# ERROR' + e.message));
  }

  private async copyFiles(path, subPath, files) {
    const newFolder = `${path}/${subPath}`;

    const options: any = {
      path: newFolder
    };
    if (!newFolder.startsWith('file:///')) options.directory = Directory.ExternalStorage;

    try {
      if (subPath) await Filesystem.mkdir(options);
    } catch (e) {
      if (e.message.toLowerCase().indexOf('exists') === -1) return;
    }
    const promises = [];

    for (const file of files) {
      console.log('## ' + file.path);
      console.log('## ' + file.path.replace('file:///storage/emulated/0/', ''));
      console.log('## ' + newFolder + '/' + file.name);
    }

    for (const file of files) {
      const opts: any = {
        from: file.path, // .replace('file:///storage/emulated/0/', ''),
        to: `${newFolder}/${file.name}`,
      };
      if (!opts.from.startsWith('file:///')) opts.directory = Directory.ExternalStorage;
      if (!opts.to.startsWith('file:///')) opts.toDirectory = Directory.ExternalStorage;

      promises.push(Filesystem.copy(opts));
    }

    await Promise.all(promises);
  }

  private async deleteFiles(files) {
    if (files.length) {
      const promises = [];
      for (const file of files) {
        const options: any = {
          path: file.path
        };
        if (!options.path.startsWith('file:///')) options.directory = Directory.ExternalStorage;
        promises.push(Filesystem.deleteFile(options));
      }

      await Promise.all(promises);
    }
  }
}
