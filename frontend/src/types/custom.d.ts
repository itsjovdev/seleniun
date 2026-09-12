export {};

declare global {
  interface Window {
    HTMLDocx: {
      asBlob: (html: string, options?: any) => Blob;
    };
  }
}
