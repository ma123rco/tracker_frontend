import type { Content, TableCell, TableLayout, TDocumentDefinitions, TVirtualFileSystem } from "pdfmake/interfaces";
import pdfMakeBrowser from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";

type PdfPrimitive = Date | null | number | string | undefined;

export interface PdfReportColumn<T> {
	alignment?: "center" | "left" | "right";
	header: string;
	value: ((record: T, index: number) => PdfPrimitive) | keyof T;
	width?: "*" | "auto" | number | string;
}

export interface PdfReportOptions<T> {
	columns: PdfReportColumn<T>[];
	emptyMessage?: string;
	fileName: string;
	orientation?: "landscape" | "portrait";
	records: T[];
	subtitle?: string;
	title: string;
}

type PdfMakeModule = Pick<typeof import("pdfmake"), "addVirtualFileSystem" | "createPdf">;

let isPdfMakeInitialized = false;

const initializePdfMake = () => {
	if (!isPdfMakeInitialized) {
		pdfMakeBrowser.addVirtualFileSystem(pdfFonts as TVirtualFileSystem);
		isPdfMakeInitialized = true;
	}

	return pdfMakeBrowser as PdfMakeModule;
};

const normalizeValue = (value: PdfPrimitive) => {
	if (value === null || value === undefined || value === "") return "-";
	if (value instanceof Date) return value.toLocaleString("es-ES");
	return String(value);
};

const resolveCellValue = <T>(record: T, column: PdfReportColumn<T>, index: number) => {
	if (typeof column.value === "function") return column.value(record, index);
	return record[column.value] as PdfPrimitive;
};

const getTableBody = <T>(records: T[], columns: PdfReportColumn<T>[]): TableCell[][] => {
	const headerRow: TableCell[] = columns.map(column => ({
		text: column.header,
		style: "tableHeader"
	}));

	const dataRows = records.map((record, index) => columns.map(column => ({
		alignment: column.alignment ?? "left",
		text: normalizeValue(resolveCellValue(record, column, index)),
		style: "tableBody"
	})));

	return [ headerRow, ...dataRows ];
};

const getTableLayout = (): TableLayout => ({
	defaultBorder: false,
	fillColor: (rowIndex: number) => {
		if (rowIndex === 0) return "#2563EB";
		return rowIndex % 2 === 0 ? "#F3F4F6" : null;
	},
	hLineColor: () => "#CBD5E1",
	hLineWidth: () => 0.7,
	paddingBottom: () => 8,
	paddingLeft: () => 8,
	paddingRight: () => 8,
	paddingTop: () => 8,
	vLineColor: () => "#CBD5E1",
	vLineWidth: () => 0.7
});

export const downloadPdfReport = async<T>(options: PdfReportOptions<T>) => {
	const pdfMake = initializePdfMake();

	const {
		columns,
		emptyMessage = "No se encontraron registros para los filtros seleccionados.",
		fileName,
		orientation = "portrait",
		records,
		subtitle,
		title
	} = options;

	const content: Content[] = [
		{ style: "title", text: title },
		{ color: "#64748B", fontSize: 10, margin: [ 0, 4, 0, 12 ], text: subtitle ?? `Total de registros: ${records.length}` }
	];

	if (records.length === 0) {
		content.push({ color: "#475569", fontSize: 11, margin: [ 0, 8, 0, 0 ], text: emptyMessage });
	} else {
		content.push({
			layout: getTableLayout(),
			margin: [ 0, 4, 0, 0 ],
			table: {
				body: getTableBody(records, columns),
				headerRows: 1,
				widths: columns.map(column => column.width ?? "*")
			}
		});
	}

	const documentDefinition: TDocumentDefinitions = {
		content,
		defaultStyle: {
			color: "#0F172A",
			fontSize: 10
		},
		footer: (currentPage: number, pageCount: number) => ({
			alignment: "right",
			color: "#64748B",
			fontSize: 9,
			margin: [ 24, 0, 24, 12 ],
			text: `Página ${currentPage} de ${pageCount}`
		}),
		info: {
			author: "task_biometric_tracker_front",
			title
		},
		pageMargins: [ 24, 32, 24, 36 ],
		pageOrientation: orientation,
		pageSize: "A4",
		styles: {
			tableBody: {
				fontSize: 9
			},
			tableHeader: {
				bold: true,
				color: "#FFFFFF",
				fontSize: 10
			},
			title: {
				bold: true,
				fontSize: 18
			}
		}
	};

	await pdfMake.createPdf(documentDefinition).download(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
};


