import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  connector_name?: string;
  sender_id?: string;
  sent?: number;
  delivered?: number;
  failed?: number;
  pending?: number;
}

interface SummaryStats {
  totalMessages?: number;
  totalSent?: number;
  totalDelivered?: number;
  totalFailed?: number;
  totalPending?: number;
  totalCost?: number;
}

interface ExportPDFOptions {
  title: string;
  reportType: "network" | "sender";
  dateRange: string;
  startDate?: string;
  endDate?: string;
  summaryStats: SummaryStats;
  reportData: ReportData[];
  pageColor?: string;
}

export const exportReportToPDF = ({
  title,
  reportType,
  dateRange,
  startDate,
  endDate,
  summaryStats,
  reportData,
  pageColor = "#f97316", // Orange par défaut
}: ExportPDFOptions) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header avec couleur
  doc.setFillColor(pageColor);
  doc.rect(0, 0, pageWidth, 30, "F");

  // Titre
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 20);

  // Date range
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateText =
    dateRange === "custom" && startDate && endDate
      ? `${startDate} to ${endDate}`
      : dateRange === "today"
        ? "Today"
        : dateRange === "week"
          ? "Last 7 Days"
          : dateRange === "month"
            ? "Last 30 Days"
            : dateRange === "year"
              ? "This Year"
              : dateRange;
  doc.text(`Period: ${dateText}`, 14, 28);

  yPosition = 40;

  // Summary Cards Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary Statistics", 14, yPosition);
  yPosition += 10;

  // Summary stats
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const stats: string[] = [];
  if (summaryStats.totalMessages !== undefined) {
    stats.push(`Total Messages: ${summaryStats.totalMessages.toLocaleString()}`);
  }
  if (summaryStats.totalSent !== undefined) {
    stats.push(`Total Sent: ${summaryStats.totalSent.toLocaleString()}`);
  }
  if (summaryStats.totalDelivered !== undefined) {
    const successRate =
      summaryStats.totalMessages && summaryStats.totalMessages > 0
        ? ((summaryStats.totalDelivered / summaryStats.totalMessages) * 100).toFixed(1)
        : "--";
    stats.push(
      `Delivered: ${summaryStats.totalDelivered.toLocaleString()} (${successRate}% success rate)`
    );
  }
  if (summaryStats.totalFailed !== undefined) {
    const failureRate =
      summaryStats.totalMessages && summaryStats.totalMessages > 0
        ? ((summaryStats.totalFailed / summaryStats.totalMessages) * 100).toFixed(1)
        : "--";
    stats.push(
      `Failed: ${summaryStats.totalFailed.toLocaleString()} (${failureRate}% failure rate)`
    );
  }
  if (summaryStats.totalPending !== undefined) {
    const pendingRate =
      summaryStats.totalMessages && summaryStats.totalMessages > 0
        ? ((summaryStats.totalPending / summaryStats.totalMessages) * 100).toFixed(1)
        : "--";
    stats.push(`Pending: ${summaryStats.totalPending.toLocaleString()} (${pendingRate}% pending)`);
  }
  if (summaryStats.totalCost !== undefined) {
    stats.push(`Total Cost: $${summaryStats.totalCost.toFixed(2)}`);
  }

  stats.forEach((stat, index) => {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(stat, 14, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Table Section
  if (reportData.length > 0) {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${reportType === "network" ? "Network" : "Sender"} Report Details`, 14, yPosition);
    yPosition += 10;

    // Préparer les données du tableau
    const tableData = reportData.map((item) => {
      const totalSent = item.sent || 0;
      const delivered = item.delivered || 0;
      const deliveryRate = totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(2) : "--";

      return [
        reportType === "network" ? item.connector_name || "N/A" : item.sender_id || "N/A",
        totalSent.toLocaleString(),
        (item.delivered || 0).toLocaleString(),
        (item.failed || 0).toLocaleString(),
        (item.pending || 0).toLocaleString(),
        `${deliveryRate}%`,
      ];
    });

    // Générer le tableau
    autoTable(doc, {
      startY: yPosition,
      head: [
        [
          reportType === "network" ? "Network" : "Sender ID",
          "Sent",
          "Delivered",
          "Failed",
          "Pending",
          "% DLR",
        ],
      ],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [
          parseInt(pageColor.slice(1, 3), 16),
          parseInt(pageColor.slice(3, 5), 16),
          parseInt(pageColor.slice(5, 7), 16),
        ],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} - Generated on ${new Date().toLocaleString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Télécharger le PDF
  const fileName = `${title.replace(/\s+/g, "_")}_${dateRange}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
