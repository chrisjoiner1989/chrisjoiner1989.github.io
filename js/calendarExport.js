/**
 * Calendar Export Module
 * Exports sermons to iCalendar (.ics) format for import into calendar apps
 *
 * Compatible with:
 * - Google Calendar
 * - Apple Calendar
 * - Microsoft Outlook
 * - Any iCal-compatible calendar app
 */

class CalendarExporter {
  constructor() {
    this.productId = '-//Mount Builder//Sermon Calendar//EN';
  }

  /**
   * Format date for iCal (YYYYMMDD or YYYYMMDDTHHmmss)
   */
  formatICalDate(date, includeTime = false) {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    if (includeTime) {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    }

    return `${year}${month}${day}`;
  }

  /**
   * Escape special characters for iCal format
   */
  escapeICalText(text) {
    if (!text) return '';

    return text
      .replace(/\\/g, '\\\\')   // Backslash
      .replace(/;/g, '\\;')      // Semicolon
      .replace(/,/g, '\\,')      // Comma
      .replace(/\n/g, '\\n')     // Newline
      .replace(/\r/g, '');       // Remove carriage return
  }

  /**
   * Generate a unique identifier for an event
   */
  generateUID(sermon) {
    return `sermon-${sermon.id}@mountbuilder.app`;
  }

  /**
   * Create an iCal event for a single sermon
   */
  createEvent(sermon, options = {}) {
    const {
      duration = 60,           // Default sermon duration in minutes
      startTime = '10:00',     // Default start time
      reminderMinutes = 1440   // Reminder 24 hours before (1440 minutes)
    } = options;

    // Parse date and add time
    const sermonDate = new Date(sermon.date);
    const [hours, minutes] = startTime.split(':');
    sermonDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Calculate end time
    const endDate = new Date(sermonDate);
    endDate.setMinutes(endDate.getMinutes() + duration);

    // Create timestamp for when this event was created
    const now = new Date();

    // Build event
    const lines = [
      'BEGIN:VEVENT',
      `UID:${this.generateUID(sermon)}`,
      `DTSTAMP:${this.formatICalDate(now, true)}Z`,
      `DTSTART:${this.formatICalDate(sermonDate, true)}`,
      `DTEND:${this.formatICalDate(endDate, true)}`,
      `SUMMARY:${this.escapeICalText(sermon.title)}`,
    ];

    // Add description with sermon details
    const description = this.buildDescription(sermon);
    if (description) {
      lines.push(`DESCRIPTION:${this.escapeICalText(description)}`);
    }

    // Add location if speaker is specified
    if (sermon.speaker && sermon.speaker !== 'Guest Speaker') {
      lines.push(`LOCATION:${this.escapeICalText(`Speaker: ${sermon.speaker}`)}`);
    }

    // Add series as category
    if (sermon.series && sermon.series !== 'General') {
      lines.push(`CATEGORIES:${this.escapeICalText(sermon.series)}`);
    }

    // Add reminder/alarm
    if (reminderMinutes > 0) {
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${this.escapeICalText(`Sermon: ${sermon.title}`)}`);
      lines.push(`TRIGGER:-PT${reminderMinutes}M`);
      lines.push('END:VALARM');
    }

    lines.push('END:VEVENT');

    return lines.join('\r\n');
  }

  /**
   * Build event description from sermon data
   */
  buildDescription(sermon) {
    const parts = [];

    if (sermon.speaker) {
      parts.push(`Speaker: ${sermon.speaker}`);
    }

    if (sermon.series && sermon.series !== 'General') {
      parts.push(`Series: ${sermon.series}`);
    }

    if (sermon.verseReference) {
      parts.push(`Scripture: ${sermon.verseReference}`);
    }

    if (sermon.notes) {
      const preview = sermon.notes.length > 200
        ? sermon.notes.substring(0, 200) + '...'
        : sermon.notes;
      parts.push(`\nNotes:\n${preview}`);
    }

    return parts.join('\n');
  }

  /**
   * Export a single sermon to iCal format
   */
  exportSermon(sermon, options = {}) {
    const calendar = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:${this.productId}`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Mount Builder Sermons',
      'X-WR-TIMEZONE:America/New_York',
      'X-WR-CALDESC:Sermon schedule from Mount Builder',
      this.createEvent(sermon, options),
      'END:VCALENDAR'
    ];

    return calendar.join('\r\n');
  }

