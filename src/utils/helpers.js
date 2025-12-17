/**
 * Format seconds to MM:SS format
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Handle image upload, resize and convert to base64
 */
export const handleImageUpload = (file, callback) => {
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const maxSize = 200;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
        callback(resizedImage);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

/**
 * Validate minimum players for game
 */
export const validateMinPlayers = (players, minPlayers = 2) => {
  const validPlayers = players.filter(p => p.name.trim() !== '');
  return validPlayers.length >= minPlayers ? validPlayers : null;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  return name.charAt(0).toUpperCase();
};
