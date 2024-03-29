class Helpers {
  static formatDate(date) {
    const formattedDate = new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
    return formattedDate;
  }
}

export default Helpers;