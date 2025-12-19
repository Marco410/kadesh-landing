export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Normalize dates to midnight for day comparison
    const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate difference in days
    const diffTime = nowMidnight.getTime() - dateMidnight.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
    // Format time for "Hoy" case - format: MM/DD/YYYY, HH:MM:SS AM/PM
    const formatTime = (d: Date) => {
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const seconds = d.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      const displaySeconds = seconds.toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${displayHours}:${displayMinutes} ${ampm}`;
    };
  
    if (diffDays === 0) {
      return `Hoy a las ${formatTime(date)}`;
    }
    if (diffDays === 1) {
      return 'Ayer';
    }
    if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    }
    if (diffDays < 30) {
      return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    }
    return `Hace ${Math.ceil(diffDays / 30)} meses`;
  };