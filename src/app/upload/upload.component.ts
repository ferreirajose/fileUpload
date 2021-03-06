import { Component, OnInit, Input } from '@angular/core';

import { FileItem, FileUploader } from 'ng2-file-upload';

import { TypesEnum } from '../enum/types.enum';

/**
 *
 * Class que gerência o component de Upload
 * @export
 * @class UploadComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-vox-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  @Input() fileExt: string;
  @Input() maxSize: number;
  @Input() url: string;
  @Input() anexosRequeridos: Array<any>;

  private _extensoes: Array<string>;
  private _limtSize: number;
  public fileItem: Array<any>;

  public alerts: Object;
  public uploader: FileUploader;
  public rows: Array<number>;
  public isUp: Array<boolean>;
  public actions: Object;
  public btn: boolean;
  private a: Array<any>;
  private fileIndex: Array<any>;

  /**
   * Creates an instance of UploadComponent.
   * @memberof UploadComponent
   */
  constructor() {
    this._limtSize = 2; // limite maximo para anexos de arquivos
    this.fileItem = [];
    this.maxSize = 2;
    this.anexosRequeridos = [];
    this.rows = [];
    this.isUp = [];
    this.btn = false;
    this.a = [];
    this.fileIndex = [];
    this.alerts = { status: false, msgs: [] };
  }

  /**
   *
   * Método pertencente ao Lifecycle hook, responsável pela inicialização do componente
   * @returns {void}
   * @memberof UploadComponent
   */
  ngOnInit(): void {
    this.uploader = new FileUploader({
      url: this.url
    });

    this.initFile();

    if (isNaN(this.maxSize)) {
      const err = `O valor da diretiva <strong>maxSize</strong> deve ser um valor inteiro`;

      this.alerts['status'] = false;
      this.alerts['msgs'].push(err);

      return;
    }

    if (!this.url) {
      const err = `O valor da diretiva <strong>URL</strong> deve ser informado ex: url="http://localhost:3000/api"`;

      this.alerts['status'] = false;
      this.alerts['msgs'].push(err);

      return;
    }

    if (this.maxSize > this._limtSize) {
      const err = `Limite para o envio de arquivos é no maximo <strong>${
        this._limtSize
      } MB</strong>`;

      this.alerts['status'] = false;
      this.alerts['msgs'].push(err);

      return;
    }
  }

  /**
   * Método responsável por executar os metódos do FileUploader
   * @returns {void}
   * @memberof UploadComponent
   */
  public initFile(): void {
    this.uploader.onAfterAddingFile = (item: FileItem) => {
      item.withCredentials = false;

      this.setFileItem(item);
      if (!this.isvalidarSize(item)) {
        item.remove();
        const err = `Error: (Tamanho) O <strong>${
          item.file.name
        }</strong> possui tamanho de
                    <strong>${this.formateSize(
                      item.file.size
                    )}</strong>, Tamanho máximo permitido é : <strong>${
          this.maxSize
        } MB</strong>`;
        this.alerts['status'] = false;
        this.alerts['msgs'].push(err);

        return;
      }

      if (!this.isValidaType(item)) {
        item.remove();
        const err = `Error: (Extensão) O <strong>${
          item.file.name
        }</strong> possui extensão inválida. Extensões validas
                    <strong>${this.msgExtension()}</strong>`;

        this.alerts['status'] = false;
        this.alerts['msgs'].push(err);

        return;
      }

      this.alerts['msgs'] = [];
    };

    this.uploader.onSuccessItem = (item: FileItem, response: string) => {
      const err = response;

      this.alerts['status'] = true;
      this.alerts['msgs'].push(err);

      this.clearTextOptions();
      item.remove();
    };

    this.uploader.onErrorItem = (item: FileItem, response: string) => {
      const err = `Não foi possivel enviar o arquivo <strong>${
        item.file.name
      }</strong>`;

      this.alerts['status'] = false;
      this.alerts['msgs'].push(err);

      this.clearTextOptions();
    };
  }

  /**
   *
   * Método responsável por validar o tamanho dos arquivos
   * @private
   * @param {FileItem} item
   * @returns {boolean}
   * @memberof UploadComponent
   */
  private isvalidarSize(item: FileItem): boolean {
    const fileSizeinMB = item.file.size / (1024 * 1000);
    const size = Math.round(fileSizeinMB * 100) / 100;

    if (size > this.maxSize) {
      return false;
    }

    return true;
  }

  /**
   *
   * Método responsável por validar o tipo de extensão dos arquivos
   * @private
   * @param {FileItem} item
   * @returns {boolean}
   * @memberof UploadComponent
   */
  private isValidaType(item: FileItem): boolean {
    const type = item.file.name.split('.');
    const fileExt = this.fileExt;

    if (fileExt) {
      const fileArray = this.fileExt.toString().split(',');

      return fileArray.some(types => {
        return types.toLowerCase().trim() === type[type.length - 1];
      });
    }

    return this.extension().some(types => {
      return types.toLowerCase().trim() === type[type.length - 1];
    });
  }

  /**
   *
   * Método responsável por retorna um lista com os tipos de extensões permitidas
   * @private
   * @returns {Array<string>}
   * @memberof UploadComponent
   */
  private extension(): Array<string> {
    return (this._extensoes = [
      TypesEnum.PDF,
      TypesEnum.PNG,
      TypesEnum.JPEG,
      TypesEnum.JPG,
      TypesEnum.CSV,
      TypesEnum.WORD
    ]);
  }

  /**
   *
   * Método responsável por exibir as extensões validas nas mensagens
   * @private
   * @returns {string}
   * @memberof UploadComponent
   */
  private msgExtension(): string {
    if (this.fileExt) {
      return this.fileExt.toString().toLocaleUpperCase();
    }

    return this.extension()
      .toString()
      .toLocaleUpperCase();
  }

  /**
   *
   * Método responsável por informa a quantidade de arquivos na Queue[]
   * @param {Array<FileItem>} item
   * @returns {(number | string)}
   * @memberof UploadComponent
   */
  public fileQtd(item: Array<FileItem>): number | string {
    return item.length === 0 ? 'Não há arquivos anexados' : item.length;
  }

  /**
   *
   * Método responsável por informa o tamanho do arquivos em 'Bytes', 'KB', 'MB', 'GB'
   * @param {any} bytes
   * @returns {string}
   * @memberof UploadComponent
   */
  public formateSize(bytes): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

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

  /**
   *
   * Método responsável por montar a tabela com os items para upload
   * @returns {Array<any>}
   * @memberof UploadComponent
   */
  public getAnexos(): Array<any> {
    return this.anexosRequeridos;
  }

  /**
   * Método responsável por exibir o icone do anexo
   * @param {string} icon
   * @returns {Array<string>}
   * @memberof UploadComponent
   */
  public icon(icon: string): Array<string> {
    return this.extension().filter(ext => {
      return icon === ext;
    });
  }

  public setFileItem(item: FileItem): void {
    // this.fileIndex.forEach((ele, i) => {
    //   this.fileItem[ele] = item;
    // });
    // this.fileIndex.map(fileIdx => this.fileItem[fileIdx] = item);
    // return this.fileItem;
    //return;
  }

  public getFileItem(): Array<FileItem> {
    return this.fileItem;
  }

  /**
   *
   * Método responsável verificar qual item da tabela foi selecionado
   * @param {number} anexoId
   * @param {number} idx
   * @returns {void}
   * @memberof UploadComponent
   */
  public changeRow(anexoId: number, idx: number, queue: FileItem): void {

    this.rows[idx] = anexoId;
    this.isUp[idx] = true;

    this.fileIndex.push(idx);

    this.fileIndex = this.fileIndex.filter((ele, i, self) => {
      return self.indexOf(ele) === i;
    });

    this.fileIndex.forEach((ele, i) => {
      this.fileItem[idx] = queue[i];
    });

    this.duplicateFiles(idx);

    console.log(this.fileIndex, 'fileIndex');
    console.log(this.fileItem, 'fileItem');
    console.log(this.uploader.queue, 'queue');
  }

  /**
   * Método responsável por enviar todos os arquivos na Queue[]
   * @returns {void}
   * @memberof UploadComponent
   */
  public uploadAll(): void {
    this.uploader.uploadAll();
  }

  public disableUploadAll(): boolean {
    return !this.uploader.getNotUploadedItems().length || this.btn;
  }

  /**
   * Método responsável por remover todos os arquivos da Queue[]
   * @returns {void}
   * @memberof UploadComponent
   */
  public clearQueue(): void {
    this.uploader.clearQueue();
    this.clearTextOptions();
    this.fileItem = [];
    this.fileIndex = [];
  }

  /**
   *
   *
   * @param {Array<FileItem>} queue
   * @param {number} idx
   * @memberof UploadComponent
   */
  public clearItem(queue: Array<FileItem>, idx: number): void {

    queue.splice(idx, 1);
    this.fileItem[idx] = undefined;
    this.isUp[idx] = false;

    this.btn = false;
  }
  /**
   *
   * Método responsável por alterna o texto do botão selecionar/alterar
   * @private
   * @returns {void}
   * @memberof UploadComponent
   */
  private clearTextOptions(): void {
    this.isUp = this.isUp.map(ele => (ele = false));
  }

  /**
   *
   *  Método responsável por exibir os status das requisições
   * @returns {Object}
   * @memberof UploadComponent
   */
  public getAlert(): Object {
    return {
      'alert-success': true === this.alerts['status'],
      'alert-danger': false === this.alerts['status']
    };
  }

  private duplicateFiles(idx: number) {

    const fileItemNameQueue = this.uploader.queue.map(fileItem => fileItem.file.name);

    const la = this.uploader.queue.filter((itemUploader, i, self) => {
      if (fileItemNameQueue.indexOf(itemUploader.file.name) !== i) {
        console.log(itemUploader.file);
        const ddFile = confirm('arquivo duplicado, desabilitar btn');
        if (ddFile || !ddFile) {
          itemUploader.remove();
          this.fileItem[idx] = undefined;
          this.isUp[idx] = false;
        }
      }
    });

    this.btn = true;
  }
}
