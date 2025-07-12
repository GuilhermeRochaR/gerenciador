// logger.js
class ActivityLogger {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
  }

  log(action, details = {}) {
    const logs = JSON.parse(localStorage.getItem('systemLogs')) || [];
    const timestamp = new Date().toLocaleString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const logEntry = {
      timestamp,
      user: this.currentUser ? {
        username: this.currentUser.username,
        name: this.currentUser.name || 'Nome não disponível'
      } : null,
      action,
      details,
      location: window.location.pathname.split('/').pop()
    };

    logs.push(logEntry);
    localStorage.setItem('systemLogs', JSON.stringify(logs));
  }
}

const logger = new ActivityLogger();
export default logger;