import { onGetStatusProject, type ProjectsInterface } from "@/types/ProjectsInterface.ts";
import { safeParseToDate } from "@/composables/convertDates.ts";
import { downloadPdfReport } from "@/prints/pdfReport.ts";

export const exportProjectsToPdf = async(projects: ProjectsInterface[]) => {
	await downloadPdfReport({
		columns: [
			{ alignment: "center", header: "ID", value: project => project.id ?? "-", width: 40 },
			{ header: "Nombre", value: "name", width: 95 },
			{ header: "Descripción", value: "description", width: "*" },
			{ alignment: "center", header: "Estado", value: project => onGetStatusProject(project.status), width: 75 },
			{ alignment: "center", header: "Fecha inicio", value: project => safeParseToDate(project.start_date)?.toLocaleDateString("es-ES") ?? "-", width: 70 },
			{ alignment: "center", header: "Fecha fin", value: project => safeParseToDate(project.end_date)?.toLocaleDateString("es-ES") ?? "-", width: 70 }
		],
		fileName: "lista_proyectos.pdf",
		orientation: "landscape",
		records: projects,
		title: "Lista de Proyectos"
	});
};