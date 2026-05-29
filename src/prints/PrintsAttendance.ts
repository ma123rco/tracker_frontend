import type { AttendanceInterface } from "@/types/AttendanceInterface.ts";
import { downloadPdfReport } from "@/prints/pdfReport.ts";

const formatDateTime = (value?: string) => (value ? new Date(value).toLocaleString("es-ES") : "-");

export const exportAttendanceToPdf = async(records: AttendanceInterface[]) => {
	await downloadPdfReport({
		columns: [
			{ alignment: "center", header: "ID", value: "id", width: 34 },
			{ alignment: "center", header: "Usuario ID", value: "user_id", width: 56 },
			{ header: "Empleado", value: "employee_name", width: 200 },
			{ alignment: "center", header: "Hora entrada", value: record => formatDateTime(record.checked_in_at), width: 100 },
			{ alignment: "center", header: "Hora salida", value: record => formatDateTime(record.checked_out_at), width: 100 }
		],
		fileName: "reporte_asistencia.pdf",
		orientation: "landscape",
		records,
		title: "Registro de Asistencia de Empleados"
	});
};