declare module "pdfmake/build/vfs_fonts.js" {
	import type { TVirtualFileSystem } from "pdfmake/interfaces";

	const pdfFonts: TVirtualFileSystem;
	export default pdfFonts;
}

declare module "pdfmake/build/pdfmake.js" {
	import type { TCreatedPdf, TDocumentDefinitions, TVirtualFileSystem } from "pdfmake/interfaces";

	interface PdfMakeBrowser {
		addVirtualFileSystem(vfs: TVirtualFileSystem): void;
		createPdf(documentDefinitions: TDocumentDefinitions): TCreatedPdf;
	}

	const pdfMake: PdfMakeBrowser;
	export default pdfMake;
}

