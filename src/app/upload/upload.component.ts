import { Component, OnInit} from '@angular/core';
import { FileItem, FileUploader } from 'ng2-file-upload';

import { TypesEnum } from '../enum/types.enum';
import { Arquivo } from '../model/arquivo';

// const URL = '/api/';
// const URL = 'http://localhost:3000/api-file';
const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  // private _uploader: FileUploader;
  private _extensoes: Array<any>;
  private _alerts: string;
  private _arquivosEnviados: Array<any>;
  private _props: Array<Arquivo>;

  public uploader = new FileUploader({url: URL});

  constructor() {
      this._arquivosEnviados = [];
     // this._uploader = new FileUploader({url: URL});
  }


  ngOnInit(): void {
    console.log(this.adicionarArquivo());
  }

  public adicionarArquivo(): void {
    this.uploader.onAfterAddingFile = (item: FileItem) => {
      console.log(`Extensão: ${this.isValidaType(item)}`);
      console.log(`Tamanho: ${this.validarTamanho(item)}`);

      if (!this.validarTamanho(item)) {
        this._alerts = `O arquivo <strong>${item.file.name}</strong> possui tamanho maior que o permitido, Tamanho máximo permitido: 2MB`;
        item.remove();
      }

      if (!this.isValidaType(item)) {
        this._alerts = `O arquivo <strong>${item.file.name}</strong> possui extensão invalida. Arquivos validos PDF, PNG, JPEG, JPG`;
        item.remove();
      }

    };

    this.uploader.onSuccessItem = (item: FileItem, response: string) => {
        console.log(response)
        console.log(item)
        const resposta = JSON.parse(response);
        this._arquivosEnviados.push(resposta);
    };

    this.uploader.onErrorItem = (item: FileItem, response: string) => {
      console.log(response)
        console.log(item)
        const resposta = JSON.parse(response);
        const mensagem = 'O arquivo ' + item.file.name + ' não foi enviado. ' + resposta['mensagem'];
        item.remove();
    };
  }

  private validarTamanho(item: FileItem): boolean {

    if (item.file.size > 2097152) { // ~= 2MB;
        return false;
    }

    return true;
  }

  public isValidaType(item: FileItem): boolean {

    const type = item.file.type.split('/');
    const a = this.validarExtensao();

    return a.some(types => types === type[1]);

  }

  public validarExtensao(): Array<string> {

    return this._extensoes = [TypesEnum.PDF, TypesEnum.PNG, TypesEnum.JPEG, TypesEnum.JPG];

  }

  public uparArquivoServidor(item: FileItem): void {
    item._onBuildForm = (form) => {
        form.append('tipo', 'anexoRequerido');
    };

    item.upload();

    this.uploader.onCompleteItem = (file: any, response: any, status: any, headers: any) => {
        console.log(`file: ${file} response: ${response} status: ${status} headers: ${headers}`);
    };
}

  public getPropsFile(): Array<Arquivo> {

     this._props = this.uploader.queue.map(function(item) {
      const props = new Arquivo(
          item.file.name,
          item.file.size,
          item.progress
        );
        return props;
    });

    return this._props;
  }


  public get error () {
    return this._alerts;
  }


  public get size() {
    return this.uploader.queue.length;
  }

  public formateSize(bytes) {

    if (isNaN(bytes)) {
      return;
    }

    const sizes = ['Bytes', 'KB', 'MB'];

    let amountOf2s = Math.floor(Math.log(+bytes) / Math.log(2));

    if (amountOf2s < 1) {
        amountOf2s = 0;
    }

    const i = Math.floor(amountOf2s / 10);
    bytes = +bytes / Math.pow(2, 10 * i);

    if (bytes.toString().length > bytes.toFixed(2).toString().length) {
        bytes = bytes.toFixed(2);
    }

    return `${bytes} ${sizes[i]}`;

  }

}
