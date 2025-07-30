const reportsService = require('./reports.service');

const handleGetBookingsReport = async (req, res) => {
  try {
    const filters = req.query;
    const result = await reportsService.getBookingsReport(filters);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve bookings report.', details: error.message });
  }
};

const handleGetFinancialReport = async (req, res) => {
  try {
    const filters = req.query;
    const result = await reportsService.getFinancialReport(filters);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve financial report.', details: error.message });
  }
};

const handleGetSystemStats = async (req, res) => {
    try {
        const result = await reportsService.getSystemStats();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve system stats.', details: error.message });
    }
};

const handleDownloadBookingsCsv = async (req, res) => {
    try {
        const filters = req.query;
        const csvStream = await reportsService.getBookingsCsvStream(filters);

        const fileName = `bookings_report_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');

        // Pipe the CSV stream to the response
        csvStream.pipe(res).on('finish', () => {
            console.log('CSV stream finished.');
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to download bookings report.', details: error.message });
    }
};

module.exports = {
  handleGetBookingsReport,
  handleGetFinancialReport,
  handleGetSystemStats,
  handleDownloadBookingsCsv,
};