  /**
   * Export multiple sermons to iCal format
   */
  exportSermons(sermons, options = {}) {
    const calendar = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:${this.productId}`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Mount Builder Sermons',
      'X-WR-TIMEZONE:America/New_York',
      'X-WR-CALDESC:Sermon schedule from Mount Builder'
    ];

    // Add each sermon as an event
    sermons.forEach(sermon => {
      calendar.push(this.createEvent(sermon, options));
    });

    calendar.push('END:VCALENDAR');

    return calendar.join('\r\n');
  }

  /**
   * Download iCal file
   */
  downloadICalFile(content, filename = 'sermons.ics') {
    // Create blob with proper MIME type
    const blob = new Blob([content], {
      type: 'text/calendar;charset=utf-8'
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  }

  /**
   * Export single sermon and download
   */
  exportSingleSermon(sermon, options = {}) {
    const icalContent = this.exportSermon(sermon, options);
    const filename = `sermon-${sermon.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
    this.downloadICalFile(icalContent, filename);
    console.log(`Exported sermon: ${sermon.title}`);
  }

  /**
   * Export all sermons and download
   */
  exportAllSermons(sermons, options = {}) {
    if (!sermons || sermons.length === 0) {
      alert('No sermons to export');
      return;
    }

    const icalContent = this.exportSermons(sermons, options);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `mount-builder-sermons-${timestamp}.ics`;

    this.downloadICalFile(icalContent, filename);
    console.log(`Exported ${sermons.length} sermons to ${filename}`);
  }

  /**
   * Export upcoming sermons only
   */
  exportUpcomingSermons(sermons, options = {}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = sermons.filter(sermon => {
      const sermonDate = new Date(sermon.date);
      return sermonDate >= today;
    });

    if (upcoming.length === 0) {
      alert('No upcoming sermons to export');
      return;
    }

    const icalContent = this.exportSermons(upcoming, options);
    const filename = `upcoming-sermons-${new Date().toISOString().split('T')[0]}.ics`;

    this.downloadICalFile(icalContent, filename);
    console.log(`Exported ${upcoming.length} upcoming sermons`);
  }

  /**
   * Export sermons for a specific date range
   */
  exportDateRange(sermons, startDate, endDate, options = {}) {
    const filtered = sermons.filter(sermon => {
      const sermonDate = new Date(sermon.date);
      return sermonDate >= startDate && sermonDate <= endDate;
    });

    if (filtered.length === 0) {
      alert('No sermons found in the selected date range');
      return;
    }

    const icalContent = this.exportSermons(filtered, options);
    const filename = `sermons-${this.formatICalDate(startDate)}-to-${this.formatICalDate(endDate)}.ics`;

    this.downloadICalFile(icalContent, filename);
    console.log(`Exported ${filtered.length} sermons from date range`);
  }

  /**
   * Export sermons by series
   */
  exportSeries(sermons, seriesName, options = {}) {
    const filtered = sermons.filter(sermon => sermon.series === seriesName);

    if (filtered.length === 0) {
      alert(`No sermons found in series: ${seriesName}`);
      return;
    }

    const icalContent = this.exportSermons(filtered, options);
    const filename = `series-${seriesName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;

    this.downloadICalFile(icalContent, filename);
    console.log(`Exported ${filtered.length} sermons from series: ${seriesName}`);
  }

  /**
   * Get export options from user (if needed for custom settings)
   */
  getExportSettings() {
    return {
      duration: 60,           // Default 60-minute sermon
      startTime: '10:00',     // Default Sunday morning service time
      reminderMinutes: 1440   // 24 hours before
    };
  }
}

// Create singleton instance
const calendarExporter = new CalendarExporter();

// Make it globally available
window.calendarExporter = calendarExporter;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalendarExporter;
}
