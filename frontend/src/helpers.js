import { useRouter } from 'vue-router';

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
  };

  static validateResponse(response, message) {
    switch (response.status) {
      case 401:
        const router = useRouter()
        router.push('/login')
        return false
      case 200:
      case 201:
      case 202:
        return true
      default:
        return false
    }
  }
}

export default Helpers;