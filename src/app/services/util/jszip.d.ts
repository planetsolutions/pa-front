declare module 'jszip' {
  interface JSZipInterface {
    files?: any;
    comment?: string;

    (): void; // Constructor

    file(name: string): ZipObject | null;
    file(regex: RegExp): [ZipObject];
    file(
      name: string,
      data: string | ArrayBuffer | Uint8Array | Blob | Promise<string>,
      opts?: any
    ): JSZipInterface;
    folder(name: string): JSZipInterface;

    generateAsync(options: JSZipGeneratorOptions, onUpdate?: any);
  }

  interface JSZipGeneratorOptions {
    compression?: 'STORE' | 'DEFLATE';
    compressionOptions?: JSZipGeneratorCompressionOptions;
    type?: 'base64' | 'binarystring' | 'uint8array' | 'arraybuffer' | 'blob';
    comment?: string;
    mimeType?: string;
    platform?: 'DOS' | 'UNIX';
    encodeFileName?: Function;
    streamFiles?:	boolean;
    onUpdate?: Function;
  }

  interface JSZipGeneratorCompressionOptions {
    level: 1 | 2 | 3| 4 | 5 | 6 | 7 | 8 | 9;
  }

  interface JSZipConstructor {
    support: {
      arraybuffer: boolean
      uint8array: boolean;
      blob: boolean;
      nodebuffer: boolean;
      nodestream: boolean;
    };

    new (): JSZipInterface;
  }

  interface ZipObject {
    name: string;
    dir: boolean;
    date: Date;
    comment: 	string;
    unixPermissions?: number;
    dosPermissions?: number;
    options: any;
    async(type: AsyncType, onUpdate?: (meta: number) => void): Promise<string>;
  }

  type AsyncType =
    'string'       |
    'text'         |
    'binarystring' |
    'base64'       |
    'array'        |
    'uint8array'   |
    'arraybuffer'  |
    'nodebuffer';

  const module: JSZipConstructor;
  export = module;
}
