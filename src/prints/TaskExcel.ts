import { onGetStatusTask, type TaskReportInterface } from "@/types/ProjectsInterface.ts";
import { safeParseToDate } from "@/composables/convertDates.ts";
import { downloadPdfReport } from "@/prints/pdfReport.ts";

export const exportTasksToPdf = async(tasks: TaskReportInterface[]) => {
	await downloadPdfReport({
		columns: [
			{ alignment: "center", header: "ID", value: "id", width: 34 },
			{ alignment: "center", header: "Proyecto ID", value: "project_id", width: 56 },
			{ header: "Título", value: "title", width: 90 },
			{ header: "Descripción", value: "description", width: "*" },
			{ alignment: "center", header: "Estado", value: task => onGetStatusTask(task.status), width: 72 },
			{ alignment: "center", header: "Fecha límite", value: task => safeParseToDate(task.due_date)?.toLocaleDateString("es-ES") ?? "-", width: 70 },
			{ header: "Empleado asignado", value: "employee_name", width: 90 }
		],
		fileName: "reporte_tareas.pdf",
		orientation: "landscape",
		records: tasks,
		title: "Lista de Tareas del Proyecto"
	});
};